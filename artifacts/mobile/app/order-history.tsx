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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { STORE_ITEMS, UTENSILS } from '@/constants/data';
import { STORE_IMAGES } from '@/constants/images';
import { useAuthMe, useGetOrders, getGetOrdersQueryKey } from '@workspace/api-client-react';

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

const ORDER_STATUS_STEPS = [
  { key: 'processing', label: 'Order Placed', icon: 'shopping-bag' },
  { key: 'in_transit', label: 'In Transit', icon: 'truck' },
  { key: 'delivered', label: 'Delivered & Completed', icon: 'check-circle' },
];

export default function OrderHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const { data: user } = useAuthMe();
  const { data: apiOrders = [] } = useGetOrders({
    query: {
      enabled: !!user,
      queryKey: getGetOrdersQueryKey(),
    },
  });

  const rawOrders = user ? apiOrders : ORDERS;

  // Format order items for UI display if they come from DB
  const userOrders = rawOrders.map((o: any) => {
    // If date is date-time string from DB, parse to visual string
    let dateStr = o.date;
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return {
      ...o,
      date: dateStr,
    };
  });

  const FILTERS = ['ALL', 'DELIVERED', 'IN TRANSIT'];
  const filtered = activeFilter === 'ALL'
    ? userOrders
    : userOrders.filter(o => o.status.replace('_', ' ').toUpperCase() === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Order History</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{userOrders.length} orders placed</Text>
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
                {(item.items as any[]).map((it: any, i: number) => {
                  const allStore = [...STORE_ITEMS, ...UTENSILS];
                  const storeItem = allStore.find(s => s.name.toLowerCase() === it.name.toLowerCase());
                  const imageSource = storeItem ? STORE_IMAGES[storeItem.id] : STORE_IMAGES['si1'];

                  return (
                    <View key={i} style={styles.itemRow}>
                      <Image
                        source={imageSource}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{it.name}</Text>
                        {storeItem?.unit && (
                          <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
                            {storeItem.unit}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.itemQty, { color: colors.mutedForeground, marginRight: 10 }]}>×{it.qty}</Text>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>₹{(it.price * it.qty).toLocaleString('en-IN')}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Footer */}
              <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>
                  {(item.items as any[]).length} item{(item.items as any[]).length > 1 ? 's' : ''}
                </Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
              </View>

              {/* Track Order */}
              {item.status !== 'cancelled' && (
                <Pressable
                  style={[styles.trackToggleBtn, { borderTopColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedTrackId(expandedTrackId === item.id ? null : item.id);
                  }}
                >
                  <Feather
                    name={expandedTrackId === item.id ? 'chevron-up' : 'map-pin'}
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={[styles.trackToggleText, { color: colors.primary }]}>
                    {expandedTrackId === item.id ? 'Hide Tracking details' : 'Track Order'}
                  </Text>
                </Pressable>
              )}

              {expandedTrackId === item.id && item.status !== 'cancelled' && (
                <View style={[styles.trackingContainer, { borderTopColor: colors.border, backgroundColor: colors.card, padding: 16 }]}>
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const completedSteps = item.status === 'delivered' ? 3 : item.status === 'in_transit' ? 2 : item.status === 'processing' ? 1 : 0;
                    const isCompleted = idx < completedSteps;
                    const isLast = idx === ORDER_STATUS_STEPS.length - 1;

                    return (
                      <View key={step.key} style={styles.trackRow}>
                        <View style={styles.trackLeft}>
                          <View style={[styles.trackDot, { backgroundColor: isCompleted ? colors.success : colors.border }]}>
                            <Feather name={step.icon as any} size={11} color={isCompleted ? '#FFFFFF' : colors.mutedForeground} />
                          </View>
                          {!isLast && (
                            <View style={[styles.trackLine, { backgroundColor: idx < completedSteps - 1 ? colors.success : colors.border }]} />
                          )}
                        </View>
                        <View style={styles.trackInfo}>
                          <Text style={[styles.trackStepLabel, { color: isCompleted ? colors.text : colors.mutedForeground }]}>
                            {step.label}
                          </Text>
                          <Text style={[styles.trackStepDesc, { color: colors.mutedForeground }]}>
                            {idx === 0 && 'We have received your order and are packing your items.'}
                            {idx === 1 && 'Your items are packaged and in transit to your address.'}
                            {idx === 2 && 'Your order has been delivered successfully. Enjoy your rituals!'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

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
  itemImage: { width: 36, height: 36, borderRadius: 8, marginRight: 4 },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderTopWidth: 1,
  },
  reorderText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  trackToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  trackToggleText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  trackingContainer: {
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trackLeft: {
    alignItems: 'center',
  },
  trackDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackLine: {
    width: 2,
    height: 38,
    marginVertical: 2,
  },
  trackInfo: {
    flex: 1,
    gap: 2,
  },
  trackStepLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  trackStepDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
  },
});
