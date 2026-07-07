import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useNavigation } from 'expo-router';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BESTSELLER_ITEMS, FEATURED_POOJAS, PANDITS } from '@/constants/data';
import { FESTIVAL_BANNER, PANDIT_IMAGES, STORE_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';
import {
  useAuthMe,
  useAuthUpdateProfile,
  getAuthMeQueryKey,
} from '@workspace/api-client-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Image as ExpoImage } from 'expo-image';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useQueryClient } from '@tanstack/react-query';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 70 : 52;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const { lang, setLang, t, f } = useLanguage();
  const topPadding = Platform.OS === 'web' ? 12 : insets.top;

  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    if (newLang === lang) return;
    Haptics.selectionAsync();
    setLang(newLang);
  };

  const { data: user } = useAuthMe();
  const queryClient = useQueryClient();
  const { pickAndUploadImage, uploading } = useImageUpload();
  const { mutateAsync: updateProfile } = useAuthUpdateProfile();

  const handleUploadProfileImage = async () => {
    if (!user) {
      router.push('/(tabs)/profile');
      return;
    }
    const url = await pickAndUploadImage();
    if (url) {
      try {
        await updateProfile({
          data: {
            name: user.name,
            profileImage: url,
          }
        });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
      } catch (err) {
        console.error('Error updating profile image:', err);
      }
    }
  };

  const avatarLetter = user?.name ? user.name[0].toUpperCase() : "G";
  const displayName = user?.name ? user.name.toUpperCase() : t('guest');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { line1: t('auspicious'), line2: t('morning') };
    } else if (hour >= 12 && hour < 17) {
      return { line1: t('auspicious'), line2: t('afternoon') };
    } else {
      return { line1: t('auspicious'), line2: t('evening') };
    }
  };
  const greetingText = getGreeting();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 4 }]}>
          {/* Left: Big Title */}
          <View style={{ flex: 1, marginRight: 8, justifyContent: 'flex-end' }}>
            <Text style={[styles.title, { color: colors.primary, fontFamily: f('bold') }]} numberOfLines={2} adjustsFontSizeToFit>
              {greetingText.line1}{'\n'}{greetingText.line2}
            </Text>
          </View>

          {/* Right: Icons on top, Name+Location at bottom */}
          <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 80 }}>
            {/* Top: Lang + Bell + Avatar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.langToggleContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Pressable
                  onPress={() => handleLanguageChange('hi')}
                  style={[
                    styles.langToggleItem,
                    lang === 'hi' && { backgroundColor: colors.primary }
                  ]}
                >
                  <Text style={[
                    styles.langToggleText,
                    { color: lang === 'hi' ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }
                  ]}>
                    HI
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleLanguageChange('en')}
                  style={[
                    styles.langToggleItem,
                    lang === 'en' && { backgroundColor: colors.primary }
                  ]}
                >
                  <Text style={[
                    styles.langToggleText,
                    { color: lang === 'en' ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }
                  ]}>
                    ENG
                  </Text>
                </Pressable>
              </View>
              <Pressable style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="bell" size={20} color={colors.primary} />
              </Pressable>
              <Pressable
                style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
                onPress={handleUploadProfileImage}
                disabled={uploading}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                  {user?.profileImage ? (
                    <ExpoImage
                      source={{ uri: user.profileImage }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { fontFamily: f('bold') }]}>{avatarLetter}</Text>
                  )}
                  {uploading && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }]}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  )}
                </View>
                {user && (
                  <View style={[styles.cameraBadgeSmall, { backgroundColor: colors.gold }]}>
                    <Feather name="camera" size={6} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            </View>

            {/* Bottom: Name + Location */}
            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: f('semibold'), textAlign: 'right' }]}>{t('namaste')}, {displayName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Feather name="map-pin" size={10} color={colors.primary} />
                <Text style={{ fontSize: 10, color: colors.primary, fontFamily: f('semibold'), letterSpacing: 0.3 }}>{user?.city ? `${user.city}, India` : t('location')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: f('regular') }]}
            placeholder={t("searchPlaceholder")}
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
              <Text style={[styles.festivalBadgeText, { color: colors.gold, fontFamily: f('semibold') }]}>{t("festivalSpecial")}</Text>
            </View>
            <Text style={[styles.festivalTitle, { fontFamily: f('bold') }]}>
              {t("festivalTitleLine1")}{'\n'}{t("festivalTitleLine2")}
            </Text>
            <Text style={[styles.festivalSub, { fontFamily: f('regular') }]}>{t("festivalSub")}</Text>
            <Pressable
              style={[styles.festivalBtn, { backgroundColor: colors.orange }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/poojas' as any);
              }}
            >
              <Text style={[styles.festivalBtnText, { fontFamily: f('bold') }]}>{t("bookNow")}</Text>
            </Pressable>
          </View>
          <View style={styles.omOverlay}>
            <Text style={styles.omText}>ॐ</Text>
          </View>
        </Pressable>

        {/* Sacred Services — Pooja & Havan only */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>{t("sacredServices")}</Text>
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
              <Text style={[styles.serviceCardName, { fontFamily: f('bold') }]}>{t("pooja")}</Text>
              <Text style={[styles.serviceCardSub, { fontFamily: f('regular') }]}>{t("poojaSub")}</Text>
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
              <Text style={[styles.serviceCardName, { fontFamily: f('bold') }]}>{t("havan")}</Text>
              <Text style={[styles.serviceCardSub, { fontFamily: f('regular') }]}>{t("havanSub")}</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>{t("featuredPoojas")}</Text>
          <Pressable onPress={() => router.push('/poojas' as any)}>
            <Text style={[styles.viewAll, { color: colors.accent, fontFamily: f('semibold') }]}>{t("viewAll")}</Text>
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
                <Text style={[styles.poojaName, { color: colors.text, fontFamily: f('semibold') }]} numberOfLines={2}>{t(item.name)}</Text>
                <Text style={[styles.poojaDuration, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t(item.duration)}</Text>
                <View style={styles.poojaFooter}>
                  <Text style={[styles.poojaPrice, { color: colors.primary, fontFamily: f('bold') }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                  <Pressable
                    style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/book/${item.panditId}` as any);
                    }}
                  >
                    <Text style={[styles.bookBtnText, { fontFamily: f('bold') }]}>{t("bookBtn")}</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>{t("bestsellerTitle")}</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>{t("bestsellerSub")}</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/store' as any)}>
            <Text style={[styles.viewAll, { color: colors.accent, fontFamily: f('semibold') }]}>{t("viewAll")}</Text>
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
                <Text style={[styles.samagriBadgeText, { color: colors.gold, fontFamily: f('bold') }]}>{t((item as any).label)}</Text>
              </View>
              <Image source={STORE_IMAGES[item.id]} style={styles.samagriImage} resizeMode="cover" />
              <Text style={[styles.samagriName, { color: colors.text, fontFamily: f('semibold') }]} numberOfLines={2}>{t(item.name)}</Text>
              <Text style={[styles.samagriUnit, { color: colors.mutedForeground, fontFamily: f('regular') }]} numberOfLines={1}>{t(item.unit)}</Text>
              <Text style={[styles.samagriPrice, { color: colors.primary, fontFamily: f('bold') }]}>₹{item.price.toLocaleString('en-IN')}</Text>
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
    marginBottom: 7,
  },
  greeting: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', lineHeight: 34 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  langToggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 2,
    alignItems: 'center',
  },
  langToggleItem: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  langToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  cameraBadgeSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
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
