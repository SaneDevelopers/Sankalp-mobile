import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PANDITS, POOJA_TYPES } from '@/constants/data';
import { PANDIT_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';
import { useAuthMe } from '@workspace/api-client-react';

type Tab = 'pandits' | 'poojas';

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('pandits');

  const { data: user } = useAuthMe();

  const [likedPandits, setLikedPandits] = useState<string[]>(['1', '3']);
  const [likedPoojas, setLikedPoojas] = useState<string[]>(['pt1', 'pt2', 'pt5']);

  React.useEffect(() => {
    if (user) {
      setLikedPandits([]);
      setLikedPoojas([]);
    }
  }, [user]);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const savedPandits = PANDITS.filter(p => likedPandits.includes(p.id));
  const savedPoojas = POOJA_TYPES.filter(p => likedPoojas.includes(p.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Saved</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {(['pandits', 'poojas'] as Tab[]).map(t => (
          <Pressable
            key={t}
            style={[styles.tab, activeTab === t && { borderBottomColor: colors.primary }]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(t); }}
          >
            <Text style={[styles.tabText, { color: activeTab === t ? colors.primary : colors.mutedForeground }]}>
              {t === 'pandits' ? `Pandits (${savedPandits.length})` : `Poojas (${savedPoojas.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'pandits' ? (
        <FlatList
          data={savedPandits}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="heart" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved pandits</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Heart a pandit to save them here</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/pandit/${item.id}` as any)}
            >
              <Image source={PANDIT_IMAGES[item.id]} style={styles.avatar} resizeMode="cover" />
              <View style={styles.panditInfo}>
                <Text style={[styles.panditName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.panditSpec, { color: colors.mutedForeground }]}>{item.specialty}</Text>
                <View style={styles.metaRow}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text style={[styles.rating, { color: colors.text }]}>{item.rating}</Text>
                  <Text style={[styles.city, { color: colors.mutedForeground }]}>· {item.city}</Text>
                </View>
              </View>
              <View style={styles.panditRight}>
                <Pressable onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLikedPandits(prev => prev.filter(id => id !== item.id));
                }}>
                  <Feather name="heart" size={20} color={colors.destructive} />
                </Pressable>
                <Pressable
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/book/${item.id}` as any)}
                >
                  <Text style={styles.bookBtnText}>BOOK</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={savedPoojas}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="heart" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved poojas</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Heart a pooja to save it here</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.poojaCard, { backgroundColor: item.bgColor }]}
              onPress={() => router.push(`/pooja/${item.id}` as any)}
            >
              <View style={[styles.poojaIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name={item.icon as any} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.poojaInfo}>
                <Text style={styles.poojaName}>{item.name}</Text>
                <Text style={styles.poojaSub}>{item.duration} · From ₹{item.priceFrom.toLocaleString('en-IN')}</Text>
              </View>
              <Pressable onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLikedPoojas(prev => prev.filter(id => id !== item.id));
              }}>
                <Feather name="heart" size={20} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </Pressable>
          )}
        />
      )}
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
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  panditCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  panditSpec: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  city: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  panditRight: { alignItems: 'flex-end', gap: 10 },
  bookBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  bookBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11 },
  poojaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14,
  },
  poojaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  poojaInfo: { flex: 1 },
  poojaName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
  poojaSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
