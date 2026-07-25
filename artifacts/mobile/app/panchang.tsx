import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { getPanchangForDate } from '@/constants/panchang';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useColors } from '@/hooks/useColors';
import { PanchangCard } from '@/components/PanchangCard';

const DATE_OFFSETS = [0, 1, 2];

export default function PanchangScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lang, t, f } = useLanguage();
  const [selectedOffset, setSelectedOffset] = useState(0);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedOffset);
  const panchang = getPanchangForDate(targetDate);
  const topPadding = Platform.OS === 'web' ? 16 : insets.top;

  const getDateInfo = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const day = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
    const date = d.getDate();
    const month = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short' });

    let label = '';
    if (offset === 0) label = lang === 'hi' ? 'आज' : 'Today';
    else if (offset === 1) label = lang === 'hi' ? 'कल' : 'Tomorrow';
    else label = day;

    return { label, date, month };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, {
        paddingTop: topPadding + 8,
        backgroundColor: colors.primary,
      }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
        >
          <Feather name="arrow-left" size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerOm, { fontFamily: f('bold') }]}>ॐ</Text>
          <Text style={[styles.headerTitle, { fontFamily: f('bold') }]}>
            {lang === 'hi' ? 'हिन्दू पंचांग' : 'Hindu Panchang'}
          </Text>
          <Text style={[styles.headerSub, { fontFamily: f('regular') }]}>
            {lang === 'hi' ? 'तिथि, नक्षत्र एवं शुभ मुहूर्त' : 'Tithi, Nakshatra & Shubh Muhurat'}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelectorWrap, { backgroundColor: colors.primary }]}>
        <View style={[styles.dateSelectorPill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          {DATE_OFFSETS.map((offset) => {
            const info = getDateInfo(offset);
            const isSelected = selectedOffset === offset;
            return (
              <Pressable
                key={offset}
                style={[
                  styles.datePill,
                  isSelected && [styles.datePillActive, { backgroundColor: '#FFFFFF' }],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedOffset(offset);
                }}
              >
                <Text style={[
                  styles.datePillLabel,
                  { fontFamily: f('bold'), color: isSelected ? colors.primary : 'rgba(255,255,255,0.7)' },
                ]}>
                  {info.label}
                </Text>
                <Text style={[
                  styles.datePillDate,
                  { fontFamily: f('regular'), color: isSelected ? colors.primary : 'rgba(255,255,255,0.55)' },
                ]}>
                  {info.date} {info.month}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Panchang Detail Card */}
        <View style={{ marginTop: 16 }}>
          <PanchangCard panchang={panchang} showFullDetails />
        </View>

        {/* Recommended Poojas Section */}
        <View style={styles.sectionWrap}>

          {/* Section Header */}
          <View style={[styles.sectionHeader, { borderLeftColor: colors.orange }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>
              {selectedOffset === 0
                ? (lang === 'hi' ? 'आज के लिए अनुशंसित पूजाएँ' : "Today's Recommended Poojas")
                : (lang === 'hi' ? 'कल के लिए अनुशंसित पूजाएँ' : "Tomorrow's Recommended Poojas")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              {lang === 'hi'
                ? 'तिथि एवं ग्रह नक्षत्र के अनुसार विशेष पूजाएँ'
                : 'Curated by Tithi & planetary alignment'}
            </Text>
          </View>

          {panchang.recommendedPoojas.map((item, idx) => {
            const name = lang === 'hi' ? item.nameHi : item.nameEn;
            const reason = lang === 'hi' ? item.reasonHi : item.reasonEn;

            return (
              <View
                key={idx}
                style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Card top row */}
                <View style={styles.recCardTop}>
                  <View style={[styles.recIconBg, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={styles.recIconEmoji}>🪔</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.recBadgeRow}>
                      <View style={[styles.recBadge, { backgroundColor: colors.orange + '18' }]}>
                        <Feather name="star" size={9} color={colors.orange} />
                        <Text style={[styles.recBadgeText, { color: colors.orange, fontFamily: f('bold') }]}>
                          {lang === 'hi' ? 'शुभ अनुष्ठान' : 'AUSPICIOUS'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.recName, { color: colors.text, fontFamily: f('bold') }]}>
                      {name}
                    </Text>
                  </View>
                </View>

                {/* Reason */}
                <Text style={[styles.recReason, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                  {reason}
                </Text>

                {/* Book CTA */}
                <Pressable
                  style={[styles.bookCta, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/pandit/${item.panditId}` as any);
                  }}
                >
                  <Feather name="calendar" size={14} color="#FFFFFF" />
                  <Text style={[styles.bookCtaText, { fontFamily: f('bold') }]}>
                    {t('bookRecommendedPooja')}
                  </Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerOm: {
    fontSize: 20,
    color: '#FFD700',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  // Date Selector
  dateSelectorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateSelectorPill: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  datePill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  datePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  datePillLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  datePillDate: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Recommended Section
  sectionWrap: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  sectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  recCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  recCardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  recIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recIconEmoji: {
    fontSize: 22,
  },
  recBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  recName: {
    fontSize: 15,
    lineHeight: 20,
  },
  recReason: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
});
