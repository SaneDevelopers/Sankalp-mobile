import { Feather } from '@expo/vector-icons';
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

import { useColors } from '@/hooks/useColors';

const ORDERS = [
  {
    id: 'o1', orderId: 'ORD-2241',
    items: [{ name: 'Complete Havan Kit', qty: 1, price: 1250 }, { name: 'Brass Pooja Thali', qty: 1, price: 1299 }],
    date: '28 Sep 2024', status: 'delivered', amount: 2549,
  },
  {
    id: 'o2', orderId: 'ORD-2240',
    items: [{ name: 'Rudraksh Mala', qty: 1, price: 899 }, { name: 'Sandalwood Agarbatti', qty: 1, price: 249 }],
    date: '10 Sep 2024', status: 'delivered', amount: 1148,
  },
  {
    id: 'o3', orderId: 'ORD-2239',
    items: [{ name: 'Panchamrit Kit', qty: 2, price: 399 }],
    date: '2 Sep 2024', status: 'delivered', amount: 798,
  },
  {
    id: 'o4', orderId: 'ORD-2244',
    items: [{ name: 'Pure Cow Ghee', qty: 1, price: 599 }, { name: 'Brass Diya Set', qty: 1, price: 199 }],
    date: '5 Oct 2024', status: 'in_transit', amount: 798,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  delivered: { label: 'DELIVERED', color: '#22C55E', icon: 'check-circle' },
  in_transit: { label: 'IN TRANSIT', color: '#D4722A', icon: 'truck' },
  processing: { label: 'PROCESSING', color: '#C89A3C', icon: 'clock' },
  cancelled: { label: 'CANCELLED', color: '#EF4444', icon: 'x-circle' },
};

export default function OrderHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const FILTERS = ['ALL', 'DELIVERED', 'IN TRANSIT'];
  const filtered = activeFilter === 'ALL'
    ? ORDERS
    : ORDERS.filter(o => o.status.replace('_', ' ').toUpperCase() === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Order History</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{ORDERS.length} orders placed</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Filters */}
      <View style={[styles.filtersRow, { borderBottomColor: colors.border }]}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            style={[styles.filter, activeFilter === f && { backgroundColor: colors.primary }]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, { color: activeFilter === f ? '#FFFFFF' : colors.mutedForeground }]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['processing'];
          return (
            <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Order Header */}
              <View style={[styles.orderHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.orderId, { color: colors.text }]}>#{item.orderId}</Text>
                  <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.color + '15' }]}>
                  <Feather name={sc.icon as any} size={12} color={sc.color} />
                  <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
              </View>

              {/* Items */}
              <View style={styles.itemsList}>
                {item.items.map((it, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={[styles.itemDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{it.name}</Text>
                    <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>×{it.qty}</Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>₹{(it.price * it.qty).toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>

              {/* Footer */}
              <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>
                  {item.items.length} item{item.items.length > 1 ? 's' : ''}
                </Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
              </View>

              {/* Reorder */}
              {item.status === 'delivered' && (
                <Pressable
                  style={[styles.reorderBtn, { borderTopColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/store' as any)}
                >
                  <Feather name="refresh-cw" size={14} color={colors.primary} />
                  <Text style={[styles.reorderText, { color: colors.primary }]}>Reorder</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  filtersRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8, borderBottomWidth: 1,
  },
  filter: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  orderCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1,
  },
  orderId: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  orderDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  itemsList: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { width: 5, height: 5, borderRadius: 2.5 },
  itemName: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  itemQty: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  itemPrice: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1,
  },
  footerLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  totalAmount: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  reorderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderTopWidth: 1,
  },
  reorderText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
