import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DATES, PANDITS, STORE_ITEMS, UTENSILS } from '@/constants/data';
import { PANDIT_IMAGES, STORE_IMAGES } from '@/constants/images';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  useGetAddresses,
  getGetAddressesQueryKey,
  useGetPandits,
  useCreateBooking,
  useAuthMe,
} from '@workspace/api-client-react';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: user } = useAuthMe();
  const { data: pandits = [] } = useGetPandits();
  const { data: addresses = [], isLoading: loadingAddresses } = useGetAddresses({
    query: {
      enabled: !!user,
      queryKey: getGetAddressesQueryKey(),
    },
  });

  const createBookingMutation = useCreateBooking();

  // Retrieve pandit details from DB list or fallback to static list
  const pandit = pandits.find(p => p.id.toString() === id) ?? PANDITS.find(p => p.id === id) ?? PANDITS[0];

  const [selectedPooja, setSelectedPooja] = useState(pandit.poojas[0]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState(0);
  const [showPoojaSelect, setShowPoojaSelect] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  // Update selected pooja when pandit loads
  React.useEffect(() => {
    if (pandit && pandit.poojas && pandit.poojas.length > 0) {
      setSelectedPooja(pandit.poojas[0]);
    }
  }, [pandit]);

  // Auto-select default address
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find(a => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const { addItem, items: cartItems } = useCart();

  const getRecommendedSamagri = () => {
    const poojaNameLower = (selectedPooja?.name || '').toLowerCase();
    const allStore = [...STORE_ITEMS, ...UTENSILS];

    if (poojaNameLower.includes('havan') || poojaNameLower.includes('yagna')) {
      return allStore.filter(i => ['si1', 'si6', 'ut2', 'ut5'].includes(i.id));
    }
    if (poojaNameLower.includes('pravesh') || poojaNameLower.includes('vastu') || poojaNameLower.includes('bhoomi')) {
      return allStore.filter(i => ['si2', 'ut2', 'ut3', 'ut1'].includes(i.id));
    }
    if (poojaNameLower.includes('satyanarayan')) {
      return allStore.filter(i => ['si2', 'si6', 'si5', 'si3'].includes(i.id));
    }
    if (poojaNameLower.includes('rudra') || poojaNameLower.includes('abhishek')) {
      return allStore.filter(i => ['ut2', 'si5', 'si6', 'ut1'].includes(i.id));
    }
    return allStore.filter(i => ['si2', 'si3', 'ut1'].includes(i.id));
  };

  const renderRecommendedSamagri = () => {
    const recommended = getRecommendedSamagri();
    if (recommended.length === 0) return null;

    return (
      <View style={styles.recommendSection}>
        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>RECOMMENDED RITUAL SAMAGRI</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendScroll}
        >
          {recommended.map(item => {
            const inCartItem = cartItems.find(c => c.id === item.id);
            const imageSource = STORE_IMAGES[item.id] || STORE_IMAGES['si1'];

            return (
              <View key={item.id} style={[styles.recommendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={imageSource} style={styles.recommendImg} resizeMode="cover" />
                <View style={styles.recommendInfo}>
                  <Text style={[styles.recommendName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.recommendUnit, { color: colors.mutedForeground }]}>
                    {item.unit}
                  </Text>
                  <View style={styles.recommendRow}>
                    <Text style={[styles.recommendPrice, { color: colors.primary }]}>
                      ₹{item.price}
                    </Text>
                    <Pressable
                      style={[
                        styles.addBtnSmall,
                        { backgroundColor: inCartItem ? colors.success + '20' : colors.primary }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        addItem({ id: item.id, name: item.name, price: item.price, unit: item.unit });
                      }}
                    >
                      {inCartItem ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="check" size={10} color={colors.success} />
                          <Text style={[styles.addBtnTextSmall, { color: colors.success }]}>
                            {inCartItem.quantity}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.addBtnTextSmall}>ADD</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const handleBooking = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (addresses.length === 0) {
      setError('Please add a saved address for the pandit to visit');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a visiting address');
      return;
    }

    setIsBooking(true);

    try {
      const dateText = `${DATES[selectedDate].date} ${DATES[selectedDate].month}`;
      const timeText = pandit.muhurats[selectedTime];

      const res = await createBookingMutation.mutateAsync({
        data: {
          poojaId: selectedPooja.id,
          poojaName: selectedPooja.name,
          panditId: pandit.id.toString(),
          panditName: pandit.name,
          panditColor: pandit.avatarColor,
          panditInitials: pandit.initials,
          date: dateText,
          time: timeText,
          amount: selectedPooja.price,
        },
      });

      // Save to latest_booking so confirmed.tsx can read it
      const bookingDetail = {
        ...res,
        poojaName: res.poojaName,
        panditName: res.panditName,
        date: res.date,
        time: res.time,
        amount: res.amount,
        panditInitials: res.panditInitials,
        panditColor: res.panditColor,
        bookingId: res.bookingId,
        status: res.status,
      };

      await AsyncStorage.setItem('@sankalp:latest_booking', JSON.stringify(bookingDetail));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/confirmed' as any);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to place booking');
    } finally {
      setIsBooking(false);
    }
  };

  const renderAddressSection = () => {
    if (!user) {
      return (
        <Pressable
          style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/login')}
        >
          <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="lock" size={14} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressTitle, { color: colors.text }]}>Sign in to Select Address</Text>
            <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
              A visiting address is required to book a pandit
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
          <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="plus" size={14} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressTitle, { color: colors.primary }]}>Add Visiting Address</Text>
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
        <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
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

  const imageSource = PANDIT_IMAGES[pandit.id] || PANDIT_IMAGES['1'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: '#FEE2E2', borderColor: '#FECACA', marginTop: topPadding + 10 }]}>
          <Feather name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPadding }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: error ? 10 : topPadding + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Book Ritual</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
          {/* Pandit Mini Card */}
          <View style={[styles.panditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={imageSource}
              style={styles.panditAvatar}
              resizeMode="cover"
            />
            <View style={styles.panditInfo}>
              <Text style={[styles.panditName, { color: colors.text }]}>{pandit.name}</Text>
              <Text style={[styles.panditSpec, { color: colors.mutedForeground }]}>{pandit.specialty} · {pandit.experience}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.text }]}>{pandit.rating}</Text>
            </View>
          </View>

          {/* Select Pooja */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT POOJA</Text>
          {selectedPooja && (
            <Pressable
              style={[styles.poojaSelector, { backgroundColor: colors.card, borderColor: showPoojaSelect ? colors.primary : colors.border }]}
              onPress={() => {
                Haptics.selectionAsync();
                setShowPoojaSelect(!showPoojaSelect);
              }}
            >
              <View style={styles.poojaSelectorContent}>
                <Text style={[styles.poojaSelectorName, { color: colors.text }]}>{selectedPooja.name}</Text>
                <Text style={[styles.poojaSelectorMeta, { color: colors.mutedForeground }]}>
                  {selectedPooja.duration} · Includes Prasad
                </Text>
              </View>
              <View style={styles.poojaPriceCol}>
                <Text style={[styles.poojaPrice, { color: colors.primary }]}>₹{selectedPooja.price.toLocaleString('en-IN')}</Text>
                <Feather name={showPoojaSelect ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
          )}

          {showPoojaSelect && (
            <View style={[styles.poojaDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {pandit.poojas.map(p => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.poojaOption,
                    { borderBottomColor: colors.border },
                    selectedPooja && p.id === selectedPooja.id && { backgroundColor: colors.primary + '10' },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPooja(p);
                    setShowPoojaSelect(false);
                  }}
                >
                  <Text style={[styles.poojaOptionName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.poojaOptionPrice, { color: colors.primary }]}>₹{p.price.toLocaleString('en-IN')}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Select Date */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT DATE</Text>
          <View style={styles.datesRow}>
            {DATES.map((d, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.dateChip,
                  {
                    borderColor: selectedDate === idx ? colors.primary : colors.border,
                    backgroundColor: selectedDate === idx ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedDate(idx);
                }}
              >
                <Text style={[styles.dateDay, { color: selectedDate === idx ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }]}>
                  {d.day}
                </Text>
                <Text style={[styles.dateNum, { color: selectedDate === idx ? '#FFFFFF' : colors.text }]}>
                  {d.date}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Muhurat */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>MUHURAT (TIME)</Text>
          <View style={styles.timesGrid}>
            {pandit.muhurats.map((t, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.timeChip,
                  {
                    borderColor: selectedTime === idx ? colors.primary : colors.border,
                    backgroundColor: selectedTime === idx ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTime(idx);
                }}
              >
                <Text style={[styles.timeText, { color: selectedTime === idx ? '#FFFFFF' : colors.text }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Address */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>ADDRESS</Text>
          {renderAddressSection()}
          {renderRecommendedSamagri()}
        </View>
      </ScrollView>

      {/* Footer */}
      {selectedPooja && (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.continueBtn, { backgroundColor: colors.primary }]}
            onPress={handleBooking}
            disabled={isBooking}
          >
            {isBooking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueBtnText}>
                {!user ? 'Sign In to Book' : `Continue · ₹${selectedPooja.price.toLocaleString('en-IN')}`}
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Address Picker Modal */}
      <Modal visible={addressModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>Select Visiting Address</Text>
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
  body: { padding: 20 },
  panditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  panditAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  panditInfo: { flex: 1 },
  panditName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  panditSpec: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  poojaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 4,
  },
  poojaSelectorContent: { flex: 1 },
  poojaSelectorName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  poojaSelectorMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  poojaPriceCol: { alignItems: 'flex-end', gap: 4 },
  poojaPrice: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  poojaDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  poojaOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  poojaOptionName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  poojaOptionPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dateDay: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  dateNum: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 2 },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  timeChip: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  timeText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  addressText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 17 },
  addressLoading: { paddingVertical: 20, alignItems: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
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
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  recommendSection: {
    marginTop: 10,
    marginBottom: 8,
  },
  recommendScroll: {
    paddingRight: 20,
    gap: 12,
    paddingVertical: 8,
  },
  recommendCard: {
    width: 155,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recommendImg: {
    width: '100%',
    height: 90,
  },
  recommendInfo: {
    padding: 10,
    gap: 4,
  },
  recommendName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  recommendUnit: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  recommendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  recommendPrice: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  addBtnSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTextSmall: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
});
