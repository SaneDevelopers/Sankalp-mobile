import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

const CITIES = ['Delhi NCR', 'Mumbai', 'Varanasi', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata'];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const fields = [
    { label: 'FULL NAME', icon: 'user', placeholder: 'Arnav Sharma', value: name, setter: setName, keyboardType: 'default' as const },
    { label: 'PHONE NUMBER', icon: 'phone', placeholder: '98765 43210', value: phone, setter: setPhone, keyboardType: 'phone-pad' as const },
  ];

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
              />
            </View>
          </View>
        ))}

        {/* City picker */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>CITY</Text>
          <Pressable
            style={[styles.inputRow, { backgroundColor: colors.card, borderColor: showCities ? colors.primary : colors.border }]}
            onPress={() => setShowCities(!showCities)}
          >
            <Feather name="map-pin" size={18} color={colors.mutedForeground} />
            <Text style={[styles.input, { color: city ? colors.text : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {city || 'Select your city'}
            </Text>
            <Feather name={showCities ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
          </Pressable>
          {showCities && (
            <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {CITIES.map(c => (
                <Pressable
                  key={c}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setCity(c); setShowCities(false); }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>{c}</Text>
                  {city === c && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          )}
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
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/otp' as any);
          }}
        >
          <Text style={styles.createBtnText}>CREATE ACCOUNT</Text>
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
