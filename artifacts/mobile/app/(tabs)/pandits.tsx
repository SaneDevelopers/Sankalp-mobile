import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PANDITS, Pandit } from '@/constants/data';
import { useColors } from '@/hooks/useColors';

const FILTERS = ['ALL', 'VEDIC', 'ASTROLOGY', 'HAVAN'];
const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

export default function PanditsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = activeFilter === 'ALL'
    ? PANDITS
    : PANDITS.filter(p => p.category.toUpperCase() === activeFilter || p.specialty.toUpperCase().includes(activeFilter));

  const getAvailLabel = (p: Pandit) => {
    if (p.available === 'today') return { label: 'AVAILABLE TODAY', color: colors.success };
    if (p.available === 'tomorrow') return { label: 'TOMORROW', color: colors.orange };
    return { label: 'NEXT WEEK', color: colors.mutedForeground };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Trusted Pandits</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveFilter(f);
            }}
            style={[
              styles.filterTab,
              activeFilter === f && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === f ? '#FFFFFF' : colors.mutedForeground },
            ]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Pandit List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const avail = getAvailLabel(item);
          return (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/pandit/${item.id}` as any);
              }}
            >
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{item.specialty} · {item.experience}</Text>
                <View style={styles.row}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.city, { color: colors.mutedForeground }]}>{item.city}</Text>
                </View>
                <View style={styles.availRow}>
                  <View style={[styles.dot, { backgroundColor: avail.color }]} />
                  <Text style={[styles.availText, { color: avail.color }]}>{avail.label}</Text>
                </View>
              </View>
              <View style={styles.rightCol}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text style={[styles.rating, { color: colors.text }]}>{item.rating}</Text>
                </View>
                <Pressable
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/book/${item.id}` as any);
                  }}
                >
                  <Text style={styles.bookBtnText}>BOOK</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 18 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  specialty: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  city: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  rightCol: { alignItems: 'flex-end', gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5 },
});
