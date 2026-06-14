import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PANDITS, POOJA_TYPES, STORE_ITEMS, UTENSILS } from '@/constants/data';
import { PANDIT_IMAGES, STORE_IMAGES } from '@/constants/images';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';

type Tab = 'pandit' | 'samagri';

const POOJA_INCLUDES: Record<string, string[]> = {
  pt1: ['Satyanarayan Katha recitation', 'Panchamrit abhishek', 'Prasad (halwa-puri)', 'Flowers & garlands', 'Sankalp & mangalashtak'],
  pt2: ['Vastu shanti', 'Havan with samidha', 'Navgraha puja', 'Griha pravesh mantra', 'Kalash sthapana'],
  pt3: ['Navgraha mantra jaap', 'Individual graha puja', 'Havan with graha samidha', 'Yantra sthapana', 'Brahman bhojan'],
  pt4: ['Rudra abhishek with milk', 'Bilva patra offering', 'Panchamrit snan', 'Shiva aarti', 'Rudrashtak path'],
  pt5: ['Lakshmi stotra recitation', 'Kumkum archana', 'Gold/silver coin puja', 'Aarti with ghee diya', 'Prasad distribution'],
  pt6: ['Ganesh sthapana', 'Modak bhog', 'Durva grass offering', 'Ganesh stotra', 'Aarti & visarjan'],
  pt7: ['Complete saptapadi ritual', 'Kanyadaan & havan', 'Mangalashtak recitation', 'Panigrahana ceremony', 'Ashirvad from pandit'],
  pt8: ['Maha havan with 11 types of samidha', 'Navgraha ahutis', 'Purnahuti', 'Havan kund setup', 'Complete prasad distribution'],
};

const POOJA_SAMAGRI_IDS: Record<string, string[]> = {
  pt1: ['si5', 'si6', 'si2', 'si3', 'ut1'],
  pt2: ['si1', 'si6', 'si5', 'ut1', 'ut3'],
  pt3: ['si1', 'si4', 'si6', 'si3', 'ut1'],
  pt4: ['si5', 'si6', 'si2', 'ut1', 'ut2'],
  pt5: ['si2', 'si3', 'ut1', 'si5', 'si6'],
  pt6: ['si3', 'ut1', 'si5', 'si2', 'ut3'],
  pt7: ['si1', 'si2', 'si4', 'si6', 'ut3'],
  pt8: ['si1', 'si6', 'ut1', 'ut3', 'si3'],
};

const ALL_STORE = [...STORE_ITEMS, ...UTENSILS];

const UTENSIL_ICONS: Record<string, string> = {
  ut1: 'sun', ut2: 'droplet', ut3: 'bell',
  ut4: 'wind', ut5: 'circle', ut6: 'disc',
};

