import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { useColors } from '@/hooks/useColors';
import {
  useGetAddresses,
  getGetAddressesQueryKey,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useAuthMe,
} from '@workspace/api-client-react';
import { validatePincodeOffline } from '@/constants/data';

interface AddressFormData {
  id?: number;
  label: string;
  name: string;
  address: string;
  phone: string;
  pincode: string;
  city: string;
  isDefault: boolean;
}

const ICON_COLORS: Record<string, string> = { home: '#7B1F1F', office: '#D4722A', other: '#C89A3C' };

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: user } = useAuthMe();
  const { data: addresses = [], isLoading, refetch } = useGetAddresses({
    query: {
      enabled: !!user,
      queryKey: getGetAddressesQueryKey(),
    },
  });

  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    label: 'Home',
    name: '',
    address: '',
    phone: '',
    pincode: '',
    city: '',
    isDefault: false,
  });

  const [resolvingPin, setResolvingPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, pincode: cleanPin }));
    setError('');

    if (cleanPin.length < 6) {
      setFormData(prev => ({ ...prev, city: '' }));
      return;
    }

    setResolvingPin(true);

    const offlineCity = validatePincodeOffline(cleanPin);
    if (!offlineCity) {
      setError('Sankalp is not available here yet. Coming Soon!');
      setFormData(prev => ({ ...prev, city: '' }));
      setResolvingPin(false);
      return;
    }

    setFormData(prev => ({ ...prev, city: offlineCity }));

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          const state = postOffices[0].State;
          const district = postOffices[0].District;
          if (state === 'Uttar Pradesh') {
            setFormData(prev => ({ ...prev, city: district }));
            setError('');
          } else {
            setError('Sankalp is not available here yet. Coming Soon!');
            setFormData(prev => ({ ...prev, city: '' }));
          }
        }
      }
    } catch (err) {
      // Quietly fall back to offline resolution
    } finally {
      setResolvingPin(false);
    }
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData({
      label: 'Home',
      name: user?.name || '',
      address: '',
      phone: user?.phone || '',
      pincode: '',
      city: '',
      isDefault: addresses.length === 0, // make it default if it's the first address
    });
    setError('');
    setModalVisible(true);
  };

  const openEditModal = (addr: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData({
      id: addr.id,
      label: addr.label,
      name: addr.name,
      address: addr.address,
      phone: addr.phone,
      pincode: addr.pincode,
      city: addr.city,
      isDefault: addr.isDefault,
    });
    setError('');
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError('');

    if (!formData.name.trim()) {
      setError('Recipient name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Street address details are required');
      return;
    }
    if (!formData.city) {
      setError('Please provide a valid Uttar Pradesh pincode');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.id) {
        // Edit flow
        await updateAddressMutation.mutateAsync({
          id: formData.id,
          data: {
            label: formData.label,
            name: formData.name.trim(),
            address: formData.address.trim(),
            phone: formData.phone.trim(),
            pincode: formData.pincode,
            city: formData.city,
            isDefault: formData.isDefault,
          },
        });
      } else {
        // Add flow
        await createAddressMutation.mutateAsync({
          data: {
            label: formData.label,
            name: formData.name.trim(),
            address: formData.address.trim(),
            phone: formData.phone.trim(),
            pincode: formData.pincode,
            city: formData.city,
            isDefault: formData.isDefault,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDefault = async (id: number) => {
    Haptics.selectionAsync();
    try {
      const addr = addresses.find(a => a.id === id);
      if (!addr) return;
      await updateAddressMutation.mutateAsync({
        id,
        data: {
          label: addr.label,
          name: addr.name,
          address: addr.address,
          phone: addr.phone,
          pincode: addr.pincode,
          city: addr.city,
          isDefault: true,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
    }
  };

  const removeAddress = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await deleteAddressMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Saved Addresses</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.guestState}>
          <Feather name="map-pin" size={60} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>Sign in Required</Text>
          <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
            Please sign in to view and manage your shipping addresses.
          </Text>
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Saved Addresses</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {addresses.map(addr => {
            const iconColor = ICON_COLORS[addr.label.toLowerCase()] || ICON_COLORS['other'];
            const iconName = addr.label.toLowerCase() === 'home' ? 'home' : addr.label.toLowerCase() === 'office' ? 'briefcase' : 'map-pin';
            return (
              <View
                key={addr.id}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: addr.isDefault ? colors.primary : colors.border,
                  },
                ]}
              >
                {addr.isDefault && (
                  <View style={[styles.defaultTag, { backgroundColor: colors.primary }]}>
                    <Text style={styles.defaultTagText}>DEFAULT</Text>
                  </View>
                )}
                <View style={styles.addrRow}>
                  <View style={[styles.addrIcon, { backgroundColor: iconColor + '15' }]}>
                    <Feather name={iconName as any} size={20} color={iconColor} />
                  </View>
                  <View style={styles.addrInfo}>
                    <Text style={[styles.addrLabel, { color: colors.text }]}>{addr.label}</Text>
                    <Text style={[styles.addrName, { color: colors.mutedForeground }]}>{addr.name}</Text>
                    <Text style={[styles.addrText, { color: colors.text }]}>
                      {addr.address}, {addr.city} – {addr.pincode}
                    </Text>
                    <Text style={[styles.addrPhone, { color: colors.mutedForeground }]}>{addr.phone}</Text>
                  </View>
                </View>
                <View style={[styles.addrActions, { borderTopColor: colors.border }]}>
                  {!addr.isDefault && (
                    <Pressable onPress={() => setDefault(addr.id)} style={styles.addrAction}>
                      <Feather name="check-circle" size={14} color={colors.primary} />
                      <Text style={[styles.addrActionText, { color: colors.primary }]}>Set Default</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => openEditModal(addr)} style={styles.addrAction}>
                    <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.addrActionText, { color: colors.mutedForeground }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => removeAddress(addr.id)} style={styles.addrAction}>
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                    <Text style={[styles.addrActionText, { color: colors.destructive }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {addresses.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No saved addresses found</Text>
            </View>
          )}

          {/* Add New */}
          <Pressable
            style={[styles.addBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '08' }]}
            onPress={openAddModal}
          >
            <Feather name="plus" size={20} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add New Address</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {formData.id ? 'Edit Address' : 'Add New Address'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Label Selection */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>ADDRESS TYPE</Text>
              <View style={styles.typeSelectorRow}>
                {['Home', 'Office', 'Other'].map(type => {
                  const isSelected = formData.label === type;
                  const iconName = type === 'Home' ? 'home' : type === 'Office' ? 'briefcase' : 'map-pin';
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setFormData(prev => ({ ...prev, label: type }))}
                      style={[
                        styles.typeTab,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary + '12' : colors.card,
                        },
                      ]}
                    >
                      <Feather name={iconName as any} size={15} color={isSelected ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.typeTabText, { color: isSelected ? colors.primary : colors.text }]}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Recipient Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>RECIPIENT NAME</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="user" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter recipient full name"
                    placeholderTextColor={colors.mutedForeground}
                    value={formData.name}
                    onChangeText={val => setFormData(prev => ({ ...prev, name: val }))}
                  />
                </View>
              </View>

              {/* Recipient Phone */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PHONE NUMBER</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="phone" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={val => setFormData(prev => ({ ...prev, phone: val }))}
                  />
                </View>
              </View>

              {/* Pincode */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PINCODE (UTTAR PRADESH ONLY)</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="hash" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="6-digit PIN code"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.pincode}
                    onChangeText={handlePincodeChange}
                  />
                  {resolvingPin && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
              </View>

              {/* Resolved City */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>RESOLVED DISTRICT / CITY</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border, opacity: 0.8 }]}>
                  <Feather name="map" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={formData.city}
                    editable={false}
                    placeholder="Autodetected from Uttar Pradesh pincode"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              </View>

              {/* Address details */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>STREET ADDRESS / HOUSE NO.</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border, height: 70, alignItems: 'flex-start', paddingTop: 10 }]}>
                  <Feather name="map-pin" size={18} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                  <TextInput
                    style={[styles.input, { color: colors.text, height: '100%' }]}
                    placeholder="Flat/House No, Building, Area, Street name"
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={2}
                    value={formData.address}
                    onChangeText={val => setFormData(prev => ({ ...prev, address: val }))}
                  />
                </View>
              </View>

              {/* Default Address Toggle */}
              <View style={styles.defaultToggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Set as default address</Text>
                  <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                    Use this address as primary for checkouts
                  </Text>
                </View>
                <Switch
                  value={formData.isDefault}
                  onValueChange={val => setFormData(prev => ({ ...prev, isDefault: val }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveAddress}
                  disabled={isSubmitting || resolvingPin}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="save" size={16} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Save Address</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guestState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  guestTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  guestSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  loginBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  addressCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  defaultTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 1,
  },
  defaultTagText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  addrRow: { flexDirection: 'row', gap: 14, padding: 16 },
  addrIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  addrName: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  addrText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 3 },
  addrPhone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  addrActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addrAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  addrActionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_500Medium' },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
  formScroll: { padding: 20, paddingBottom: 60 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: '#DC2626', fontFamily: 'Inter_500Medium', flex: 1 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5, marginBottom: 8 },
  typeSelectorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  typeTabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  fieldGroup: { marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  defaultToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  toggleTextCol: { flex: 1, paddingRight: 20 },
  toggleTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  toggleSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  modalActions: { marginTop: 10 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtnText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 },
});
