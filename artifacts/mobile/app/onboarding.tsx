import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'users',
    bgColor: '#7B1F1F',
    accentColor: '#C89A3C',
    title: 'Find Your\nPandit',
    subtitle: 'Browse 500+ verified Vedic pandits, sorted by specialty, rating and availability.',
  },
  {
    id: '2',
    icon: 'calendar',
    bgColor: '#D4722A',
    accentColor: '#FAF3E8',
    title: 'Book Sacred\nRituals',
    subtitle: 'Choose your pooja, pick a muhurat time and confirm your booking in under 2 minutes.',
  },
  {
    id: '3',
    icon: 'shopping-bag',
    bgColor: '#5C3317',
    accentColor: '#C89A3C',
    title: 'Get Samagri\nDelivered',
    subtitle: 'Order authentic pooja samagri, brass diyas, and ritual utensils delivered to your door.',
  },
  {
    id: '4',
    icon: 'shield',
    bgColor: '#C89A3C',
    accentColor: '#7B1F1F',
    title: '100% Trusted\n& Verified',
    subtitle: 'Every pandit is background-checked, credential-verified, and community-reviewed.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleNext = () => {
    Haptics.selectionAsync();
    if (currentIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIdx + 1, animated: true });
      setCurrentIdx(currentIdx + 1);
    } else {
      router.replace('/login' as any);
    }
  };

  const slide = SLIDES[currentIdx];

  return (
    <View style={[styles.container, { backgroundColor: slide.bgColor }]}>
      {/* Skip */}
      <Pressable
        style={[styles.skipBtn, { paddingTop: topPadding + 16 }]}
        onPress={() => router.replace('/login')}
      >
        <Text style={[styles.skipText, { color: 'rgba(255,255,255,0.7)' }]}>SKIP</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {/* Big icon circle */}
            <View style={[styles.iconOuter, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
              <View style={[styles.iconInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Feather name={item.icon as any} size={60} color="#FFFFFF" />
              </View>
            </View>
            {/* Decorative OM */}
            <Text style={styles.omDecor}>ॐ</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom area */}
      <View style={[styles.bottom, { paddingBottom: bottomPadding + 24 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                flatRef.current?.scrollToIndex({ index: i, animated: true });
                setCurrentIdx(i);
              }}
            >
              <View style={[
                styles.dot,
                { backgroundColor: i === currentIdx ? '#FFFFFF' : 'rgba(255,255,255,0.35)' },
                i === currentIdx && styles.dotActive,
              ]} />
            </Pressable>
          ))}
        </View>

        {/* Next / Get Started */}
        <Pressable
          style={[styles.nextBtn, { backgroundColor: '#FFFFFF' }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextBtnText, { color: slide.bgColor }]}>
            {currentIdx === SLIDES.length - 1 ? 'GET STARTED' : 'NEXT'}
          </Text>
          <Feather
            name={currentIdx === SLIDES.length - 1 ? 'check' : 'arrow-right'}
            size={18}
            color={slide.bgColor}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  skipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  iconInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omDecor: {
    position: 'absolute',
    top: 100,
    right: 30,
    fontSize: 80,
    color: 'rgba(255,255,255,0.07)',
  },
  slideTitle: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 20,
  },
  slideSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 32,
    gap: 28,
    alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  nextBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
});
