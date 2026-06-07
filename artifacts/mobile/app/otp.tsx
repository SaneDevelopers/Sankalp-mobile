import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    if (cleaned && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: topPadding + 16 }]}>
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
          <Feather name="message-circle" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Verify Phone</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Enter the 6-digit OTP sent to{'\n'}
          <Text style={[styles.phone, { color: colors.text }]}>+91 98765 43210</Text>
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { inputs.current[idx] = r; }}
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: digit ? colors.primary + '10' : colors.card,
                  color: colors.text,
                  fontFamily: 'Inter_700Bold',
                },
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={val => handleChange(val, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={[styles.resendLabel, { color: colors.mutedForeground }]}>Didn't receive OTP? </Text>
          {countdown > 0 ? (
            <Text style={[styles.countdown, { color: colors.primary }]}>Resend in {countdown}s</Text>
          ) : (
            <Pressable onPress={() => {
              setOtp(Array(OTP_LENGTH).fill(''));
              setCountdown(30);
              inputs.current[0]?.focus();
            }}>
              <Text style={[styles.resendBtn, { color: colors.primary }]}>RESEND OTP</Text>
            </Pressable>
          )}
        </View>

        {/* Verify */}
        <Pressable
          style={[styles.verifyBtn, { backgroundColor: isComplete ? colors.primary : colors.border }]}
          disabled={!isComplete}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
          }}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.verifyBtnText}>VERIFY & CONTINUE</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24, alignSelf: 'center',
  },
  heading: { fontSize: 26, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 36, color: '#888' },
  phone: { fontFamily: 'Inter_600SemiBold' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  otpBox: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 2,
    textAlign: 'center', fontSize: 22,
  },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 36 },
  resendLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  countdown: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  resendBtn: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 17, gap: 10,
  },
  verifyBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1 },
});
