import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PANDITS } from '@/constants/data';
import { PANDIT_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';
import { useGetPandits } from '@workspace/api-client-react';

export default function PanditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: pandits = [] } = useGetPandits();
  const pandit = pandits.find(p => p.id.toString() === id) ?? PANDITS.find(p => p.id === id) ?? PANDITS[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}>

        {/* Hero Photo */}
        <View style={styles.heroContainer}>
          <Image
            source={PANDIT_IMAGES[pandit.id.toString()] ?? PANDIT_IMAGES['1']}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Gradient overlay at bottom */}
          <View style={[styles.heroOverlay, { backgroundColor: colors.background }]} />

          {/* Floating buttons */}
          <View style={[styles.heroButtons, { paddingTop: topPadding + 12 }]}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            >
              <Feather name="arrow-left" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLiked(!liked);
              }}
              style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            >
              <Feather name="heart" size={20} color={liked ? colors.destructive : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* Name + Rating */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
            <View style={[styles.ratingBadge, { backgroundColor: colors.gold + '20' }]}>
              <Feather name="star" size={13} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.text }]}>{pandit.rating}</Text>
            </View>
          </View>
          <Text style={[styles.specialty, { color: colors.mutedForeground, marginBottom: 8 }]}>{pandit.specialty}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="map-pin" size={13} color={colors.primary} />
              <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>
                From {pandit.city}
              </Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>
              Age: {pandit.age} Yrs
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
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
                  {pooja.duration}{pooja.includesPrasad ? ' · Includes Prasad' : ''}
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
          <Text style={styles.bookBtnText}>Book {pandit.name.split(' ').slice(-1)[0]}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: {
    position: 'relative',
    height: 320,
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.0,
  },
  heroButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  panditName: { fontSize: 22, fontFamily: 'Inter_700Bold', flex: 1 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rating: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  specialty: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  statDiv: { width: 1 },
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
