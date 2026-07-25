import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BannerSlide {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  badgeEn: string;
  badgeHi: string;
  imageUrl?: string;
  buttonTextEn: string;
  buttonTextHi: string;
  route: string;
  bgGradient: [string, string];
  active: boolean;
  type: 'offer' | 'festival' | 'panchang' | 'custom';
}

const STORAGE_KEY = '@sankalp:home_banners_v1';

export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'b1',
    titleEn: 'Diwali Special\nLakshmi Pooja',
    titleHi: 'दीपावली विशेष\nमहालक्ष्मी पूजन',
    subtitleEn: 'Book certified Vedic Pandits · Save 20%',
    subtitleHi: 'अनुभवी वैदिक पंडितों द्वारा पूजन · 20% छूट',
    badgeEn: 'FESTIVAL OFFER',
    badgeHi: 'त्यौहार ऑफर',
    buttonTextEn: 'BOOK NOW',
    buttonTextHi: 'अभी बुक करें',
    route: '/poojas',
    bgGradient: ['#E65100', '#BF360C'],
    active: true,
    type: 'offer',
  },
  {
    id: 'b2',
    titleEn: 'Today\'s Panchang\n& Shubh Muhurat',
    titleHi: 'आज का पंचांग\nएवं शुभ मुहूर्त',
    subtitleEn: 'Tithi, Nakshatra & Auspicious Pooja timing',
    subtitleHi: 'आज की तिथि, नक्षत्र और पूजा का शुभ समय देखें',
    badgeEn: 'HINDU CALENDAR',
    badgeHi: 'पंचांग दर्शन',
    buttonTextEn: 'VIEW PANCHANG',
    buttonTextHi: 'पंचांग देखें',
    route: '/panchang',
    bgGradient: ['#4A148C', '#311B92'],
    active: true,
    type: 'panchang',
  },
  {
    id: 'b3',
    titleEn: 'Mahamrityunjaya\nJaap & Havan',
    titleHi: 'महामृत्युंजय\nजाप एवं हवन',
    subtitleEn: 'Special 15% discount on family rituals',
    subtitleHi: 'पारिवारिक सुख-शांति हेतु विशेष 15% छूट',
    badgeEn: '15% DISCOUNT',
    badgeHi: '15% छूट',
    buttonTextEn: 'EXPLORE NOW',
    buttonTextHi: 'विवरण देखें',
    route: '/poojas?category=havan',
    bgGradient: ['#D84315', '#880E4F'],
    active: true,
    type: 'offer',
  },
];

export async function getHomeBanners(): Promise<BannerSlide[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as BannerSlide[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error fetching home banners:', err);
  }
  return DEFAULT_BANNERS;
}

export async function saveHomeBanners(banners: BannerSlide[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    return true;
  } catch (err) {
    console.error('Error saving home banners:', err);
    return false;
  }
}
