import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAuthMe,
  getAuthMeQueryKey,
  useAuthUpdateProfile,
  useGetBookings,
  getGetBookingsQueryKey,
  useGetOrders,
  getGetOrdersQueryKey,
} from '@workspace/api-client-react';
import { useNavigation } from 'expo-router';

const TAB_BAR_HEIGHT = Platform.OS === 'web' ? 84 : 60;

import { useLanguage } from '@/context/LanguageContext';

const MENU_ITEMS = [
  { id: 'm1', labelKey: 'editProfile', icon: 'user', route: '/edit-profile' },
  { id: 'm2', labelKey: 'myBookings', icon: 'calendar', route: '/(tabs)/bookings' },
  { id: 'm3', labelKey: 'savedPandits', icon: 'heart', route: '/favorites' },
  { id: 'm4', labelKey: 'orderHistory', icon: 'package', route: '/order-history' },
  { id: 'm5', labelKey: 'savedAddresses', icon: 'map-pin', route: '/addresses' },
  { id: 'm6', labelKey: 'notifications', icon: 'bell', route: '/notifications' },
  { id: 'm7', labelKey: 'helpSupport', icon: 'help-circle', route: '/help' },
  { id: 'm8', labelKey: 'settings', icon: 'settings', route: '/settings' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const navigation = useNavigation();
  const { t, f } = useLanguage();
  const queryClient = useQueryClient();
  const { pickAndUploadImage, uploading } = useImageUpload();
  const { mutateAsync: updateProfile } = useAuthUpdateProfile();

  const { data: user } = useAuthMe();

  const handleUploadProfileImage = async () => {
    if (!user) return;
    const url = await pickAndUploadImage();
    if (url) {
      try {
        await updateProfile({
          data: {
            name: user.name,
            profileImage: url,
          }
        });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
      } catch (err) {
        console.error('Error updating profile image:', err);
      }
    }
  };
  const { data: bookings = [], refetch: refetchBookings } = useGetBookings({
    query: {
      enabled: !!user,
      queryKey: getGetBookingsQueryKey(),
    },
  });

  const { data: orders = [], refetch: refetchOrders } = useGetOrders({
    query: {
      enabled: !!user,
      queryKey: getGetOrdersQueryKey(),
    },
  });

  React.useEffect(() => {
    if (user) {
      refetchBookings();
      refetchOrders();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        refetchBookings();
        refetchOrders();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const displayName = user?.name || t('guest');
  const displayContact = user?.phone || user?.email || "Sign in to sync your profile";
  const avatarLetter = displayName[0].toUpperCase();

  const statsBookings = user ? bookings.length.toString() : "12";

  let totalSpent = 0;
  if (user) {
    bookings.forEach(b => {
      if (b.status === 'completed' || b.status === 'upcoming') {
        totalSpent += b.amount;
      }
    });
    orders.forEach(o => {
      if (o.status === 'delivered' || o.status === 'processing' || o.status === 'in_transit') {
        totalSpent += o.amount;
      }
    });
  }
  const statsSpent = user ? `₹${totalSpent.toLocaleString('en-IN')}` : "₹24K";

  let statsPandits = "8";
  if (user) {
    const uniquePandits = new Set(bookings.map(b => b.panditId));
    statsPandits = uniquePandits.size.toString();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.primary, paddingTop: topPadding + 24 }]}>
        <View style={styles.omContainer}>
          <Text style={styles.omSymbol}>ॐ</Text>
        </View>
        <Pressable 
          style={[styles.avatarRing, { borderColor: colors.gold }]}
          onPress={handleUploadProfileImage}
          disabled={uploading}
        >
          {user?.profileImage ? (
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.avatarImage} 
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.orange }]}>
              <Text style={[styles.avatarText, { fontFamily: f('bold') }]}>{avatarLetter}</Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.gold }]}>
            <Feather name="camera" size={10} color="#FFFFFF" />
          </View>
        </Pressable>
        <Text style={[styles.devoteeLabel, { fontFamily: f('semibold') }]}>{t('namaste')}</Text>
        <Text style={[styles.name, { fontFamily: f('bold') }]}>{displayName}</Text>
        <Text style={[styles.phone, { fontFamily: f('regular') }]}>{displayContact}</Text>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { fontFamily: f('bold') }]}>{statsBookings}</Text>
            <Text style={[styles.statLabel, { fontFamily: f('semibold') }]}>{t('totalBookings').toUpperCase()}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { fontFamily: f('bold') }]}>{statsSpent}</Text>
            <Text style={[styles.statLabel, { fontFamily: f('semibold') }]}>{t('spent').toUpperCase()}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { fontFamily: f('bold') }]}>{statsPandits}</Text>
            <Text style={[styles.statLabel, { fontFamily: f('semibold') }]}>{t('trustedPandits').split(' ')[1]?.toUpperCase() || t('trustedPandits').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[
              styles.menuItem,
              idx < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              if (item.route) router.push(item.route as any);
            }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Feather name={item.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text, fontFamily: f('medium') }]}>{t(item.labelKey)}</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Admin Console */}
      <Pressable
        style={[styles.adminBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/admin' as any);
        }}
      >
        <Feather name="bar-chart-2" size={18} color="#FFFFFF" />
        <Text style={[styles.adminBtnText, { fontFamily: f('semibold') }]}>{t('adminConsole')}</Text>
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  omContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.15,
  },
  omSymbol: { fontSize: 60, color: '#FFFFFF' },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 28 },
  devoteeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  name: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  phone: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.5 },
  statDivider: { width: 1, height: 36 },
  menuCard: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  adminBtnText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
