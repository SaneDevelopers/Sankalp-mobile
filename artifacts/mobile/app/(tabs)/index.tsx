import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BESTSELLER_ITEMS, FEATURED_POOJAS, PANDITS } from '@/constants/data';
import { FESTIVAL_BANNER, PANDIT_IMAGES, STORE_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>NAMASTE, ARNAV</Text>
            <Text style={[styles.title, { color: colors.primary }]}>Auspicious{'\n'}Beginnings</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="bell" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.avatarText}>A</Text>
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search poojas, pandits..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Festival Banner */}
        <Pressable
          style={[styles.festivalBanner, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/poojas' as any)}
        >
          <Image source={FESTIVAL_BANNER} style={styles.festivalBg} resizeMode="cover" />
          <View style={styles.festivalOverlay}>
            <View style={styles.festivalBadge}>
              <Feather name="star" size={10} color={colors.gold} />
              <Text style={[styles.festivalBadgeText, { color: colors.gold }]}>FESTIVAL SPECIAL</Text>
            </View>
            <Text style={styles.festivalTitle}>Diwali Lakshmi{'\n'}Pooja</Text>
            <Text style={styles.festivalSub}>Book before Oct 28 · Save 20%</Text>
            <Pressable
              style={[styles.festivalBtn, { backgroundColor: colors.orange }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/poojas' as any);
              }}
            >
              <Text style={styles.festivalBtnText}>BOOK NOW</Text>
            </Pressable>
          </View>
          <View style={styles.omOverlay}>
            <Text style={styles.omText}>ॐ</Text>
          </View>
        </Pressable>

        {/* Sacred Services — Pooja & Havan only */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sacred Services</Text>
        </View>
        <View style={styles.servicesRow}>
          {/* Pooja Card */}
          <Pressable
            style={[styles.serviceCardLarge, { overflow: 'hidden' }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/poojas' as any);
            }}
          >
            <Image source={STORE_IMAGES['si2']} style={styles.serviceCardBg} resizeMode="cover" />
            <View style={[styles.serviceCardOverlay, { backgroundColor: colors.orange + 'CC' }]}>
              <View style={[styles.serviceIconBig, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Feather name="sun" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.serviceCardName}>Pooja</Text>
              <Text style={styles.serviceCardSub}>50+ rituals</Text>
              <View style={styles.serviceArrow}>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>

          {/* Havan Card */}
          <Pressable
            style={[styles.serviceCardLarge, { overflow: 'hidden', backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push({ pathname: '/poojas', params: { category: 'havan' } } as any);
            }}
          >
            <View style={[styles.serviceCardOverlay, { backgroundColor: colors.primary + 'EE' }]}>
              <View style={[styles.serviceIconBig, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name="zap" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.serviceCardName}>Havan</Text>
              <Text style={styles.serviceCardSub}>Sacred fire rituals</Text>
              <View style={styles.serviceArrow}>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.havanDecor}>
              <Text style={styles.havanOm}>ॐ</Text>
            </View>
          </Pressable>
        </View>

        {/* Featured Poojas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Poojas</Text>
          <Pressable onPress={() => router.push('/poojas' as any)}>
            <Text style={[styles.viewAll, { color: colors.accent }]}>VIEW ALL</Text>
          </Pressable>
        </View>
        <FlatList
          data={FEATURED_POOJAS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const pandit = PANDITS.find(p => p.id === item.panditId)!;
            return (
              <Pressable
                style={[styles.poojaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/pandit/${item.panditId}` as any)}
              >
                <Image source={PANDIT_IMAGES[item.panditId]} style={styles.poojaAvatar} resizeMode="cover" />
                <Text style={[styles.poojaName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.poojaDuration, { color: colors.mutedForeground }]}>{item.duration}</Text>
                <View style={styles.poojaFooter}>
                  <Text style={[styles.poojaPrice, { color: colors.primary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                  <Pressable
                    style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/book/${item.panditId}` as any);
                    }}
                  >
                    <Text style={styles.bookBtnText}>BOOK</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        {/* Bestseller Pooja Samagri */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bestseller Pooja Samagri</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Most ordered ritual essentials</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/store' as any)}>
            <Text style={[styles.viewAll, { color: colors.accent }]}>VIEW ALL</Text>
          </Pressable>
        </View>
        <FlatList
          data={BESTSELLER_ITEMS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={item => item.id + '_bs'}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.samagriCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/store' as any)}
            >
              <View style={[styles.samagriBadge, { backgroundColor: colors.gold + '20' }]}>
                <Text style={[styles.samagriBadgeText, { color: colors.gold }]}>{(item as any).label}</Text>
              </View>
              <Image source={STORE_IMAGES[item.id]} style={styles.samagriImage} resizeMode="cover" />
              <Text style={[styles.samagriName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.samagriUnit, { color: colors.mutedForeground }]} numberOfLines={1}>{item.unit}</Text>
              <Text style={[styles.samagriPrice, { color: colors.primary }]}>₹{item.price.toLocaleString('en-IN')}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greeting: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', lineHeight: 34 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  festivalBanner: {
    marginHorizontal: 20, borderRadius: 16, marginBottom: 24,
    overflow: 'hidden', height: 180, position: 'relative',
  },
  festivalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.3 },
  festivalOverlay: { padding: 20, flex: 1, justifyContent: 'center' },
  festivalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  festivalBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5 },
  festivalTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginBottom: 6, lineHeight: 30 },
  festivalSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  festivalBtn: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  festivalBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1 },
  omOverlay: { position: 'absolute', right: 20, bottom: -10, opacity: 0.15 },
  omText: { fontSize: 100, color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  servicesRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  serviceCardLarge: {
    flex: 1, height: 150, borderRadius: 16, position: 'relative',
  },
  serviceCardBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  serviceCardOverlay: {
    flex: 1, padding: 16, justifyContent: 'space-between', borderRadius: 16,
  },
  serviceIconBig: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  serviceCardName: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 6 },
  serviceCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Inter_400Regular' },
  serviceArrow: {
    alignSelf: 'flex-end',
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  havanDecor: { position: 'absolute', right: 10, top: 10, opacity: 0.15 },
  havanOm: { fontSize: 70, color: '#FFFFFF' },
  poojaCard: {
    width: 155, borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 4,
  },
  poojaAvatar: { width: '100%', height: 90, borderRadius: 10, marginBottom: 10 },
  poojaName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4, lineHeight: 18 },
  poojaDuration: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  poojaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  poojaPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  bookBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  bookBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.5 },
  samagriCard: { width: 140, borderRadius: 14, borderWidth: 1, overflow: 'hidden', paddingBottom: 12 },
  samagriBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 1,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  samagriBadgeText: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  samagriImage: { width: '100%', height: 110 },
  samagriName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', paddingHorizontal: 10, marginTop: 8, lineHeight: 17 },
  samagriUnit: { fontSize: 10, fontFamily: 'Inter_400Regular', paddingHorizontal: 10, marginTop: 2, marginBottom: 4 },
  samagriPrice: { fontSize: 14, fontFamily: 'Inter_700Bold', paddingHorizontal: 10 },
});
