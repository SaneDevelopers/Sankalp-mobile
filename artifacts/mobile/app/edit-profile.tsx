import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { Image as ExpoImage } from 'expo-image';

import { useColors } from '@/hooks/useColors';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuthMe, useAuthUpdateProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { validatePincodeOffline } from '@/constants/data';

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: user } = useAuthMe();
  const updateProfileMutation = useAuthUpdateProfile();
  const { pickAndUploadImage, uploading } = useImageUpload();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [resolvingPin, setResolvingPin] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setCity(user.city || '');
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/[^0-9]/g, '');
    setPincode(cleanPin);
    if (cleanPin.length < 6) {
      setCity('');
      setError('');
      return;
    }

    setError('');
    setResolvingPin(true);

    const offlineCity = validatePincodeOffline(cleanPin);
    if (!offlineCity) {
      setError('Sankalp is currently only available in Maharashtra.');
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
            setError('Sankalp is currently only available in Maharashtra.');
            setCity('');
          }
        }
      }
    } catch (err) {
      // Quietly keep offline fallback
    } finally {
      setResolvingPin(false);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!city) {
      setError('Please enter a valid Maharashtra pincode');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          city: city.trim() || undefined,
          profileImage: profileImage || undefined,
        },
      });

      // Invalidate query to trigger profile re-fetching
      queryClient.invalidateQueries({ queryKey: [`/api/auth/me`] });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to update profile';
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.inner, { paddingBottom: bottomPadding + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable 
            style={[styles.avatarRing, { borderColor: colors.gold }]}
            onPress={async () => {
              const url = await pickAndUploadImage();
              if (url) setProfileImage(url);
            }}
            disabled={uploading}
          >
            {profileImage ? (
              <ExpoImage
                source={{ uri: profileImage }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : 'A'}</Text>
              </View>
            )}
            {uploading && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 40, alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.orange }]}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={[styles.changePhotoText, { color: colors.accent }]}>Tap to change photo</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Fields */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>FULL NAME</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PHONE NUMBER</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="phone" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL ADDRESS</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PINCODE (MAHARASHTRA ONLY)</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              value={pincode}
              onChangeText={handlePincodeChange}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              placeholderTextColor={colors.mutedForeground}
            />
            {resolvingPin && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>RESOLVED CITY</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="map-pin" size={18} color={colors.mutedForeground} />
            <Text style={[styles.readOnlyText, { color: city ? colors.text : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {city || 'Enter pincode to resolve location'}
            </Text>
            <View style={[styles.lockedBadge, { backgroundColor: colors.border }]}>
              <Feather name="lock" size={10} color={colors.mutedForeground} />
            </View>
          </View>
        </View>

        {/* Devotee ID (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>DEVOTEE ID</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <Text style={[styles.readOnlyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {user?.id ? `SKL-D-${user.id}` : 'SKL-D-GUEST'}
            </Text>
            <View style={[styles.lockedBadge, { backgroundColor: colors.border }]}>
              <Feather name="lock" size={10} color={colors.mutedForeground} />
            </View>
          </View>
        </View>

        {/* Save */}
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  inner: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 32 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  changePhotoText: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 8 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  readOnlyText: { flex: 1, fontSize: 15 },
  lockedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 17, gap: 10, marginTop: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#DC2626', flex: 1 },
});
