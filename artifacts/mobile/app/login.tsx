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
import { useAuthLogin, useAuthGoogle } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const queryClient = useQueryClient();
  const loginMutation = useAuthLogin();
  const googleMutation = useAuthGoogle();

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        data: {
          identifier: identifier.trim(),
          password,
        },
      });

      console.log('[Login] Got token:', result.token ? result.token.substring(0, 15) + '…' : 'NULL');
      await AsyncStorage.setItem('auth_token', result.token);
      // Verify the token was actually stored
      const stored = await AsyncStorage.getItem('auth_token');
      console.log('[Login] Verified stored token:', stored ? stored.substring(0, 15) + '…' : 'NULL');
      
      await queryClient.invalidateQueries();
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Invalid credentials';
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');
    
    let idToken = '';

    try {
      // Try real Google Sign-In native module if installed and configured
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        const hasPlay = await GoogleSignin.hasPlayServices();
        if (hasPlay) {
          const userInfo = await GoogleSignin.signIn();
          idToken = userInfo.idToken;
        }
      } catch (err) {
        console.log('Google Sign-In native module not available or not configured:', err);
      }

      // Fallback to mock dev token for simulator / Expo Go local testing
      if (!idToken) {
        idToken = 'mock_dev_google_id_token';
      }

      const result = await googleMutation.mutateAsync({
        data: {
          idToken,
        },
      });
      console.log('[GoogleLogin] Got token:', result.token ? result.token.substring(0, 15) + '…' : 'NULL');
      await AsyncStorage.setItem('auth_token', result.token);
      await queryClient.invalidateQueries();
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Google authentication failed';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoOm}>ॐ</Text>
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>Sankalp</Text>
          <Text style={[styles.appSub, { color: colors.gold }]}>संकल्प</Text>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Sign in to continue your spiritual journey</Text>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email or Phone */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL OR PHONE NUMBER</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              placeholder="Email or phone number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="default"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              placeholder="Enter your password"
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

        <Pressable style={styles.forgotRow}>
          <Text style={[styles.forgotText, { color: colors.accent }]}>Forgot Password?</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable
          style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loginMutation.isPending ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>SIGN IN</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR</Text>
          <View style={[styles.orLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google */}
        <Pressable
          style={[styles.googleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
        </Pressable>

        {/* Create account */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/register' as any)}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Create Account</Text>
          </Pressable>
        </View>

        {/* Guest */}
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.guestRow}>
          <Text style={[styles.guestText, { color: colors.mutedForeground }]}>Continue as Guest</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoOm: { fontSize: 36, color: '#FFFFFF' },
  appName: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  appSub: { fontSize: 14, fontFamily: 'Inter_400Regular', letterSpacing: 2 },
  heading: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 28, lineHeight: 20 },
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
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  loginBtn: {
    borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 20,
  },
  loginBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 1 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, borderWidth: 1, gap: 10, marginBottom: 24,
  },
  googleIcon: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  registerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  guestRow: { alignItems: 'center' },
  guestText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
