import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { STORE_IMAGES } from '@/constants/images';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';
import { useGetStoreItems, getGetStoreItemsQueryKey } from '@workspace/api-client-react';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

const UTENSIL_COLORS: Record<string, string> = {
  ut1: '#C89A3C', ut2: '#D4722A', ut3: '#C89A3C',
  ut4: '#7B4F2E', ut5: '#8B7355', ut6: '#8B8B8B',
};

const UTENSIL_ICONS: Record<string, string> = {
  ut1: 'sun', ut2: 'droplet', ut3: 'bell',
  ut4: 'wind', ut5: 'circle', ut6: 'disc',
};

import { useLanguage } from '@/context/LanguageContext';

export default function StoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'samagri' | 'utensils'>('samagri');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const { t, f } = useLanguage();

  const { data: dbItems = [], isLoading, refetch, isFetching } = useGetStoreItems({
    query: {
      queryKey: getGetStoreItemsQueryKey(),
    }
  });

  const featured = dbItems.find(i => i.featured) || dbItems[0];
  const samagriItems = dbItems.filter(i => i.category === 'samagri' || i.category === 'premium' ? (dbItems.find(x => x.featured)?.id !== i.id) : false);
  const utensilsItems = dbItems.filter(i => i.category === 'utensils');

  const filteredSamagri = search
    ? samagriItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : samagriItems;
  const filteredUtensils = search
    ? utensilsItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : utensilsItems;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary, fontFamily: f('bold') }]}>{t('samagriStore')}</Text>
        <Pressable onPress={() => router.push('/cart' as any)} style={styles.cartBtn}>
          <Feather name="shopping-cart" size={22} color={colors.primary} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.orange }]}>
              <Text style={[styles.badgeText, { fontFamily: f('bold') }]}>{itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: f('regular') }]}
            placeholder={t('searchStore')}
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Featured Product */}
        {!search && (
          <View style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={featured.imageUrl ? { uri: featured.imageUrl } : (STORE_IMAGES[`si${featured.id}`] || STORE_IMAGES[String(featured.id)] || STORE_IMAGES['si1'])} style={styles.featuredImage} contentFit="cover" />
            <View style={styles.featuredInfo}>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold + '20' }]}>
                <Text style={[styles.premiumText, { color: colors.gold, fontFamily: f('bold') }]}>★ {t('featuredItem')}</Text>
              </View>
              <Text style={[styles.featuredName, { color: colors.text, fontFamily: f('bold') }]}>{t(featured.name || '')}</Text>
              <Text style={[styles.featuredUnit, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t(featured.unit || '')}</Text>
              <View style={styles.featuredFooter}>
                <Text style={[styles.featuredPrice, { color: colors.primary, fontFamily: f('bold') }]}>₹{(featured.price || 0).toLocaleString('en-IN')}</Text>
                <Pressable
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addItem({ id: String(featured.id), name: featured.name || '', price: featured.price || 0, unit: featured.unit || '' });
                  }}
                >
                  <Text style={[styles.addBtnText, { fontFamily: f('bold') }]}>{t('addToCart')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Category Tabs */}
        {!search && (
          <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
            <Pressable
              style={[styles.tab, activeTab === 'samagri' && { borderBottomColor: colors.primary }]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('samagri');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'samagri' ? colors.primary : colors.mutedForeground, fontFamily: f('semibold') }]}>
                {t('storeSamagri')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'utensils' && { borderBottomColor: colors.primary }]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('utensils');
              }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'utensils' ? colors.primary : colors.mutedForeground, fontFamily: f('semibold') }]}>
                {t('storeUtensils')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Samagri Grid */}
        {(search || activeTab === 'samagri') && (
          <>
            {!search && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>{t('bestsellerTitle')}</Text>
                <Text style={[styles.viewAll, { color: colors.accent, fontFamily: f('semibold') }]}>{t('viewAll')}</Text>
              </View>
            )}
            <View style={styles.grid}>
              {(search ? filteredSamagri : filteredSamagri).map(item => (
                <Pressable
                  key={item.id}
                  style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(`/product/${item.id}` as any);
                  }}
                >
                  <Image source={item.imageUrl ? { uri: item.imageUrl } : (STORE_IMAGES[`si${item.id}`] || STORE_IMAGES[String(item.id)] || STORE_IMAGES['si1'])} style={styles.gridImage} contentFit="cover" />
                  <Text style={[styles.gridName, { color: colors.text, fontFamily: f('semibold') }]} numberOfLines={2}>{t(item.name)}</Text>
                  <Text style={[styles.gridUnit, { color: colors.mutedForeground, fontFamily: f('regular') }]} numberOfLines={1}>{t(item.unit)}</Text>
                  <View style={styles.gridFooter}>
                    <Text style={[styles.gridPrice, { color: colors.primary, fontFamily: f('bold') }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                    <Pressable
                      style={[styles.gridAddBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        addItem({ id: String(item.id), name: item.name, price: item.price, unit: item.unit });
                      }}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Utensils Section */}
        {(search || activeTab === 'utensils') && (
          <>
            {!search && (
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>{t('storeUtensils')}</Text>
                  <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t('bestsellerSub')}</Text>
                </View>
                <Text style={[styles.viewAll, { color: colors.accent, fontFamily: f('semibold') }]}>{t('viewAll')}</Text>
              </View>
            )}
            <View style={styles.utensilsList}>
              {(search ? filteredUtensils : filteredUtensils).map(item => (
                <Pressable
                key={item.id}
                style={[styles.utensilCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/product/${item.id}` as any);
                }}
              >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.utensilIconWrap} contentFit="cover" />
                  ) : (
                    <View style={[styles.utensilIconWrap, { backgroundColor: (UTENSIL_COLORS[`ut${item.id}`] || UTENSIL_COLORS[item.id] || colors.primary) + '20' }]}>
                      <Feather name={(UTENSIL_ICONS[`ut${item.id}`] || UTENSIL_ICONS[item.id] || 'circle') as any} size={22} color={UTENSIL_COLORS[`ut${item.id}`] || UTENSIL_COLORS[item.id] || colors.primary} />
                    </View>
                  )}
                  <View style={styles.utensilInfo}>
                    <Text style={[styles.utensilName, { color: colors.text, fontFamily: f('semibold') }]}>{t(item.name)}</Text>
                    <Text style={[styles.utensilUnit, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t(item.unit)}</Text>
                    <Text style={[styles.utensilDesc, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{item.description ? t(item.description) : ''}</Text>
                  </View>
                  <View style={styles.utensilRight}>
                    <Text style={[styles.utensilPrice, { color: colors.primary, fontFamily: f('bold') }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                    <Pressable
                      style={[styles.utensilAddBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        addItem({ id: String(item.id), name: item.name, price: item.price, unit: item.unit });
                      }}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  cartBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0, width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_700Bold' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', margin: 20,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  featuredCard: {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 8,
  },
  featuredImage: { width: '100%', height: 200 },
  featuredInfo: { padding: 16 },
  premiumBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  premiumText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  featuredName: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  featuredUnit: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  addBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 },
  tabsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    borderBottomWidth: 1, marginTop: 8,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sectionSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  gridCard: { width: '47%', borderRadius: 14, borderWidth: 1, overflow: 'hidden', paddingBottom: 12 },
  gridImage: { width: '100%', height: 110, marginBottom: 10 },
  gridName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 3, lineHeight: 18, paddingHorizontal: 10 },
  gridUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 8, paddingHorizontal: 10 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  gridPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  gridAddBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  utensilsList: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  utensilCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1, gap: 12,
  },
  utensilIconWrap: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  utensilInfo: { flex: 1 },
  utensilName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  utensilUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  utensilDesc: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  utensilRight: { alignItems: 'flex-end', gap: 8 },
  utensilPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  utensilAddBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
