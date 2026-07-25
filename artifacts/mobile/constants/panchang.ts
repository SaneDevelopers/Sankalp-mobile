export interface PanchangDetail {
  tithi: {
    en: string;
    hi: string;
    number: number;
    pakshaEn: 'Shukla' | 'Krishna';
    pakshaHi: 'शुक्ल' | 'कृष्ण';
    until: string;
  };
  nakshatra: {
    en: string;
    hi: string;
    until: string;
  };
  yoga: {
    en: string;
    hi: string;
  };
  karana: {
    en: string;
    hi: string;
  };
  sunrise: string;
  sunset: string;
  rahukalam: {
    start: string;
    end: string;
  };
  abhijitMuhurat: {
    start: string;
    end: string;
  };
  auspiciousStatus: {
    en: string;
    hi: string;
    isHighlyAuspicious: boolean;
  };
  recommendedPoojas: Array<{
    poojaId: string;
    nameEn: string;
    nameHi: string;
    reasonEn: string;
    reasonHi: string;
    panditId: string;
  }>;
}

const TITHIS = [
  { en: 'Pratipada', hi: 'प्रतिपदा' },
  { en: 'Dwitiya', hi: 'द्वितीया' },
  { en: 'Tritiya', hi: 'तृतीया' },
  { en: 'Chaturthi', hi: 'चतुर्थी' },
  { en: 'Panchami', hi: 'पंचमी' },
  { en: 'Shashthi', hi: 'षष्ठी' },
  { en: 'Saptami', hi: 'सप्तमी' },
  { en: 'Ashtami', hi: 'अष्टमी' },
  { en: 'Navami', hi: 'नवमी' },
  { en: 'Dashami', hi: 'दशमी' },
  { en: 'Ekadashi', hi: 'एकादशी' },
  { en: 'Dwadashi', hi: 'द्वादशी' },
  { en: 'Trayodashi', hi: 'त्रयोदशी' },
  { en: 'Chaturdashi', hi: 'चतुर्दशी' },
  { en: 'Purnima', hi: 'पूर्णिमा' },
  { en: 'Amavasya', hi: 'अमावस्या' },
];

