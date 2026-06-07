import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
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

import { PANDITS, POOJA_TYPES } from '@/constants/data';
import { STORE_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';

const POOJA_INCLUDES: Record<string, string[]> = {
  pt1: ['Satyanarayan Katha recitation', 'Panchamrit abhishek', 'Prasad (halwa-puri)', 'Flowers & garlands', 'Sankalp & mangalashtak'],
  pt2: ['Vastu shanti', 'Havan with samidha', 'Navgraha puja', 'Griha pravesh mantra', 'Kalash sthapana'],
  pt3: ['Navgraha mantra jaap', 'Individual graha puja', 'Havan with graha samidha', 'Yantra sthapana', 'Brahman bhojan'],
  pt4: ['Rudra abhishek with milk', 'Bilva patra offering', 'Panchamrit snan', 'Shiva aarti', 'Rudrashtak path'],
  pt5: ['Lakshmi stotra recitation', 'Kumkum archana', 'Gold/silver coin puja', 'Aarti with ghee diya', 'Prasad distribution'],
  pt6: ['Ganesh sthapana', 'Modak bhog', 'Durva grass offering', 'Ganesh stotra', 'Aarti & visarjan'],
  pt7: ['Complete saptapadi ritual', 'Kanyadaan & havan', 'Mangalashtak recitation', 'Panigrahana ceremony', 'Ashirvad from pandit'],
  pt8: ['Maha havan with 11 types of samidha', 'Navgraha ahutis', 'Purnahuti', 'Havan kund setup', 'Complete prasad distribution'],
};

export default function PoojaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const pooja = POOJA_TYPES.find(p => p.id === id) ?? POOJA_TYPES[0];
  const includes = POOJA_INCLUDES[pooja.id] ?? POOJA_INCLUDES['pt1'];
  const pandits = PANDITS.filter(p => pooja.panditIds.includes(p.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: pooja.bgColor }]}>
          <Image source={STORE_IMAGES['si2']} style={styles.heroBg} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Pressable
              style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.2)', paddingTop: topPadding + 8 }]}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.heroContent}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name={pooja.icon as any} size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>{pooja.name}</Text>
              <Text style={styles.heroDesc}>{pooja.description}</Text>
            </View>
          </View>
        </View>

        {/* Quick Info */}
        <View style={[styles.quickRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.quickItem}>
            <Feather name="clock" size={18} color={colors.primary} />
            <Text style={[styles.quickVal, { color: colors.text }]}>{pooja.duration}</Text>
            <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>DURATION</Text>
          </View>
          <View style={[styles.quickDiv, { backgroundColor: colors.border }]} />
          <View style={styles.quickItem}>
            <Feather name="users" size={18} color={colors.primary} />
            <Text style={[styles.quickVal, { color: colors.text }]}>{pandits.length}</Text>
            <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>PANDITS</Text>
          </View>
          <View style={[styles.quickDiv, { backgroundColor: colors.border }]} />
          <View style={styles.quickItem}>
            <Feather name="tag" size={18} color={colors.primary} />
            <Text style={[styles.quickVal, { color: colors.text }]}>₹{pooja.priceFrom.toLocaleString('en-IN')}</Text>
            <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>FROM</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* What's included */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What's Included</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {includes.map((item, i) => (
              <View key={i} style={[styles.includeRow, i < includes.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.includeDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.includeText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Devotee Provides</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {['Clean puja space', 'Milk (500ml), curd, honey, ghee', 'Fresh flowers & fruits', 'Brass/copper utensils'].map((r, i, arr) => (
              <View key={i} style={[styles.includeRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Feather name="check-circle" size={14} color={colors.gold} />
                <Text style={[styles.includeText, { color: colors.text }]}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Available Pandits */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{pandits.length} Pandits Available</Text>
          {pandits.map(pandit => (
            <View key={pandit.id} style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.panditAvatar, { backgroundColor: pandit.avatarColor }]}>
                <Text style={styles.panditInitials}>{pandit.initials}</Text>
              </View>
              <View style={styles.panditInfo}>
                <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
                <Text style={[styles.panditSpec, { color: colors.mutedForeground }]}>{pandit.specialty}</Text>
                <View style={styles.panditMeta}>
                  <Feather name="star" size={12} color={colors.gold} />
                  <Text style={[styles.panditRating, { color: colors.text }]}>{pandit.rating}</Text>
                  <Text style={[styles.panditCity, { color: colors.mutedForeground }]}>· {pandit.city}</Text>
                </View>
              </View>
              <Text style={[styles.panditExp, { color: colors.primary }]}>{pandit.experience}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.findBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: '/pandits-by-pooja', params: { poojaId: pooja.id, poojaName: pooja.name } } as any);
          }}
        >
          <Feather name="users" size={18} color="#FFFFFF" />
          <Text style={styles.findBtnText}>Find Pandits · ₹{pooja.priceFrom.toLocaleString('en-IN')}+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { height: 260, position: 'relative', overflow: 'hidden' },
  heroBg: { position: 'absolute', width: '100%', height: '100%', opacity: 0.25 },
  heroOverlay: { flex: 1 },
  backBtn: { paddingHorizontal: 20, paddingBottom: 8 },
  heroContent: { paddingHorizontal: 24, paddingBottom: 24, flex: 1, justifyContent: 'flex-end' },
  heroIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  quickRow: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16, borderRadius: 14,
    borderWidth: 1, paddingVertical: 16,
  },
  quickItem: { flex: 1, alignItems: 'center', gap: 4 },
  quickVal: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  quickLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2 },
  quickDiv: { width: 1 },
  body: { padding: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 10, marginTop: 6 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  includeDot: { width: 6, height: 6, borderRadius: 3 },
  includeText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  panditCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 1, marginBottom: 8, gap: 12,
  },
  panditAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  panditInitials: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  panditSpec: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  panditMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  panditRating: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  panditCity: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  panditExp: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1,
  },
  findBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 16, gap: 10 },
  findBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
});
