import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

interface Address {
  id: string;
  label: string;
  icon: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

const INITIAL: Address[] = [
  { id: 'a1', label: 'Home', icon: 'home', name: 'Arnav Sharma', address: 'A-301, Lotus Towers, Sector 62, Noida – 201301', phone: '+91 98765 43210', isDefault: true },
  { id: 'a2', label: 'Office', icon: 'briefcase', name: 'Arnav Sharma', address: 'B-204, Cyber Park, Sector 90, Noida – 201305', phone: '+91 98765 43210', isDefault: false },
];

const ICON_COLORS: Record<string, string> = { home: '#7B1F1F', office: '#D4722A', other: '#C89A3C' };

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const setDefault = (id: string) => {
    Haptics.selectionAsync();
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const remove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Saved Addresses</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {addresses.map(addr => {
          const iconColor = ICON_COLORS[addr.label.toLowerCase()] || ICON_COLORS['other'];
          return (
            <View key={addr.id} style={[styles.addressCard, { backgroundColor: colors.card, borderColor: addr.isDefault ? colors.primary : colors.border }]}>
              {addr.isDefault && (
                <View style={[styles.defaultTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.defaultTagText}>DEFAULT</Text>
                </View>
              )}
              <View style={styles.addrRow}>
                <View style={[styles.addrIcon, { backgroundColor: iconColor + '15' }]}>
                  <Feather name={addr.icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.addrInfo}>
                  <Text style={[styles.addrLabel, { color: colors.text }]}>{addr.label}</Text>
                  <Text style={[styles.addrName, { color: colors.mutedForeground }]}>{addr.name}</Text>
                  <Text style={[styles.addrText, { color: colors.text }]}>{addr.address}</Text>
                  <Text style={[styles.addrPhone, { color: colors.mutedForeground }]}>{addr.phone}</Text>
                </View>
              </View>
              <View style={[styles.addrActions, { borderTopColor: colors.border }]}>
                {!addr.isDefault && (
                  <Pressable onPress={() => setDefault(addr.id)} style={styles.addrAction}>
                    <Feather name="check-circle" size={14} color={colors.primary} />
                    <Text style={[styles.addrActionText, { color: colors.primary }]}>Set Default</Text>
                  </Pressable>
                )}
                <Pressable style={styles.addrAction}>
                  <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.addrActionText, { color: colors.mutedForeground }]}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => remove(addr.id)} style={styles.addrAction}>
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                  <Text style={[styles.addrActionText, { color: colors.destructive }]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* Add New */}
        <Pressable style={[styles.addBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '08' }]}>
          <Feather name="plus" size={20} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Add New Address</Text>
        </Pressable>
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
  addressCard: {
    borderRadius: 16, borderWidth: 1.5, marginBottom: 14, overflow: 'hidden', position: 'relative',
  },
  defaultTag: {
    position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, zIndex: 1,
  },
  defaultTagText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  addrRow: { flexDirection: 'row', gap: 14, padding: 16 },
  addrIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  addrName: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  addrText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 3 },
  addrPhone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  addrActions: {
    flexDirection: 'row', borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 10,
  },
  addrAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  addrActionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
