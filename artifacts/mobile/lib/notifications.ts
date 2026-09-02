import { Platform, Alert, Linking } from 'react-native';

// Safe check if expo-notifications is available
let NotificationsModule: any = null;
try {
  NotificationsModule = require('expo-notifications');
  if (NotificationsModule?.setNotificationHandler) {
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  // Not supported or missing in environment
}

/**
 * Requests push notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    Alert.alert('Notifications', 'Push notifications are not supported on web.');
    return false;
  }

  try {
    const Notifications = NotificationsModule || (await import('expo-notifications'));

    const { status: existing } = await Notifications.getPermissionsAsync();

    if (existing === 'granted') {
      return true;
    }

    if (existing === 'denied') {
      Alert.alert(
        'Notifications Blocked',
        'Please enable notifications in your device Settings to receive daily Panchang and pooja reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

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
          name: 'Sankalp Daily Panchang',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7B1F1F',
        });
      }
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Notifications permission error:', err);
    return false;
  }
}

/**
 * Schedules a daily morning Panchang notification at 6:30 AM local time.
 */
export async function scheduleDailyPanchangNotification(
  cityName: string = 'Pune',
  lang: 'en' | 'hi' | 'mr' = 'mr'
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const Notifications = NotificationsModule || (await import('expo-notifications'));
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return false;

    // Cancel existing panchang schedules to avoid duplicate alerts
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'daily_panchang') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const title =
      lang === 'mr'
        ? `🌅 आजचे पंचांग व शुभ मुहूर्त (${cityName})`
        : lang === 'hi'
        ? `🌅 आज का पंचांग एवं शुभ मुहूर्त (${cityName})`
        : `🌅 Today's Panchang & Muhurat (${cityName})`;

    const body =
      lang === 'mr'
        ? 'आजची तिथी, अभिजित मुहूर्त व शुभ विधी तपासा. राहुकाळात शुभ कार्ये टाळा.'
        : lang === 'hi'
        ? 'आज की तिथि, अभिजित मुहूर्त एवं पूजन समय जानें। राहुकाल से बचें।'
        : "Check today's Tithi, Abhijit Muhurat, and avoid Rahu Kaal window.";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'daily_panchang', city: cityName },
      },
      trigger: {
        hour: 6,
        minute: 30,
        repeats: true,
      } as any,
    });

    return true;
  } catch (err) {
    console.warn('Failed to schedule daily notification:', err);
    return false;
  }
}

/**
 * Triggers an immediate preview notification (fired in 1 second)
 * so the user can test the Panchang notification on their phone.
 */
export async function sendInstantPanchangPreview(
  cityName: string = 'Pune',
  lang: 'en' | 'hi' | 'mr' = 'mr'
): Promise<boolean> {
  if (Platform.OS === 'web') {
    Alert.alert('Notifications', 'Push notifications are not supported on web.');
    return false;
  }

  try {
    const Notifications = NotificationsModule || (await import('expo-notifications'));
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return false;

    const title =
      lang === 'mr'
        ? `🌅 आजचे पंचांग · ${cityName}`
        : lang === 'hi'
        ? `🌅 आज का पंचांग · ${cityName}`
        : `🌅 Today's Panchang · ${cityName}`;

    const body =
      lang === 'mr'
        ? 'दैनिक पंचांग सूचना यशस्वीरित्या सुरू झाली! दररोज सकाळी ६:३० वाजता आपल्याला मुहूर्त मिळतील.'
        : lang === 'hi'
        ? 'दैनिक पंचांग सूचना सक्रिय हो गई है! प्रतिदिन प्रातः ६:३० बजे मुहूर्त प्राप्त होंगे।'
        : 'Daily Panchang notifications active! You will receive daily 6:30 AM Muhurat updates.';

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'instant_preview' },
      },
      trigger: null, // deliver immediately
    });

    Alert.alert(
      lang === 'mr' ? 'सूचना सक्रिय झाली ✓' : 'Notifications Active ✓',
      lang === 'mr'
        ? `दररोज सकाळी ६:३० वाजता आपल्याला ${cityName} चे पंचांग व शुभ मुहूर्त मिळतील.`
        : `You will receive daily 6:30 AM Panchang and Muhurat alerts for ${cityName}.`,
      [{ text: 'OK' }]
    );

    return true;
  } catch (err) {
    console.warn('Failed to send preview notification:', err);
    return false;
  }
}
