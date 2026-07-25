import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { PanchangDetail } from '@/constants/panchang';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useColors } from '@/hooks/useColors';

interface PanchangCardProps {
  panchang: PanchangDetail;
  showFullDetails?: boolean;
}

export function PanchangCard({ panchang, showFullDetails = false }: PanchangCardProps) {
  const colors = useColors();
  const { lang, t, f } = useLanguage();

  const tithiText = `${lang === 'hi' ? panchang.tithi.pakshaHi : panchang.tithi.pakshaEn} ${
    lang === 'hi' ? panchang.tithi.hi : panchang.tithi.en
  }`;
  const nakshatraText = lang === 'hi' ? panchang.nakshatra.hi : panchang.nakshatra.en;
  const statusText = lang === 'hi' ? panchang.auspiciousStatus.hi : panchang.auspiciousStatus.en;
  const isAuspicious = panchang.auspiciousStatus.isHighlyAuspicious;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

      {/* Decorative top strip */}
      <View style={[styles.topStrip, { backgroundColor: colors.primary }]}>
        <View style={styles.stripLeft}>
          <Text style={[styles.stripOm, { fontFamily: f('bold') }]}>ॐ</Text>
          <View>
            <Text style={[styles.stripTitle, { fontFamily: f('bold') }]}>
              {lang === 'hi' ? 'हिन्दू पंचांग' : 'Hindu Panchang'}
            </Text>
            <Text style={[styles.stripSub, { fontFamily: f('regular') }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {!showFullDetails && (
          <Pressable
            style={styles.viewBtn}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/panchang' as any);
            }}
          >
            <Text style={[styles.viewBtnText, { fontFamily: f('bold') }]}>
              {lang === 'hi' ? 'विस्तार' : 'Details'}
            </Text>
            <Feather name="chevron-right" size={12} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Main Grid */}
      <View style={styles.mainGrid}>
        {/* Tithi Block */}
        <View style={[styles.gridBlock, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
          <View style={[styles.iconDot, { backgroundColor: colors.primary + '18' }]}>
            <Text style={styles.iconEmoji}>🌙</Text>
          </View>
          <Text style={[styles.blockLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
            {t('tithi')}
          </Text>
          <Text style={[styles.blockValue, { color: colors.text, fontFamily: f('bold') }]} numberOfLines={1}>
            {tithiText}
          </Text>
          <Text style={[styles.blockSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
            {lang === 'hi' ? 'तक' : 'until'} {panchang.tithi.until}
          </Text>
        </View>

        {/* Nakshatra Block */}
        <View style={styles.gridBlock}>
          <View style={[styles.iconDot, { backgroundColor: colors.gold + '18' }]}>
            <Text style={styles.iconEmoji}>⭐</Text>
          </View>
          <Text style={[styles.blockLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
            {t('nakshatra')}
          </Text>
          <Text style={[styles.blockValue, { color: colors.text, fontFamily: f('bold') }]} numberOfLines={1}>
            {nakshatraText}
          </Text>
          <Text style={[styles.blockSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
            {lang === 'hi' ? 'तक' : 'until'} {panchang.nakshatra.until}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Timings Row */}
      <View style={styles.timingsRow}>
        {/* Shubh Muhurat */}
        <View style={styles.timingBlock}>
          <View style={styles.timingIconRow}>
            <View style={[styles.timingDot, { backgroundColor: '#16A34A' }]} />
            <Text style={[styles.timingLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
              {t('shubhMuhurat')}
            </Text>
          </View>
          <Text style={[styles.timingValue, { color: '#16A34A', fontFamily: f('bold') }]}>
            {panchang.abhijitMuhurat.start}
          </Text>
          <Text style={[styles.timingValueSub, { color: '#16A34A', fontFamily: f('regular') }]}>
            – {panchang.abhijitMuhurat.end}
          </Text>
        </View>

        {/* Vertical separator */}
        <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

        {/* Rahu Kalam */}
        <View style={styles.timingBlock}>
          <View style={styles.timingIconRow}>
            <View style={[styles.timingDot, { backgroundColor: '#DC2626' }]} />
            <Text style={[styles.timingLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
              {t('rahukalam')}
            </Text>
          </View>
          <Text style={[styles.timingValue, { color: '#DC2626', fontFamily: f('bold') }]}>
            {panchang.rahukalam.start}
          </Text>
          <Text style={[styles.timingValueSub, { color: '#DC2626', fontFamily: f('regular') }]}>
            – {panchang.rahukalam.end}
          </Text>
        </View>

        {/* Vertical separator */}
        <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

        {/* Sunrise */}
        <View style={styles.timingBlock}>
          <View style={styles.timingIconRow}>
            <View style={[styles.timingDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.timingLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
              {lang === 'hi' ? 'सूर्योदय' : 'Sunrise'}
            </Text>
          </View>
          <Text style={[styles.timingValue, { color: '#92400E', fontFamily: f('bold') }]}>
            {panchang.sunrise}
          </Text>
          <Text style={[styles.timingValueSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
            {lang === 'hi' ? '–' : '–'} {panchang.sunset}
          </Text>
        </View>
      </View>

      {/* Extra details when full mode */}
      {showFullDetails && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.yogaRow}>
            <View style={styles.yogaItem}>
              <Text style={[styles.yogaLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
                {lang === 'hi' ? 'योग' : 'Yoga'}
              </Text>
              <Text style={[styles.yogaValue, { color: colors.text, fontFamily: f('semibold') }]}>
                {lang === 'hi' ? panchang.yoga.hi : panchang.yoga.en}
              </Text>
            </View>
            <View style={[styles.vertDivider, { backgroundColor: colors.border, height: 30 }]} />
            <View style={styles.yogaItem}>
              <Text style={[styles.yogaLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
                {lang === 'hi' ? 'करण' : 'Karana'}
              </Text>
              <Text style={[styles.yogaValue, { color: colors.text, fontFamily: f('semibold') }]}>
                {lang === 'hi' ? panchang.karana.hi : panchang.karana.en}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#7B1F1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stripOm: {
    fontSize: 22,
    color: '#FFD700',
    opacity: 0.9,
  },
  stripTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stripSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  mainGrid: {
    flexDirection: 'row',
    paddingVertical: 14,
  },
  gridBlock: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 3,
  },
  iconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconEmoji: {
    fontSize: 14,
  },
  blockLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  blockValue: {
    fontSize: 14,
    marginTop: 1,
  },
  blockSub: {
    fontSize: 9.5,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 0,
  },
  timingsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  timingBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  timingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timingLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timingValue: {
    fontSize: 13,
    marginTop: 2,
  },
  timingValueSub: {
    fontSize: 10,
  },
  vertDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  yogaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  yogaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  yogaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yogaValue: {
    fontSize: 13,
  },
});
