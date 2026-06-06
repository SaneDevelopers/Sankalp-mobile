import { Feather } from '@expo/vector-icons';
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

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_DATA = [65, 40, 80, 55, 90, 70, 45];

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const maxBar = Math.max(...BAR_DATA);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Dark Header */}
      <View style={[styles.adminHeader, { paddingTop: topPadding + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.adminConsoleLabel}>ADMIN CONSOLE</Text>
            <Text style={styles.adminTitle}>Sankalp</Text>
          </View>
          <View style={[styles.adminAvatar, { backgroundColor: colors.gold }]}>
            <Text style={styles.adminAvatarText}>A</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="dollar-sign" size={14} color={colors.gold} />
              <Text style={styles.statCardLabel}>REVENUE</Text>
            </View>
            <Text style={styles.statCardValue}>₹4.2L</Text>
            <Text style={styles.statCardGrowth}>+18%</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="calendar" size={14} color={colors.gold} />
              <Text style={styles.statCardLabel}>BOOKINGS</Text>
            </View>
            <Text style={styles.statCardValue}>284</Text>
            <Text style={styles.statCardGrowth}>+12%</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="users" size={14} color={colors.gold} />
              <Text style={styles.statCardLabel}>PANDITS</Text>
            </View>
            <Text style={styles.statCardValue}>47</Text>
            <Text style={styles.statCardGrowth}>+3</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="trending-up" size={14} color={colors.gold} />
              <Text style={styles.statCardLabel}>RATING</Text>
            </View>
            <Text style={styles.statCardValue}>4.8</Text>
            <Text style={styles.statCardGrowth}>★★★★★</Text>
          </View>
        </View>
      </View>

      {/* White Body */}
      <ScrollView
        style={[styles.body, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 20 }}
      >
        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Bookings · This Week</Text>
          </View>
          <View style={styles.chartBars}>
            {BAR_DATA.map((val, idx) => (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(val / maxBar) * 100}%`,
                        backgroundColor: idx === 4 ? colors.gold : colors.primary + '60',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{DAYS[idx]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'bar-chart-2', label: 'Analytics' },
            { icon: 'users', label: 'Pandits' },
            { icon: 'calendar', label: 'Bookings' },
            { icon: 'settings', label: 'Settings' },
          ].map(action => (
            <Pressable
              key={action.label}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Feather name={action.icon as any} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
          <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>Back to Profile</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  adminHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  adminConsoleLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  adminTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: 12,
    padding: 14,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statCardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  statCardValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  statCardGrowth: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  body: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  chartCard: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  backBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
