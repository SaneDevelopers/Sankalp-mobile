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
        paddingTop: topPadding + 6,
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

        <View style={{ width: 34 }} />
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
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Panchang Detail Card */}
        <View style={{ marginTop: 12 }}>
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
                {/* Card top row — icon + text + badge */}
                <View style={styles.recCardTop}>
                  <View style={[styles.recIconBg, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={styles.recIconEmoji}>🪔</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recName, { color: colors.text, fontFamily: f('bold') }]}>
                      {name}
                    </Text>
                    <Text style={[styles.recReason, { color: colors.mutedForeground, fontFamily: f('regular') }]} numberOfLines={2}>
                      {reason}
                    </Text>
                  </View>
                  <View style={[styles.recBadge, { backgroundColor: colors.orange + '18' }]}>
                    <Feather name="star" size={7} color={colors.orange} />
                    <Text style={[styles.recBadgeText, { color: colors.orange, fontFamily: f('bold') }]}>
                      {lang === 'hi' ? 'शुभ' : 'SHUBH'}
                    </Text>
                  </View>
                </View>

                {/* Book CTA — compact, right-aligned */}
                <View style={styles.recCardBottom}>
                  <Pressable
                    style={[styles.bookCta, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/pandit/${item.panditId}` as any);
                    }}
                  >
                    <Feather name="calendar" size={11} color="#FFFFFF" />
                    <Text style={[styles.bookCtaText, { fontFamily: f('bold') }]}>
                      {t('bookRecommendedPooja')}
                    </Text>
                    <Feather name="chevron-right" size={11} color="#FFFFFF" />
                  </Pressable>
                </View>
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
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  headerOm: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },

  // Date Selector
  dateSelectorWrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  dateSelectorPill: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  datePill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  datePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  datePillLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  datePillDate: {
    fontSize: 9,
    textAlign: 'center',
  },

  // Recommended Section
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 2,
  },
  sectionHeader: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 19,
  },
  sectionSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  recCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  recCardTop: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  recIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recIconEmoji: {
    fontSize: 14,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  recBadgeText: {
    fontSize: 7,
    letterSpacing: 0.3,
  },
  recName: {
    fontSize: 13,
    lineHeight: 17,
  },
  recReason: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
  },
  recCardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bookCtaText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
