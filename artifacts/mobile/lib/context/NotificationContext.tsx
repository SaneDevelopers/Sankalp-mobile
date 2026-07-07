import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export interface AppNotification {
  id: string;
  type: 'booking' | 'order' | 'offer' | 'reminder' | 'general';
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (type: AppNotification['type'], title: string, body: string, icon: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string; type: AppNotification['type'] } | null>(null);
  
  // Animation for drop-down toast
  const translateY = useState(new Animated.Value(-120))[0];

  // Load notifications from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('@sankalp:notifications').then(val => {
      if (val) {
        try {
          setNotifications(JSON.parse(val));
        } catch (e) {
          console.error(e);
        }
      } else {
        const DEFAULTS: AppNotification[] = [
          { id: 'n1', type: 'booking', icon: 'calendar', title: 'Booking Confirmed!', body: 'Your Satyanarayan Katha with Acharya Shastri on 15 Oct at 9:30 AM is confirmed.', time: '2 hrs ago', read: false, createdAt: new Date().toISOString() },
          { id: 'n2', type: 'offer', icon: 'tag', title: 'Diwali Special — 20% Off', body: 'Book any Diwali special pooja before Oct 28 and save 20%. Limited slots!', time: '5 hrs ago', read: false, createdAt: new Date().toISOString() },
          { id: 'n3', type: 'reminder', icon: 'bell', title: 'Upcoming Pooja Reminder', body: 'Your Satyanarayan Katha is tomorrow at 9:30 AM. Make sure to be ready with the samagri.', time: '1 day ago', read: true, createdAt: new Date().toISOString() }
        ];
        setNotifications(DEFAULTS);
        AsyncStorage.setItem('@sankalp:notifications', JSON.stringify(DEFAULTS));
      }
    });
  }, []);

  // Save notifications to AsyncStorage when changed
  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    AsyncStorage.setItem('@sankalp:notifications', JSON.stringify(newNotifs));
  };

  const showToast = (title: string, body: string, type: AppNotification['type']) => {
    setActiveToast({ title, body, type });
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: 20,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveToast(null);
    });
  };

  const addNotification = (type: AppNotification['type'], title: string, body: string, icon: string) => {
    const newNotif: AppNotification = {
      id: 'n_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type,
      icon,
      title,
      body,
      time: 'Just now',
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotif, ...notifications];
    saveNotifications(updated);
    showToast(title, body, type);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const TYPE_ICONS: Record<string, string> = {
    booking: 'calendar',
    order: 'package',
    offer: 'tag',
    reminder: 'bell',
    general: 'info',
  };

  const TYPE_COLORS: Record<string, string> = {
    booking: '#7B1F1F',
    order: '#D4722A',
    offer: '#D4722A',
    reminder: '#C89A3C',
    general: '#5C3317',
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount }}>
      {children}
      {activeToast && (
        <Animated.View style={[
          styles.toastContainer, 
          { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            transform: [{ translateY }],
          }
        ]}>
          <View style={[styles.iconWrap, { backgroundColor: TYPE_COLORS[activeToast.type] + '15' }]}>
            <Feather name={TYPE_ICONS[activeToast.type] as any} size={20} color={TYPE_COLORS[activeToast.type]} />
          </View>
          <View style={styles.toastContent}>
            <Text style={[styles.toastTitle, { color: colors.text }]} numberOfLines={1}>{activeToast.title}</Text>
            <Text style={[styles.toastBody, { color: colors.mutedForeground }]} numberOfLines={2}>{activeToast.body}</Text>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  toastBody: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
});
