import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [offerAlerts, setOfferAlerts] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const SwitchRow = ({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
      <View style={styles.switchInfo}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
        {sub && <Text style={[styles.switchSub, { color: colors.mutedForeground }]}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={v => { Haptics.selectionAsync(); onChange(v); }}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
      />
    </View>
  );

  const LinkRow = ({ label, icon, color, onPress, destructive }: any) => (
    <Pressable
      style={[styles.linkRow, { borderBottomColor: colors.border }]}
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
    >
      <View style={[styles.linkIcon, { backgroundColor: (color || colors.primary) + '15' }]}>
        <Feather name={icon} size={18} color={color || colors.primary} />
      </View>
      <Text style={[styles.linkLabel, { color: destructive ? colors.destructive : colors.text }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SwitchRow label="Booking Alerts" sub="Confirmations & updates" value={bookingAlerts} onChange={setBookingAlerts} />
          <SwitchRow label="Offers & Promotions" sub="Discounts & festival specials" value={offerAlerts} onChange={setOfferAlerts} />
          <SwitchRow label="Ritual Reminders" sub="24-hour advance reminder" value={reminderAlerts} onChange={setReminderAlerts} />
          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>SMS Alerts</Text>
              <Text style={[styles.switchSub, { color: colors.mutedForeground }]}>Receive alerts via SMS</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={v => { Haptics.selectionAsync(); setSmsAlerts(v); }}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={smsAlerts ? colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Account */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinkRow label="Edit Profile" icon="user" onPress={() => router.push('/edit-profile' as any)} />
          <LinkRow label="Saved Addresses" icon="map-pin" onPress={() => router.push('/addresses' as any)} />
          <LinkRow label="Language" icon="globe" onPress={() => {}} />
          <LinkRow label="Change Password" icon="lock" onPress={() => {}} />
        </View>

        {/* Legal */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LEGAL</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinkRow label="Privacy Policy" icon="shield" onPress={() => {}} />
          <LinkRow label="Terms of Service" icon="file-text" onPress={() => {}} />
          <LinkRow label="About Sankalp" icon="info" onPress={() => {}} />
        </View>

        {/* Version */}
        <View style={[styles.versionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>Sankalp v1.0.0 · Build 2025.1</Text>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT ACTIONS</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinkRow label="Sign Out" icon="log-out" color={colors.destructive} onPress={() => router.replace('/login' as any)} destructive />
          <LinkRow label="Delete Account" icon="trash-2" color={colors.destructive} onPress={() => {}} destructive />
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  section: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, gap: 12,
  },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  switchSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, gap: 12,
  },
  linkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  versionCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 12,
    borderWidth: 1, padding: 14, alignItems: 'center',
  },
  versionText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
