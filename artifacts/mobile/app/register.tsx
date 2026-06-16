import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

import { useColors } from '@/hooks/useColors';
import { useAuthRegister } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { validatePincodeOffline } from '@/constants/data';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [resolvingPin, setResolvingPin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const queryClient = useQueryClient();
  const registerMutation = useAuthRegister();

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
      setError('Sankalp is currently only available in Uttar Pradesh (UP).');
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
          if (state === 'Uttar Pradesh') {
            setCity(district);
            setError('');
          } else {
            setError('Sankalp is currently only available in Uttar Pradesh (UP).');
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

  const fields = [
    { label: 'FULL NAME', icon: 'user', placeholder: 'Enter your full name', value: name, setter: setName, keyboardType: 'default' as const },
    { label: 'EMAIL ADDRESS', icon: 'mail', placeholder: 'Enter your email address', value: email, setter: setEmail, keyboardType: 'email-address' as const },
    { label: 'PHONE NUMBER', icon: 'phone', placeholder: 'Enter your phone number', value: phone, setter: setPhone, keyboardType: 'phone-pad' as const },
  ];

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Please provide email or phone number');
      return;
    }

    const emailTrimmed = email.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    const phoneTrimmed = phone.trim().replace(/[^0-9]/g, '');
    if (phone.trim() && phoneTrimmed.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (!city) {
      setError('Please enter a valid Uttar Pradesh pincode');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          city: city || undefined,
          password,
        },
      });

      console.log('[Register] Got token:', result.token ? result.token.substring(0, 15) + '…' : 'NULL');
      await AsyncStorage.setItem('auth_token', result.token);
      // Verify the token was actually stored
      const stored = await AsyncStorage.getItem('auth_token');
      console.log('[Register] Verified stored token:', stored ? stored.substring(0, 15) + '…' : 'NULL');
      
      await queryClient.invalidateQueries();
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Registration failed';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>

        {/* Header */}
        <View style={styles.headerArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoOm}>ॐ</Text>
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Join thousands of devotees on Sankalp</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Fields */}
        {fields.map(f => (
          <View key={f.label} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{f.label}</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={f.icon as any} size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={f.keyboardType}
                value={f.value}
                onChangeText={f.setter}
                autoCapitalize={f.keyboardType === 'email-address' ? 'none' : 'words'}
              />
            </View>
          </View>
        ))}

        {/* Pincode Input */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PINCODE (UTTAR PRADESH ONLY)</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="hash" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              placeholder="Enter 6-digit Pincode"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={handlePincodeChange}
            />
            {resolvingPin && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          {city ? (
            <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.success, marginTop: 6, marginLeft: 4 }}>
              Location: {city}, Uttar Pradesh
            </Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              placeholder="Min. 8 characters"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By creating an account, you agree to our{' '}
          <Text style={[styles.termsLink, { color: colors.primary }]}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
        </Text>

        {/* Create Account */}
        <Pressable
          style={[styles.createBtn, { backgroundColor: colors.primary, opacity: registerMutation.isPending ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createBtnText}>CREATE ACCOUNT</Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/login' as any)}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoOm: { fontSize: 28, color: '#FFFFFF' },
  heading: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#DC2626', flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  dropdown: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1,
  },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  terms: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, textAlign: 'center', marginBottom: 20 },
  termsLink: { fontFamily: 'Inter_600SemiBold' },
  createBtn: { borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 20 },
  createBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  loginLink: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
