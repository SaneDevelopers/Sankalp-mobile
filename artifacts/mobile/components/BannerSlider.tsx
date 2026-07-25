import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { BannerSlide } from '@/lib/banners';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useColors } from '@/hooks/useColors';

interface BannerSliderProps {
  banners: BannerSlide[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PADDING = 20;
const BANNER_GAP = 10;
const BANNER_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
const BANNER_HEIGHT = 195;
const ITEM_WIDTH = BANNER_WIDTH + BANNER_GAP; // snap interval

export function BannerSlider({ banners }: BannerSliderProps) {
  const colors = useColors();
  const { lang, f } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBanners = banners.filter((b) => b.active);
  const total = activeBanners.length;

  const scrollToIndex = (idx: number, animated = true) => {
    scrollRef.current?.scrollTo({ x: idx * ITEM_WIDTH, animated });
  };

  // Auto-scroll timer — reset whenever currentIndex changes
  useEffect(() => {
    if (total <= 1) return;
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % total;
        scrollToIndex(next);
        return next;
      });
    }, 4500);
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, [total]);

  // Progress bar animation
  useEffect(() => {
    progressAnim.setValue(0);
    if (total <= 1) return;
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, total]);

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      {/* Scrollable banner row */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING - BANNER_GAP, // last card flush
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const idx = Math.round(x / ITEM_WIDTH);
          if (idx >= 0 && idx < total && idx !== currentIndex) {
            setCurrentIndex(idx);
          }
        }}
      >
        {activeBanners.map((item, index) => {
          const title = lang === 'hi' ? item.titleHi : item.titleEn;
          const subtitle = lang === 'hi' ? item.subtitleHi : item.subtitleEn;
          const badge = lang === 'hi' ? item.badgeHi : item.badgeEn;
          const buttonText = lang === 'hi' ? item.buttonTextHi : item.buttonTextEn;

          return (
            <Pressable
              key={item.id}
              style={[styles.card, { marginRight: BANNER_GAP }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              {/* Background */}
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.bg} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={item.bgGradient || [colors.primary, '#4A0E0E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bg}
                />
              )}

              {/* Bottom gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.60)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Om watermark for panchang type */}
              {item.type === 'panchang' && (
                <Text style={styles.omWatermark}>ॐ</Text>
              )}

              {/* Content */}
              <View style={styles.content}>
                {/* Top row: badge + counter */}
                <View style={styles.topRow}>
                  <View style={[
                    styles.badge,
                    {
                      backgroundColor: item.type === 'panchang'
                        ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.15)',
                      borderColor: item.type === 'panchang'
                        ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.3)',
                    },
                  ]}>
                    <Feather
                      name={item.type === 'panchang' ? 'sun' : 'tag'}
                      size={10}
                      color={item.type === 'panchang' ? '#FFD700' : '#FFFFFF'}
                    />
                    <Text style={[styles.badgeText, {
                      color: item.type === 'panchang' ? '#FFD700' : '#FFFFFF',
                      fontFamily: f('bold'),
                    }]}>
                      {badge}
                    </Text>
                  </View>

                  {total > 1 && (
                    <View style={styles.counter}>
                      <Text style={[styles.counterText, { fontFamily: f('bold') }]}>
                        {index + 1}/{total}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom: title + subtitle + CTA */}
                <View style={styles.bottomContent}>
                  <Text style={[styles.title, { fontFamily: f('bold') }]} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={[styles.subtitle, { fontFamily: f('regular') }]} numberOfLines={1}>
                    {subtitle}
                  </Text>

                  <Pressable
                    style={[styles.cta, {
                      backgroundColor: item.type === 'panchang' ? '#FF6D00' : colors.orange,
                    }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(item.route as any);
                    }}
                  >
                    <Text style={[styles.ctaText, { fontFamily: f('bold') }]}>{buttonText}</Text>
                    <Feather name="arrow-right" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pagination dots */}
      {total > 1 && (
        <View style={styles.pagination}>
          {activeBanners.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCurrentIndex(i);
                  scrollToIndex(i);
                }}
                hitSlop={8}
              >
                {isActive ? (
                  <View style={[styles.dotActive, { backgroundColor: colors.border }]}>
                    <Animated.View
                      style={[
                        styles.dotProgress,
                        {
                          backgroundColor: colors.primary,
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 28],
                          }),
                        },
                      ]}
                    />
                  </View>
                ) : (
                  <View style={[
                    styles.dot,
                    { backgroundColor: i < currentIndex ? colors.primary + '60' : colors.border },
                  ]} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  omWatermark: {
    position: 'absolute',
    right: -8,
    top: -8,
    fontSize: 100,
    color: 'rgba(255,255,255,0.07)',
    fontWeight: 'bold',
    lineHeight: 110,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  counterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
  },
  bottomContent: {
    gap: 4,
  },
  title: {
    fontSize: 21,
    color: '#FFFFFF',
    lineHeight: 27,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dotProgress: {
    height: 6,
    borderRadius: 3,
  },
});