export default function PoojaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, removeItem, itemCount, items } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>('pandit');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const pooja = POOJA_TYPES.find(p => p.id === id) ?? POOJA_TYPES[0];
  const includes = POOJA_INCLUDES[pooja.id] ?? POOJA_INCLUDES['pt1'];
  const pandits = PANDITS.filter(p => pooja.panditIds.includes(p.id));
  const samagriIds = POOJA_SAMAGRI_IDS[pooja.id] ?? POOJA_SAMAGRI_IDS['pt1'];
  const samagriItems = samagriIds.map(sid => ALL_STORE.find(s => s.id === sid)).filter(Boolean) as typeof ALL_STORE;

  const bundleTotal = samagriItems.reduce((sum, s) => sum + s.price, 0);
  const bundleDiscount = Math.round(bundleTotal * 0.1);
  const bundlePrice = bundleTotal - bundleDiscount;

  const getCartQty = (itemId: string) => items.filter(i => i.id === itemId).length;

  const panditImgMap: Record<string, string> = { '1': '1', '2': '2', '3': '3', '4': '4' };

  const cartSamagriCount = samagriIds.reduce((sum, sid) => sum + getCartQty(sid), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 + bottomPadding }}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: pooja.bgColor }]}>
          <Image source={STORE_IMAGES['si2']} style={styles.heroBg} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <View style={[styles.heroTopBar, { paddingTop: topPadding + 12 }]}>
              <Pressable style={styles.backCircle} onPress={() => router.back()}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </Pressable>
              {itemCount > 0 && (
                <Pressable style={styles.cartCircle} onPress={() => router.push('/cart' as any)}>
                  <Feather name="shopping-bag" size={18} color="#FFFFFF" />
                  <View style={[styles.cartBadge, { backgroundColor: colors.gold }]}>
                    <Text style={styles.cartBadgeText}>{itemCount}</Text>
                  </View>
                </Pressable>
              )}
            </View>
            <View style={styles.heroContent}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <Feather name={pooja.icon as any} size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>{pooja.name}</Text>
              <Text style={styles.heroDesc}>{pooja.description}</Text>
              {pooja.bestseller && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>★ POPULAR</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: 'clock', val: pooja.duration, label: 'DURATION' },
            { icon: 'users', val: String(pandits.length), label: 'PANDITS' },
            { icon: 'tag', val: `₹${pooja.priceFrom.toLocaleString('en-IN')}`, label: 'FROM' },
            { icon: 'shopping-bag', val: String(samagriItems.length), label: 'ITEMS' },
          ].map((stat, i, arr) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Feather name={stat.icon as any} size={16} color={colors.primary} />
                <Text style={[styles.statVal, { color: colors.text }]}>{stat.val}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'pandit' && { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab('pandit'); }}
          >
            <Feather name="user-check" size={16} color={activeTab === 'pandit' ? '#FFFFFF' : colors.mutedForeground} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'pandit' ? '#FFFFFF' : colors.mutedForeground }]}>
              Book a Pandit
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeTab === 'samagri' && { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab('samagri'); }}
          >
            <Feather name="shopping-bag" size={16} color={activeTab === 'samagri' ? '#FFFFFF' : colors.mutedForeground} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'samagri' ? '#FFFFFF' : colors.mutedForeground }]}>
              Buy Samagri
              {cartSamagriCount > 0 && (
                <Text style={{ color: activeTab === 'samagri' ? colors.gold : colors.primary }}> ·{cartSamagriCount}</Text>
              )}
            </Text>
          </Pressable>
        </View>

        {/* ────── PANDIT TAB ────── */}
        {activeTab === 'pandit' && (
          <View style={styles.body}>
            {/* What's Included */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What's Included</Text>
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {includes.map((item, i) => (
                <View key={i} style={[styles.listRow, i < includes.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={[styles.listDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Devotee Provides */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>You Need to Provide</Text>
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {['Clean puja space', 'Milk (500ml), curd, honey, ghee', 'Fresh flowers & fruits', 'Brass/copper utensils'].map((r, i, arr) => (
                <View key={i} style={[styles.listRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <Feather name="check-circle" size={14} color={colors.gold} />
                  <Text style={[styles.listText, { color: colors.text }]}>{r}</Text>
                </View>
              ))}
            </View>

            {/* Samagri Hint */}
            <Pressable
              style={[styles.samagriHint, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab('samagri'); }}
            >
              <Feather name="shopping-bag" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.samagriHintTitle, { color: colors.primary }]}>Don't have the samagri?</Text>
                <Text style={[styles.samagriHintSub, { color: colors.mutedForeground }]}>We have {samagriItems.length} items curated for this pooja</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </Pressable>

            {/* Available Pandits */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{pandits.length} Pandits Available</Text>
            {pandits.map(pandit => (
              <Pressable
                key={pandit.id}
                style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/pandit/${pandit.id}` as any)}
              >
                <Image
                  source={PANDIT_IMAGES[panditImgMap[pandit.id] ?? '1']}
                  style={styles.panditPhoto}
                  resizeMode="cover"
                />
                <View style={styles.panditInfo}>
                  <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
                  <Text style={[styles.panditSpec, { color: colors.mutedForeground }]}>{pandit.specialty}</Text>
                  <View style={styles.panditMeta}>
                    <Feather name="star" size={12} color={colors.gold} />
                    <Text style={[styles.panditRating, { color: colors.text }]}>{pandit.rating}</Text>
                    <Text style={[styles.panditReviews, { color: colors.mutedForeground }]}>({pandit.bookings})</Text>
                    <Text style={[styles.panditCity, { color: colors.mutedForeground }]}>· {pandit.city}</Text>
                  </View>
                </View>
                <View style={styles.panditRight}>
                  <Text style={[styles.panditExp, { color: colors.primary }]}>{pandit.experience}</Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ────── SAMAGRI TAB ────── */}
        {activeTab === 'samagri' && (
          <View style={styles.body}>
            {/* Bundle Deal Card */}
            <View style={[styles.bundleCard, { backgroundColor: colors.primary }]}>
              <View style={styles.bundleLeft}>
                <View style={styles.bundleIconRow}>
                  <Feather name="gift" size={18} color={colors.gold} />
                  <Text style={styles.bundleTag}>BUNDLE DEAL · SAVE 10%</Text>
                </View>
                <Text style={styles.bundleTitle}>Complete {pooja.name} Kit</Text>
                <Text style={styles.bundleItems}>{samagriItems.length} items · Curated by Vedic experts</Text>
                <View style={styles.bundlePriceRow}>
                  <Text style={styles.bundleOriginal}>₹{bundleTotal.toLocaleString('en-IN')}</Text>
                  <Text style={styles.bundlePrice}>₹{bundlePrice.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <Pressable
                style={[styles.bundleBtn, { backgroundColor: colors.gold }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  samagriItems.forEach(item => addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit }));
                  router.push('/cart' as any);
                }}
              >
                <Text style={styles.bundleBtnText}>ADD ALL</Text>
                <Text style={[styles.bundleBtnSave, { color: colors.primary }]}>Save ₹{bundleDiscount}</Text>
              </Pressable>
            </View>

            {/* Items Label */}
            <View style={styles.samagriHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for {pooja.name}</Text>
              <Text style={[styles.itemsCount, { color: colors.mutedForeground }]}>{samagriItems.length} items</Text>
            </View>

            {/* Individual Items */}
            {samagriItems.map((item, i) => {
              const qty = getCartQty(item.id);
              const isUtensil = item.id.startsWith('ut');
              return (
                <Pressable
                  key={item.id}
                  style={[styles.samagriCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  {/* Image or Icon */}
                  {!isUtensil ? (
                    <Image source={STORE_IMAGES[item.id]} style={styles.samagriImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.samagriIconBox, { backgroundColor: item.color + '20' }]}>
                      <Feather name={UTENSIL_ICONS[item.id] as any ?? 'circle'} size={24} color={item.color} />
                    </View>
                  )}

                  <View style={styles.samagriInfo}>
                    <Text style={[styles.samagriName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.samagriUnit, { color: colors.mutedForeground }]} numberOfLines={1}>{item.unit}</Text>
                    <Text style={[styles.samagriPrice, { color: colors.primary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                  </View>

                  {/* Qty Controls */}
                  <View style={styles.qtyControls}>
                    {qty === 0 ? (
                      <Pressable
                        style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
                        }}
                      >
                        <Feather name="plus" size={16} color="#FFFFFF" />
                        <Text style={styles.addToCartText}>ADD</Text>
                      </Pressable>
                    ) : (
                      <View style={[styles.qtyRow, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            Haptics.selectionAsync();
                            removeItem(item.id);
                          }}
                        >
                          <Feather name="minus" size={14} color={colors.primary} />
                        </Pressable>
                        <Text style={[styles.qtyNum, { color: colors.primary }]}>{qty}</Text>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            Haptics.selectionAsync();
                            addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
                          }}
                        >
                          <Feather name="plus" size={14} color={colors.primary} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Also check utensils note */}
            <View style={[styles.noticeCard, { backgroundColor: colors.gold + '12', borderColor: colors.gold + '30' }]}>
              <Feather name="info" size={14} color={colors.gold} />
              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
                Items marked with icons are ritual utensils (brass/copper). All other items are consumable samagri.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {activeTab === 'pandit' ? (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: '/pandits-by-pooja', params: { poojaId: pooja.id, poojaName: pooja.name } } as any);
            }}
          >
            <Feather name="users" size={18} color="#FFFFFF" />
            <Text style={styles.footerBtnText}>Find Pandits · ₹{pooja.priceFrom.toLocaleString('en-IN')}+</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.footerDualRow}>
            <Pressable
              style={[styles.footerSecondaryBtn, { borderColor: colors.primary }]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab('pandit'); }}
            >
              <Feather name="user-check" size={16} color={colors.primary} />
              <Text style={[styles.footerSecondaryText, { color: colors.primary }]}>Book Pandit</Text>
            </Pressable>
            <Pressable
              style={[styles.footerPrimaryBtn, { backgroundColor: cartSamagriCount > 0 ? colors.primary : colors.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/cart' as any);
              }}
            >
              <Feather name="shopping-bag" size={16} color="#FFFFFF" />
              <Text style={styles.footerBtnText}>
                {cartSamagriCount > 0 ? `View Cart · ${cartSamagriCount} items` : 'Go to Cart'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { height: 240, position: 'relative', overflow: 'hidden' },
  heroBg: { position: 'absolute', width: '100%', height: '100%', opacity: 0.2 },
  heroOverlay: { flex: 1 },
  heroTopBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 8,
  },
  backCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  cartCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -2, right: -2, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Inter_700Bold' },
  heroContent: { paddingHorizontal: 24, flex: 1, justifyContent: 'flex-end', paddingBottom: 20 },
  heroIcon: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  popularBadge: {
    alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  popularText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14, borderRadius: 14,
    borderWidth: 1, paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  statDiv: { width: 1 },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14, borderRadius: 14,
    borderWidth: 1, padding: 4, gap: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, gap: 7,
  },
  tabBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold' },

  // Body
  body: { padding: 16, gap: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 10, marginTop: 6 },

  // List Card
  listCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  listDot: { width: 6, height: 6, borderRadius: 3 },
  listText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },

  // Samagri Hint Banner
  samagriHint: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: 12, borderWidth: 1, marginBottom: 16,
  },
  samagriHintTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  samagriHintSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Pandit Cards
  panditCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14,
    borderWidth: 1, marginBottom: 10, gap: 12,
  },
  panditPhoto: { width: 52, height: 52, borderRadius: 26 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  panditSpec: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  panditMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  panditRating: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  panditReviews: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  panditCity: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  panditRight: { alignItems: 'flex-end', gap: 6 },
  panditExp: { fontSize: 12, fontFamily: 'Inter_700Bold' },

  // Bundle Card
  bundleCard: {
    borderRadius: 16, padding: 18, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  bundleLeft: { flex: 1 },
  bundleIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  bundleTag: { color: '#C89A3C', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  bundleTitle: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  bundleItems: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  bundlePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bundleOriginal: {
    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
  },
  bundlePrice: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter_700Bold' },
  bundleBtn: {
    paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, alignItems: 'center', gap: 4,
  },
  bundleBtnText: { color: '#7B1F1F', fontSize: 14, fontFamily: 'Inter_700Bold' },
  bundleBtnSave: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

  // Samagri Items
  samagriHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  itemsCount: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  samagriCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
    marginBottom: 10, overflow: 'hidden', gap: 12, paddingRight: 14,
  },
  samagriImage: { width: 76, height: 76 },
  samagriIconBox: {
    width: 76, height: 76, alignItems: 'center', justifyContent: 'center',
  },
  samagriInfo: { flex: 1, paddingVertical: 12 },
  samagriName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  samagriUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 5 },
  samagriPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  qtyControls: { alignItems: 'center', justifyContent: 'center' },
  addToCartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10,
  },
  addToCartText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 12 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 9 },
  qtyNum: { fontSize: 14, fontFamily: 'Inter_700Bold', paddingHorizontal: 4, minWidth: 24, textAlign: 'center' },

  // Notice
  noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 4,
  },
  noticeText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, gap: 10,
  },
  footerBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 },
  footerDualRow: { flexDirection: 'row', gap: 10 },
  footerSecondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, gap: 8, borderWidth: 1.5, flex: 0.45,
  },
  footerSecondaryText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  footerPrimaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 15, gap: 8,
  },
});
