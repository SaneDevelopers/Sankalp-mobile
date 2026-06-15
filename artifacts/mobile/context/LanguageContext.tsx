import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'hi';

// ─── Translation dictionary ───────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // Greeting / Home
    namaste: 'NAMASTE',
    guest: 'GUEST',
    titleLine1: 'Auspicious',
    titleLine2: 'Beginnings',
    auspicious: 'Good',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    location: 'Lucknow, Uttar Pradesh',

    // Home sections
    sacredServices: 'Sacred Services',
    pooja: 'Pooja',
    poojaSub: '50+ rituals',
    havan: 'Havan',
    havanSub: 'Sacred fire rituals',
    featuredPoojas: 'Featured Poojas',
    viewAll: 'VIEW ALL',
    bestsellerTitle: 'Bestseller Pooja Samagri',
    bestsellerSub: 'Most ordered ritual essentials',
    bookBtn: 'BOOK',
    searchPlaceholder: 'Search poojas, pandits...',

    // Festival banner
    festivalSpecial: 'FESTIVAL SPECIAL',
    festivalTitleLine1: 'Diwali Lakshmi',
    festivalTitleLine2: 'Pooja',
    festivalSub: 'Book before Oct 28 · Save 20%',
    bookNow: 'BOOK NOW',

    // Pandits screen
    trustedPandits: 'Trusted Pandits',
    availableToday: 'AVAILABLE TODAY',
    tomorrow: 'TOMORROW',
    nextWeek: 'NEXT WEEK',
    filterAll: 'ALL',
    filterVedic: 'VEDIC',
    filterAstrology: 'ASTROLOGY',
    filterHavan: 'HAVAN',

    // Bookings screen
    bookingHistory: 'Booking History',
    sacredJourney: 'Your sacred journey',
    rituals: 'rituals',
    noBookings: 'No bookings found',
    filterUpcoming: 'UPCOMING',
    filterCompleted: 'COMPLETED',

    // Store screen
    samagriStore: 'Samagri Store',
    storeSamagri: 'Samagri',
    storeUtensils: 'Utensils',
    searchStore: 'Search items...',
    addToCart: 'ADD',
    featuredItem: 'FEATURED',
    inStock: 'In Stock',

    // Profile screen
    editProfile: 'Edit Profile',
    myBookings: 'My Bookings',
    savedPandits: 'Saved Pandits & Poojas',
    orderHistory: 'Order History',
    savedAddresses: 'Saved Addresses',
    notifications: 'Notifications',
    helpSupport: 'Help & Support',
    settings: 'Settings',
    logout: 'Logout',
    totalBookings: 'Bookings',
    totalOrders: 'Orders',
    spent: 'Spent',
    memberSince: 'Member since',
    adminConsole: 'Admin Console',
    dashboard: 'Dashboard',
    orders: 'Orders',
    bookings: 'Bookings',
    pandits: 'Pandits',
    adminLoginTitle: 'Admin Portal Login',
    adminEmailLabel: 'ADMIN EMAIL',
    adminPasswordLabel: 'PASSWORD',
    adminLoginBtn: 'Sign In',
    adminInvalidCreds: 'Invalid email or password',
    webOnlyTitle: 'Web Access Only',
    webOnlyDesc: 'The Admin Console is restricted to desktop web browsers for operational security and optimization. Please log in from a computer.',
    adminLogout: 'Logout',

    // Common
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Something went wrong',

    // Pooja / Pandit data keys
    'Satyanarayan Katha': 'Satyanarayan Katha',
    'Griha Pravesh': 'Griha Pravesh',
    'Navagraha Shanti': 'Navagraha Shanti',
    'Rudra Abhishek': 'Rudra Abhishek',
    '1.5 Hrs': '1.5 Hrs',
    '2 Hrs': '2 Hrs',
    '1 Hr': '1 Hr',
    '2.5 Hrs': '2.5 Hrs',
    'Complete Havan Kit': 'Complete Havan Kit',
    'Brass Pooja Thali': 'Brass Pooja Thali',
    'Sandalwood Agarbatti': 'Sandalwood Agarbatti',
    'Rudraksh Mala': 'Rudraksh Mala',
    'Panchamrit Kit': 'Panchamrit Kit',
    'Pure Cow Ghee': 'Pure Cow Ghee',
    '100% organic · 750g': '100% organic · 750g',
    'Set of 7 items': 'Set of 7 items',
    'Pack of 40 sticks': 'Pack of 40 sticks',
    '108 beads · 5 Mukhi': '108 beads · 5 Mukhi',
    'Ready to use': 'Ready to use',
    '500ml · Pure A2': '500ml · Pure A2',
    '🏆 Bestseller': '🏆 Bestseller',
    '⭐ Popular': '⭐ Popular',
    '✨ Trending': '✨ Trending',
    '🔥 Top Pick': '🔥 Top Pick',
    'Vedic Rituals Specialist': 'Vedic Rituals Specialist',
    'Astrology & Jyotish Expert': 'Astrology & Jyotish Expert',
    'Griha Pravesh Specialist': 'Griha Pravesh Specialist',
    'Havan & Yagna Expert': 'Havan & Yagna Expert',
    '15+ Yrs': '15+ Yrs',
    '12 Yrs': '12 Yrs',
    '8 Yrs': '8 Yrs',
    '20 Yrs': '20 Yrs',
    'Varanasi': 'Varanasi',
    'Ujjain': 'Ujjain',
    'Delhi NCR': 'Delhi NCR',
    'Allahabad': 'Allahabad',
  },
  hi: {
    // Greeting / Home
    namaste: 'नमस्ते',
    guest: 'अतिथि',
    titleLine1: 'शुभ',
    titleLine2: 'शुरुआत',
    auspicious: 'शुभ',
    morning: 'प्रभात',
    afternoon: 'दोपहर',
    evening: 'संध्या',
    location: 'लखनऊ, उत्तर प्रदेश',

    // Home sections
    sacredServices: 'पवित्र सेवाएँ',
    pooja: 'पूजा',
    poojaSub: '50+ अनुष्ठान',
    havan: 'हवन',
    havanSub: 'पवित्र अग्नि अनुष्ठान',
    featuredPoojas: 'विशेष पूजाएँ',
    viewAll: 'सभी देखें',
    bestsellerTitle: 'बेस्टसेलर पूजा सामग्री',
    bestsellerSub: 'सबसे अधिक ऑर्डर किए जाने वाले अनुष्ठान',
    bookBtn: 'बुक करें',
    searchPlaceholder: 'पूजा, पंडित खोजें...',

    // Festival banner
    festivalSpecial: 'त्यौहार विशेष',
    festivalTitleLine1: 'दीवाली लक्ष्मी',
    festivalTitleLine2: 'पूजा',
    festivalSub: '28 अक्टूबर से पहले बुक करें · 20% बचाएं',
    bookNow: 'अभी बुक करें',

    // Pandits screen
    trustedPandits: 'विश्वसनीय पंडित',
    availableToday: 'आज उपलब्ध',
    tomorrow: 'कल',
    nextWeek: 'अगले सप्ताह',
    filterAll: 'सभी',
    filterVedic: 'वैदिक',
    filterAstrology: 'ज्योतिष',
    filterHavan: 'हवन',

    // Bookings screen
    bookingHistory: 'बुकिंग इतिहास',
    sacredJourney: 'आपकी पवित्र यात्रा',
    rituals: 'अनुष्ठान',
    noBookings: 'कोई बुकिंग नहीं मिली',
    filterUpcoming: 'आगामी',
    filterCompleted: 'पूर्ण',

    // Store screen
    samagriStore: 'सामग्री स्टोर',
    storeSamagri: 'सामग्री',
    storeUtensils: 'बर्तन',
    searchStore: 'वस्तु खोजें...',
    addToCart: 'जोड़ें',
    featuredItem: 'विशेष',
    inStock: 'स्टॉक में',

    // Profile screen
    editProfile: 'प्रोफाइल संपादित करें',
    myBookings: 'मेरी बुकिंग',
    savedPandits: 'सहेजे गए पंडित और पूजाएँ',
    orderHistory: 'ऑर्डर इतिहास',
    savedAddresses: 'सहेजे गए पते',
    notifications: 'सूचनाएं',
    helpSupport: 'सहायता और समर्थन',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    totalBookings: 'बुकिंग',
    totalOrders: 'ऑर्डर',
    spent: 'खर्च',
    memberSince: 'सदस्य बने',
    adminConsole: 'एडमिन कंसोल',
    dashboard: 'डैशबोर्ड',
    orders: 'ऑर्डर',
    bookings: 'बुकिंग',
    pandits: 'पंडित',
    adminLoginTitle: 'एडमिन पोर्टल लॉगिन',
    adminEmailLabel: 'एडमिन ईमेल',
    adminPasswordLabel: 'पासवर्ड',
    adminLoginBtn: 'साइन इन करें',
    adminInvalidCreds: 'अमान्य ईमेल या पासवर्ड',
    webOnlyTitle: 'केवल वेब एक्सेस',
    webOnlyDesc: 'परिचालन सुरक्षा और अनुकूलन के लिए एडमिन कंसोल केवल कंप्यूटर वेब ब्राउज़र पर उपलब्ध है। कृपया कंप्यूटर से लॉगिन करें।',
    adminLogout: 'लॉगआउट',

    // Common
    back: 'वापस',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    confirm: 'पुष्टि करें',
    loading: 'लोड हो रहा है...',
    error: 'कुछ गलत हो गया',

    // Pooja / Pandit data keys
    'Satyanarayan Katha': 'सत्यनारायण कथा',
    'Griha Pravesh': 'गृह प्रवेश',
    'Navagraha Shanti': 'नवग्रह शांति',
    'Rudra Abhishek': 'रुद्राभिषेक',
    '1.5 Hrs': '1.5 घंटे',
    '2 Hrs': '2 घंटे',
    '1 Hr': '1 घंटा',
    '2.5 Hrs': '2.5 घंटे',
    'Complete Havan Kit': 'सम्पूर्ण हवन किट',
    'Brass Pooja Thali': 'पीतल पूजा थाली',
    'Sandalwood Agarbatti': 'चंदन अगरबत्ती',
    'Rudraksh Mala': 'रुद्राक्ष माला',
    'Panchamrit Kit': 'पंचामृत किट',
    'Pure Cow Ghee': 'शुद्ध गाय का घी',
    '100% organic · 750g': '100% जैविक · 750 ग्राम',
    'Set of 7 items': '7 वस्तुओं का सेट',
    'Pack of 40 sticks': '40 स्टिक्स का पैक',
    '108 beads · 5 Mukhi': '108 मनके · 5 मुखी',
    'Ready to use': 'तैयार किट',
    '500ml · Pure A2': '500 मि.ली. · शुद्ध A2',
    '🏆 Bestseller': '🏆 बेस्टसेलर',
    '⭐ Popular': '⭐ लोकप्रिय',
    '✨ Trending': '✨ ट्रेंडिंग',
    '🔥 Top Pick': '🔥 शीर्ष विकल्प',
    'Vedic Rituals Specialist': 'वैदिक अनुष्ठान विशेषज्ञ',
    'Astrology & Jyotish Expert': 'ज्योतिष विशेषज्ञ',
    'Griha Pravesh Specialist': 'गृह प्रवेश विशेषज्ञ',
    'Havan & Yagna Expert': 'हवन और यज्ञ विशेषज्ञ',
    '15+ Yrs': '15+ वर्ष',
    '12 Yrs': '12 वर्ष',
    '8 Yrs': '8 वर्ष',
    '20 Yrs': '20 वर्ष',
    'Varanasi': 'वाराणसी',
    'Ujjain': 'उज्जैन',
    'Delhi NCR': 'दिल्ली एनसीआर',
    'Allahabad': 'इलाहाबाद',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

// ─── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  t: (key: TranslationKey | string) => string;
  /** Font family selector — Poppins for Hindi, Inter for English */
  f: (style: 'regular' | 'medium' | 'semibold' | 'bold') => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: async () => {},
  t: (k) => k,
  f: () => 'Inter_400Regular',
});

const STORAGE_KEY = '@sankalp:language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'hi' || v === 'en') setLangState(v);
    });
  }, []);

  const setLang = useCallback(async (newLang: Lang) => {
    setLangState(newLang);
    await AsyncStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = TRANSLATIONS[lang] as Record<string, string>;
      return dict[key] ?? key;
    },
    [lang]
  );

  const f = useCallback(
    (style: 'regular' | 'medium' | 'semibold' | 'bold'): string => {
      const hiMap = {
        regular: 'Poppins_400Regular',
        medium: 'Poppins_500Medium',
        semibold: 'Poppins_600SemiBold',
        bold: 'Poppins_700Bold',
      };
      const enMap = {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
      };
      return lang === 'hi' ? hiMap[style] : enMap[style];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, f }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
