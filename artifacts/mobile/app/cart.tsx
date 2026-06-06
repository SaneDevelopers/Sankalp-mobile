import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem, total } = useCart();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const delivery = total > 999 ? 0 : 99;
  const grandTotal = total + delivery;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cart & Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={() => (
          <View style={{ marginTop: 20 }}>
            {/* Delivery Address */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DELIVERY ADDRESS</Text>
            <Pressable style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.addressIconWrap, { backgroundColor: colors.primary + '15' }]}>
                <Feather name="home" size={14} color={colors.primary} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={[styles.addressTitle, { color: colors.text }]}>Home · Arnav Sharma</Text>
                <Text style={[styles.addressText, { color: colors.mutedForeground }]}>A-301, Lotus Towers, Sector 62, Noida – 201301</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>

            {/* Price Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₹{total.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Delivery</Text>
                <Text style={[styles.summaryValue, { color: delivery === 0 ? colors.success : colors.text }]}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="package" size={20} color={colors.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>{item.unit}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (item.quantity === 1) removeItem(item.id);
                  else updateQuantity(item.id, -1);
                }}
              >
                <Feather name={item.quantity === 1 ? 'trash-2' : 'minus'} size={14} color={colors.primary} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateQuantity(item.id, 1);
                }}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="shopping-cart" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your cart is empty</Text>
            <Pressable onPress={() => router.push('/(tabs)/store' as any)}>
              <Text style={[styles.shopLink, { color: colors.accent }]}>Browse Samagri Store</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Pay Button */}
      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/confirmed' as any);
            }}
          >
            <Feather name="lock" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.payBtnText}>Pay Securely · ₹{grandTotal.toLocaleString('en-IN')}</Text>
          </Pressable>
        </View>
      )}
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  itemUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qtyText: { fontSize: 15, fontFamily: 'Inter_700Bold', minWidth: 20, textAlign: 'center' },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  addressText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  summaryDivider: { height: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  shopLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
