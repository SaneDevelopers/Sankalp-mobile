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

import { STORE_ITEMS, UTENSILS, PANDITS } from '@/constants/data';
import { STORE_IMAGES, PANDIT_IMAGES } from '@/constants/images';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';
import { useGetPandits } from '@workspace/api-client-react';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const allItems = [...STORE_ITEMS, ...UTENSILS];
  const item = allItems.find(i => i.id === id) ?? STORE_ITEMS[0];
  const imageSource = STORE_IMAGES[item.id] ?? STORE_IMAGES['si2'];

  const { data: dbPandits = [] } = useGetPandits();
  const panditsList = dbPandits.length > 0 ? dbPandits : PANDITS;

  const getRecommendedPandits = () => {
    const itemNameLower = (item?.name || '').toLowerCase();
    
    if (itemNameLower.includes('havan') || itemNameLower.includes('ghee')) {
      return panditsList.filter(p => p.category === 'havan' || p.category === 'vedic');
    }
    if (itemNameLower.includes('rudraksh') || itemNameLower.includes('mala') || itemNameLower.includes('agarbatti')) {
      return panditsList.filter(p => p.category === 'astrology');
    }
    if (itemNameLower.includes('thali') || itemNameLower.includes('diya') || itemNameLower.includes('kalash') || itemNameLower.includes('bell') || itemNameLower.includes('holder')) {
      return panditsList.filter(p => p.category === 'griha' || p.category === 'vedic');
    }
    return [...panditsList].sort((a, b) => b.rating - a.rating).slice(0, 2);
  };

  const renderRecommendedPandits = () => {
    const recommended = getRecommendedPandits();
    if (recommended.length === 0) return null;

    return (
      <View style={styles.recommendSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Pandits for Rituals</Text>
        <Text style={[styles.recommendSub, { color: colors.mutedForeground }]}>
          Book a verified Pandit to perform pooja using this Samagri
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendScroll}
        >
          {recommended.map(p => {
            const imageSource = PANDIT_IMAGES[p.id.toString()] ?? PANDIT_IMAGES['1'];
            return (
              <Pressable
                key={p.id}
                style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/pandit/${p.id}` as any);
                }}
              >
                <Image source={imageSource} style={styles.panditImg} resizeMode="cover" />
                <View style={styles.panditInfo}>
                  <Text style={[styles.panditName, { color: colors.text }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={[styles.panditSpec, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {p.specialty}
                  </Text>
                  <View style={styles.panditRatingRow}>
                    <Feather name="star" size={12} color={colors.gold} />
                    <Text style={[styles.panditRating, { color: colors.text }]}>{p.rating}</Text>
                    <Text style={[styles.panditCity, { color: colors.mutedForeground }]}> · {p.city}</Text>
                  </View>
                  <Pressable
                    style={[styles.bookBtnSmall, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/book/${p.id}` as any);
                    }}
                  >
                    <Text style={styles.bookBtnTextSmall}>Book Now</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const benefits = [
    '100% authentic & organic ingredients',
    'Quality tested by Vedic experts',
    'Sourced from verified suppliers',
    'Packed in eco-friendly packaging',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 + bottomPadding }}>
        {/* Image with back button */}
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
          <Pressable
            style={[styles.backBtn, { paddingTop: topPadding + 12, paddingLeft: 20 }]}
            onPress={() => router.back()}
          >
            <View style={styles.backCircle}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </View>
          </Pressable>
          {item.featured && (
            <View style={[styles.premiumTag, { backgroundColor: colors.gold }]}>
              <Text style={styles.premiumTagText}>★ PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Name & Price */}
          <View style={styles.nameRow}>
            <View style={styles.nameInfo}>
              <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.productUnit, { color: colors.mutedForeground }]}>{item.unit}</Text>
            </View>
            <Text style={[styles.productPrice, { color: colors.primary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
          </View>

          {/* Delivery */}
          <View style={[styles.deliveryBadge, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
            <Feather name="truck" size={14} color={colors.success} />
            <Text style={[styles.deliveryText, { color: colors.success }]}>Free delivery · Arrives in 2-3 days</Text>
          </View>

          {/* Description */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this Product</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {item.description}. Carefully sourced and prepared for authentic ritual use. Perfect for home puja, temple offerings, and special ceremonies. Our products are verified by experienced pandits for purity and authenticity.
            </Text>
          </View>

          {/* Benefits */}
          <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quality Promise</Text>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={[styles.benefitDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.benefitText, { color: colors.text }]}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Quantity */}
          <View style={styles.qtySection}>
            <Text style={[styles.qtyLabel, { color: colors.text }]}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { if (qty > 1) { Haptics.selectionAsync(); setQty(q => q - 1); } }}
              >
                <Feather name="minus" size={18} color={colors.text} />
              </Pressable>
              <Text style={[styles.qtyNum, { color: colors.text }]}>{qty}</Text>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setQty(q => q + 1); }}
              >
                <Feather name="plus" size={18} color={colors.text} />
              </Pressable>
              <Text style={[styles.qtyTotal, { color: colors.mutedForeground }]}>
                Total: <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold' }}>₹{(item.price * qty).toLocaleString('en-IN')}</Text>
              </Text>
            </View>
          </View>
          {renderRecommendedPandits()}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.cartBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/cart' as any)}
        >
          <Feather name="shopping-cart" size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary, flex: 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            for (let i = 0; i < qty; i++) addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
            router.back();
          }}
        >
          <Feather name="shopping-bag" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add to Cart · ₹{(item.price * qty).toLocaleString('en-IN')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: 'relative', height: 300 },
  productImage: { width: '100%', height: 300 },
  backBtn: { position: 'absolute', top: 0 },
  backCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  premiumTag: {
    position: 'absolute', bottom: 16, right: 16,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  premiumTagText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  body: { padding: 20, gap: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 28 },
  productUnit: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  productPrice: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  deliveryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1,
  },
  deliveryText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  section: { borderTopWidth: 1, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  benefitsCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitDot: { width: 6, height: 6, borderRadius: 3 },
  benefitText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  qtySection: { gap: 10 },
  qtyLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 20, fontFamily: 'Inter_700Bold', minWidth: 32, textAlign: 'center' },
  qtyTotal: { flex: 1, textAlign: 'right', fontSize: 15, fontFamily: 'Inter_400Regular' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, gap: 12,
  },
  cartBtn: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 15, gap: 10,
  },
  addBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 },
  recommendSection: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  recommendSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 12,
  },
  recommendScroll: {
    paddingRight: 20,
    gap: 12,
    paddingVertical: 4,
  },
  panditCard: {
    width: 260,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  panditImg: {
    width: 70,
    height: '100%',
    minHeight: 110,
    borderRadius: 10,
  },
  panditInfo: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 2,
  },
  panditName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  panditSpec: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  panditRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  panditRating: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  panditCity: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  bookBtnSmall: {
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bookBtnTextSmall: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
});
