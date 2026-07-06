import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';
import { STORE_IMAGES } from '@/constants/images';
import {
  useGetAddresses,
  getGetAddressesQueryKey,
  useCreateOrder,
  useAuthMe,
} from '@workspace/api-client-react';


const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:5001';
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : null;
  return ip ? `http://${ip}:5001` : 'http://localhost:5001';
};

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: user } = useAuthMe();
  const { data: addresses = [], isLoading: loadingAddresses } = useGetAddresses({
    query: {
      enabled: !!user,
      queryKey: getGetAddressesQueryKey(),
    },
  });

  const createOrderMutation = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');

  // Auto-select default or first address
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find(a => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const delivery = total > 999 ? 0 : 99;
  const grandTotal = total + delivery;

  const handleCheckout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (addresses.length === 0) {
      setError('Please add a delivery address first');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    setIsCheckingOut(true);

    const processBackendOrder = async (paymentId?: string) => {
      const addressText = `${selectedAddress.label} · ${selectedAddress.name}, ${selectedAddress.address}, ${selectedAddress.city} – ${selectedAddress.pincode}, Phone: ${selectedAddress.phone}`;

      // Map cart items to OrderItem spec type
      const orderItems = items.map(i => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        unit: i.unit,
      }));

      try {
        await createOrderMutation.mutateAsync({
          data: {
            items: orderItems,
            amount: grandTotal,
            delivery,
            addressText,
          },
        });

        clearCart();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/confirmed' as any);
      } catch (err: any) {
        setError(err?.data?.message || err?.message || 'Failed to place order');
      } finally {
        setIsCheckingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Please check your internet connection.');
        setIsCheckingOut(false);
        return;
      }

      const options = {
        key: 'rzp_test_RrQEP8mxFd8g3W',
        amount: grandTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'Sankalp Checkout',
        description: `Order of Pooja Samagri Items`,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png',
        handler: function (response: any) {
          console.log('[Razorpay] Payment Success:', response);
          processBackendOrder(response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function () {
            setIsCheckingOut(false);
            if (typeof window !== 'undefined') {
              const simulate = window.confirm('Razorpay checkout closed. Would you like to simulate a successful payment to test the order flow?');
              if (simulate) {
                setIsCheckingOut(true);
                processBackendOrder('mock_web_payment_' + Date.now());
              }
            }
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: colors.primary,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Native WebView-based Razorpay checkout
      try {
        const backendUrl = getBackendUrl();
        const description = encodeURIComponent('Order of Pooja Samagri Items');
        const name = encodeURIComponent(user.name || '');
        const email = encodeURIComponent(user.email || '');
        const contact = encodeURIComponent(user.phone || '');
        const amount = grandTotal;

        const redirectUrl = Linking.createURL('payment-success');
        const checkoutUrl = `${backendUrl}/api/payment/checkout?amount=${amount}&description=${description}&name=${name}&email=${email}&contact=${contact}&redirect_url=${encodeURIComponent(redirectUrl)}`;
        console.log('[Razorpay Native] Opening checkout URL:', checkoutUrl);

        const browserResult = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);

        if (browserResult.type === 'success' && browserResult.url) {
          console.log('[Razorpay Native] Payment success callback URL:', browserResult.url);
          const parsedUrl = Linking.parse(browserResult.url);
          const paymentId = parsedUrl.queryParams?.payment_id;

          if (paymentId) {
            console.log('[Razorpay Native] Payment ID found:', paymentId);
            processBackendOrder(paymentId as string);
          } else {
            throw new Error('Payment verification ID not found.');
          }
        } else {
          console.log('[Razorpay Native] Payment closed or cancelled.');
          setIsCheckingOut(false);
        }
      } catch (err: any) {
        console.log('[Razorpay Native] Error during mobile checkout:', err);
        setError('Payment flow failed: ' + err.message);
        setIsCheckingOut(false);
      }
    }
  };

  const renderAddressSection = () => {
    if (!user) {
      return (
        <Pressable
          style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/login')}
        >
          <View style={[styles.addressIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="lock" size={14} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressTitle, { color: colors.text }]}>Sign in to Select Address</Text>
            <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
              Keep your order history tracked in your profile
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      );
    }

    if (loadingAddresses) {
      return (
        <View style={styles.addressLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (addresses.length === 0) {
      return (
        <Pressable
          style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.primary, borderStyle: 'dashed' }]}
          onPress={() => router.push('/addresses')}
        >
          <View style={[styles.addressIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="plus" size={14} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressTitle, { color: colors.primary }]}>Add Delivery Address</Text>
            <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
              You have no saved addresses. Tap to add one now.
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      );
    }

    const addr = selectedAddress || addresses[0];
    const iconName = addr.label.toLowerCase() === 'home' ? 'home' : addr.label.toLowerCase() === 'office' ? 'briefcase' : 'map-pin';

    return (
      <Pressable
        style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setAddressModalVisible(true)}
      >
        <View style={[styles.addressIconWrap, { backgroundColor: colors.primary + '15' }]}>
          <Feather name={iconName as any} size={14} color={colors.primary} />
        </View>
        <View style={styles.addressInfo}>
          <Text style={[styles.addressTitle, { color: colors.text }]}>
            {addr.label} · {addr.name}
          </Text>
          <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {addr.address}, {addr.city} – {addr.pincode}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cart & Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
          <Feather name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={() => (
          <View style={{ marginTop: 20 }}>
            {/* Delivery Address */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DELIVERY ADDRESS</Text>
            {renderAddressSection()}

            {/* Price Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₹{total.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Delivery</Text>
                <Text style={[styles.summaryValue, { color: delivery === 0 ? colors.success : colors.text }]}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={STORE_IMAGES[item.id] || STORE_IMAGES['si1']}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>{item.unit}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  if (item.quantity === 1) removeItem(item.id);
                  else updateQuantity(item.id, -1);
                }}
              >
                <Feather name={item.quantity === 1 ? 'trash-2' : 'minus'} size={14} color={colors.primary} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
              <Pressable
                style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateQuantity(item.id, 1);
                }}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="shopping-cart" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your cart is empty</Text>
            <Pressable onPress={() => router.push('/(tabs)/store' as any)}>
              <Text style={[styles.shopLink, { color: colors.accent }]}>Browse Samagri Store</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Pay Button */}
      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
            onPress={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="lock" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.payBtnText}>
                  {!user ? 'Sign In to Pay' : `Pay Securely · ₹${grandTotal.toLocaleString('en-IN')}`}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Address Picker Modal */}
      <Modal visible={addressModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>Select Delivery Address</Text>
              <Pressable onPress={() => setAddressModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.addressListScroll}>
              {addresses.map(addr => {
                const isSelected = addr.id === selectedAddressId;
                const iconName = addr.label.toLowerCase() === 'home' ? 'home' : addr.label.toLowerCase() === 'office' ? 'briefcase' : 'map-pin';
                return (
                  <Pressable
                    key={addr.id}
                    style={[
                      styles.addressSelectItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedAddressId(addr.id);
                      setAddressModalVisible(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <View style={[styles.addressIconWrap, { backgroundColor: colors.primary + '15' }]}>
                      <Feather name={iconName as any} size={15} color={colors.primary} />
                    </View>
                    <View style={styles.addressSelectInfo}>
                      <Text style={[styles.addressTitle, { color: colors.text }]}>
                        {addr.label} · {addr.name}
                      </Text>
                      <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
                        {addr.address}, {addr.city} – {addr.pincode}
                      </Text>
                      <Text style={[styles.addressText, { color: colors.mutedForeground, marginTop: 4 }]}>
                        Phone: {addr.phone}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color={colors.primary} style={styles.checkIcon} />
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                style={[styles.manageAddressBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '08' }]}
                onPress={() => {
                  setAddressModalVisible(false);
                  router.push('/addresses');
                }}
              >
                <Feather name="settings" size={16} color={colors.primary} />
                <Text style={[styles.manageAddressText, { color: colors.primary }]}>Manage Saved Addresses</Text>
              </Pressable>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  itemUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qtyText: { fontSize: 15, fontFamily: 'Inter_700Bold', minWidth: 20, textAlign: 'center' },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  addressText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  addressLoading: { paddingVertical: 20, alignItems: 'center' },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  summaryDivider: { height: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  shopLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 10,
  },
  errorText: { fontSize: 13, color: '#DC2626', fontFamily: 'Inter_500Medium', flex: 1 },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  addressListScroll: { padding: 20, gap: 12, paddingBottom: 40 },
  addressSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  addressSelectInfo: { flex: 1 },
  checkIcon: { marginLeft: 8 },
  manageAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  manageAddressText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
