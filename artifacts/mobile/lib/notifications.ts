import { Platform, Alert, Linking } from 'react-native';

/**
 * Requests push notification permission.
 * Uses dynamic import so expo-notifications doesn't crash
 * when native module is unavailable (e.g. Expo Go).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    Alert.alert('Notifications', 'Push notifications are not supported on web.');
    return false;
  }

  try {
    // Dynamic import — won't crash the app if native module is missing
    const Notifications = await import('expo-notifications');

    const { status: existing } = await Notifications.getPermissionsAsync();

    if (existing === 'granted') {
      Alert.alert(
        'Notifications Enabled ✓',
        'You will receive updates about your bookings, offers, and festival reminders.',
        [{ text: 'OK' }],
      );
      return true;
    }

    if (existing === 'denied') {
      Alert.alert(
        'Notifications Blocked',
        'Please enable notifications in your device Settings to receive pooja reminders and special offers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }

    // First time — request permission
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    if (status === 'granted') {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Sankalp Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7B1F1F',
        });
      }
      return true;
    }

    return false;
  } catch (err) {
    // Native module not available (Expo Go without dev build)
    Alert.alert(
      'Notifications',
      'To enable push notifications, please use a development build of the app.',
      [{ text: 'OK' }],
    );
    return false;
  }
}
