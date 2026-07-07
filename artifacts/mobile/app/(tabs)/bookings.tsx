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

import { router, useNavigation } from 'expo-router';

import { BOOKINGS, Booking } from '@/constants/data';
import { useColors } from '@/hooks/useColors';
import { useAuthMe, useGetBookings, getGetBookingsQueryKey } from '@workspace/api-client-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLanguage } from '@/lib/context/LanguageContext';

const FILTERS = [
  { key: 'ALL', translationKey: 'filterAll' },
  { key: 'UPCOMING', translationKey: 'filterUpcoming' },
  { key: 'COMPLETED', translationKey: 'filterCompleted' },
];
const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const { t, f } = useLanguage();

  const { data: user } = useAuthMe();
  const { data: apiBookings = [], refetch } = useGetBookings({
    query: {
      enabled: !!user,
      queryKey: getGetBookingsQueryKey(),
    },
  });

  React.useEffect(() => {
    if (user) {
      refetch();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        refetch();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const userBookings = user ? apiBookings : BOOKINGS;

  const filtered = activeFilter === 'ALL'
    ? userBookings
    : userBookings.filter(b => b.status.toUpperCase() === activeFilter);

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
          <Text style={[styles.headerTitle, { color: colors.primary, fontFamily: f('bold') }]}>{t('bookingHistory')}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t('sacredJourney')} · {filtered.length} {t('rituals')}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {FILTERS.map(item => (
          <Pressable
            key={item.key}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveFilter(item.key);
            }}
            style={[
              styles.filterTab,
              activeFilter === item.key && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === item.key ? '#FFFFFF' : colors.mutedForeground, fontFamily: f('semibold') },
            ]}>
              {t(item.translationKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: f('medium') }]}>{t('noBookings')}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status as any);
          const displayStatus = item.status === 'upcoming' ? t('filterUpcoming') : t('filterCompleted');
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
                  <Text style={[styles.avatarText, { fontFamily: f('bold') }]}>{item.panditInitials}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.poojaName, { color: colors.text, fontFamily: f('bold') }]} numberOfLines={1}>{t(item.poojaName)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color, fontFamily: f('bold') }]}>
                        {displayStatus}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.panditName, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{item.panditName}</Text>
                  <View style={styles.dateRow}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.dateText, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                      {item.date} · {item.time}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.bookingId, { color: colors.mutedForeground, fontFamily: f('regular') }]}>#{item.bookingId}</Text>
                <Text style={[styles.amount, { color: colors.primary, fontFamily: f('bold') }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
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
