import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

import { router } from 'expo-router';

import { BOOKINGS, Booking } from '@/constants/data';
import { useColors } from '@/hooks/useColors';

const FILTERS = ['ALL', 'UPCOMING', 'COMPLETED'];
const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = activeFilter === 'ALL'
    ? BOOKINGS
    : BOOKINGS.filter(b => b.status.toUpperCase() === activeFilter);

  const getStatusStyle = (status: Booking['status']) => {
    if (status === 'upcoming') return { color: colors.upcoming, bg: colors.upcoming + '15' };
    if (status === 'completed') return { color: colors.success, bg: colors.success + '15' };
    return { color: colors.destructive, bg: colors.destructive + '15' };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Booking History</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Your sacred journey · {BOOKINGS.length} rituals</Text>
        </View>
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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No bookings found</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <Pressable
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/booking-detail/${item.id}` as any);
            }}
          >
              <View style={styles.cardRow}>
                <View style={[styles.avatar, { backgroundColor: item.panditColor }]}>
                  <Text style={styles.avatarText}>{item.panditInitials}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.poojaName, { color: colors.text }]} numberOfLines={1}>{item.poojaName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.panditName, { color: colors.mutedForeground }]}>{item.panditName}</Text>
                  <View style={styles.dateRow}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                      {item.date} · {item.time}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.bookingId, { color: colors.mutedForeground }]}>#{item.bookingId}</Text>
                <Text style={[styles.amount, { color: colors.primary }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 8,
  },
  poojaName: { flex: 1, fontSize: 15, fontFamily: 'Inter_700Bold' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  panditName: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  bookingId: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  amount: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