const NAKSHATRAS = [
  { en: 'Ashwini', hi: 'अश्विनी' },
  { en: 'Bharani', hi: 'भरणी' },
  { en: 'Krittika', hi: 'कृत्तिका' },
  { en: 'Rohini', hi: 'रोहिणी' },
  { en: 'Mrigashira', hi: 'मृगशिरा' },
  { en: 'Ardra', hi: 'आर्द्रा' },
  { en: 'Punarvasu', hi: 'पुनर्वसु' },
  { en: 'Pushya', hi: 'पुष्य' },
  { en: 'Ashlesha', hi: 'आश्लेषा' },
  { en: 'Magha', hi: 'मघा' },
  { en: 'Purva Phalguni', hi: 'पूर्वा फाल्गुनी' },
  { en: 'Uttara Phalguni', hi: 'उत्तरा फाल्गुनी' },
  { en: 'Hasta', hi: 'हस्त' },
  { en: 'Chitra', hi: 'चित्रा' },
  { en: 'Swati', hi: 'स्वाती' },
  { en: 'Vishakha', hi: 'विशाखा' },
  { en: 'Anuradha', hi: 'अनुराधा' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठा' },
  { en: 'Mula', hi: 'मूल' },
  { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा' },
  { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा' },
  { en: 'Shravana', hi: 'श्रवण' },
  { en: 'Dhanishta', hi: 'धनिष्ठा' },
  { en: 'Shatabhisha', hi: 'शतभिषा' },
  { en: 'Purva Bhadrapada', hi: 'पूर्वाभाद्रपद' },
  { en: 'Uttara Bhadrapada', hi: 'उत्तराभाद्रपद' },
  { en: 'Revati', hi: 'रेवती' },
];

const YOGAS = [
  { en: 'Siddhi', hi: 'सिद्धि' },
  { en: 'Shubha', hi: 'शुभ' },
  { en: 'Ayushman', hi: 'आयुष्मान' },
  { en: 'Saubhagya', hi: 'सौभाग्य' },
  { en: 'Dhriti', hi: 'धृति' },
  { en: 'Harshana', hi: 'हर्षण' },
  { en: 'Viddhi', hi: 'वृद्धि' },
];

const KARANAS = [
  { en: 'Bava', hi: 'बव' },
  { en: 'Balava', hi: 'बालव' },
  { en: 'Kaulava', hi: 'कौलव' },
  { en: 'Taitila', hi: 'तैतिल' },
  { en: 'Gara', hi: 'गर' },
  { en: 'Vanija', hi: 'वणिज' },
  { en: 'Vishti', hi: 'विष्टि' },
];

const RAHU_TIMES = [
  { start: '07:30 AM', end: '09:00 AM' },
  { start: '09:00 AM', end: '10:30 AM' },
  { start: '10:30 AM', end: '12:00 PM' },
  { start: '12:00 PM', end: '01:30 PM' },
  { start: '01:30 PM', end: '03:00 PM' },
  { start: '03:00 PM', end: '04:30 PM' },
  { start: '04:30 PM', end: '06:00 PM' },
];

const POOJA_RECOMMENDATIONS = [
  {
    poojaId: 'p1',
    nameEn: 'Satyanarayan Katha',
    nameHi: 'श्री सत्यनारायण व्रत कथा',
    reasonEn: 'Highly auspicious tithi for prosperity, family harmony, and wish fulfillment.',
    reasonHi: 'सुख-समृद्धि, पारिवारिक शांति और मनोकामना पूर्ति के लिए आज का दिन अत्यंत शुभ है।',
    panditId: '1',
  },
  {
    poojaId: 'p2',
    nameEn: 'Rudra Abhishek',
    nameHi: 'रुद्राभिषेक पूजन',
    reasonEn: 'Favorable planetary alignment for health, peace, and removal of obstacles.',
    reasonHi: 'स्वास्थ्य लाभ, मानसिक शांति और कष्ट निवारण के लिए शिवजी का अभिषेक उत्तम है।',
    panditId: '1',
  },
  {
    poojaId: 'p3',
    nameEn: 'Navagraha Shanti',
    nameHi: 'नवग्रह शांति पूजा',
    reasonEn: 'Ideal day to pacify planet doshas and attract positive energy.',
    reasonHi: 'ग्रह दोषों के प्रभाव को शांत करने और सकारात्मक ऊर्जा प्राप्त करने हेतु उपयुक्त।',
    panditId: '2',
  },
  {
    poojaId: 'p4',
    nameEn: 'Griha Pravesh Pooja',
    nameHi: 'गृह प्रवेश एवं वास्तु पूजा',
    reasonEn: 'Auspicious Sthira Muhurat for home blessing and new beginnings.',
    reasonHi: 'नए घर के प्रवेश और वास्तु शांति के लिए स्थिर शुभ मुहूर्त।',
    panditId: '3',
  },
];

export function getPanchangForDate(date: Date): PanchangDetail {
  // Deterministic daily calculation based on day offset
  const dayOffset = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  
  const tithiIdx = Math.abs(dayOffset % 15);
  const isPurnima = tithiIdx === 14 && (dayOffset % 30 === 14);
  const isAmavasya = tithiIdx === 14 && (dayOffset % 30 !== 14);
  
  let tithiItem = TITHIS[tithiIdx];
  if (isPurnima) tithiItem = TITHIS[14]; // Purnima
  if (isAmavasya) tithiItem = TITHIS[15]; // Amavasya
  
  const pakshaIsShukla = (dayOffset % 30) < 15;
  const nakshatraItem = NAKSHATRAS[Math.abs((dayOffset * 3) % NAKSHATRAS.length)];
  const yogaItem = YOGAS[Math.abs((dayOffset * 2) % YOGAS.length)];
  const karanaItem = KARANAS[Math.abs((dayOffset + 1) % KARANAS.length)];
  const rahuTime = RAHU_TIMES[date.getDay()];

  const isHighlyAuspicious = tithiIdx === 10 || tithiIdx === 4 || tithiIdx === 8 || isPurnima;

  const rec1 = POOJA_RECOMMENDATIONS[dayOffset % POOJA_RECOMMENDATIONS.length];
  const rec2 = POOJA_RECOMMENDATIONS[(dayOffset + 1) % POOJA_RECOMMENDATIONS.length];

  return {
    tithi: {
      en: tithiItem.en,
      hi: tithiItem.hi,
      number: tithiIdx + 1,
      pakshaEn: pakshaIsShukla ? 'Shukla' : 'Krishna',
      pakshaHi: pakshaIsShukla ? 'शुक्ल' : 'कृष्ण',
      until: '08:45 PM',
    },
    nakshatra: {
      en: nakshatraItem.en,
      hi: nakshatraItem.hi,
      until: '11:20 PM',
    },
    yoga: {
      en: yogaItem.en,
      hi: yogaItem.hi,
    },
    karana: {
      en: karanaItem.en,
      hi: karanaItem.hi,
    },
    sunrise: '05:42 AM',
    sunset: '06:58 PM',
    rahukalam: rahuTime,
    abhijitMuhurat: {
      start: '11:48 AM',
      end: '12:38 PM',
    },
    auspiciousStatus: {
      en: isHighlyAuspicious ? 'Highly Auspicious Day for Pooja' : 'Auspicious Day for Rituals',
      hi: isHighlyAuspicious ? 'पूजा एवं अनुष्ठान के लिए अत्यंत शुभ दिन' : 'सर्वदेव पूजन हेतु शुभ समय',
      isHighlyAuspicious,
    },
    recommendedPoojas: [rec1, rec2],
  };
}
