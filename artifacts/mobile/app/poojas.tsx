import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { POOJA_TYPES } from '@/constants/data';
import { useColors } from '@/hooks/useColors';

const CATEGORIES = ['ALL', 'POPULAR', 'VEDIC', 'SPECIAL'];

export default function PoojasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(category === 'havan' ? 'SPECIAL' : 'ALL');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = POOJA_TYPES.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === 'POPULAR') return matchesSearch && p.bestseller;
    if (activeCategory === 'SPECIAL') return matchesSearch && ['pt7', 'pt8'].includes(p.id);
    if (activeCategory === 'VEDIC') return matchesSearch && ['pt1', 'pt3', 'pt4', 'pt6'].includes(p.id);
    return matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Select Pooja</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Choose your sacred ritual</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
          placeholder="Search poojas..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filters */}
      <View style={[styles.filtersRow, { borderBottomColor: colors.border }]}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            style={[styles.filterChip, activeCategory === cat && { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveCategory(cat);
            }}
          >
            <Text style={[styles.filterText, { color: activeCategory === cat ? '#FFFFFF' : colors.mutedForeground }]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Pooja Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No poojas found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.poojaCard, { backgroundColor: item.bgColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/pooja/${item.id}` as any);
            }}
          >
            {item.bestseller && (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.bestsellerText}>★ POPULAR</Text>
              </View>
            )}
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Feather name={item.icon as any} size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.poojaName}>{item.name}</Text>
            <Text style={styles.poojaDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.poojaFooter}>
              <View>
                <Text style={styles.poojaFrom}>FROM</Text>
                <Text style={styles.poojaPrice}>₹{item.priceFrom.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.durationBadge}>
                <Feather name="clock" size={10} color="rgba(255,255,255,0.8)" />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            </View>
          </Pressable>
        )}
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  poojaCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 190,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestsellerText: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  poojaName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  poojaDesc: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
    marginBottom: 12,
  },
  poojaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  poojaFrom: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  poojaPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
