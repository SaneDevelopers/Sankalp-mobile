import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOOKINGS } from '@/constants/data';
import { PANDIT_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';
import { useAuthMe, useGetBookings, getGetBookingsQueryKey } from '@workspace/api-client-react';

const STATUS_STEPS = [
  { key: 'booked', label: 'Booking Confirmed', icon: 'check-circle' },
  { key: 'confirmed', label: 'Pandit Confirmed', icon: 'user-check' },
  { key: 'completed', label: 'Ritual Completed', icon: 'star' },
];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: user } = useAuthMe();
  const { data: apiBookings = [] } = useGetBookings({
    query: {
      enabled: !!user,
      queryKey: getGetBookingsQueryKey(),
    },
  });

  const booking = user
    ? (apiBookings.find(b => b.id.toString() === id || b.bookingId === id) ?? apiBookings[0] ?? BOOKINGS[0])
    : (BOOKINGS.find(b => b.id === id) ?? BOOKINGS[0]);

  const getStatusStyle = () => {
    if (booking.status === 'upcoming') return { color: colors.upcoming, bg: colors.upcoming + '15', label: 'UPCOMING' };
    if (booking.status === 'completed') return { color: colors.success, bg: colors.success + '15', label: 'COMPLETED' };
    return { color: colors.destructive, bg: colors.destructive + '15', label: 'CANCELLED' };
  };

  const statusStyle = getStatusStyle();
  const bookingObj = booking as any;
  const panditImgId = bookingObj.panditId ? bookingObj.panditId.toString() : (bookingObj.panditInitials === 'VS' ? '1' : bookingObj.panditInitials === 'KN' ? '2' : bookingObj.panditInitials === 'RJ' ? '3' : '4');
  const imageSource = PANDIT_IMAGES[panditImgId] ?? PANDIT_IMAGES['1'];
  const completedSteps = booking.status === 'completed' ? 3 : booking.status === 'upcoming' ? 2 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + bottomPadding }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Booking Details</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Booking ID */}
          <View style={[styles.bookingIdCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Feather name="hash" size={14} color={colors.primary} />
            <Text style={[styles.bookingIdText, { color: colors.primary }]}>Booking ID: {booking.bookingId}</Text>
          </View>

          {/* Pandit Info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={imageSource} style={styles.panditPhoto} resizeMode="cover" />
            <View style={styles.panditInfo}>
              <Text style={[styles.panditName, { color: colors.text }]}>{booking.panditName}</Text>
              <Text style={[styles.poojaName, { color: colors.primary }]}>{booking.poojaName}</Text>
              <View style={styles.metaRow}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{booking.date} · {booking.time}</Text>
              </View>
            </View>
          </View>

          {/* Date & Time */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardTitle, { color: colors.mutedForeground }]}>DATE & TIME</Text>
            <View style={styles.infoRow}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{booking.date}, 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{booking.time} · Shubh Muhurat</Text>
            </View>
          </View>

          {/* Address */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardTitle, { color: colors.mutedForeground }]}>VENUE</Text>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>A-301, Lotus Towers, Sector 62, Noida – 201301</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardTitle, { color: colors.mutedForeground }]}>PAYMENT SUMMARY</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.text }]}>Pooja Charges</Text>
              <Text style={[styles.amountValue, { color: colors.text }]}>₹{(booking.amount - 99).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: colors.text }]}>Platform Fee</Text>
              <Text style={[styles.amountValue, { color: colors.text }]}>₹99</Text>
            </View>
            <View style={[styles.amountDivider, { backgroundColor: colors.border }]} />
            <View style={styles.amountRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Paid</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹{booking.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.paymentMethod, { backgroundColor: colors.primary + '10' }]}>
              <Feather name="credit-card" size={14} color={colors.primary} />
              <Text style={[styles.paymentMethodText, { color: colors.primary }]}>Paid via UPI · Confirmed</Text>
            </View>
          </View>

          {/* Timeline */}
          {booking.status !== 'cancelled' && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoCardTitle, { color: colors.mutedForeground }]}>STATUS TIMELINE</Text>
              {STATUS_STEPS.map((step, i) => (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, {
                      backgroundColor: i < completedSteps ? colors.success : colors.border,
                    }]}>
                      <Feather name={step.icon as any} size={12} color={i < completedSteps ? '#FFFFFF' : colors.mutedForeground} />
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: i < completedSteps - 1 ? colors.success : colors.border }]} />
                    )}
                  </View>
                  <Text style={[styles.timelineLabel, { color: i < completedSteps ? colors.text : colors.mutedForeground }]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {booking.status === 'completed' && (
          <Pressable
            style={[styles.rateBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/review/${booking.id}` as any);
            }}
          >
            <Feather name="star" size={18} color="#FFFFFF" />
            <Text style={styles.rateBtnText}>Rate & Review Pandit</Text>
          </Pressable>
        )}
        {booking.status === 'upcoming' && (
          <Pressable style={[styles.cancelBtn, { borderColor: colors.destructive }]}>
            <Text style={[styles.cancelBtnText, { color: colors.destructive }]}>Cancel Booking</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.bookAgainBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(tabs)/pandits' as any)}
        >
          <Text style={[styles.bookAgainText, { color: colors.text }]}>Book Again</Text>
        </Pressable>
      </View>
    </View>
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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  body: { padding: 20, gap: 12 },
  bookingIdCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  bookingIdText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  panditPhoto: { width: 56, height: 56, borderRadius: 28 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  poojaName: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  infoCardTitle: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  amountCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  amountValue: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  amountDivider: { height: 1 },
  totalLabel: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  totalValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  paymentMethod: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
  },
  paymentMethodText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  timelineLeft: { alignItems: 'center' },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: { width: 2, height: 20, marginVertical: 2 },
  timelineLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', paddingTop: 4 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, gap: 10,
  },
  rateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, gap: 10,
  },
  rateBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 },
  cancelBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5 },
  cancelBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  bookAgainBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  bookAgainText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
