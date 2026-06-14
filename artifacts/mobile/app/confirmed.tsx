import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConfirmedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const [latestBooking, setLatestBooking] = useState<any>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AsyncStorage.getItem('@sankalp:latest_booking').then(val => {
      if (val) {
        setLatestBooking(JSON.parse(val));
      }
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={styles.content}>
        {/* Success Circle */}
        <View style={[styles.successCircle, { backgroundColor: colors.gold + '20' }]}>
          <View style={[styles.successInner, { backgroundColor: colors.gold }]}>
            <Feather name="check" size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* OM Symbol */}
        <Text style={[styles.omSymbol, { color: colors.primary }]}>ॐ</Text>

        <Text style={[styles.title, { color: colors.primary }]}>Booking Confirmed</Text>
        <Text style={[styles.blessing, { color: colors.mutedForeground }]}>
          May this sacred ritual bring peace, prosperity{'\n'}and divine blessings to your home.
        </Text>

        {/* Booking Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Booking ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {latestBooking?.bookingId || 'SKL-8821'}
            </Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Pandit</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {latestBooking?.panditName || 'Acharya Shastri'}
            </Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Date · Time</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {latestBooking ? `${latestBooking.date} · ${latestBooking.time}` : '15 Oct · 9:30 AM'}
            </Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Paid</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
              ₹{latestBooking ? latestBooking.amount.toLocaleString('en-IN') : '3,181'}
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16 }]}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/bookings' as any);
          }}
        >
          <Text style={styles.primaryBtnText}>View Booking Details</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>BACK TO HOME</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omSymbol: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  blessing: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  detailDivider: { height: 1 },
  detailLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
});
