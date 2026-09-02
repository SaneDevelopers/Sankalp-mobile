import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  useGetBookings,
  useUpdateBookingStatus,
  useGetOrders,
  useUpdateOrderStatus,
  useGetPandits,
  useCreatePandit,
  useUpdatePandit,
  useDeletePandit,
  useGetStoreItems,
  getGetStoreItemsQueryKey,
  useCreateStoreItem,
  useUpdateStoreItem,
  useDeleteStoreItem,
} from '@workspace/api-client-react';
import { validatePincodeOffline } from '@/constants/data';
import { getHomeBanners, saveHomeBanners, BannerSlide, DEFAULT_BANNERS } from '@/lib/banners';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_DATA = [65, 40, 80, 55, 90, 70, 45];

const CATEGORIES = ['vedic', 'astrology', 'havan', 'griha'];

const ADMIN_TABS = ['dashboard', 'orders', 'bookings', 'pandits', 'store', 'banners'] as const;

interface PanditFormData {
  id?: number;
  name: string;
  shortName: string;
  specialty: string;
  category: string;
  rating: number;
  experience: string;
  bookings: number;
  age: number;
  city: string;
  address: string;
  available: string;
  specializations: string[];
  muhurats: string[];
  poojas: Array<{ id: string; name: string; duration: string; price: number; includesPrasad: boolean }>;
  initials: string;
  avatarColor: string;
  email: string;
  password: string;
  imageUrl: string;
}

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { lang, setLang, t, f } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === 'web' && screenWidth >= 1024;

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [bypassMobileRestriction, setBypassMobileRestriction] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  React.useEffect(() => {
    AsyncStorage.getItem('@sankalp:admin_authenticated').then(val => {
      if (val === 'true') {
        setIsAdminAuthenticated(true);
      }
      setIsCheckingAuth(false);
    });
  }, []);

  const handleAdminLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAdminLoginError('');
    const ADMIN_EMAIL = (process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'admin@sankalp.com').toLowerCase();
    const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || 'Sankalp_2026_Admin_Secret';

    if (adminEmail.trim().toLowerCase() === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      await AsyncStorage.setItem('@sankalp:admin_authenticated', 'true');
    } else {
      setAdminLoginError(t('adminInvalidCreds'));
    }
  };

  const handleAdminLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAdminAuthenticated(false);
    await AsyncStorage.removeItem('@sankalp:admin_authenticated');
  };

  const topPadding = isDesktopWeb ? 67 : insets.top;
  const bottomPadding = isDesktopWeb ? 34 : insets.bottom;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'bookings' | 'pandits' | 'store' | 'banners'>('dashboard');
  const [bookingSearch, setBookingSearch] = useState('');

  // Banners manager state
  const [adminBanners, setAdminBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    titleEn: string;
    titleHi: string;
    subtitleEn: string;
    subtitleHi: string;
    badgeEn: string;
    badgeHi: string;
    buttonTextEn: string;
    buttonTextHi: string;
    route: string;
    imageUrl: string;
    type: 'offer' | 'festival' | 'panchang' | 'custom';
  }>({
    titleEn: '',
    titleHi: '',
    subtitleEn: '',
    subtitleHi: '',
    badgeEn: 'SPECIAL OFFER',
    badgeHi: 'विशेष ऑफर',
    buttonTextEn: 'BOOK NOW',
    buttonTextHi: 'अभी बुक करें',
    route: '/poojas',
    imageUrl: '',
    type: 'offer',
  });

  React.useEffect(() => {
    getHomeBanners().then(setAdminBanners);
  }, []);

  const handleOpenBannerModal = (slide?: BannerSlide) => {
    if (slide) {
      setEditingBannerId(slide.id);
      setBannerForm({
        titleEn: slide.titleEn,
        titleHi: slide.titleHi,
        subtitleEn: slide.subtitleEn,
        subtitleHi: slide.subtitleHi,
        badgeEn: slide.badgeEn,
        badgeHi: slide.badgeHi,
        buttonTextEn: slide.buttonTextEn,
        buttonTextHi: slide.buttonTextHi,
        route: slide.route,
        imageUrl: slide.imageUrl || '',
        type: slide.type,
      });
    } else {
      setEditingBannerId(null);
      setBannerForm({
        titleEn: '',
        titleHi: '',
        subtitleEn: '',
        subtitleHi: '',
        badgeEn: 'SPECIAL OFFER',
        badgeHi: 'विशेष ऑफर',
        buttonTextEn: 'EXPLORE',
        buttonTextHi: 'देखें',
        route: '/poojas',
        imageUrl: '',
        type: 'offer',
      });
    }
    setBannerModalVisible(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.titleEn || !bannerForm.titleHi) return;
    let updated: BannerSlide[];
    if (editingBannerId) {
      updated = adminBanners.map(b =>
        b.id === editingBannerId
          ? {
              ...b,
              ...bannerForm,
            }
          : b
      );
    } else {
      const newSlide: BannerSlide = {
        id: 'b_' + Date.now(),
        ...bannerForm,
        bgGradient: ['#E65100', '#BF360C'],
        active: true,
      };
      updated = [newSlide, ...adminBanners];
    }
    setAdminBanners(updated);
    await saveHomeBanners(updated);
    setBannerModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteBanner = async (id: string) => {
    const updated = adminBanners.filter(b => b.id !== id);
    setAdminBanners(updated);
    await saveHomeBanners(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleBannerActive = async (id: string) => {
    const updated = adminBanners.map(b => (b.id === id ? { ...b, active: !b.active } : b));
    setAdminBanners(updated);
    await saveHomeBanners(updated);
    Haptics.selectionAsync();
  };

  const handleLanguageChange = (newLang: 'en' | 'hi' | 'mr') => {
    if (newLang === lang) return;
    Haptics.selectionAsync();
    setLang(newLang);
  };

  // React Query queries
  const { data: bookings = [], isLoading: loadingBookings } = useGetBookings({
    request: {
      headers: {
        Authorization: 'Bearer admin-bypass-secret-2026',
      },
    },
  });
  const { data: orders = [], isLoading: loadingOrders } = useGetOrders({
    request: {
      headers: {
        Authorization: 'Bearer admin-bypass-secret-2026',
      },
    },
  });
  const { data: pandits = [], isLoading: loadingPandits } = useGetPandits();
  const { data: storeItems = [], isLoading: loadingStoreItems } = useGetStoreItems();

  // Metrics
  const totalBookingsRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalOrdersRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalRevenue = totalBookingsRevenue + totalOrdersRevenue;

  const totalBookingsCount = bookings.filter(b => b.status !== 'cancelled').length;
  const totalOrdersCount = orders.filter(o => o.status !== 'cancelled').length;

  const filteredBookingsLogs = bookings.filter(b => {
    const query = bookingSearch.toLowerCase();
    return (
      b.bookingId.toLowerCase().includes(query) ||
      b.panditName.toLowerCase().includes(query) ||
      b.poojaName.toLowerCase().includes(query)
    );
  });

  // Mutations
  const updateBookingStatusMutation = useUpdateBookingStatus();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const createPanditMutation = useCreatePandit();
  const updatePanditMutation = useUpdatePandit();
  const deletePanditMutation = useDeletePandit();
  const createStoreItemMutation = useCreateStoreItem();
  const updateStoreItemMutation = useUpdateStoreItem();
  const deleteStoreItemMutation = useDeleteStoreItem();
  const { pickAndUploadImage: pickAndUploadPanditImage, uploading: uploadingPanditImage } = useImageUpload();

  const handleUploadPanditImage = async () => {
    const url = await pickAndUploadPanditImage();
    if (url) {
      setPanditForm(prev => ({ ...prev, imageUrl: url }));
    }
  };


  // Pandit Form Modal state
  const [panditModalVisible, setPanditModalVisible] = useState(false);
  const [panditForm, setPanditForm] = useState<PanditFormData>({
    name: '',
    shortName: '',
    specialty: '',
    category: 'vedic',
    rating: 4.8,
    experience: '10 Yrs',
    bookings: 100,
    age: 40,
    city: '',
    address: '',
    available: 'today',
    specializations: [],
    muhurats: ['8:00 AM', '11:00 AM', '4:00 PM'],
    poojas: [],
    initials: '',
    avatarColor: '#7B4F2E',
    email: '',
    password: '',
    imageUrl: '',
  });

  // Store items CRUD state & actions
  interface StoreItemFormData {
    id?: number;
    name: string;
    price: string;
    unit: string;
    category: 'samagri' | 'utensils' | 'premium';
    featured: boolean;
    description: string;
    color: string;
    imageUrl: string;
  }

  const [storeItemModalVisible, setStoreItemModalVisible] = useState(false);
  const [storeItemForm, setStoreItemForm] = useState<StoreItemFormData>({
    name: '',
    price: '',
    unit: '',
    category: 'samagri',
    featured: false,
    description: '',
    color: '#D4722A',
    imageUrl: '',
  });

  const { pickAndUploadImage: pickAndUploadStoreImage, uploading: uploadingStoreImage } = useImageUpload();

  const handleUploadStoreImage = async () => {
    const url = await pickAndUploadStoreImage();
    if (url) {
      setStoreItemForm(prev => ({ ...prev, imageUrl: url }));
    }
  };

  const openAddStoreItem = () => {
    setStoreItemForm({
      name: '',
      price: '',
      unit: '',
      category: 'samagri',
      featured: false,
      description: '',
      color: '#D4722A',
      imageUrl: '',
    });
    setFormError('');
    setStoreItemModalVisible(true);
  };

  const openEditStoreItem = (item: any) => {
    setStoreItemForm({
      id: item.id,
      name: item.name,
      price: String(item.price),
      unit: item.unit,
      category: item.category,
      featured: item.featured,
      description: item.description || '',
      color: item.color || '#D4722A',
      imageUrl: item.imageUrl || '',
    });
    setFormError('');
    setStoreItemModalVisible(true);
  };

  const handleSaveStoreItem = async () => {
    if (!storeItemForm.name || !storeItemForm.price || !storeItemForm.unit) {
      setFormError('Please fill name, price, and unit fields');
      return;
    }

    const priceNum = parseInt(storeItemForm.price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      if (storeItemForm.id) {
        // Update
        await updateStoreItemMutation.mutateAsync({
          id: storeItemForm.id,
          data: {
            name: storeItemForm.name,
            price: priceNum,
            unit: storeItemForm.unit,
            category: storeItemForm.category,
            featured: storeItemForm.featured,
            description: storeItemForm.description || null,
            color: storeItemForm.color || null,
            imageUrl: storeItemForm.imageUrl || null,
          },
        });
      } else {
        // Create
        await createStoreItemMutation.mutateAsync({
          data: {
            name: storeItemForm.name,
            price: priceNum,
            unit: storeItemForm.unit,
            category: storeItemForm.category,
            featured: storeItemForm.featured,
            description: storeItemForm.description || null,
            color: storeItemForm.color || null,
            imageUrl: storeItemForm.imageUrl || null,
          },
        });
      }
      await queryClient.invalidateQueries({ queryKey: getGetStoreItemsQueryKey() });
      setStoreItemModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save store item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStoreItem = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (typeof window !== 'undefined') {
      if (!confirm('Are you sure you want to delete this item?')) return;
    }
    try {
      await deleteStoreItemMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: getGetStoreItemsQueryKey() });
    } catch (err) {
      console.error('Failed to delete store item:', err);
    }
  };

  const [specInput, setSpecInput] = useState('');
  const [poojaName, setPoojaName] = useState('');
  const [poojaPrice, setPoojaPrice] = useState('');
  const [pincode, setPincode] = useState('');
  const [resolvingPin, setResolvingPin] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxBar = Math.max(...BAR_DATA);
  const [resettingPasswordId, setResettingPasswordId] = useState<number | null>(null);
  const [resetLinkModal, setResetLinkModal] = useState<{ visible: boolean; link: string; email: string }>({ visible: false, link: '', email: '' });

  // Status transitions
  const { addNotification } = useNotifications();
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateOrderStatusMutation.mutateAsync({
        id,
        data: { status },
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      addNotification('order', 'Order Updated', `Order #${id} status set to ${status}`, 'package');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateBookingStatusMutation.mutateAsync({
        id,
        data: { status },
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      addNotification('booking', 'Booking Updated', `Booking #${id} status set to ${status}`, 'calendar');
    } catch (err) {
      console.error(err);
    }
  };

  const handleForgotPassword = async (email: string | undefined, id: number) => {
    if (!email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResettingPasswordId(id);
    try {
      // Mocking the backend call or pointing to api server (port 5001)
      const res = await fetch('http://localhost:5001/api/pandits/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetLinkModal({ visible: true, link: data.resetLink, email });
      } else {
        alert(data.message || 'Failed to generate link');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to server');
    } finally {
      setResettingPasswordId(null);
    }
  };

  // Pincode resolution for Pandit city
  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/[^0-9]/g, '');
    setPincode(cleanPin);
    if (cleanPin.length < 6) return;

    setResolvingPin(true);
    const offlineCity = validatePincodeOffline(cleanPin);
    if (!offlineCity) {
      setFormError('Pandit must reside in Maharashtra. Pincode not supported.');
      setResolvingPin(false);
      return;
    }

    setPanditForm(prev => ({ ...prev, city: offlineCity }));
    setFormError('');

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          const state = postOffices[0].State;
          const district = postOffices[0].District;
          if (state === 'Maharashtra') {
            setPanditForm(prev => ({ ...prev, city: district }));
          } else {
            setFormError('Pandit must reside in Maharashtra.');
          }
        }
      }
    } catch (e) {
      // Offline fallback is already set
    } finally {
      setResolvingPin(false);
    }
  };

  // Add specialization chip
  const addSpec = () => {
    if (specInput.trim() && !panditForm.specializations.includes(specInput.trim())) {
      setPanditForm(prev => ({
        ...prev,
        specializations: [...prev.specializations, specInput.trim()],
      }));
      setSpecInput('');
    }
  };

  // Remove spec chip
  const removeSpec = (spec: string) => {
    setPanditForm(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec),
    }));
  };

  // Add Pooja option
  const addPooja = () => {
    if (poojaName.trim() && poojaPrice.trim()) {
      const priceVal = parseInt(poojaPrice, 10);
      if (isNaN(priceVal)) return;

      const randomId = 'p' + Math.floor(100 + Math.random() * 900);
      setPanditForm(prev => ({
        ...prev,
        poojas: [...prev.poojas, { id: randomId, name: poojaName.trim(), duration: '2 Hrs', price: priceVal, includesPrasad: true }],
      }));
      setPoojaName('');
      setPoojaPrice('');
    }
  };

  // Remove Pooja
  const removePooja = (pId: string) => {
    setPanditForm(prev => ({
      ...prev,
      poojas: prev.poojas.filter(p => p.id !== pId),
    }));
  };

  // Open Add Pandit modal
  const openAddPandit = () => {
    setPanditForm({
      name: '',
      shortName: '',
      specialty: '',
      category: 'vedic',
      rating: 4.8,
      experience: '10 Yrs',
      bookings: 120,
      age: 38,
      city: '',
      address: '',
      available: 'today',
      specializations: ['Satyanarayan', 'Griha Pravesh'],
      muhurats: ['8:00 AM', '11:00 AM', '4:00 PM'],
      poojas: [
        { id: 'p1', name: 'Satyanarayan Katha', duration: '1.5 Hrs', price: 2499, includesPrasad: true },
      ],
      initials: '',
      avatarColor: '#7B4F2E',
      email: '',
      password: '',
      imageUrl: '',
    });
    setPincode('');
    setFormError('');
    setPanditModalVisible(true);
  };

  // Open Edit Pandit modal
  const openEditPandit = (p: any) => {
    setPanditForm({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      specialty: p.specialty,
      category: p.category,
      rating: p.rating,
      experience: p.experience,
      bookings: p.bookings,
      age: p.age,
      city: p.city,
      address: p.address,
      available: p.available,
      specializations: p.specializations || [],
      muhurats: p.muhurats || [],
      poojas: p.poojas || [],
      initials: p.initials,
      avatarColor: p.avatarColor,
      email: p.email || '',
      password: '', // Do not populate password for editing, or leave blank if we don't want to change
      imageUrl: p.imageUrl || '',
    });
    setPincode('');
    setFormError('');
    setPanditModalVisible(true);
  };

  // Handle Pandit Form Save
  const handleSavePandit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFormError('');

    if (!panditForm.name.trim()) {
      setFormError('Pandit name is required');
      return;
    }
    if (!panditForm.email?.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!panditForm.id && !panditForm.password?.trim()) {
      setFormError('Password is required for new Pandits');
      return;
    }
    if (!panditForm.specialty.trim()) {
      setFormError('Specialty is required');
      return;
    }
    if (!panditForm.city) {
      setFormError('A valid Maharashtra city/location is required');
      return;
    }

    // Auto-calculate initials if empty
    let initials = panditForm.initials;
    if (!initials) {
      const parts = panditForm.name.split(' ');
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else {
        initials = panditForm.name.substring(0, 2).toUpperCase();
      }
    }

    const shortName = panditForm.shortName || (panditForm.name.length > 12 ? panditForm.name.substring(0, 11) + '...' : panditForm.name);

    setIsSubmitting(true);
    try {
      if (panditForm.id) {
        // Edit Pandit
        await updatePanditMutation.mutateAsync({
          id: panditForm.id,
          data: {
            ...panditForm,
            initials,
            shortName,
          },
        });
      } else {
        // Create Pandit
        await createPanditMutation.mutateAsync({
          data: {
            ...panditForm,
            initials,
            shortName,
          },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['/api/pandits'] });
      setPanditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to save pandit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Pandit
  const handleDeletePandit = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await deletePanditMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ['/api/pandits'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 1. Mobile & tablet view restriction screen
  if (!isDesktopWeb && !bypassMobileRestriction) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background, padding: 24 }]}>
        {/* Mobile Header / Toggle */}
        <View style={[styles.langToggleContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 30, alignSelf: 'center' }]}>
          <Pressable
            onPress={() => handleLanguageChange('en')}
            style={[
              styles.langToggleItem,
              lang === 'en' && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.langToggleText,
              { color: lang === 'en' ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }
            ]}>
              EN
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageChange('hi')}
            style={[
              styles.langToggleItem,
              lang === 'hi' && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.langToggleText,
              { color: lang === 'hi' ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }
            ]}>
              HI
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageChange('mr')}
            style={[
              styles.langToggleItem,
              lang === 'mr' && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.langToggleText,
              { color: lang === 'mr' ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }
            ]}>
              MR
            </Text>
          </Pressable>
        </View>

        <View style={[styles.warningCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.warningIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="monitor" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.warningTitle, { color: colors.text, fontFamily: f('bold') }]}>
            {t('webOnlyTitle')}
          </Text>
          <Text style={[styles.warningDesc, { color: colors.mutedForeground, fontFamily: f('regular') }]}>
            {t('webOnlyDesc')}
          </Text>
          <Pressable
            style={[styles.warningBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
            onPress={() => {
              Haptics.selectionAsync();
              setBypassMobileRestriction(true);
            }}
          >
            <Text style={[styles.warningBtnText, { fontFamily: f('bold') }]}>Open Admin Console on Mobile</Text>
          </Pressable>
          <Pressable
            style={[styles.warningBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            }}
          >
            <Text style={[styles.warningBtnText, { color: colors.text, fontFamily: f('semibold') }]}>{t('back')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 2. Admin Login gate (strictly on Web)
  if (!isAdminAuthenticated) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background, padding: 20 }]}>
        {/* Language toggle */}
        <View style={[styles.langToggleContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 24 }]}>
          {(['en', 'hi', 'mr'] as const).map(l => (
            <Pressable
              key={l}
              onPress={() => handleLanguageChange(l)}
              style={[styles.langToggleItem, lang === l && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.langToggleText, { color: lang === l ? '#FFFFFF' : colors.primary, fontFamily: f('bold') }]}>
                {l.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.loginCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Brand header */}
          <View style={[styles.loginBrandHeader, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={28} color={colors.gold} />
            <Text style={[styles.loginBrandTitle, { fontFamily: f('bold') }]}>Sankalp Control</Text>
            <Text style={[styles.loginBrandSub, { fontFamily: f('regular') }]}>Admin Console</Text>
          </View>

          <View style={{ padding: 20 }}>
            {adminLoginError ? (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA', marginBottom: 16 }]}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={[styles.errorText, { fontFamily: f('medium') }]}>{adminLoginError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>{t('adminEmailLabel')}</Text>
              <View style={[styles.iconInputWrap, { borderColor: colors.border }]}>
                <Feather name="mail" size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.iconInput, { color: colors.text, fontFamily: f('regular') }]}
                  placeholder="Enter admin email"
                  placeholderTextColor={colors.mutedForeground}
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="one-time-code"
                  textContentType="none"
                  importantForAutofill="no"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>{t('adminPasswordLabel')}</Text>
              <View style={[styles.iconInputWrap, { borderColor: colors.border }]}>
                <Feather name="lock" size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.iconInput, { color: colors.text, fontFamily: f('regular') }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="none"
                  importantForAutofill="no"
                />
              </View>
            </View>

            <Pressable
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              onPress={handleAdminLogin}
            >
              <Feather name="log-in" size={16} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={[styles.loginBtnText, { fontFamily: f('bold') }]}>
                {t('adminLoginBtn')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setAdminEmail('admin@sankalp.com');
                setAdminPassword('Sankalp_2026_Admin_Secret');
              }}
              style={{ alignSelf: 'center', marginTop: 16, padding: 8 }}
            >
              <Text style={{ fontSize: 12, color: colors.primary, fontFamily: f('semibold') }}>
                ⚡ Quick Fill Admin Credentials
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const TAB_ICONS: Record<string, string> = {
    dashboard: 'grid',
    orders: 'package',
    bookings: 'calendar',
    pandits: 'users',
    store: 'shopping-bag',
    banners: 'image',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Header */}
      <View style={[styles.adminHeader, { paddingTop: topPadding }]}>
        {/* Top strip: title + controls */}
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.adminConsoleLabel, { fontFamily: f('bold') }]}>{t('adminConsole').toUpperCase()}</Text>
            <Text style={[styles.adminTitle, { fontFamily: f('bold') }]}>Sankalp Control</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Language toggle */}
            <View style={[styles.langToggleContainer, { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(0,0,0,0.18)' }]}>
              {(['en', 'hi', 'mr'] as const).map(l => (
                <Pressable
                  key={l}
                  onPress={() => handleLanguageChange(l)}
                  style={[styles.langToggleItem, lang === l && { backgroundColor: colors.gold }]}
                >
                  <Text style={[styles.langToggleText, { color: '#FFFFFF', fontFamily: f('bold') }]}>
                    {l.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleAdminLogout}
              style={styles.headerIconBtn}
            >
              <Feather name="log-out" size={15} color="#FFFFFF" />
            </Pressable>

            <View style={[styles.adminAvatar, { backgroundColor: colors.gold }]}>
              <Text style={[styles.adminAvatarText, { fontFamily: f('bold') }]}>A</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid — 3 accent cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderLeftColor: colors.gold }]}>
            <View style={styles.statCardHeader}>
              <Feather name="package" size={13} color={colors.gold} />
              <Text style={[styles.statCardLabel, { fontFamily: f('semibold') }]}>{t('totalOrders').toUpperCase()}</Text>
            </View>
            <Text style={[styles.statCardValue, { fontFamily: f('bold') }]}>{orders.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderLeftColor: '#5BC4F5' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="calendar" size={13} color="#5BC4F5" />
              <Text style={[styles.statCardLabel, { fontFamily: f('semibold') }]}>{t('totalBookings').toUpperCase()}</Text>
            </View>
            <Text style={[styles.statCardValue, { fontFamily: f('bold') }]}>{bookings.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderLeftColor: '#7AE28C' }]}>
            <View style={styles.statCardHeader}>
              <Feather name="users" size={13} color="#7AE28C" />
              <Text style={[styles.statCardLabel, { fontFamily: f('semibold') }]}>PANDITS</Text>
            </View>
            <Text style={[styles.statCardValue, { fontFamily: f('bold') }]}>{pandits.length}</Text>
          </View>
        </View>
      </View>

      {/* Navigation tabs — icon + label */}
      <View style={styles.tabRow}>
        {ADMIN_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab(tab);
              Haptics.selectionAsync();
            }}
          >
            <Feather
              name={TAB_ICONS[tab] as any}
              size={14}
              color={activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
              style={{ marginBottom: 3 }}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, { fontFamily: f('bold') }]}>
              {t(tab).toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Body Scroll */}
      <ScrollView
        style={[styles.body, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
      >
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Dashboard & Metrics</Text>

            {/* Metric cards — 2-column grid, revenue full-width */}
            <View style={styles.metricGrid}>
              {/* Revenue — full width */}
              <View style={[styles.metricCard, styles.metricCardFullRow, { borderLeftColor: colors.gold }]}>
                <View style={styles.metricCardIconBadge}>
                  <Feather name="trending-up" size={18} color={colors.gold} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>TOTAL REVENUE</Text>
                <Text style={[styles.metricValue, { color: colors.text, fontFamily: f('bold') }]}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
                <Text style={[styles.metricSub, { color: colors.mutedForeground }]}>Bookings + Store Sales</Text>
              </View>

              {/* Bookings */}
              <View style={[styles.metricCard, styles.metricCardHalf, { borderLeftColor: '#5BC4F5' }]}>
                <View style={[styles.metricCardIconBadge, { backgroundColor: '#5BC4F510' }]}>
                  <Feather name="calendar" size={16} color="#5BC4F5" />
                </View>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>BOOKINGS</Text>
                <Text style={[styles.metricValue, { color: colors.text, fontFamily: f('bold') }]}>{totalBookingsCount}</Text>
                <Text style={[styles.metricSub, { color: colors.mutedForeground }]}>Completed & Upcoming</Text>
              </View>

              {/* Samagri Orders */}
              <View style={[styles.metricCard, styles.metricCardHalf, { borderLeftColor: colors.orange }]}>
                <View style={[styles.metricCardIconBadge, { backgroundColor: colors.orange + '18' }]}>
                  <Feather name="shopping-bag" size={16} color={colors.orange} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>SAMAGRI</Text>
                <Text style={[styles.metricValue, { color: colors.text, fontFamily: f('bold') }]}>{totalOrdersCount}</Text>
                <Text style={[styles.metricSub, { color: colors.mutedForeground }]}>Store Shipments</Text>
              </View>

              {/* Active Pandits */}
              <View style={[styles.metricCard, styles.metricCardHalf, { borderLeftColor: colors.success }]}>
                <View style={[styles.metricCardIconBadge, { backgroundColor: colors.success + '18' }]}>
                  <Feather name="users" size={16} color={colors.success} />
                </View>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: f('semibold') }]}>PANDITS</Text>
                <Text style={[styles.metricValue, { color: colors.text, fontFamily: f('bold') }]}>{pandits.length}</Text>
                <Text style={[styles.metricSub, { color: colors.mutedForeground }]}>Onboarded</Text>
              </View>
            </View>

            {/* Booking Audit Logs */}
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 10 }]}>Booking Audit Logs</Text>
              <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="search" size={15} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, color: colors.text, fontSize: 14, fontFamily: 'Inter_400Regular' }}
                  placeholder="Search Booking ID or Pandit name..."
                  placeholderTextColor={colors.mutedForeground}
                  value={bookingSearch}
                  onChangeText={setBookingSearch}
                />
                {bookingSearch.length > 0 && (
                  <Pressable onPress={() => setBookingSearch('')}>
                    <Feather name="x" size={15} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            </View>

            {loadingBookings ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
            ) : filteredBookingsLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No matching bookings found.</Text>
              </View>
            ) : (
              filteredBookingsLogs.map(b => {
                const statusColor = b.status === 'completed' ? colors.success : b.status === 'cancelled' ? colors.destructive : colors.primary;
                return (
                  <View
                    key={b.id}
                    style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: statusColor, borderLeftWidth: 4 }]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.orderId, { color: colors.text }]}>{b.poojaName}</Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}>
                          #{b.bookingId} · {new Date(b.createdAt).toLocaleString()}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusPillText, { color: statusColor }]}>{b.status.toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={{ gap: 3 }}>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>Pandit: </Text>{b.panditName}
                      </Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>Schedule: </Text>{b.date} at {b.time}
                      </Text>
                      <Text style={{ color: statusColor, fontSize: 13, fontFamily: 'Inter_700Bold', marginTop: 4 }}>
                        ₹{b.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            <View style={styles.tabSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Active Orders</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>{orders.length}</Text>
              </View>
            </View>
            {loadingOrders ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="package" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No orders placed yet.</Text>
              </View>
            ) : (
              orders.map(o => {
                const statusColor = o.status === 'delivered' ? colors.success : o.status === 'cancelled' ? colors.destructive : o.status === 'in_transit' ? '#5BC4F5' : colors.gold;
                return (
                  <View key={o.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.orderId, { color: colors.text }]}>#{o.orderId}</Text>
                      <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusPillText, { color: statusColor }]}>{o.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.cardDivider} />
                    <Text style={[styles.addressLabel, { color: colors.text, marginBottom: 2 }]}>
                      {o.items.map((i: any) => `${i.name} ×${i.qty}`).join('  ·  ')}
                    </Text>
                    <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={2}>
                      📦 {o.addressText}
                    </Text>
                    <View style={styles.statusButtonsRow}>
                      {o.status === 'processing' && (
                        <Pressable style={[styles.actionBtn, { backgroundColor: colors.gold }]} onPress={() => handleUpdateOrderStatus(o.id, 'in_transit')}>
                          <Feather name="truck" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Ship</Text>
                        </Pressable>
                      )}
                      {o.status === 'in_transit' && (
                        <Pressable style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => handleUpdateOrderStatus(o.id, 'delivered')}>
                          <Feather name="check-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Delivered</Text>
                        </Pressable>
                      )}
                      {o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive }]} onPress={() => handleUpdateOrderStatus(o.id, 'cancelled')}>
                          <Feather name="x" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Cancel</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'bookings' && (
          <View style={styles.tabContent}>
            <View style={styles.tabSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Ritual Bookings</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>{bookings.length}</Text>
              </View>
            </View>
            {loadingBookings ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No bookings made yet.</Text>
              </View>
            ) : (
              bookings.map(b => {
                const statusColor = b.status === 'completed' ? colors.success : b.status === 'cancelled' ? colors.destructive : colors.primary;
                return (
                  <View key={b.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.orderId, { color: colors.text }]}>{b.poojaName}</Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>#{b.bookingId}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusPillText, { color: statusColor }]}>{b.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.cardDivider} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 2 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>Pandit: </Text>{b.panditName}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                      📅 {b.date} at {b.time}
                    </Text>
                    {b.status === 'upcoming' && (
                      <View style={styles.statusButtonsRow}>
                        <Pressable style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => handleUpdateBookingStatus(b.id, 'completed')}>
                          <Feather name="check-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Complete</Text>
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive }]} onPress={() => handleUpdateBookingStatus(b.id, 'cancelled')}>
                          <Feather name="x-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Cancel</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'pandits' && (
          <View style={styles.tabContent}>
            <View style={styles.tabSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Pandits</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>{pandits.length}</Text>
                </View>
              </View>
              <Pressable style={[styles.addPanditBtn, { backgroundColor: colors.primary }]} onPress={openAddPandit}>
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addPanditText}>Add Pandit</Text>
              </Pressable>
            </View>

            {loadingPandits ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : pandits.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No pandits onboarded yet.</Text>
              </View>
            ) : (
              pandits.map(p => (
                <View key={p.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.orderId, { color: colors.text }]}>{p.name}</Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{p.specialty}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.statusPillText, { color: colors.primary }]}>{p.category.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    ⏱ {p.experience}  ·  📍 {p.city}
                  </Text>
                  <View style={styles.statusButtonsRow}>
                    <Pressable style={[styles.actionBtn, { backgroundColor: colors.gold }]} onPress={() => openEditPandit(p)}>
                      <Feather name="edit-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: colors.primary, opacity: (resettingPasswordId === p.id || !p.email) ? 0.45 : 1 }]}
                      onPress={() => handleForgotPassword(p.email ?? '', p.id)}
                      disabled={resettingPasswordId === p.id || !p.email}
                    >
                      {resettingPasswordId === p.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Feather name="key" size={11} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnText}>Reset</Text>
                        </>
                      )}
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive }]} onPress={() => handleDeletePandit(p.id)}>
                      <Feather name="trash-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        {activeTab === 'store' && (
          <View style={styles.tabContent}>
            <View style={styles.tabSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Store Items</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>{storeItems.length}</Text>
                </View>
              </View>
              <Pressable style={[styles.addPanditBtn, { backgroundColor: colors.primary }]} onPress={openAddStoreItem}>
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addPanditText}>Add Item</Text>
              </Pressable>
            </View>

            {loadingStoreItems ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : storeItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="shopping-bag" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No store items yet.</Text>
              </View>
            ) : (
              storeItems.map(item => (
                <View key={item.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.orange, borderLeftWidth: 4 }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.orderId, { color: colors.text }]}>{item.name}</Text>
                      <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_700Bold' }}>₹{item.price} · {item.unit}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      {item.featured && (
                        <View style={[styles.statusPill, { backgroundColor: colors.gold + '20' }]}>
                          <Text style={[styles.statusPillText, { color: colors.gold }]}>FEATURED</Text>
                        </View>
                      )}
                      <View style={[styles.statusPill, { backgroundColor: colors.orange + '18' }]}>
                        <Text style={[styles.statusPillText, { color: colors.orange }]}>{item.category.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  {item.description ? (
                    <>
                      <View style={styles.cardDivider} />
                      <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
                    </>
                  ) : null}
                  <View style={styles.statusButtonsRow}>
                    <Pressable style={[styles.actionBtn, { backgroundColor: colors.gold }]} onPress={() => openEditStoreItem(item)}>
                      <Feather name="edit-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive }]} onPress={() => handleDeleteStoreItem(item.id)}>
                      <Feather name="trash-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'banners' && (
          <View style={styles.tabContent}>
            <View style={styles.tabSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>{t('bannerManager')}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>{adminBanners.length}</Text>
                </View>
              </View>
              <Pressable style={[styles.addPanditBtn, { backgroundColor: colors.primary }]} onPress={() => handleOpenBannerModal()}>
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addPanditText}>Add Slide</Text>
              </Pressable>
            </View>

            {adminBanners.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="image" size={32} color={colors.border} />
                <Text style={[styles.emptyLabel, { color: colors.mutedForeground }]}>No banner slides yet.</Text>
              </View>
            ) : adminBanners.map(slide => (
              <View key={slide.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: slide.active ? colors.primary : colors.mutedForeground, borderLeftWidth: 4 }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderId, { color: colors.text }]}>{slide.titleEn.replace('\n', ' ')}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}>{slide.route}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: slide.active ? colors.success + '18' : colors.border + '80' }]}>
                    <View style={[styles.statusDot, { backgroundColor: slide.active ? colors.success : colors.mutedForeground }]} />
                    <Text style={[styles.statusPillText, { color: slide.active ? colors.success : colors.mutedForeground }]}>
                      {slide.active ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardDivider} />
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  🏷 {slide.badgeEn}  ·  HI: {slide.titleHi.replace('\n', ' ')}
                </Text>
                <View style={styles.statusButtonsRow}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.gold }]} onPress={() => handleOpenBannerModal(slide)}>
                    <Feather name="edit-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: slide.active ? colors.mutedForeground : colors.success }]} onPress={() => handleToggleBannerActive(slide.id)}>
                    <Feather name={slide.active ? 'eye-off' : 'eye'} size={11} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>{slide.active ? 'Disable' : 'Enable'}</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.destructive }]} onPress={() => handleDeleteBanner(slide.id)}>
                    <Feather name="trash-2" size={11} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}


        <Pressable
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/profile');
            }
          }}
        >
          <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
          <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>Back to Profile</Text>
        </Pressable>
      </ScrollView>

      {/* Pandit Form Modal */}
      <Modal visible={panditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle} />
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {panditForm.id ? 'Edit Pandit Details' : 'Create Pandit Profile'}
              </Text>
              <Pressable onPress={() => setPanditModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 16 }]}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              {formError ? (
                <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              {/* Pandit Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PANDIT NAME</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Acharya R. Joshi"
                  placeholderTextColor={colors.mutedForeground}
                  value={panditForm.name}
                  onChangeText={val => setPanditForm(prev => ({ ...prev, name: val }))}
                />
              </View>

              {/* Email & Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. pandit@sankalp.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  value={panditForm.email}
                  onChangeText={val => setPanditForm(prev => ({ ...prev, email: val }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder={panditForm.id ? "Leave blank to keep unchanged" : "Set login password"}
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  value={panditForm.password}
                  onChangeText={val => setPanditForm(prev => ({ ...prev, password: val }))}
                />
              </View>

              {/* Avatar Selector (Presets) */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>PROFILE PHOTO</Text>
              <View style={styles.categoryRow}>
                {[1, 2, 3, 4].map(preset => {
                  const url = `https://randomuser.me/api/portraits/men/${preset * 15}.jpg`;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => setPanditForm(prev => ({ ...prev, imageUrl: url }))}
                      style={[
                        styles.categoryTab,
                        {
                          borderColor: panditForm.imageUrl === url ? colors.primary : colors.border,
                          backgroundColor: panditForm.imageUrl === url ? colors.primary + '12' : colors.card,
                        },
                      ]}
                    >
                      <Text style={[styles.categoryTabText, { color: panditForm.imageUrl === url ? colors.primary : colors.text }]}>
                        Preset {preset}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={handleUploadPanditImage}
                disabled={uploadingPanditImage}
                style={[
                  styles.categoryTab,
                  {
                    marginTop: 8,
                    borderColor: panditForm.imageUrl && !panditForm.imageUrl.includes('randomuser.me') ? colors.primary : colors.border,
                    backgroundColor: panditForm.imageUrl && !panditForm.imageUrl.includes('randomuser.me') ? colors.primary + '12' : colors.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                  },
                ]}
              >
                {uploadingPanditImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Feather name="upload-cloud" size={14} color={colors.primary} />
                    <Text style={[styles.categoryTabText, { color: colors.primary, fontFamily: f('bold') }]}>
                      {panditForm.imageUrl && !panditForm.imageUrl.includes('randomuser.me') ? 'Custom Image Uploaded' : 'Upload Custom Image'}
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Specialty */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>SPECIALTY</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Havan & Yagna Specialist"
                  placeholderTextColor={colors.mutedForeground}
                  value={panditForm.specialty}
                  onChangeText={val => setPanditForm(prev => ({ ...prev, specialty: val }))}
                />
              </View>

              {/* Category */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>CATEGORY</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setPanditForm(prev => ({ ...prev, category: cat }))}
                    style={[
                      styles.categoryTab,
                      {
                        borderColor: panditForm.category === cat ? colors.primary : colors.border,
                        backgroundColor: panditForm.category === cat ? colors.primary + '12' : colors.card,
                      },
                    ]}
                  >
                    <Text style={[styles.categoryTabText, { color: panditForm.category === cat ? colors.primary : colors.text }]}>
                      {cat.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Experience & Age */}
              <View style={styles.doubleFieldRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>EXPERIENCE</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. 15 Yrs"
                    placeholderTextColor={colors.mutedForeground}
                    value={panditForm.experience}
                    onChangeText={val => setPanditForm(prev => ({ ...prev, experience: val }))}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>AGE</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. 45"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={panditForm.age.toString()}
                    onChangeText={val => setPanditForm(prev => ({ ...prev, age: parseInt(val, 10) || 0 }))}
                  />
                </View>
              </View>

              {/* Pincode Resolution */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PINCODE (MAHARASHTRA ONLY)</Text>
                <View style={styles.pinInputWrap}>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border, flex: 1 }]}
                    placeholder="Enter 6-digit PIN code"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={handlePincodeChange}
                  />
                  {resolvingPin && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 10 }} />}
                </View>
              </View>

              {/* City resolved */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>CITY (RESOLVED)</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.secondary, opacity: 0.8 }]}
                  editable={false}
                  placeholder="Will autodetect from pincode"
                  placeholderTextColor={colors.mutedForeground}
                  value={panditForm.city}
                />
              </View>

              {/* Address details */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>PANDIT VENUE ADDRESS</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Sector 2, Dashashwamedh, Varanasi, UP"
                  placeholderTextColor={colors.mutedForeground}
                  value={panditForm.address}
                  onChangeText={val => setPanditForm(prev => ({ ...prev, address: val }))}
                />
              </View>

              {/* Specializations (Chips input) */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>SPECIALIZATIONS</Text>
              <View style={styles.chipsWrap}>
                {panditForm.specializations.map(s => (
                  <View key={s} style={[styles.chip, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
                    <Pressable onPress={() => removeSpec(s)}>
                      <Feather name="x" size={12} color={colors.primary} />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={styles.chipAddRow}>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border, flex: 1, height: 40 }]}
                  placeholder="Add specialization"
                  placeholderTextColor={colors.mutedForeground}
                  value={specInput}
                  onChangeText={setSpecInput}
                />
                <Pressable style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addSpec}>
                  <Text style={styles.addChipBtnText}>Add</Text>
                </Pressable>
              </View>

              {/* Pooja services list */}
              <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>OFFERED POOJAS</Text>
              <View style={styles.poojasList}>
                {panditForm.poojas.map(p => (
                  <View key={p.id} style={[styles.poojaItem, { borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.poojaItemTitle, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.poojaItemPrice, { color: colors.primary }]}>₹{p.price.toLocaleString('en-IN')}</Text>
                    </View>
                    <Pressable onPress={() => removePooja(p.id)} style={{ padding: 4 }}>
                      <Feather name="trash-2" size={14} color={colors.destructive} />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={styles.addPoojaForm}>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border, flex: 2, height: 40 }]}
                  placeholder="Pooja name (e.g. Ganesh Puja)"
                  placeholderTextColor={colors.mutedForeground}
                  value={poojaName}
                  onChangeText={setPoojaName}
                />
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border, flex: 1, height: 40 }]}
                  placeholder="Price"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={poojaPrice}
                  onChangeText={setPoojaPrice}
                />
                <Pressable style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addPooja}>
                  <Text style={styles.addChipBtnText}>Add</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={handleSavePandit}
                disabled={isSubmitting || resolvingPin}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Pandit Profile</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Store Item Form Modal */}
      <Modal visible={storeItemModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle} />
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {storeItemForm.id ? 'Edit Store Item' : 'Create Store Item'}
              </Text>
              <Pressable onPress={() => setStoreItemModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 16 }]}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              {formError ? (
                <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                  <Feather name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              {/* Item Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>ITEM NAME</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Complete Havan Kit"
                  placeholderTextColor={colors.mutedForeground}
                  value={storeItemForm.name}
                  onChangeText={val => setStoreItemForm(prev => ({ ...prev, name: val }))}
                />
              </View>

              {/* Price & Unit */}
              <View style={styles.doubleFieldRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>PRICE (INR)</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. 1250"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    value={storeItemForm.price}
                    onChangeText={val => setStoreItemForm(prev => ({ ...prev, price: val }))}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>UNIT / PACK SIZE</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. 500g or Set of 5"
                    placeholderTextColor={colors.mutedForeground}
                    value={storeItemForm.unit}
                    onChangeText={val => setStoreItemForm(prev => ({ ...prev, unit: val }))}
                  />
                </View>
              </View>

              {/* Category */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>CATEGORY</Text>
              <View style={styles.categoryRow}>
                {(['samagri', 'utensils', 'premium'] as const).map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setStoreItemForm(prev => ({ ...prev, category: cat }))}
                    style={[
                      styles.categoryTab,
                      {
                        borderColor: storeItemForm.category === cat ? colors.primary : colors.border,
                        backgroundColor: storeItemForm.category === cat ? colors.primary + '12' : colors.card,
                      },
                    ]}
                  >
                    <Text style={[styles.categoryTabText, { color: storeItemForm.category === cat ? colors.primary : colors.text }]}>
                      {cat.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Featured toggle */}
              <View style={[styles.fieldGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }]}>
                <Text style={[styles.label, { color: colors.mutedForeground, marginBottom: 0 }]}>FEATURE ON HOMEPAGE</Text>
                <Switch
                  value={storeItemForm.featured}
                  onValueChange={val => setStoreItemForm(prev => ({ ...prev, featured: val }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border, height: 60, textAlignVertical: 'top' }]}
                  placeholder="Enter product description..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  value={storeItemForm.description}
                  onChangeText={val => setStoreItemForm(prev => ({ ...prev, description: val }))}
                />
              </View>

              {/* Image Upload */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>PRODUCT IMAGE</Text>
              <Pressable
                onPress={handleUploadStoreImage}
                disabled={uploadingStoreImage}
                style={[
                  styles.categoryTab,
                  {
                    borderColor: storeItemForm.imageUrl ? colors.primary : colors.border,
                    backgroundColor: storeItemForm.imageUrl ? colors.primary + '12' : colors.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                  },
                ]}
              >
                {uploadingStoreImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Feather name="upload-cloud" size={14} color={colors.primary} />
                    <Text style={[styles.categoryTabText, { color: colors.primary, fontFamily: f('bold') }]}>
                      {storeItemForm.imageUrl ? 'Product Image Uploaded' : 'Upload Product Image'}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={handleSaveStoreItem}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Store Item</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Banner Slide Modal */}
      <Modal visible={bannerModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalDragHandle} />
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                {editingBannerId ? t('editSlide') : t('addNewSlide')}
              </Text>
              <Pressable onPress={() => setBannerModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 16 }]}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideTitle')} (ENG)</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Special Offer\nSave 20%"
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.titleEn}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, titleEn: val }))}
                  multiline
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideTitle')} (HINDI)</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. विशेष ऑफर\n20% बचाएं"
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.titleHi}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, titleHi: val }))}
                  multiline
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideSubtitle')} (ENG)</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Book experienced pandits"
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.subtitleEn}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, subtitleEn: val }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideSubtitle')} (HINDI)</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. अनुभवी पंडितों से पूजन कराएं"
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.subtitleHi}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, subtitleHi: val }))}
                />
              </View>

              <View style={styles.doubleFieldRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideBadge')} (ENG)</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="OFFER"
                    placeholderTextColor={colors.mutedForeground}
                    value={bannerForm.badgeEn}
                    onChangeText={val => setBannerForm(prev => ({ ...prev, badgeEn: val }))}
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideBadge')} (HI)</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="ऑफर"
                    placeholderTextColor={colors.mutedForeground}
                    value={bannerForm.badgeHi}
                    onChangeText={val => setBannerForm(prev => ({ ...prev, badgeHi: val }))}
                  />
                </View>
              </View>

              <View style={styles.doubleFieldRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideButton')} (ENG)</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="BOOK NOW"
                    placeholderTextColor={colors.mutedForeground}
                    value={bannerForm.buttonTextEn}
                    onChangeText={val => setBannerForm(prev => ({ ...prev, buttonTextEn: val }))}
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideButton')} (HI)</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                    placeholder="अभी बुक करें"
                    placeholderTextColor={colors.mutedForeground}
                    value={bannerForm.buttonTextHi}
                    onChangeText={val => setBannerForm(prev => ({ ...prev, buttonTextHi: val }))}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideRoute')}</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. /poojas or /panchang"
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.route}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, route: val }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('slideImage')}</Text>
                <TextInput
                  style={[styles.inputField, { color: colors.text, borderColor: colors.border }]}
                  placeholder="https://..."
                  placeholderTextColor={colors.mutedForeground}
                  value={bannerForm.imageUrl}
                  onChangeText={val => setBannerForm(prev => ({ ...prev, imageUrl: val }))}
                />
              </View>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                onPress={handleSaveBanner}
              >
                <Text style={styles.saveBtnText}>{t('save')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Link Modal */}
      <Modal visible={resetLinkModal.visible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, margin: 20, borderRadius: 16, padding: 20 }]}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.text, marginBottom: 10 }}>Password Reset Link</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginBottom: 16 }}>
              A simulated password reset email would be sent to: {resetLinkModal.email}
            </Text>
            <View style={{ backgroundColor: colors.secondary, padding: 12, borderRadius: 8, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.primary }}>
                {resetLinkModal.link}
              </Text>
            </View>
            <Pressable
              style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => setResetLinkModal({ visible: false, link: '', email: '' })}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ─── Header ───────────────────────────────────────────────
  adminHeader: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  adminConsoleLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  adminTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },

  // ─── Stats Grid ───────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  statCardLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 8,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
  },
  statCardValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },

  // ─── Tabs ─────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // ─── Body ─────────────────────────────────────────────────
  body: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabContent: {
    padding: 20,
  },
  tabSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },

  // ─── Metric Grid (Dashboard) ───────────────────────────────
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8D5B7',
    borderLeftWidth: 4,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  metricCardFullRow: {
    width: '100%',
  },
  metricCardHalf: {
    flex: 1,
    minWidth: '45%',
  },
  metricCardIconBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#C89A3C18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },

  // ─── Search bar ───────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },

  // ─── Cards ────────────────────────────────────────────────
  cardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8D5B740',
    marginVertical: 10,
  },
  orderId: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  poojaNameText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  addressLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  addressText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },

  // ─── Status pill ──────────────────────────────────────────
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },

  // ─── Count badge ──────────────────────────────────────────
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },

  // ─── Action buttons ───────────────────────────────────────
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },

  // ─── CRUD header ──────────────────────────────────────────
  panditCrudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPanditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addPanditText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_700Bold' },

  // ─── Empty state ──────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },

  // ─── Back button ──────────────────────────────────────────
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  backBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },

  // ─── Language toggle ──────────────────────────────────────
  langToggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 2,
    alignItems: 'center',
  },
  langToggleItem: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  langToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  // ─── Modals ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw' as any,
      height: '100vh' as any,
      zIndex: 99999,
    } : {}),
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
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
  fieldGroup: { marginBottom: 14 },
  inputField: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryTabText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  doubleFieldRow: { flexDirection: 'row', gap: 10 },
  pinInputWrap: { flexDirection: 'row', alignItems: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  chipAddRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  addChipBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  addChipBtnText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_700Bold' },
  poojasList: { gap: 6, marginBottom: 8 },
  poojaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  poojaItemTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  poojaItemPrice: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  addPoojaForm: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },

  // ─── Login screen ─────────────────────────────────────────
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  loginBrandHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  loginBrandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  loginBrandSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1.5,
  },
  loginTitle: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  iconInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  iconInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  // ─── Warning (mobile restriction) ─────────────────────────
  warningCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  warningIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  warningBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  warningBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
