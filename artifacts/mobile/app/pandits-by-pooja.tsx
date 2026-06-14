import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
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
import { useGetPandits } from '@workspace/api-client-react';

export default function PanditsByPoojaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { poojaId, poojaName } = useLocalSearchParams<{ poojaId: string; poojaName: string }>();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const { data: dbPandits = [] } = useGetPandits();
  const panditsList = dbPandits.length > 0 ? dbPandits : PANDITS;

  const poojaType = POOJA_TYPES.find(p => p.id === poojaId);
  const pandits = poojaType
    ? panditsList.filter(p => poojaType.panditIds.map(String).includes(p.id.toString()))
    : panditsList;

  const getAvailLabel = (available: string) => {
    if (available === 'today') return { label: 'AVAILABLE TODAY', color: colors.success };
    if (available === 'tomorrow') return { label: 'TOMORROW', color: colors.orange };
    return { label: 'NEXT WEEK', color: colors.mutedForeground };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>{poojaName ?? 'Select Pandit'}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{pandits.length} Pandits Available</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Pooja info banner */}
      {poojaType && (
        <View style={[styles.poojaBanner, { backgroundColor: poojaType.bgColor }]}>
          <View style={[styles.poojaIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name={poojaType.icon as any} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.poojaInfo}>
            <Text style={styles.poojaInfoName}>{poojaType.name}</Text>
            <Text style={styles.poojaInfoDesc}>{poojaType.description}</Text>
          </View>
          <View style={styles.poojaInfoRight}>
            <Text style={styles.poojaInfoFrom}>FROM</Text>
            <Text style={styles.poojaInfoPrice}>₹{poojaType.priceFrom.toLocaleString('en-IN')}</Text>
            <Text style={styles.poojaInfoDuration}>{poojaType.duration}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={pandits}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pandits available</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const avail = getAvailLabel(item.available);
          const matchingPooja = item.poojas.find(p =>
            poojaType ? p.name.toLowerCase().includes(poojaType.name.split(' ')[0].toLowerCase()) : true
          ) ?? item.poojas[0];

          return (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/pandit/${item.id}` as any);
              }}
            >
              <Image source={PANDIT_IMAGES[item.id.toString()] ?? PANDIT_IMAGES['1']} style={styles.avatar} resizeMode="cover" />
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.specialty, { color: colors.mutedForeground }]}>
                  {item.specialty} · {item.experience}
                </Text>
                <View style={styles.cityRow}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.city, { color: colors.mutedForeground }]}>{item.city}</Text>
                </View>
                <View style={styles.availRow}>
                  <View style={[styles.dot, { backgroundColor: avail.color }]} />
                  <Text style={[styles.availText, { color: avail.color }]}>{avail.label}</Text>
                </View>
                {matchingPooja && (
                  <View style={[styles.priceChip, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={[styles.priceText, { color: colors.primary }]}>
                      {matchingPooja.name} · ₹{matchingPooja.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.rightCol}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text style={[styles.rating, { color: colors.text }]}>{item.rating}</Text>
                </View>
                <Pressable
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/book/${item.id}` as any);
                  }}
                >
                  <Text style={styles.bookBtnText}>BOOK</Text>
                </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  poojaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  poojaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poojaInfo: { flex: 1 },
  poojaInfoName: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  poojaInfoDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  poojaInfoRight: { alignItems: 'flex-end' },
  poojaInfoFrom: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  poojaInfoPrice: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  poojaInfoDuration: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter_400Regular' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  specialty: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  city: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  priceChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  priceText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  rightCol: { alignItems: 'flex-end', gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  bookBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  bookBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
