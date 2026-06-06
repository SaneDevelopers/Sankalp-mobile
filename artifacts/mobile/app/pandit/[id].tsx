import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
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

import { PANDITS } from '@/constants/data';
import { useColors } from '@/hooks/useColors';

export default function PanditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const pandit = PANDITS.find(p => p.id === id) ?? PANDITS[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <Pressable onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLiked(!liked);
            }}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="heart" size={20} color={liked ? colors.destructive : colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Avatar Section */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarLarge, { backgroundColor: pandit.avatarColor }]}>
            <Text style={styles.avatarText}>{pandit.initials}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.text }]}>{pandit.rating}</Text>
            </View>
          </View>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{pandit.specialty}</Text>

          {/* Stats */}
          <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{pandit.experience}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>EXPERIENCE</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{pandit.bookings.toLocaleString('en-IN')}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>BOOKINGS</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{pandit.age} Yrs</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>AGE</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Address */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADDRESS</Text>
            <View style={styles.addrRow}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.addrText, { color: colors.text }]}>{pandit.address}</Text>
            </View>
          </View>

          {/* Specializations */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SPECIALIZATIONS</Text>
            <View style={styles.tagsRow}>
              {pandit.specializations.map(s => (
                <View key={s} style={[styles.tag, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Muhurat */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MUHURAT TIMES</Text>
            <View style={styles.muhuratGrid}>
              {pandit.muhurats.map(t => (
                <View key={t} style={[styles.muhuratChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.muhuratText, { color: colors.text }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Poojas */}
          <Text style={[styles.subTitle, { color: colors.text }]}>Available Poojas</Text>
          {pandit.poojas.map(pooja => (
            <View key={pooja.id} style={[styles.poojaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.poojaInfo}>
                <Text style={[styles.poojaName, { color: colors.text }]}>{pooja.name}</Text>
                <Text style={[styles.poojaMeta, { color: colors.mutedForeground }]}>
                  {pooja.duration} {pooja.includesPrasad ? '· Includes Prasad' : ''}
                </Text>
              </View>
              <Text style={[styles.poojaPrice, { color: colors.primary }]}>₹{pooja.price.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/book/${pandit.id}` as any);
          }}
        >
          <Text style={styles.bookBtnText}>Book {pandit.name.split(' ')[1]}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 0,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 36 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  panditName: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  specialty: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  statDiv: { width: 1, height: '100%' },
  body: { paddingHorizontal: 20 },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  addrRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  addrText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  muhuratGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muhuratChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  muhuratText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  subTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 10, marginTop: 4 },
  poojaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  poojaInfo: { flex: 1 },
  poojaName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  poojaMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  poojaPrice: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bookBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
