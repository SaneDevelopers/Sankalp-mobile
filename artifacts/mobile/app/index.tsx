import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topDecor} />
      <View style={styles.bottomDecor} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Sankalp</Text>
        <Text style={styles.subtitle}>संकल्प</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>CONNECTING DEVOTEES{'\n'}WITH TRUSTED PANDITS</Text>
      </View>
      <View style={styles.divaContainer}>
        <View style={styles.diyaFlame} />
        <View style={styles.diyaBase} />
        <View style={styles.diyaWick} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDecor: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0E6D3',
    opacity: 0.6,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F0E6D3',
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B1F1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 28,
  },
  icon: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#7B1F1F',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#C89A3C',
    letterSpacing: 2,
    marginBottom: 24,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#C89A3C',
    marginBottom: 16,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#8B7355',
    letterSpacing: 2.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  divaContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 80 : 60,
    alignItems: 'center',
  },
  diyaFlame: {
    width: 10,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#D4722A',
    marginBottom: -4,
    shadowColor: '#D4722A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  diyaWick: {
    width: 2,
    height: 8,
    backgroundColor: '#5C3317',
    marginBottom: -4,
  },
  diyaBase: {
    width: 32,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C89A3C',
    shadowColor: '#C89A3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
});
