import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export interface RazorpayCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  checkoutUrl: string;
  amount: number;
  title?: string;
}

export function RazorpayCheckoutModal({
  visible,
  onClose,
  onSuccess,
  checkoutUrl,
  amount,
  title = 'Ritual Booking Checkout',
}: RazorpayCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [loading, setLoading] = useState(true);

  if (!visible || !checkoutUrl) return null;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[RazorpayModal] Bridge message:', data);

      if (data.type === 'PAYMENT_SUCCESS' && data.paymentId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(data.paymentId);
      } else if (data.type === 'PAYMENT_CANCELLED') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onClose();
      } else if (data.type === 'PAYMENT_FAILED') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onClose();
      }
    } catch (err) {
      console.log('[RazorpayModal] Message parse error:', err);
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    if (!url) return;

    console.log('[RazorpayModal] Navigation URL:', url);

    if (url.includes('payment_id=')) {
      const match = url.match(/[?&]payment_id=([^&#]*)/);
      if (match && match[1]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(match[1]);
      }
    } else if (url.includes('payment-cancelled')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Embedded WebView */}
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: checkoutUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#E25822" />
                <Text style={styles.loadingText}>Connecting to Razorpay Secure Gateway...</Text>
              </View>
            )}
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FAF3E8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  secureText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountBadge: {
    backgroundColor: '#7B1F1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FAF3E8',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#4A3E3D',
    fontWeight: '500',
  },
});
