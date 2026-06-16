import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

const FAQS = [
  {
    q: 'How do I book a pandit?',
    a: 'Browse pandits or select a pooja type → choose your preferred pandit → pick a date & muhurat time → confirm your booking. The pandit will reach your address at the scheduled time.',
  },
  {
    q: 'Are all pandits verified?',
    a: 'Yes! Every pandit on Sankalp goes through a 3-step verification: credential check, background verification, and community rating. Only pandits with 4.0+ rating are listed.',
  },
  {
    q: 'Can I cancel or reschedule a booking?',
    a: 'You can cancel or reschedule up to 24 hours before the scheduled ritual. Go to My Bookings → select your booking → tap Cancel/Reschedule.',
  },
  {
    q: 'What is included in the pooja samagri?',
    a: 'Each pooja listing mentions what the pandit brings and what the devotee needs to provide. You can also order the complete samagri kit from our store.',
  },
  {
    q: 'How is the pandit fee determined?',
    a: 'Pandit fees are set by them based on the ritual type, duration, and their experience. You see the full price before confirming. No hidden charges.',
  },
  {
    q: 'What if the pandit doesn\'t show up?',
    a: 'In the rare case of a no-show, contact our support immediately. We guarantee a full refund and will arrange an alternative pandit within 2 hours.',
  },
  {
    q: 'Can I request a specific language?',
    a: 'Yes! Pandits specify the languages they can conduct rituals in (Sanskrit, Hindi, Tamil, Telugu, etc.). You can filter pandits by language from the search.',
  },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Contact Options */}
        <View style={styles.contactRow}>
          {[
            { icon: 'message-circle', label: 'Live Chat', color: '#7B1F1F', onPress: () => router.push('/contact-support') },
            { icon: 'phone', label: 'Call Us', color: '#D4722A', onPress: () => Linking.openURL('tel:+918800123456') },
            { icon: 'mail', label: 'Email', color: '#C89A3C', onPress: () => Linking.openURL('mailto:support@sankalp.in') },
          ].map(c => (
            <Pressable
              key={c.label}
              style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); c.onPress(); }}
            >
              <View style={[styles.contactIcon, { backgroundColor: c.color + '15' }]}>
                <Feather name={c.icon as any} size={22} color={c.color} />
              </View>
              <Text style={[styles.contactLabel, { color: colors.text }]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Support Hours */}
        <View style={[styles.hoursCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
          <Feather name="clock" size={16} color={colors.primary} />
          <Text style={[styles.hoursText, { color: colors.primary }]}>Support available 7 AM – 10 PM · 7 days a week</Text>
        </View>

        {/* FAQs */}
        <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => (
            <Pressable
              key={idx}
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.selectionAsync();
                setExpandedIdx(expandedIdx === idx ? null : idx);
              }}
            >
              <View style={styles.faqRow}>
                <Text style={[styles.faqQ, { color: colors.text }]}>{faq.q}</Text>
                <Feather
                  name={expandedIdx === idx ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.mutedForeground}
                />
              </View>
              {expandedIdx === idx && (
                <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
  contactRow: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 0 },
  contactCard: {
    flex: 1, alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, gap: 8,
  },
  contactIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  hoursCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 14, padding: 14, borderRadius: 12, borderWidth: 1,
  },
  hoursText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  faqTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  faqList: { paddingHorizontal: 20, gap: 10 },
  faqCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  faqQ: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  faqA: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginTop: 12 },
});
