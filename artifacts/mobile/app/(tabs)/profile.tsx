import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

const MENU_ITEMS = [
  { id: 'm1', label: 'My Bookings', icon: 'calendar', route: '/(tabs)/bookings' },
  { id: 'm2', label: 'Saved Addresses', icon: 'map-pin', route: null },
  { id: 'm3', label: 'Order History', icon: 'package', route: null },
  { id: 'm4', label: 'Privacy & Security', icon: 'shield', route: null },
  { id: 'm5', label: 'Settings', icon: 'settings', route: null },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.primary, paddingTop: topPadding + 24 }]}>
        <View style={styles.omContainer}>
          <Text style={styles.omSymbol}>ॐ</Text>
        </View>
        <View style={[styles.avatarRing, { borderColor: colors.gold }]}>
          <View style={[styles.avatar, { backgroundColor: colors.orange }]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
        <Text style={styles.devoteeLabel}>DEVOTEE</Text>
        <Text style={styles.name}>Arnav Sharma</Text>
        <Text style={styles.phone}>+91 98XXX XXX12</Text>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>BOOKINGS</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>₹24K</Text>
            <Text style={styles.statLabel}>SPENT</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>PANDITS</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[
              styles.menuItem,
              idx < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              if (item.route) router.push(item.route as any);
            }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Feather name={item.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Admin Console */}
      <Pressable
        style={[styles.adminBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/admin' as any);
        }}
      >
        <Feather name="bar-chart-2" size={18} color="#FFFFFF" />
        <Text style={styles.adminBtnText}>Admin Console</Text>
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  omContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.15,
  },
  omSymbol: { fontSize: 60, color: '#FFFFFF' },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 28 },
  devoteeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  name: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  phone: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5 },
  statDivider: { width: 1, height: 36 },
  menuCard: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  adminBtnText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
