import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DATES, PANDITS } from '@/constants/data';
import { useColors } from '@/hooks/useColors';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const pandit = PANDITS.find(p => p.id === id) ?? PANDITS[0];
  const [selectedPooja, setSelectedPooja] = useState(pandit.poojas[0]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState(0);
  const [showPoojaSelect, setShowPoojaSelect] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Book Ritual</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
          {/* Pandit Mini Card */}
          <View style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.panditAvatar, { backgroundColor: pandit.avatarColor }]}>
              <Text style={styles.panditAvatarText}>{pandit.initials}</Text>
            </View>
            <View style={styles.panditInfo}>
              <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
              <Text style={[styles.panditSpec, { color: colors.mutedForeground }]}>{pandit.specialty} · {pandit.experience}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.text }]}>{pandit.rating}</Text>
            </View>
          </View>

          {/* Select Pooja */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT POOJA</Text>
          <Pressable
            style={[styles.poojaSelector, { backgroundColor: colors.card, borderColor: showPoojaSelect ? colors.primary : colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              setShowPoojaSelect(!showPoojaSelect);
            }}
          >
            <View style={styles.poojaSelectorContent}>
              <Text style={[styles.poojaSelectorName, { color: colors.text }]}>{selectedPooja.name}</Text>
              <Text style={[styles.poojaSelectorMeta, { color: colors.mutedForeground }]}>{selectedPooja.duration} · Includes Prasad</Text>
            </View>
            <View style={styles.poojaPriceCol}>
              <Text style={[styles.poojaPrice, { color: colors.primary }]}>₹{selectedPooja.price.toLocaleString('en-IN')}</Text>
              <Feather name={showPoojaSelect ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          {showPoojaSelect && (
            <View style={[styles.poojaDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {pandit.poojas.map(p => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.poojaOption,
                    { borderBottomColor: colors.border },
                    p.id === selectedPooja.id && { backgroundColor: colors.primary + '10' },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPooja(p);
                    setShowPoojaSelect(false);
                  }}
                >
                  <Text style={[styles.poojaOptionName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.poojaOptionPrice, { color: colors.primary }]}>₹{p.price.toLocaleString('en-IN')}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Select Date */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT DATE</Text>
          <View style={styles.datesRow}>
            {DATES.map((d, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.dateChip,
                  { borderColor: selectedDate === idx ? colors.primary : colors.border, backgroundColor: selectedDate === idx ? colors.primary : colors.card },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedDate(idx);
                }}
              >
                <Text style={[styles.dateDay, { color: selectedDate === idx ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }]}>{d.day}</Text>
                <Text style={[styles.dateNum, { color: selectedDate === idx ? '#FFFFFF' : colors.text }]}>{d.date}</Text>
              </Pressable>
            ))}
          </View>

          {/* Muhurat */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>MUHURAT (TIME)</Text>
          <View style={styles.timesGrid}>
            {pandit.muhurats.map((t, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.timeChip,
                  { borderColor: selectedTime === idx ? colors.primary : colors.border, backgroundColor: selectedTime === idx ? colors.primary : colors.card },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTime(idx);
                }}
              >
                <Text style={[styles.timeText, { color: selectedTime === idx ? '#FFFFFF' : colors.text }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Address */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>ADDRESS</Text>
          <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="home" size={14} color={colors.primary} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={[styles.addressTitle, { color: colors.text }]}>Home · Arnav Sharma</Text>
              <Text style={[styles.addressText, { color: colors.mutedForeground }]}>A-301, Lotus Towers, Sector 62, Noida – 201301</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.continueBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/confirmed' as any);
          }}
        >
          <Text style={styles.continueBtnText}>Continue · ₹{selectedPooja.price.toLocaleString('en-IN')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  body: { padding: 20 },
  panditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  panditAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditAvatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  panditSpec: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  poojaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 4,
  },
  poojaSelectorContent: { flex: 1 },
  poojaSelectorName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  poojaSelectorMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  poojaPriceCol: { alignItems: 'flex-end', gap: 4 },
  poojaPrice: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  poojaDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  poojaOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  poojaOptionName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  poojaOptionPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dateDay: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  dateNum: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 2 },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  timeChip: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  timeText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  addressText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 17 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
