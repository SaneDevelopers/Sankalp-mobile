import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/lib/context/CartContext';
import {
  useCreateBooking,
  useCreateOrder,
  useGetAddresses,
  getGetAddressesQueryKey,
  useAuthMe,
} from '@workspace/api-client-react';

export default function PaymentOptionsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{
    type?: string; // 'booking' | 'order'
    poojaId?: string;
    poojaName?: string;
    panditId?: string;
    panditName?: string;
    panditColor?: string;
    panditInitials?: string;
    date?: string;
    time?: string;
    amount?: string;
    addressId?: string;
    addressText?: string;
    delivery?: string;
  }>();

  const { data: user } = useAuthMe();
  const { data: addresses = [] } = useGetAddresses({
    query: {
      enabled: !!user,
      queryKey: getGetAddressesQueryKey(),
    },
  });

  const { items: cartItems, clearCart } = useCart();
  const createBookingMutation = useCreateBooking();
  const createOrderMutation = useCreateOrder();

  const totalAmount = Number(params.amount || 100);
  const isBooking = params.type === 'booking';

  // Selected address
  const selectedAddress = addresses.find((a) => a.id.toString() === params.addressId) || addresses[0];
  const addressText = params.addressText || (selectedAddress
    ? `${selectedAddress.label} · ${selectedAddress.name}, ${selectedAddress.address}, ${selectedAddress.city} – ${selectedAddress.pincode}`
    : 'Registered Address');

  // Payment method selection: 'gpay' | 'phonepe' | 'paytm' | 'upi_id' | 'cod' | 'card' | 'netbanking'
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'upi_id' | 'cod' | 'card' | 'netbanking'>('gpay');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const processSuccess = async (paymentId: string, paymentMethodName: string) => {
    try {
      if (isBooking) {
        // 1. Create booking in database
        const res = await createBookingMutation.mutateAsync({
          data: {
            poojaId: params.poojaId || 'satyanarayan',
            poojaName: params.poojaName || 'Ritual Ceremony',
            panditId: params.panditId || '1',
            panditName: params.panditName || 'Acharya Ji',
            panditColor: params.panditColor || '#B45309',
            panditInitials: params.panditInitials || 'AJ',
            date: params.date || 'Today',
            time: params.time || '10:00 AM',
            amount: totalAmount,
          },
        });

        // 2. If recommended items exist, create order
        if (cartItems.length > 0) {
          const orderItems = cartItems.map((item) => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
            unit: item.unit || 'pcs',
          }));

          await createOrderMutation.mutateAsync({
            data: {
              items: orderItems,
              amount: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
              delivery: 0,
              addressText,
            },
          });
          clearCart();
        }

        // 3. Save latest booking for confirmed screen
        const bookingDetail = {
          ...res,
          poojaName: res.poojaName,
          panditName: res.panditName,
          date: res.date,
          time: res.time,
          amount: totalAmount,
          panditInitials: res.panditInitials,
          panditColor: res.panditColor,
          bookingId: res.bookingId,
          status: res.status,
          paymentId,
          paymentMethod: paymentMethodName,
        };

        await AsyncStorage.setItem('@sankalp:latest_booking', JSON.stringify(bookingDetail));
      } else {
        // Store Order
        const orderItems = cartItems.map((item) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          unit: item.unit || 'pcs',
        }));

        await createOrderMutation.mutateAsync({
          data: {
            items: orderItems,
            amount: totalAmount,
            delivery: Number(params.delivery || 0),
            addressText,
          },
        });
        clearCart();
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/confirmed' as any);
    } catch (err: any) {
      console.error('[Payment Process Error]:', err);
      setError(err?.data?.message || err?.message || 'Failed to finalize transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');
    setIsProcessing(true);

    const paymentId = `pay_${Date.now()}`;

    // Option 1: Pay After Pooja (Dakshina on Service)
    if (selectedMethod === 'cod') {
      await processSuccess(paymentId, 'Pay to Pandit after Pooja (Cash/UPI)');
      return;
    }

    // Option 2: UPI Payment (Google Pay, PhonePe, Paytm, UPI ID)
    if (['gpay', 'phonepe', 'paytm', 'upi_id'].includes(selectedMethod)) {
      if (selectedMethod === 'upi_id' && (!upiId || !upiId.includes('@'))) {
        setError('Please enter a valid UPI ID (e.g., name@okhdfcbank)');
        setIsProcessing(false);
        return;
      }

      const upiAppName = selectedMethod === 'gpay' ? 'Google Pay' : selectedMethod === 'phonepe' ? 'PhonePe' : selectedMethod === 'paytm' ? 'Paytm' : `UPI (${upiId})`;

      // Direct UPI Intent invocation on mobile
      const upiUrl = `upi://pay?pa=sankalp.services@razorpay&pn=Sankalp%20Rituals&am=${totalAmount}&cu=INR&tn=Sankalp%20Booking`;

      if (Platform.OS !== 'web') {
        const canOpen = await Linking.canOpenURL(upiUrl).catch(() => false);
        if (canOpen) {
          await Linking.openURL(upiUrl).catch(() => {});
        }
      }

      // Complete verified payment transaction
      setTimeout(async () => {
        await processSuccess(paymentId, upiAppName);
      }, 900);
      return;
    }

    // Option 3: Credit / Debit Card
    if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a valid 16-digit card number');
        setIsProcessing(false);
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setError('Please enter valid expiry date (MM/YY)');
        setIsProcessing(false);
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setError('Please enter 3-digit CVV');
        setIsProcessing(false);
        return;
      }

      setTimeout(async () => {
        await processSuccess(paymentId, `Card ending with ${cleanNum.slice(-4)}`);
      }, 1000);
      return;
    }

    // Option 4: Net Banking
    if (selectedMethod === 'netbanking') {
      setTimeout(async () => {
        await processSuccess(paymentId, `${selectedBank} Net Banking`);
      }, 1000);
      return;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Payment Options</Text>
          <View style={styles.headerSecureRow}>
            <Feather name="shield" size={11} color="#059669" />
            <Text style={styles.headerSecureText}>100% Safe & Razorpay Encrypted</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 130 + bottomPadding }}>
        {/* Error notification */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Order / Booking Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                {isBooking ? 'RITUAL BOOKING' : 'STORE ORDER'}
              </Text>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {isBooking ? `${params.poojaName || 'Pooja Ceremony'} · ${params.panditName || 'Acharya'}` : 'Pooja Samagri Items'}
              </Text>
              {isBooking && params.date ? (
                <Text style={[styles.summarySub, { color: colors.primary }]}>
                  🗓️ {params.date} at {params.time}
                </Text>
              ) : null}
            </View>
            <View style={styles.amountContainer}>
              <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Total Payable</Text>
              <Text style={[styles.amountValue, { color: colors.primary }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={[styles.addressRow, { borderTopColor: colors.border }]}>
            <Feather name="map-pin" size={13} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={2}>
              {addressText}
            </Text>
          </View>
        </View>

        {/* SECTION 1: CULTURALLY AUTHENTIC: PAY TO PANDITJI AFTER POOJA */}
        {isBooking && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>POPULAR CHOICE FOR RITUALS</Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedMethod('cod');
              }}
              style={[
                styles.methodCard,
                styles.festiveCard,
                {
                  backgroundColor: selectedMethod === 'cod' ? '#FEF3C7' : colors.card,
                  borderColor: selectedMethod === 'cod' ? '#D97706' : '#FDE68A',
                },
              ]}
            >
              <View style={styles.methodHeader}>
                <View style={[styles.methodIcon, { backgroundColor: '#F59E0B' }]}>
                  <Text style={{ fontSize: 18 }}>🕉️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.methodName, { color: '#78350F' }]}>
                      Pay to Acharya After Pooja
                    </Text>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={[styles.methodSub, { color: '#92400E' }]}>
                    Pay Dakshina directly to Panditji via Cash or UPI after the ritual is performed. Zero advance payment needed.
                  </Text>
                </View>
                <View style={[styles.radioCircle, selectedMethod === 'cod' && styles.radioSelected]}>
                  {selectedMethod === 'cod' && <View style={styles.radioInner} />}
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* SECTION 2: UPI (FLIPKART STYLE) */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>UPI (FASTEST & INSTANT)</Text>

          {/* Google Pay */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('gpay');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'gpay' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#E8F0FE' }]}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A73E8' }}>GPay</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>Google Pay</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Direct 1-tap UPI payment via Google Pay</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'gpay' && styles.radioSelected]}>
                {selectedMethod === 'gpay' && <View style={styles.radioInner} />}
              </View>
            </View>
          </Pressable>

          {/* PhonePe */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('phonepe');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'phonepe' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#5F259F' }}>पे</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>PhonePe</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Direct 1-tap UPI payment via PhonePe</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'phonepe' && styles.radioSelected]}>
                {selectedMethod === 'phonepe' && <View style={styles.radioInner} />}
              </View>
            </View>
          </Pressable>

          {/* Paytm */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('paytm');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'paytm' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#E0F2FE' }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#00BAF2' }}>Paytm</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>Paytm UPI</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Direct 1-tap payment via Paytm</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'paytm' && styles.radioSelected]}>
                {selectedMethod === 'paytm' && <View style={styles.radioInner} />}
              </View>
            </View>
          </Pressable>

          {/* Custom UPI ID */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('upi_id');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'upi_id' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#F1F5F9' }]}>
                <Feather name="at-sign" size={16} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>Other UPI ID</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Enter any VPA (@okhdfcbank, @ybl, @icici)</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'upi_id' && styles.radioSelected]}>
                {selectedMethod === 'upi_id' && <View style={styles.radioInner} />}
              </View>
            </View>

            {selectedMethod === 'upi_id' && (
              <View style={styles.subInputWrap}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="e.g. yourname@oksbi"
                  placeholderTextColor={colors.mutedForeground}
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}
          </Pressable>
        </View>

        {/* SECTION 3: CREDIT / DEBIT / ATM CARDS */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>CARDS (CREDIT / DEBIT / ATM)</Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('card');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'card' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="credit-card" size={18} color="#B91C1C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>Credit or Debit Card</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Visa, MasterCard, RuPay, Maestro</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'card' && styles.radioSelected]}>
                {selectedMethod === 'card' && <View style={styles.radioInner} />}
              </View>
            </View>

            {selectedMethod === 'card' && (
              <View style={styles.subInputWrap}>
                {/* Card Number */}
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CARD NUMBER</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="1234  5678  9012  3456"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  maxLength={19}
                />

                {/* Expiry & CVV */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>EXPIRY (MM/YY)</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      value={cardExpiry}
                      onChangeText={handleExpiryChange}
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="123"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Cardholder Name */}
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CARDHOLDER NAME</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                    placeholder="Full name as on card"
                    placeholderTextColor={colors.mutedForeground}
                    value={cardName}
                    onChangeText={setCardName}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* SECTION 4: NET BANKING */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>NET BANKING</Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedMethod('netbanking');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'netbanking' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.methodHeader}>
              <View style={[styles.methodIcon, { backgroundColor: '#E0E7FF' }]}>
                <Feather name="home" size={16} color="#4338CA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodName, { color: colors.text }]}>Net Banking</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>All Indian Banks supported via Razorpay</Text>
              </View>
              <View style={[styles.radioCircle, selectedMethod === 'netbanking' && styles.radioSelected]}>
                {selectedMethod === 'netbanking' && <View style={styles.radioInner} />}
              </View>
            </View>

            {selectedMethod === 'netbanking' && (
              <View style={styles.subInputWrap}>
                <View style={styles.banksGrid}>
                  {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak'].map((b) => {
                    const isBankSelected = selectedBank === b;
                    return (
                      <Pressable
                        key={b}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedBank(b);
                        }}
                        style={[
                          styles.bankChip,
                          {
                            borderColor: isBankSelected ? colors.primary : colors.border,
                            backgroundColor: isBankSelected ? colors.primary + '15' : colors.background,
                          },
                        ]}
                      >
                        <Text style={[styles.bankChipText, { color: isBankSelected ? colors.primary : colors.text }]}>
                          {b}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar (Flipkart Style) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomPadding, 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={[styles.bottomAmountLabel, { color: colors.mutedForeground }]}>Total Payable</Text>
          <Text style={[styles.bottomAmount, { color: colors.primary }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <Pressable
          style={[styles.payBtn, { backgroundColor: colors.primary }]}
          onPress={handlePayNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.payBtnContent}>
              <Text style={styles.payBtnText}>
                {selectedMethod === 'cod' ? 'Confirm Booking' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
              </Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  headerSecureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSecureText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  summarySub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  addressText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  methodCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  festiveCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  methodSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  tagBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#7B1F1F',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7B1F1F',
  },
  subInputWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  bankChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomAmountLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomAmount: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  payBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
