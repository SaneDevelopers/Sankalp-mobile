import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CartProvider } from "@/lib/context/CartContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import Constants from "expo-constants";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Suppress retry loops for guest auth checks or unauthenticated requests
        if (error && (error.status === 401 || error.status === 403)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:5001';
    }
    return '';
  }

  // Auto-detect host IP from Expo debugger
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : null;
  if (ip) {
    console.log('[API Auto-Detection] Resolved host IP address:', ip);
    return `http://${ip}:5001`;
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
};

setBaseUrl(getBaseUrl());
setAuthTokenGetter(async () => {
  const token = await AsyncStorage.getItem('auth_token');
  console.log('[AuthTokenGetter] token from storage:', token ? token.substring(0, 15) + '…' : 'NULL');
  return token;
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="poojas" />
      <Stack.Screen name="pandits-by-pooja" />
      <Stack.Screen name="pooja/[id]" />
      <Stack.Screen name="pandit/[id]" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="booking-detail/[id]" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="review/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="confirmed" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="help" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="order-history" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <CartProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </CartProvider>
            </NotificationProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
