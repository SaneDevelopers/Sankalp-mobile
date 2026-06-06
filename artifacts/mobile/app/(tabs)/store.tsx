import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STORE_ITEMS } from '@/constants/data';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

export default function StoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, itemCount } = useCart();
  const [search, setSearch] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const featured = STORE_ITEMS.find(i => i.featured)!;
  const trending = STORE_ITEMS.filter(i => !i.featured);
  const filtered = search
    ? trending.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : trending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Samagri Store</Text>
        <Pressable onPress={() => router.push('/cart' as any)} style={styles.cartBtn}>
          <Feather name="shopping-cart" size={22} color={colors.primary} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.orange }]}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search items..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Featured Product */}
        {!search && (
          <View style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featuredImagePlaceholder, { backgroundColor: featured.color + '20' }]}>
              <View style={[styles.featuredImageInner, { backgroundColor: featured.color + '40' }]}>
                <Text style={[styles.featuredEmoji, { color: featured.color }]}>✦</Text>
              </View>
            </View>
            <View style={styles.featuredInfo}>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold + '20' }]}>
                <Text style={[styles.premiumText, { color: colors.gold }]}>PREMIUM</Text>
              </View>
              <Text style={[styles.featuredName, { color: colors.text }]}>{featured.name}</Text>
              <Text style={[styles.featuredUnit, { color: colors.mutedForeground }]}>{featured.unit}</Text>
              <View style={styles.featuredFooter}>
                <Text style={[styles.featuredPrice, { color: colors.primary }]}>₹{featured.price.toLocaleString('en-IN')}</Text>
                <Pressable
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addItem({ id: featured.id, name: featured.name, price: featured.price, unit: featured.unit });
                  }}
                >
                  <Text style={styles.addBtnText}>ADD</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{search ? 'Results' : 'Trending Now'}</Text>
          {!search && <Text style={[styles.viewAll, { color: colors.accent }]}>VIEW ALL</Text>}
        </View>

        <View style={styles.grid}>
          {filtered.map(item => (
            <Pressable
              key={item.id}
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.gridImagePlaceholder, { backgroundColor: item.color + '20' }]}>
                <View style={[styles.gridImageInner, { backgroundColor: item.color + '30' }]}>
                  <Feather name="package" size={24} color={item.color} />
                </View>
              </View>
              <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.gridUnit, { color: colors.mutedForeground }]} numberOfLines={1}>{item.unit}</Text>
              <View style={styles.gridFooter}>
                <Text style={[styles.gridPrice, { color: colors.primary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                <Pressable
                  style={[styles.gridAddBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
                  }}
                >
                  <Feather name="plus" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  cartBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_700Bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featuredImagePlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmoji: { fontSize: 40 },
  featuredInfo: { padding: 16 },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  premiumText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  featuredName: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  featuredUnit: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  addBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  gridCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  gridImagePlaceholder: {
    height: 90,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridImageInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 3, lineHeight: 18 },
  gridUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  gridAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
