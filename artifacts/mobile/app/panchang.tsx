import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  getPanchangForDate,
  MAHARASHTRA_CITIES,
  MaharashtraCity,
  resolveCity,
  getUpcomingMaharashtraFestivals,
  getTonightMoonriseCountdown,
} from '@/constants/panchang';
import {
  scheduleDailyPanchangNotification,
  sendInstantPanchangPreview,
} from '@/lib/notifications';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useColors } from '@/hooks/useColors';
import { PanchangCard } from '@/components/PanchangCard';
import {
  useAuthMe,
  useGetAddresses,
  getGetAddressesQueryKey,
} from '@workspace/api-client-react';
import * as Location from 'expo-location';

const DATE_OFFSETS = [0, 1, 2, 3, 4];

export default function PanchangScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lang, t, f } = useLanguage();

  const { data: user } = useAuthMe();
  const { data: addresses = [] } = useGetAddresses({
    query: {
      enabled: !!user,
      queryKey: getGetAddressesQueryKey(),
    },
  });

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const userCity = defaultAddress?.city || user?.city || 'Pune';

  const [selectedOffset, setSelectedOffset] = useState(0);
  const [selectedCityId, setSelectedCityId] = useState(() => resolveCity(userCity).id);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  React.useEffect(() => {
    if (userCity) {
      setSelectedCityId(resolveCity(userCity).id);
    }
  }, [userCity]);

  const selectedCity =
    MAHARASHTRA_CITIES.find((c) => c.id === selectedCityId) || MAHARASHTRA_CITIES[0];

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedOffset);

  const panchang = getPanchangForDate(targetDate, selectedCity.id);
  const moonriseInfo = getTonightMoonriseCountdown(targetDate, selectedCity.id);
  const upcomingFestivals = getUpcomingMaharashtraFestivals(new Date(), 6);
  const topPadding = Platform.OS === 'web' ? 16 : insets.top;

  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  const isDevanagari = isMr || isHi;

  const getDateInfo = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const day = d.toLocaleDateString(isMr ? 'mr-IN' : isHi ? 'hi-IN' : 'en-US', {
      weekday: 'short',
    });
    const date = d.getDate();
    const month = d.toLocaleDateString(isMr ? 'mr-IN' : isHi ? 'hi-IN' : 'en-US', {
      month: 'short',
    });

    let label = '';
    if (offset === 0) label = isMr ? 'आज' : isHi ? 'आज' : 'Today';
    else if (offset === 1) label = isMr ? 'उद्या' : isHi ? 'कल' : 'Tomorrow';
    else label = day;

    return { label, date, month };
  };

  const cityName = isMr
    ? selectedCity.nameMr
    : isHi
    ? selectedCity.nameHi
    : selectedCity.nameEn;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 6,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Pressable
          style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
        >
          <Feather name="arrow-left" size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerOm, { fontFamily: f('bold') }]}>ॐ</Text>
          <Text style={[styles.headerTitle, { fontFamily: f('bold') }]}>
            {isMr ? 'महाराष्ट्र पंचांग व मुहूर्त' : isHi ? 'हिन्दू पंचांग एवं मुहूर्त' : 'Maharashtra Panchang'}
          </Text>
          <Text style={[styles.headerSub, { fontFamily: f('regular') }]}>
            {isMr
              ? `${panchang.shaka.mr} · ${panchang.month.mr} मास`
              : isHi
              ? `${panchang.shaka.hi} · ${panchang.month.hi} मास`
              : `${panchang.shaka.en} · ${panchang.month.en} Month`}
          </Text>
        </View>

        {/* City Switcher Button */}
        <Pressable
          style={[styles.cityBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowCityModal(true);
          }}
        >
          <Feather name="map-pin" size={12} color="#FFFFFF" />
          <Text style={[styles.cityBtnText, { fontFamily: f('semibold') }]} numberOfLines={1}>
            {cityName}
          </Text>
        </Pressable>
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelectorWrap, { backgroundColor: colors.primary }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelectorScroll}
        >
          {DATE_OFFSETS.map((offset) => {
            const info = getDateInfo(offset);
            const isSelected = selectedOffset === offset;
            return (
              <Pressable
                key={offset}
                style={[
                  styles.datePill,
                  isSelected && [styles.datePillActive, { backgroundColor: '#FFFFFF' }],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedOffset(offset);
                }}
              >
                <Text
                  style={[
                    styles.datePillLabel,
                    {
                      fontFamily: f('bold'),
                      color: isSelected ? colors.primary : 'rgba(255,255,255,0.7)',
                    },
                  ]}
                >
                  {info.label}
                </Text>
                <Text
                  style={[
                    styles.datePillDate,
                    {
                      fontFamily: f('regular'),
                      color: isSelected ? colors.primary : 'rgba(255,255,255,0.55)',
                    },
                  ]}
                >
                  {info.date} {info.month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Maharashtra Festivals & Events Card */}
        {panchang.events && panchang.events.length > 0 && (
          <View style={styles.eventSection}>
            {panchang.events.map((ev, idx) => (
              <View
                key={idx}
                style={[
                  styles.festivalBanner,
                  {
                    backgroundColor: colors.gold + '15',
                    borderColor: colors.gold,
                  },
                ]}
              >
                <View style={styles.festivalIconWrap}>
                  <Text style={styles.festivalEmoji}>🚩</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.festivalTitle, { color: colors.primary, fontFamily: f('bold') }]}>
                      {isMr ? ev.titleMr : isHi ? ev.titleHi : ev.titleEn}
                    </Text>
                    <View style={[styles.festBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.festBadgeText, { fontFamily: f('bold') }]}>
                        {isMr ? 'सण / उत्सव' : isHi ? 'त्योहार' : 'FESTIVAL'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.festivalDesc, { color: colors.text, fontFamily: f('regular') }]}>
                    {isMr ? ev.descriptionMr : isHi ? ev.descriptionHi : ev.descriptionEn}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Primary Panchang Card */}
        <View style={{ marginTop: panchang.events.length > 0 ? 4 : 12 }}>
          <PanchangCard panchang={panchang} showFullDetails />
        </View>

        {/* Shubh & Ashubh Kaal Timing Details */}
        <View style={styles.sectionWrap}>
          <View style={[styles.timingGridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardHeaderTitle, { color: colors.primary, fontFamily: f('bold') }]}>
              {isMr ? '⏰ आजचे शुभ व अशुभ मुहूर्त' : isHi ? '⏰ शुभ व अशुभ मुहूर्त' : '⏰ Auspicious & Inauspicious Timings'}
            </Text>
            <Text style={[styles.cardHeaderSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              {isMr ? `स्थान: ${cityName} · सूर्योदयानुसार अचूक गणना` : `Location: ${cityName} · Astronomical Timings`}
            </Text>

            <View style={styles.gridRow}>
              {/* Abhijit Muhurat */}
              <View style={[styles.timingBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.timingBoxLabel, { color: '#065F46', fontFamily: f('semibold') }]}>
                  {isMr ? 'अभिजित मुहूर्त (शुभ)' : 'Abhijit Muhurat'}
                </Text>
                <Text style={[styles.timingBoxTime, { color: '#047857', fontFamily: f('bold') }]}>
                  {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
                </Text>
              </View>

              {/* Brahma Muhurat */}
              <View style={[styles.timingBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Text style={[styles.timingBoxLabel, { color: '#92400E', fontFamily: f('semibold') }]}>
                  {isMr ? 'ब्रह्म मुहूर्त (ध्यान/साधना)' : 'Brahma Muhurat'}
                </Text>
                <Text style={[styles.timingBoxTime, { color: '#B45309', fontFamily: f('bold') }]}>
                  {panchang.brahmaMuhurat.start} – {panchang.brahmaMuhurat.end}
                </Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              {/* Rahu Kaal */}
              <View style={[styles.timingBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={[styles.timingBoxLabel, { color: '#991B1B', fontFamily: f('semibold') }]}>
                  {isMr ? 'राहुकाळ (वर्ज्य वेळ)' : 'Rahu Kalam'}
                </Text>
                <Text style={[styles.timingBoxTime, { color: '#DC2626', fontFamily: f('bold') }]}>
                  {panchang.rahukalam.start} – {panchang.rahukalam.end}
                </Text>
              </View>

              {/* Yamaganda */}
              <View style={[styles.timingBox, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                <Text style={[styles.timingBoxLabel, { color: '#9A3412', fontFamily: f('semibold') }]}>
                  {isMr ? 'यमगंड काळ' : 'Yamaganda'}
                </Text>
                <Text style={[styles.timingBoxTime, { color: '#EA580C', fontFamily: f('bold') }]}>
                  {panchang.yamaganda.start} – {panchang.yamaganda.end}
                </Text>
              </View>
            </View>

            {/* Moonrise & Fast-Breaking Countdown Card */}
            <View style={[styles.moonStrip, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[styles.moonIconWrap, { backgroundColor: colors.primary + '15' }]}>
                <Feather name="moon" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moonTitle, { color: colors.text, fontFamily: f('bold') }]}>
                  {isMr ? 'चंद्रोदय वेळ व अर्घ्य मुहूर्त' : isHi ? 'चंद्रोदय समय एवं अर्घ्य' : "Tonight's Moonrise"}
                </Text>
                <Text style={[styles.moonSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                  {isMr
                    ? `${selectedCity.nameMr}: ${moonriseInfo.statusTextMr}`
                    : isHi
                    ? `${selectedCity.nameHi}: ${moonriseInfo.statusTextHi}`
                    : `${selectedCity.nameEn}: ${moonriseInfo.statusTextEn}`}
                </Text>
              </View>
              <View style={[styles.moonBadge, { backgroundColor: colors.gold + '25' }]}>
                <Text style={[styles.moonBadgeText, { color: colors.primary, fontFamily: f('bold') }]}>
                  {moonriseInfo.timeStr}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Morning Panchang Alert Subscription Card */}
        <View style={styles.sectionWrap}>
          <Pressable
            style={[styles.notifBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await scheduleDailyPanchangNotification(cityName, lang);
              await sendInstantPanchangPreview(cityName, lang);
            }}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: colors.primary }]}>
              <Feather name="bell" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, { color: colors.primary, fontFamily: f('bold') }]}>
                {isMr
                  ? `दररोज सकाळी ६:३० वाजता पंचांग मिळवा (${cityName})`
                  : isHi
                  ? `दैनिक प्रातः ६:३० बजे पंचांग प्राप्त करें (${cityName})`
                  : `Get Daily 6:30 AM Panchang Alerts (${cityName})`}
              </Text>
              <Text style={[styles.notifSub, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                {isMr
                  ? 'अचूक तिथी, शुभ अभिजित मुहूर्त व राहुकाळ सूचना थेट आपल्या फोनवर'
                  : 'Daily auspicious timings and Rahu Kaal window straight to your phone'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Upcoming Maharashtra Festivals & Vrats Carousel */}
        <View style={styles.sectionWrap}>
          <View style={[styles.sectionHeader, { borderLeftColor: colors.gold }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>
              {isMr ? '🚩 आगामी सण व उत्सव (महाराष्ट्र)' : isHi ? '🚩 आगामी पर्व एवं व्रत' : '🚩 Upcoming Maharashtra Festivals'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              {isMr ? 'पुढील प्रमुख सण व उपवासांचे काउंटडाउन' : 'Countdown to upcoming sacred occasions'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.festivalScroll}
          >
            {upcomingFestivals.map((fest) => {
              let tagLabel = '';
              if (fest.daysRemaining === 0) tagLabel = isMr ? 'आज' : isHi ? 'आज' : 'Today';
              else if (fest.daysRemaining === 1) tagLabel = isMr ? 'उद्या' : isHi ? 'कल' : 'Tomorrow';
              else tagLabel = isMr ? `${fest.daysRemaining} दिवस बाकी` : isHi ? `${fest.daysRemaining} दिन शेष` : `In ${fest.daysRemaining}d`;

              return (
                <View
                  key={fest.id}
                  style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.upcomingTop}>
                    <Text style={styles.upcomingEmoji}>🚩</Text>
                    <View
                      style={[
                        styles.upcomingTag,
                        {
                          backgroundColor:
                            fest.daysRemaining <= 1 ? colors.primary : colors.gold + '25',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.upcomingTagText,
                          {
                            color: fest.daysRemaining <= 1 ? '#FFFFFF' : colors.primary,
                            fontFamily: f('bold'),
                          },
                        ]}
                      >
                        {tagLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.upcomingTitle, { color: colors.text, fontFamily: f('bold') }]} numberOfLines={2}>
                    {isMr ? fest.titleMr : isHi ? fest.titleHi : fest.titleEn}
                  </Text>
                  <Text style={[styles.upcomingDate, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
                    {fest.dateStr}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Recommended Poojas Section */}
        <View style={styles.sectionWrap}>
          <View style={[styles.sectionHeader, { borderLeftColor: colors.orange }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: f('bold') }]}>
              {selectedOffset === 0
                ? isMr
                  ? 'आजचे विशेष पूजा विधी'
                  : isHi
                  ? 'आज के लिए अनुशंसित पूजाएँ'
                  : "Today's Recommended Poojas"
                : isMr
                ? 'उद्याचे विशेष पूजा विधी'
                : isHi
                ? 'कल के लिए अनुशंसित पूजाएँ'
                : "Tomorrow's Recommended Poojas"}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              {isMr
                ? 'महाराष्ट्रातील तिथी व ग्रहनक्षत्रानुसार शुभ विधी'
                : isHi
                ? 'तिथि एवं ग्रह नक्षत्र के अनुसार विशेष पूजाएँ'
                : 'Curated by Tithi & planetary alignment in Maharashtra'}
            </Text>
          </View>

          {panchang.recommendedPoojas.map((item, idx) => {
            const name = isMr ? item.nameMr : isHi ? item.nameHi : item.nameEn;
            const reason = isMr ? item.reasonMr : isHi ? item.reasonHi : item.reasonEn;

            return (
              <View
                key={idx}
                style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.recCardTop}>
                  <View style={[styles.recIconBg, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={styles.recIconEmoji}>🪔</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recName, { color: colors.text, fontFamily: f('bold') }]}>
                      {name}
                    </Text>
                    <Text
                      style={[styles.recReason, { color: colors.mutedForeground, fontFamily: f('regular') }]}
                      numberOfLines={2}
                    >
                      {reason}
                    </Text>
                  </View>
                  <View style={[styles.recBadge, { backgroundColor: colors.orange + '18' }]}>
                    <Feather name="star" size={7} color={colors.orange} />
                    <Text style={[styles.recBadgeText, { color: colors.orange, fontFamily: f('bold') }]}>
                      {isMr ? 'शुभ' : isHi ? 'शुभ' : 'SHUBH'}
                    </Text>
                  </View>
                </View>

                <View style={styles.recCardBottom}>
                  <Pressable
                    style={[styles.bookCta, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/pandit/${item.panditId}` as any);
                    }}
                  >
                    <Feather name="calendar" size={11} color="#FFFFFF" />
                    <Text style={[styles.bookCtaText, { fontFamily: f('bold') }]}>
                      {isMr ? 'गुरुजी बुक करा' : t('bookRecommendedPooja')}
                    </Text>
                    <Feather name="chevron-right" size={11} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary, fontFamily: f('bold') }]}>
                {isMr ? 'महाराष्ट्र शहर निवडा' : 'Select Maharashtra City'}
              </Text>
              <Pressable
                onPress={() => setShowCityModal(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
              {isMr
                ? 'सूर्योदय, सूर्यास्त व पंचांग अचूकतेसाठी आपले शहर निवडा:'
                : 'Panchang and timings will calculate accurately for this city:'}
            </Text>

            {/* Auto Detect GPS Button */}
            <Pressable
              style={[
                styles.autoDetectBtn,
                { backgroundColor: colors.gold + '18', borderColor: colors.gold + '50' },
              ]}
              disabled={isDetectingGps}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsDetectingGps(true);
                try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status === 'granted') {
                    const pos = await Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Balanced,
                    });
                    const [geo] = await Location.reverseGeocodeAsync({
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                    });
                    const detectedName = geo?.city || geo?.subregion || geo?.district;
                    if (detectedName) {
                      const resolved = resolveCity(detectedName);
                      setSelectedCityId(resolved.id);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setShowCityModal(false);
                    }
                  }
                } catch (e) {
                  console.log('GPS detection error', e);
                } finally {
                  setIsDetectingGps(false);
                }
              }}
            >
              <Feather name="navigation" size={15} color={colors.primary} />
              <Text style={[styles.autoDetectBtnText, { color: colors.primary, fontFamily: f('bold') }]}>
                {isDetectingGps
                  ? (isMr ? 'स्थान शोधत आहे...' : 'Detecting GPS Location...')
                  : (isMr ? 'माझे वर्तमान स्थान शोधा (GPS Auto-Detect)' : 'Auto-Detect My Current City (GPS)')}
              </Text>
            </Pressable>

            <ScrollView style={{ maxHeight: 320 }}>
              {MAHARASHTRA_CITIES.map((c) => {
                const isSelected = selectedCityId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    style={[
                      styles.cityRow,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.primary + '12' : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedCityId(c.id);
                      setShowCityModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Feather
                        name="map-pin"
                        size={16}
                        color={isSelected ? colors.primary : colors.mutedForeground}
                      />
                      <View>
                        <Text
                          style={[
                            styles.cityNameText,
                            {
                              color: isSelected ? colors.primary : colors.text,
                              fontFamily: isSelected ? f('bold') : f('medium'),
                            },
                          ]}
                        >
                          {isMr ? c.nameMr : c.nameEn}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: f('regular') }}>
                          {c.nameEn} ({c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E)
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Feather name="check" size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 6,
  },
  headerOm: { fontSize: 18, color: '#FFD700', marginBottom: 1 },
  headerTitle: { fontSize: 16, color: '#FFFFFF', letterSpacing: 0.2 },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  cityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    maxWidth: 95,
  },
  cityBtnText: { color: '#FFFFFF', fontSize: 11 },

  // Date Selector
  dateSelectorWrap: {
    paddingBottom: 12,
    paddingHorizontal: 10,
  },
  dateSelectorScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 4,
  },
  datePill: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  datePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  datePillLabel: { fontSize: 11, textAlign: 'center' },
  datePillDate: { fontSize: 9, textAlign: 'center' },

  // Festivals
  eventSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  festivalBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  festivalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  festivalEmoji: { fontSize: 20 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  festivalTitle: { fontSize: 14, flex: 1 },
  festBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  festBadgeText: { color: '#FFFFFF', fontSize: 8, letterSpacing: 0.5 },
  festivalDesc: { fontSize: 11, lineHeight: 16 },

  // Section
  sectionWrap: { paddingHorizontal: 16, marginTop: 14 },
  timingGridCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeaderTitle: { fontSize: 14 },
  cardHeaderSub: { fontSize: 11 },
  gridRow: { flexDirection: 'row', gap: 10 },
  timingBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  timingBoxLabel: { fontSize: 11, marginBottom: 2 },
  timingBoxTime: { fontSize: 12 },
  moonStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  moonIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonTitle: { fontSize: 13 },
  moonSub: { fontSize: 11, marginTop: 1 },
  moonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moonBadgeText: { fontSize: 12 },

  // Notification Banner
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontSize: 13, lineHeight: 17 },
  notifSub: { fontSize: 11, marginTop: 2, lineHeight: 15 },

  // Upcoming Festivals
  festivalScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  upcomingCard: {
    width: 145,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  upcomingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upcomingEmoji: { fontSize: 18 },
  upcomingTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  upcomingTagText: { fontSize: 9 },
  upcomingTitle: { fontSize: 12, lineHeight: 16, height: 32 },
  upcomingDate: { fontSize: 11 },

  // Recommended
  sectionHeader: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 14, lineHeight: 19 },
  sectionSubtitle: { fontSize: 10, marginTop: 1 },
  recCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  recCardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  recIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recIconEmoji: { fontSize: 16 },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recBadgeText: { fontSize: 8, letterSpacing: 0.3 },
  recName: { fontSize: 14, lineHeight: 18 },
  recReason: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  recCardBottom: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bookCtaText: { color: '#FFFFFF', fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cityModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 16 },
  modalSubtitle: { fontSize: 12, marginBottom: 14 },
  closeBtn: { padding: 4 },
  autoDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'center',
  },
  autoDetectBtnText: { fontSize: 12 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  cityNameText: { fontSize: 14 },
});
