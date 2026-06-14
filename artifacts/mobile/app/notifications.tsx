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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useAuthMe } from '@workspace/api-client-react';

const NOTIFICATIONS = [
  { id: 'n1', type: 'booking', icon: 'calendar', title: 'Booking Confirmed!', body: 'Your Satyanarayan Katha with Acharya Shastri on 15 Oct at 9:30 AM is confirmed.', time: '2 hrs ago', read: false },
  { id: 'n2', type: 'offer', icon: 'tag', title: 'Diwali Special — 20% Off', body: 'Book any Diwali special pooja before Oct 28 and save 20%. Limited slots!', time: '5 hrs ago', read: false },
  { id: 'n3', type: 'reminder', icon: 'bell', title: 'Upcoming Pooja Reminder', body: 'Your Satyanarayan Katha is tomorrow at 9:30 AM. Make sure to be ready with the samagri.', time: '1 day ago', read: true },
  { id: 'n4', type: 'general', icon: 'users', title: 'New Pandits in Delhi NCR', body: '5 new verified pandits have joined Sankalp in your area. Check their profiles!', time: '3 days ago', read: true },
  { id: 'n5', type: 'booking', icon: 'check-circle', title: 'Ritual Completed', body: 'Your Griha Pravesh with Pandit Mishra has been marked as completed. Rate your experience!', time: '4 days ago', read: true },
  { id: 'n6', type: 'offer', icon: 'gift', title: 'Refer & Earn ₹200', body: 'Invite friends to Sankalp and earn ₹200 cashback on your next booking.', time: '1 week ago', read: true },
];

const TYPE_COLORS: Record<string, string> = {
  booking: '#7B1F1F',
  offer: '#D4722A',
  reminder: '#C89A3C',
  general: '#5C3317',
};

import { useNotifications } from '@/context/NotificationContext';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const markAllRead = () => {
    Haptics.selectionAsync();
    markAllAsRead();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markRead, { color: colors.accent }]}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>We'll notify you when there's an update</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.notifCard,
              {
                backgroundColor: item.read ? colors.card : colors.primary + '08',
                borderColor: item.read ? colors.border : colors.primary + '30',
              },
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={[styles.iconWrap, { backgroundColor: TYPE_COLORS[item.type] + '15' }]}>
              <Feather name={item.icon as any} size={20} color={TYPE_COLORS[item.type]} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTitleRow}>
                <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>{item.body}</Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{item.time}</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  markRead: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notifBody: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
