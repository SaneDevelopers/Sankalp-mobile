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

      {/* Main Grid — Tithi & Nakshatra side by side */}
      <View style={styles.mainGrid}>
        {/* Tithi Block */}
        <View style={[styles.gridBlock, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
          <View style={styles.gridBlockHeader}>
            <View style={[styles.iconDot, { backgroundColor: colors.primary + '18' }]}>
              <Text style={styles.iconEmoji}>🌙</Text>
            </View>
            <Text style={[styles.blockLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
              {t('tithi')}
            </Text>
          </View>
          <Text style={[styles.blockValue, { color: colors.text, fontFamily: f('bold') }]} numberOfLines={1}>
            {tithiText}
          </Text>
          <Text style={[styles.blockSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
            {lang === 'hi' ? 'तक' : 'until'} {panchang.tithi.until}
          </Text>
        </View>

        {/* Nakshatra Block */}
        <View style={styles.gridBlock}>
          <View style={styles.gridBlockHeader}>
            <View style={[styles.iconDot, { backgroundColor: colors.gold + '18' }]}>
              <Text style={styles.iconEmoji}>⭐</Text>
            </View>
            <Text style={[styles.blockLabel, { color: colors.mutedForeground, fontFamily: f('medium') }]}>
              {t('nakshatra')}
            </Text>
          </View>
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
            – {panchang.sunset}
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
            <View style={[styles.vertDivider, { backgroundColor: colors.border, height: 28 }]} />
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
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#7B1F1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stripOm: {
    fontSize: 20,
    color: '#FFD700',
    opacity: 0.9,
  },
  stripTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  stripSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  mainGrid: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  gridBlock: {
    flex: 1,
    paddingHorizontal: 14,
  },
  gridBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 12,
  },
  blockLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  blockValue: {
    fontSize: 13,
    lineHeight: 17,
  },
  blockSub: {
    fontSize: 9,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 0,
  },
  timingsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  timingBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  timingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  timingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  timingLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timingValue: {
    fontSize: 12,
  },
  timingValueSub: {
    fontSize: 9,
  },
  vertDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  yogaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
  },
  yogaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  yogaLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  yogaValue: {
    fontSize: 12,
  },
});
