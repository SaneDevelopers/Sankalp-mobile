import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexScreen() {
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!isMounted) return;

        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch {
        if (isMounted) {
          router.replace('/login');
        }
      }
    };

    checkAuthAndNavigate();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#7B1F1F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF3E8',
  },
});
