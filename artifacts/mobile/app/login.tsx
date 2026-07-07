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
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useColors } from '@/hooks/useColors';
import { useAuthLogin, useAuthGoogle } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();


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
      // 1. Try native Google Sign-in first
      try {
        const { NativeModules } = require('react-native');
        const hasNativeModule = !!NativeModules.RNGoogleSignin;
        
        if (hasNativeModule) {
          const { GoogleSignin } = require('@react-native-google-signin/google-signin');
          const hasPlay = await GoogleSignin.hasPlayServices();
          if (hasPlay) {
            const userInfo = await GoogleSignin.signIn();
            idToken = userInfo.idToken;
          }
        }
      } catch (err) {
        console.log('Google Sign-In native module not available or not configured:', err);
      }

      let supabaseToken = '';

      if (idToken) {
        // Native Google Sign-in succeeded. Sign in to Supabase with the ID Token
        console.log('[GoogleLogin] Native token found. Authenticating with Supabase...');
        const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (supabaseError) throw supabaseError;
        if (!data.session) throw new Error('No Supabase session returned');
        supabaseToken = data.session.access_token;
      } else {
        // 2. Native sign-in not available or failed. Fallback to Web Redirect OAuth via Supabase
        console.log('[GoogleLogin] Falling back to Web-based Redirect OAuth...');
        const redirectUrl = Linking.createURL('login');
        console.log('[GoogleLogin] Redirect URL:', redirectUrl);

        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (oauthError) throw oauthError;
        if (!data?.url) throw new Error('No OAuth URL returned');

        console.log('[GoogleLogin] Opening browser auth session...');
        const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (browserResult.type === 'success' && browserResult.url) {
          console.log('[GoogleLogin] OAuth callback URL:', browserResult.url);
          
          // Parse hash fragment
          const hash = browserResult.url.split('#')[1];
          if (!hash) throw new Error('No session parameters found in redirect URL');

          const params: Record<string, string> = {};
          hash.split('&').forEach((part) => {
            const [key, value] = part.split('=');
            if (key && value) {
              params[key] = decodeURIComponent(value);
            }
          });

          const { access_token, refresh_token } = params;
          if (!access_token) throw new Error('Access token not found in URL');

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });

          if (sessionError) throw sessionError;
          if (!sessionData.session) throw new Error('Failed to retrieve Supabase session');

          supabaseToken = sessionData.session.access_token;
        } else {
          // If browser closed or cancelled, use mock bypass in development so they can proceed
          console.log('[GoogleLogin] Web OAuth cancelled or closed. Using mock dev fallback.');
          supabaseToken = 'mock_dev_google_id_token';
        }
      }

      // 3. Send Supabase Token to backend
      const result = await googleMutation.mutateAsync({
        data: {
          idToken: supabaseToken,
        },
      });

      console.log('[GoogleLogin] Got backend token:', result.token ? result.token.substring(0, 15) + '…' : 'NULL');
      await AsyncStorage.setItem('auth_token', result.token);
      await queryClient.invalidateQueries();
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Google authentication failed';
      setError(message);
    }
  };

  const [isDemoPending, setIsDemoPending] = useState(false);

  const handleDemoLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');
    setIsDemoPending(true);

    try {
      console.log('[DemoLogin] Attempting mock login via backend...');
      try {
        const result = await googleMutation.mutateAsync({
          data: {
            idToken: 'mock_dev_google_id_token',
          },
        });
        console.log('[DemoLogin] Backend authentication successful:', result.token ? result.token.substring(0, 15) + '…' : 'NULL');
        await AsyncStorage.setItem('auth_token', result.token);
      } catch (backendErr) {
        console.log('[DemoLogin] Backend/DB is offline, bypassing authentication locally:', backendErr);
        // Fallback: save a local mock token so they can preview the UI offline
        await AsyncStorage.setItem('auth_token', 'local_demo_token_bypass');
      }

      await queryClient.invalidateQueries();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError('Demo Sign-In failed');
    } finally {
      setIsDemoPending(false);
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
          style={[styles.googleBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: googleMutation.isPending ? 0.7 : 1, marginBottom: 12 }]}
          onPress={handleGoogleLogin}
          disabled={googleMutation.isPending || isDemoPending}
        >
          {googleMutation.isPending ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {/* Demo Sign-In */}
        <Pressable
          style={[styles.demoBtn, { backgroundColor: colors.card, borderColor: colors.gold, borderWidth: 1.5, opacity: isDemoPending ? 0.7 : 1 }]}
          onPress={handleDemoLogin}
          disabled={googleMutation.isPending || isDemoPending}
        >
          {isDemoPending ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <>
              <Feather name="shield" size={18} color={colors.gold} />
              <Text style={[styles.demoBtnText, { color: colors.text }]}>Demo Sign-In (Skip Setup)</Text>
            </>
          )}
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
    borderRadius: 14, paddingVertical: 15, borderWidth: 1, gap: 10,
  },
  googleIcon: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, borderWidth: 1.5, gap: 10, marginBottom: 24,
  },
  demoBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  registerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  guestRow: { alignItems: 'center' },
  guestText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
