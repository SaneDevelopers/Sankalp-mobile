import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { useColors } from '@/hooks/useColors';
import {
  useAuthMe,
  useAuthUpdateProfile,
  useCreateAddress,
  getGetAddressesQueryKey,
} from '@workspace/api-client-react';
import { validatePincodeOffline } from '@/constants/data';

const LABELS = ['Home', 'Office', 'Other'];

export default function CompleteProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: user } = useAuthMe();
  const updateProfileMutation = useAuthUpdateProfile();
  const createAddressMutation = useCreateAddress();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('Home');

  const [resolvingPin, setResolvingPin] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState('');

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
    }
  }, [user]);

  // Real-time Pincode resolution
  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(cleanPin);

    if (cleanPin.length < 6) {
      setError('');
      return;
    }

    setError('');
    setResolvingPin(true);

    const offlineCity = validatePincodeOffline(cleanPin);
    if (!offlineCity) {
      setError('Sankalp is currently serving locations in Maharashtra.');
      setCity('');
      setResolvingPin(false);
      return;
    }

    setCity(offlineCity);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          const state = postOffices[0].State;
          const district = postOffices[0].District;
          if (state === 'Maharashtra') {
            setCity(district);
            setError('');
          } else {
            setError('Sankalp is currently serving locations in Maharashtra.');
            setCity('');
          }
        }
      }
    } catch {
      // Quietly use offline fallback
    } finally {
      setResolvingPin(false);
    }
  };

  // GPS Auto-detect location
  const handleDetectLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError('');
    setDetectingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enter your address manually.');
        setDetectingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode) {
        if (geocode.postalCode) {
          setPincode(geocode.postalCode);
          handlePincodeChange(geocode.postalCode);
        }
        if (geocode.city || geocode.subregion) {
          setCity(geocode.city || geocode.subregion || '');
        }

        const addressParts = [
          geocode.name,
          geocode.street,
          geocode.district,
        ].filter(Boolean);

        if (addressParts.length > 0) {
          setAddress(addressParts.join(', '));
        }
      }
    } catch (err: any) {
      setError('Could not detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    // Validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const cleanPin = pincode.replace(/[^0-9]/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    if (!city.trim()) {
      setError('Please select or enter your city');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setError('Please enter your complete street / house address');
      return;
    }

    try {
      // 1. Update user profile with phone & city
      await updateProfileMutation.mutateAsync({
        data: {
          name: name.trim() || user?.name || 'User',
          phone: cleanPhone,
          city: city.trim(),
        },
      });

      // 2. Save as default address for bookings and delivery
      await createAddressMutation.mutateAsync({
        data: {
          label,
          name: name.trim() || user?.name || 'User',
          address: address.trim(),
          phone: cleanPhone,
          pincode: cleanPin,
          city: city.trim(),
          isDefault: true,
        },
      });

      // 3. Mark profile completed locally
      await AsyncStorage.setItem('profile_completed', 'true');
      await queryClient.invalidateQueries({ queryKey: getGetAddressesQueryKey() });
      await queryClient.invalidateQueries();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to save details. Please try again.';
      setError(msg);
    }
  };

  const isSaving = updateProfileMutation.isPending || createAddressMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Branding */}
        <View style={styles.headerArea}>
          <View style={[styles.omBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.omText}>ॐ</Text>
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Required for coordinating with your assigned pandit and delivering pooja samagri.
          </Text>
        </View>

        {/* Error Alert */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>PHONE NUMBER *</Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <View style={styles.phonePrefix}>
                <Feather name="phone" size={16} color={colors.primary} />
                <Text style={[styles.prefixText, { color: colors.text }]}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Location Detection Button */}
          <Pressable
            style={[
              styles.detectBtn,
              { backgroundColor: colors.gold + '15', borderColor: colors.gold },
            ]}
            onPress={handleDetectLocation}
            disabled={detectingLocation}
          >
            {detectingLocation ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <>
                <Feather name="navigation" size={16} color={colors.gold} />
                <Text style={[styles.detectBtnText, { color: colors.primary }]}>
                  Detect My Location Automatically
                </Text>
              </>
            )}
          </Pressable>

          {/* Pincode & City */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>PINCODE *</Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
                  placeholder="e.g. 400001"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pincode}
                  onChangeText={handlePincodeChange}
                />
                {resolvingPin ? <ActivityIndicator size="small" color={colors.primary} /> : null}
              </View>
            </View>

            <View style={[styles.fieldGroup, { flex: 1.2 }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>CITY / REGION *</Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
                  placeholder="e.g. Mumbai"
                  placeholderTextColor={colors.mutedForeground}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>

          {/* Full Street Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              STREET / HOUSE ADDRESS *
            </Text>
            <View
              style={[
                styles.inputRow,
                styles.textAreaRow,
                { borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.text, fontFamily: 'Inter_400Regular' },
                ]}
                placeholder="Flat / House No, Building Name, Street / Area"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          {/* Address Label Chips */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>ADDRESS TYPE</Text>
            <View style={styles.labelChips}>
              {LABELS.map((item) => {
                const isSelected = label === item;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLabel(item);
                    }}
                  >
                    <Feather
                      name={item === 'Home' ? 'home' : item === 'Office' ? 'briefcase' : 'map-pin'}
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>CONTINUE TO APP</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </>
          )}
        </Pressable>

        {/* Skip for now */}
        <Pressable
          style={{ alignItems: 'center', marginTop: 14, paddingVertical: 8 }}
          onPress={async () => {
            await AsyncStorage.setItem('profile_completed', 'true');
            router.replace('/(tabs)');
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>
            Skip for now & explore app
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 20 },
  headerArea: { alignItems: 'center', marginBottom: 24 },
  omBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  omText: { fontSize: 28, color: '#FFFFFF' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 8, textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#DC2626', flex: 1 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    gap: 16,
  },
  fieldGroup: { width: '100%' },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textAreaRow: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  textArea: { height: 60, textAlignVertical: 'top' },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  prefixText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    gap: 8,
  },
  detectBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', gap: 12 },
  labelChips: { flexDirection: 'row', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});
