import * as Astronomy from '@/lib/astronomy';

export interface MaharashtraCity {
  id: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  lat: number;
  lng: number;
  elevation: number;
}

export const MAHARASHTRA_CITIES: MaharashtraCity[] = [
  { id: 'pune', nameEn: 'Pune', nameMr: 'पुणे', nameHi: 'पुणे', lat: 18.5204, lng: 73.8567, elevation: 560 },
  { id: 'mumbai', nameEn: 'Mumbai', nameMr: 'मुंबई', nameHi: 'मुंबई', lat: 19.0760, lng: 72.8777, elevation: 14 },
  { id: 'nagpur', nameEn: 'Nagpur', nameMr: 'नागपूर', nameHi: 'नागपुर', lat: 21.1458, lng: 79.0882, elevation: 310 },
  { id: 'nashik', nameEn: 'Nashik', nameMr: 'नाशिक', nameHi: 'नासिक', lat: 19.9975, lng: 73.7898, elevation: 600 },
  { id: 'csn', nameEn: 'Chh. Sambhajinagar', nameMr: 'छत्रपती संभाजीनगर', nameHi: 'छत्रपति संभाजीनगर', lat: 19.8762, lng: 75.3433, elevation: 568 },
  { id: 'kolhapur', nameEn: 'Kolhapur', nameMr: 'कोल्हापूर', nameHi: 'कोल्हापुर', lat: 16.7050, lng: 74.2433, elevation: 569 },
  { id: 'thane', nameEn: 'Thane', nameMr: 'ठाणे', nameHi: 'ठाणे', lat: 19.2183, lng: 72.9781, elevation: 15 },
  { id: 'solapur', nameEn: 'Solapur', nameMr: 'सोलापूर', nameHi: 'सोलापुर', lat: 17.6599, lng: 75.9064, elevation: 458 },
  { id: 'satara', nameEn: 'Satara', nameMr: 'सातारा', nameHi: 'सतारा', lat: 17.6805, lng: 73.9930, elevation: 742 },
  { id: 'ratnagiri', nameEn: 'Ratnagiri', nameMr: 'रत्नागिरी', nameHi: 'रत्नागिरि', lat: 16.9902, lng: 73.3120, elevation: 11 },
];

export interface PanchangEvent {
  titleEn: string;
  titleMr: string;
  titleHi: string;
  type: 'festival' | 'vrat' | 'jayanti' | 'muhurat';
  descriptionEn: string;
  descriptionMr: string;
  descriptionHi: string;
}

export interface PanchangDetail {
  tithi: {
    en: string;
    hi: string;
    mr: string;
    number: number;
    pakshaEn: 'Shukla' | 'Krishna';
    pakshaHi: 'शुक्ल' | 'कृष्ण';
    pakshaMr: 'शुक्ल' | 'कृष्ण';
    until: string;
  };
  nakshatra: {
    en: string;
    hi: string;
    mr: string;
    number: number;
    until: string;
  };
  yoga: {
    en: string;
    hi: string;
    mr: string;
    number: number;
  };
  karana: {
    en: string;
    hi: string;
    mr: string;
    number: number;
  };
  sunrise: string;
  sunset: string;
  moonrise: string;
  rahukalam: {
    start: string;
    end: string;
  };
  yamaganda: {
    start: string;
    end: string;
  };
  gulikaKaal: {
    start: string;
    end: string;
  };
  abhijitMuhurat: {
    start: string;
    end: string;
  };
  brahmaMuhurat: {
    start: string;
    end: string;
  };
  shaka: {
    en: string;
    mr: string;
    hi: string;
  };
  month: {
    en: string;
    mr: string;
    hi: string;
  };
  samvatsara: {
    en: string;
    mr: string;
  };
  city: {
    nameEn: string;
    nameMr: string;
    nameHi: string;
  };
  events: PanchangEvent[];
  auspiciousStatus: {
    en: string;
    hi: string;
    mr: string;
    isHighlyAuspicious: boolean;
  };
  recommendedPoojas: Array<{
    poojaId: string;
    nameEn: string;
    nameHi: string;
    nameMr: string;
    reasonEn: string;
    reasonHi: string;
    reasonMr: string;
    panditId: string;
  }>;
}

// ─── Vedic Definitions ──────────────────────────────────────────────────────────

const TITHIS = [
  { en: 'Pratipada', hi: 'प्रतिपदा', mr: 'प्रतिपदा' },
  { en: 'Dwitiya', hi: 'द्वितीया', mr: 'द्वितीया' },
  { en: 'Tritiya', hi: 'तृतीया', mr: 'तृतीया' },
  { en: 'Chaturthi', hi: 'चतुर्थी', mr: 'चतुर्थी' },
  { en: 'Panchami', hi: 'पंचमी', mr: 'पंचमी' },
  { en: 'Shashthi', hi: 'षष्ठी', mr: 'षष्ठी' },
  { en: 'Saptami', hi: 'सप्तमी', mr: 'सप्तमी' },
  { en: 'Ashtami', hi: 'अष्टमी', mr: 'अष्टमी' },
  { en: 'Navami', hi: 'नवमी', mr: 'नवमी' },
  { en: 'Dashami', hi: 'दशमी', mr: 'दशमी' },
  { en: 'Ekadashi', hi: 'एकादशी', mr: 'एकादशी' },
  { en: 'Dwadashi', hi: 'द्वादशी', mr: 'द्वादशी' },
  { en: 'Trayodashi', hi: 'त्रयोदशी', mr: 'त्रयोदशी' },
  { en: 'Chaturdashi', hi: 'चतुर्दशी', mr: 'चतुर्दशी' },
  { en: 'Purnima', hi: 'पूर्णिमा', mr: 'पौर्णिमा' },
  { en: 'Amavasya', hi: 'अमावस्या', mr: 'अमावस्या' },
];

const NAKSHATRAS = [
  { en: 'Ashwini', hi: 'अश्विनी', mr: 'अश्विनी' },
  { en: 'Bharani', hi: 'भरणी', mr: 'भरणी' },
  { en: 'Krittika', hi: 'कृत्तिका', mr: 'कृत्तिका' },
  { en: 'Rohini', hi: 'रोहिणी', mr: 'रोहिणी' },
  { en: 'Mrigashira', hi: 'मृगशिरा', mr: 'मृगशीर्ष' },
  { en: 'Ardra', hi: 'आर्द्रा', mr: 'आर्द्रा' },
  { en: 'Punarvasu', hi: 'पुनर्वसु', mr: 'पुनर्वसू' },
  { en: 'Pushya', hi: 'पुष्य', mr: 'पुष्य' },
  { en: 'Ashlesha', hi: 'आश्लेषा', mr: 'आश्लेषा' },
  { en: 'Magha', hi: 'मघा', mr: 'मघा' },
  { en: 'Purva Phalguni', hi: 'पूर्वा फाल्गुनी', mr: 'पूर्वा फाल्गुनी' },
  { en: 'Uttara Phalguni', hi: 'उत्तरा फाल्गुनी', mr: 'उत्तरा फाल्गुनी' },
  { en: 'Hasta', hi: 'हस्त', mr: 'हस्त' },
  { en: 'Chitra', hi: 'चित्रा', mr: 'चित्रा' },
  { en: 'Swati', hi: 'स्वाती', mr: 'स्वाती' },
  { en: 'Vishakha', hi: 'विशाखा', mr: 'विशाखा' },
  { en: 'Anuradha', hi: 'अनुराधा', mr: 'अनुराधा' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठा', mr: 'ज्येष्ठा' },
  { en: 'Mula', hi: 'मूल', mr: 'मूळ' },
  { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा', mr: 'पूर्वाषाढा' },
  { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा', mr: 'उत्तराषाढा' },
  { en: 'Shravana', hi: 'श्रवण', mr: 'श्रवण' },
  { en: 'Dhanishta', hi: 'धनिष्ठा', mr: 'धनिष्ठा' },
  { en: 'Shatabhisha', hi: 'शतभिषा', mr: 'शततारका' },
  { en: 'Purva Bhadrapada', hi: 'पूर्वाभाद्रपद', mr: 'पूर्वाभाद्रपदा' },
  { en: 'Uttara Bhadrapada', hi: 'उत्तराभाद्रपद', mr: 'उत्तराभाद्रपदा' },
  { en: 'Revati', hi: 'रेवती', mr: 'रेवती' },
];

const YOGAS = [
  { en: 'Vishkambha', hi: 'विष्कुम्भ', mr: 'विष्कुंभ' },
  { en: 'Priti', hi: 'प्रीति', mr: 'प्रीती' },
  { en: 'Ayushman', hi: 'आयुष्मान', mr: 'आयुष्मान' },
  { en: 'Saubhagya', hi: 'सौभाग्य', mr: 'सौभाग्य' },
  { en: 'Shobhana', hi: 'शोभन', mr: 'शोभन' },
  { en: 'Atiganda', hi: 'अतिगण्ड', mr: 'अतिगंड' },
  { en: 'Sukarma', hi: 'सुकर्मा', mr: 'सुकर्मा' },
  { en: 'Dhriti', hi: 'धृति', mr: 'धृती' },
  { en: 'Shula', hi: 'शूल', mr: 'शूळ' },
  { en: 'Ganda', hi: 'गण्ड', mr: 'गंड' },
  { en: 'Vriddhi', hi: 'वृद्धि', mr: 'वृद्धी' },
  { en: 'Dhruva', hi: 'ध्रुव', mr: 'ध्रुव' },
  { en: 'Vyaghata', hi: 'व्याघात', mr: 'व्याघात' },
  { en: 'Harshana', hi: 'हर्षण', mr: 'हर्षण' },
  { en: 'Vajra', hi: 'वज्र', mr: 'वज्र' },
  { en: 'Siddhi', hi: 'सिद्धि', mr: 'सिद्धी' },
  { en: 'Vyatipata', hi: 'व्यतीपात', mr: 'व्यतीपात' },
  { en: 'Variyan', hi: 'वरीयान', mr: 'वरीयान' },
  { en: 'Parigha', hi: 'परिघ', mr: 'परिघ' },
  { en: 'Shiva', hi: 'शिव', mr: 'शिव' },
  { en: 'Siddha', hi: 'सिद्ध', mr: 'सिद्ध' },
  { en: 'Sadhya', hi: 'साध्य', mr: 'साध्य' },
  { en: 'Shubha', hi: 'शुभ', mr: 'शुभ' },
  { en: 'Shukla', hi: 'शुक्ल', mr: 'शुक्ल' },
  { en: 'Brahma', hi: 'ब्रह्म', mr: 'ब्रह्म' },
  { en: 'Indra', hi: 'इन्द्र', mr: 'इंद्र' },
  { en: 'Vaidhriti', hi: 'वैधृति', mr: 'वैधृती' },
];

const KARANAS = [
  { en: 'Bava', hi: 'बव', mr: 'बव' },
  { en: 'Balava', hi: 'बालव', mr: 'बालव' },
  { en: 'Kaulava', hi: 'कौलव', mr: 'कौलव' },
  { en: 'Taitila', hi: 'तैतिल', mr: 'तैतिल' },
  { en: 'Gara', hi: 'गर', mr: 'गर' },
  { en: 'Vanija', hi: 'वणिज', mr: 'वणिज' },
  { en: 'Vishti (Bhadra)', hi: 'विष्टि (भद्रा)', mr: 'विष्टी (भद्रा)' },
  { en: 'Shakuni', hi: 'शकुनि', mr: 'शकुनी' },
  { en: 'Chatushpada', hi: 'चतुष्पाद', mr: 'चतुष्पाद' },
  { en: 'Naga', hi: 'नाग', mr: 'नाग' },
  { en: 'Kinstughna', hi: 'किंस्तुघ्न', mr: 'किंस्तुघ्न' },
];

// Maharashtra Marathi Amanta Months
const MARATHI_MONTHS = [
  { en: 'Chaitra', hi: 'चैत्र', mr: 'चैत्र' },
  { en: 'Vaishakha', hi: 'वैशाख', mr: 'वैशाख' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठ', mr: 'ज्येष्ठ' },
  { en: 'Ashadha', hi: 'आषाढ', mr: 'आषाढ' },
  { en: 'Shravana', hi: 'श्रावण', mr: 'श्रावण' },
  { en: 'Bhadrapada', hi: 'भाद्रपद', mr: 'भाद्रपद' },
  { en: 'Ashwin', hi: 'अश्विन', mr: 'अश्विन' },
  { en: 'Kartika', hi: 'कार्तिक', mr: 'कार्तिक' },
  { en: 'Margashirsha', hi: 'मार्गशीर्ष', mr: 'मार्गशीर्ष' },
  { en: 'Pausha', hi: 'पौष', mr: 'पौष' },
  { en: 'Magha', hi: 'माघ', mr: 'माघ' },
  { en: 'Phalguna', hi: 'फाल्गुन', mr: 'फाल्गुन' },
];

// ─── Astronomical Helper Functions ──────────────────────────────────────────────

function getSunMoonAngles(date: Date) {
  const sunPos = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, date, false));
  const moonPos = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, date, false));

  const yearDecimal = date.getFullYear() + (date.getMonth() + date.getDate() / 30) / 12;
  const ayanamsa = 23.85 + (yearDecimal - 2000) * 0.01397; // Lahiri Ayanamsha

  const sunSidereal = (sunPos.elon - ayanamsa + 360) % 360;
  const moonSidereal = (moonPos.elon - ayanamsa + 360) % 360;
  const diff = (moonPos.elon - sunPos.elon + 360) % 360;

  return { sunSidereal, moonSidereal, diff, sunPos, moonPos };
}

function findTithiEndTime(currentDate: Date, currentTithiNum: number): string {
  let low = currentDate.getTime();
  let high = low + 28 * 3600 * 1000;

  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    const angles = getSunMoonAngles(new Date(mid));
    const tNum = Math.floor(angles.diff / 12) + 1;
    if (tNum === currentTithiNum) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const endDate = new Date(high);
  return endDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

function findNakshatraEndTime(currentDate: Date, currentNakshatraIdx: number): string {
  let low = currentDate.getTime();
  let high = low + 28 * 3600 * 1000;

  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    const angles = getSunMoonAngles(new Date(mid));
    const nNum = Math.floor(angles.moonSidereal / (360 / 27));
    if (nNum === currentNakshatraIdx) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const endDate = new Date(high);
  return endDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

function formatTime(d: Date | null): string {
  if (!d) return '--:--';
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

// ─── Maharashtra Events Detector ────────────────────────────────────────────────

function getMaharashtraEvents(
  monthIdx: number,
  tithiNum: number,
  dayOfWeek: number
): PanchangEvent[] {
  const events: PanchangEvent[] = [];
  const isShukla = tithiNum <= 15;
  const tithiInPaksha = isShukla ? tithiNum : tithiNum - 15;

  // 1. Recurring Monthly Sacred Days in Maharashtra
  if (tithiNum === 19) {
    // Krishna Chaturthi = Sankashti
    if (dayOfWeek === 2) {
      // Tuesday
      events.push({
        titleEn: 'Angaraki Sankashti Chaturthi ⭐',
        titleMr: 'अंगारकी संकष्टी चतुर्थी ⭐ (विशेष मंगलकारी)',
        titleHi: 'अंगारकी संकष्टी चतुर्थी ⭐',
        type: 'festival',
        descriptionEn: 'Angaraki Chaturthi falling on Tuesday is considered 100 times more auspicious for Lord Ganesha worship.',
        descriptionMr: 'मंगळवारी येणारी अंगारकी संकष्टी अत्यंत पुण्यप्रद मानली जाते. गणेश दर्शनाने सर्व विघ्ने दूर होतात.',
        descriptionHi: 'मंगलवार को पड़ने वाली अंगारकी संकष्टी श्री गणेश पूजन हेतु अनंत फलदायी मानी गई है।',
      });
    } else {
      events.push({
        titleEn: 'Sankashti Chaturthi',
        titleMr: 'संकष्टी चतुर्थी (चंद्रोदय पूजन)',
        titleHi: 'संकष्टी चतुर्थी',
        type: 'vrat',
        descriptionEn: 'Sacred fast dedicated to Lord Ganesha, completed after Moonrise arghya.',
        descriptionMr: 'श्री गणेशाच्या उपासनेचा पवित्र दिवस. रात्री चंद्रोदयानंतर अर्घ्य देऊन उपवास सोडला जातो.',
        descriptionHi: 'भगवान श्री गणेश को समर्पित व्रत, रात को चंद्रोदय के पश्चात पूजा व अर्घ्य दिया जाता है।',
      });
    }
  }

  if (tithiNum === 4) {
    events.push({
      titleEn: 'Vinayaki Chaturthi',
      titleMr: 'विनायकी चतुर्थी',
      titleHi: 'विनायकी चतुर्थी',
      type: 'vrat',
      descriptionEn: 'Auspicious noon pooja for Sri Ganesha wish fulfillment.',
      descriptionMr: 'दुपारच्या वेळी श्री गणपतीची मनोभावे पूजा करून दुर्वा व मोदक अर्पण केले जातात.',
      descriptionHi: 'दोपहर में भगवान गणेश की विशेष पूजा व मोदक अर्पण किया जाता है।',
    });
  }

  if (tithiInPaksha === 11) {
    events.push({
      titleEn: 'Pavitra Ekadashi Vrat',
      titleMr: 'एकादशी व्रत (विठ्ठल स्मरण)',
      titleHi: 'पवित्र एकादशी व्रत',
      type: 'vrat',
      descriptionEn: 'Auspicious Ekadashi dedicated to Lord Vishnu and Sri Vitthal.',
      descriptionMr: 'भगवान श्री विष्णू व पंढरीच्या पांडुरंगाच्या नामस्मरणाचा परम पावन दिवस.',
      descriptionHi: 'भगवान श्री हरि विष्णु को समर्पित परम कल्याणकारी व्रत।',
    });
  }

  if (tithiInPaksha === 13) {
    events.push({
      titleEn: 'Pradosh Vrat',
      titleMr: 'प्रदोष व्रत (शिव पूजा)',
      titleHi: 'प्रदोष व्रत',
      type: 'vrat',
      descriptionEn: 'Dusk twilight pooja dedicated to Lord Shiva for peace and health.',
      descriptionMr: 'संध्याकाळी प्रदोष काळात महादेवाची पूजा व रुद्राभिषेक करणे अत्यंत फलदायी.',
      descriptionHi: 'सायंकाल प्रदोष काल में भगवान शिव की आराधना व अभिषेक किया जाता है।',
    });
  }

  if (tithiNum === 15) {
    events.push({
      titleEn: 'Satyanarayan Purnima',
      titleMr: 'सत्यनारायण पौर्णिमा (कुलधर्म पूजन)',
      titleHi: 'सत्यनारायण पूर्णिमा',
      type: 'festival',
      descriptionEn: 'Most auspicious day for hosting Sri Satyanarayan Pooja at home.',
      descriptionMr: 'घरात सत्यनारायणाची पूजा व कुलदैवताचे स्मरण करण्यासाठी सर्वोत्तम दिवस.',
      descriptionHi: 'घर में श्री सत्यनारायण पूजन एवं कुलदेवता स्मरण के लिए सर्वोत्तम दिन।',
    });
  }

  if (tithiNum === 30) {
    if (dayOfWeek === 1) {
      events.push({
        titleEn: 'Somvati Amavasya ⭐',
        titleMr: 'सोमवती अमावस्या ⭐ (अश्वत्थ प्रदक्षिणा)',
        titleHi: 'सोमवती अमावस्या ⭐',
        type: 'festival',
        descriptionEn: 'Highly sacred Somvati Amavasya for Peepal tree parikrama and ancestor peace.',
        descriptionMr: 'सोमवारी येणारी अमावस्या अत्यंत पवित्र. पिंपळाची प्रदक्षिणा व पितृतर्पण फलदायी ठरते.',
        descriptionHi: 'सोमवार को पड़ने वाली अमावस्या पर पीपल वृक्ष पूजन व पितृ तर्पण विशेष फलदायी है।',
      });
    } else {
      events.push({
        titleEn: 'Darsha Amavasya (Pitri Tarpana)',
        titleMr: 'दर्श अमावस्या (पितृतर्पण व दीपदान)',
        titleHi: 'दर्श अमावस्या',
        type: 'vrat',
        descriptionEn: 'Sacred new moon day for ancestor prayers, charity, and lighting evening lamps.',
        descriptionMr: 'पितरांचे स्मरण, दानधर्म आणि घराबाहेर दिवा लावण्यासाठी पवित्र दिवस.',
        descriptionHi: 'पितरों का तर्पण, दान व शांति प्रार्थना हेतु उत्तम दिन।',
      });
    }
  }

  // 2. Month-Specific Major Maharashtra Festivals
  // Chaitra (0)
  if (monthIdx === 0 && tithiNum === 1) {
    events.push({
      titleEn: 'Gudi Padwa (Marathi New Year) 🎉',
      titleMr: 'गुढीपाडवा (मराठी नववर्ष प्रारंभ) 🚩',
      titleHi: 'गुड़ी पड़वा (नव संवत्सर प्रारंभ) 🚩',
      type: 'festival',
      descriptionEn: 'Grand Maharashtrian New Year! Hoisting the sacred Gudi and celebrating new auspicious beginnings.',
      descriptionMr: 'महाराष्ट्राचा सर्वात मोठा सण! घराघरांवर विजयाची व समृद्धीची गुढी उभारून नववर्षाचे स्वागत केले जाते.',
      descriptionHi: 'महाराष्ट्र का महापर्व! नववर्ष व विजय पताका गुड़ी फहराकर शुभ आरंभ किया जाता है।',
    });
  }
  if (monthIdx === 0 && tithiNum === 9) {
    events.push({
      titleEn: 'Sri Ram Navami',
      titleMr: 'श्रीराम नवमी (प्रभू श्रीराम जन्मोत्सव)',
      titleHi: 'श्री राम नवमी',
      type: 'festival',
      descriptionEn: 'Celebration of the divine birth of Lord Rama at solar midday (12:00 PM).',
      descriptionMr: 'दुपारी १२ वाजता प्रभू श्रीरामांचा जन्मोत्सव कीर्तन व पाळणा गाऊन साजरा केला जातो.',
      descriptionHi: 'मध्याह्न १२ बजे भगवान श्री राम का पावन जन्मोत्सव मनाया जाता है।',
    });
  }
  if (monthIdx === 0 && tithiNum === 15) {
    events.push({
      titleEn: 'Hanuman Jayanti',
      titleMr: 'श्री हनुमान जयंती (सूर्योदय जन्मोत्सव)',
      titleHi: 'श्री हनुमान जन्मोत्सव',
      type: 'festival',
      descriptionEn: 'Celebration of Lord Hanuman’s divine birth at sunrise with Maruti Stotra recitation.',
      descriptionMr: 'सूर्योदयाच्या वेळी मारुती रायांचा जन्मोत्सव साजरा करून मारुती स्तोत्र व शेंदूर अर्पण केला जातो.',
      descriptionHi: 'सूर्योदय वेला पर पवनपुत्र श्री हनुमान जी का जन्मोत्सव मनाया जाता है।',
    });
  }

  // Vaishakha (1)
  if (monthIdx === 1 && tithiNum === 3) {
    events.push({
      titleEn: 'Akshaya Tritiya (Sade Teen Muhurat)',
      titleMr: 'अक्षय्य तृतीया (साडेतीन मुहूर्तांपैकी एक) 🌟',
      titleHi: 'अक्षय तृतीया',
      type: 'festival',
      descriptionEn: 'One of the Sade Teen Muhurats in Maharashtra! Infinite merit for gold purchase and new ventures.',
      descriptionMr: 'महाराष्ट्रातील साडेतीन मुहूर्तांपैकी एक स्वयं सिद्ध मुहूर्त! सोने खरेदी, गृहप्रवेश व दानधर्मासाठी अक्षय्य दिवस.',
      descriptionHi: 'अबूझ मुहूर्त! स्वर्ण क्रय, गृहप्रवेश व नए कार्यों के शुभारंभ हेतु सर्वोत्तम दिन।',
    });
  }

  // Jyeshtha (2)
  if (monthIdx === 2 && tithiNum === 15) {
    events.push({
      titleEn: 'Vat Purnima',
      titleMr: 'वटपौर्णिमा (वटवृक्ष पूजन व अखंड सौभाग्य)',
      titleHi: 'वट पूर्णिमा',
      type: 'festival',
      descriptionEn: 'Traditional worship of the Banyan tree by Maharashtrian women for long family life.',
      descriptionMr: 'सुवासिनी स्त्रिया वटवृक्षाची पूजा करून पतीच्या दीर्घायुष्यासाठी प्रार्थना करतात.',
      descriptionHi: 'सती सावित्री एवं वटवृक्ष की पूजा कर अखंड सौभाग्य की कामना की जाती है।',
    });
  }

  // Ashadha (3)
  if (monthIdx === 3 && tithiNum === 11) {
    events.push({
      titleEn: 'Ashadhi Ekadashi (Pandharpur Wari) 🚩',
      titleMr: 'आषाढी एकादशी (देवशयनी एकादशी - पंढरपूर महासोहळा) 🚩',
      titleHi: 'आषाढ़ी एकादशी (देवशयनी एकादशी) 🚩',
      type: 'festival',
      descriptionEn: 'The monumental culmination of the Pandharpur Wari! Millions revere Mauli and Lord Vitthal.',
      descriptionMr: 'वारकरी संप्रदायाचा महाउत्सव! लाखो वारकरी पंढरपुरात विठू माऊलीच्या चरणी लीन होतात.',
      descriptionHi: 'महाराष्ट्र का आलौकिक पंढरपुर वारी महापर्व! श्री विट्ठल-रुक्मिणी के दर्शन का पावन दिन।',
    });
  }
  if (monthIdx === 3 && tithiNum === 15) {
    events.push({
      titleEn: 'Guru Purnima / Vyas Purnima',
      titleMr: 'गुरुपौर्णिमा (व्यास पूजन व गुरुवंदना)',
      titleHi: 'गुरु पूर्णिमा',
      type: 'festival',
      descriptionEn: 'Honoring spiritual gurus, mentors, and the revered sage Ved Vyasa.',
      descriptionMr: 'आपल्या सद्गुरूंना वंदनाचा आणि महर्षी व्यासांच्या स्मरणाचा पवित्र दिवस.',
      descriptionHi: 'सद्गुरु एवं महर्षि वेदव्यास की वंदना व पूजन का पावन दिन।',
    });
  }

  // Shravana (4)
  if (monthIdx === 4 && tithiNum === 5) {
    events.push({
      titleEn: 'Nag Panchami',
      titleMr: 'नागपंचमी (नागदेवता पूजन)',
      titleHi: 'नाग पंचमी',
      type: 'festival',
      descriptionEn: 'Sacred day for worshipping the serpent deities and offering milk.',
      descriptionMr: 'श्रावणातील पहिला सण. नागदेवतेची पूजा करून लाह्या व दूध अर्पण केले जाते.',
      descriptionHi: 'श्रावण मास में नाग देवता की विशेष पूजा की जाती है।',
    });
  }
  if (monthIdx === 4 && tithiNum === 15) {
    events.push({
      titleEn: 'Narali Purnima & Rakhi Purnima',
      titleMr: 'नारळी पौर्णिमा व रक्षाबंधन 🌊',
      titleHi: 'नारली पूर्णिमा व रक्षाबंधन',
      type: 'festival',
      descriptionEn: 'Coastal Maharashtra worships the sea with coconuts, along with brother-sister Rakhi festival.',
      descriptionMr: 'कोकणात सागराला सोन्याचा नारळ अर्पण केला जातो आणि बहिण-भावाच्या प्रेमाचा रक्षाबंधन साजरा होतो.',
      descriptionHi: 'समुद्र पूजन एवं भाई-बहन के पावन स्नेह का रक्षाबंधन पर्व।',
    });
  }
  if (monthIdx === 4 && tithiNum === 23) {
    events.push({
      titleEn: 'Gokulashtami & Dahi Handi 🎉',
      titleMr: 'गोकुळाष्टमी व दहीहंडी उत्सव (श्रीकृष्ण जन्मोत्सव) 🏺',
      titleHi: 'श्रीकृष्ण जन्माष्टमी व दही हांडी',
      type: 'festival',
      descriptionEn: 'Divine birth of Sri Krishna at midnight, followed by vibrant Dahi Handi across Maharashtra.',
      descriptionMr: 'मध्यरात्री बाळकृष्णाचा जन्म आणि महाराष्ट्रात गोविंदांच्या उत्साहात दहीहंडीचा थरार!',
      descriptionHi: 'मध्यरात्रि भगवान श्री कृष्ण का जन्मोत्सव एवं दही हांडी का भव्य उत्सव।',
    });
  }
  if (monthIdx === 4 && tithiNum === 30) {
    events.push({
      titleEn: 'Pola / Pithori Amavasya',
      titleMr: 'बैलपोळा व पिठोरी अमावस्या 🐂',
      titleHi: 'बैल पोला व पिठोरी अमावस्या',
      type: 'festival',
      descriptionEn: 'Maharashtra’s farm festival honoring bulls and oxen for their tireless service.',
      descriptionMr: 'शेतकऱ्यांचा लाडका सण! वर्षभर राबणाऱ्या सर्जा-राजाची वाजतगाजत मिरवणूक व पूजा केली जाते.',
      descriptionHi: 'कृषि संस्कृति का महापर्व, बैलों की पूजा व कृतज्ञता व्यक्त की जाती है।',
    });
  }

  // Bhadrapada (5)
  if (monthIdx === 5 && tithiNum === 4) {
    events.push({
      titleEn: 'Ganesh Chaturthi (Ganeshotsav Start) 🐘',
      titleMr: 'श्री गणेश चतुर्थी (गणेशोत्सव प्रारंभ) 🚩',
      titleHi: 'श्री गणेश चतुर्थी महोत्सव',
      type: 'festival',
      descriptionEn: 'The grandest festival of Maharashtra! Welcoming Bappa into homes and pandals for 10 glorious days.',
      descriptionMr: 'महाराष्ट्राचा प्राण! गणपती बाप्पाचे घरोघरी व सार्वजनिक मंडळांत वाजत-गाजत मंगल आगमन.',
      descriptionHi: 'महाराष्ट्र का गौरव! विघ्नहर्ता बाप्पा का घरों में भव्य स्वागत व प्राणप्रतिष्ठा।',
    });
  }
  if (monthIdx === 5 && (tithiNum === 7 || tithiNum === 8)) {
    events.push({
      titleEn: 'Gauri Pujan (Mahalakshmi Avahan)',
      titleMr: 'ज्येष्ठा गौरी आवाहन व पूजन 🌸',
      titleHi: 'ज्येष्ठा गौरी पूजन',
      type: 'festival',
      descriptionEn: 'Auspicious Mahalakshmi Gauri arrival, bringing wealth and domestic prosperity.',
      descriptionMr: 'माहेरवाशीण गौरीचे आगमन! पुरणपोळीचा नैवेद्य दाखवून सुख-समृद्धीची प्रार्थना केली जाते.',
      descriptionHi: 'माता महालक्ष्मी के गौरी स्वरूप का आगमन व सौभाग्य पूजन।',
    });
  }
  if (monthIdx === 5 && tithiNum === 14) {
    events.push({
      titleEn: 'Anant Chaturdashi (Ganesh Visarjan)',
      titleMr: 'अनंत चतुर्दशी (गणेश विसर्जन सोहळा) 🚩',
      titleHi: 'अनंत चतुर्दशी',
      type: 'festival',
      descriptionEn: 'Emotional and grand farewell to Lord Ganesha with "Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya".',
      descriptionMr: 'पुढच्या वर्षी लवकर या! लाखो भक्तांच्या साश्रू नयनांनी बाप्पाला भावपूर्ण निरोप.',
      descriptionHi: 'गणेश विसर्जन का विशाल एवं भक्तिमय विदाई समारोह।',
    });
  }

  // Ashwin (6)
  if (monthIdx === 6 && tithiNum === 1) {
    events.push({
      titleEn: 'Shardiya Navratri & Ghatasthapana 🔱',
      titleMr: 'शारदीय नवरात्र प्रारंभ व घटस्थापना 🔱',
      titleHi: 'शारदीय नवरात्रि प्रारंभ',
      type: 'festival',
      descriptionEn: 'Nine nights of divine feminine worship honoring Goddess Durga, Bhavani, and Mahalakshmi.',
      descriptionMr: 'आई तुळजाभवानी व महालक्ष्मीच्या चरणी घटस्थापना करून नऊ दिवसांचे अखंड व्रत प्रारंभ.',
      descriptionHi: 'मां जगदम्बा की आराधना व मंगल घटस्थापना का पावन शुभारंभ।',
    });
  }
  if (monthIdx === 6 && tithiNum === 9) {
    events.push({
      titleEn: 'Khandenavami (Shastra & Vahana Pooja)',
      titleMr: 'खंडेनवमी (शस्त्र, अवजार व वाहन पूजन)',
      titleHi: 'महानवमी / शस्त्र पूजन',
      type: 'festival',
      descriptionEn: 'Worship of machines, vehicles, and tools of trade before Dussehra.',
      descriptionMr: 'सर्व यंत्रे, वाहने व कामाच्या अवजारांची पूजा करून झेंडूची फुले वाहिली जातात.',
      descriptionHi: 'शस्त्र, वाहन एवं कर्म के उपकरणों की विशेष पूजा।',
    });
  }
  if (monthIdx === 6 && tithiNum === 10) {
    events.push({
      titleEn: 'Dussehra / Vijayadashami (Sade Teen Muhurat) 🏹',
      titleMr: 'दसरा / विजयादशमी (साडेतीन मुहूर्तांपैकी एक) 🏹',
      titleHi: 'विजयादशमी / दशहरा',
      type: 'festival',
      descriptionEn: 'Victory of Good over Evil! Exchanging Apta leaves (Gold) and starting auspicious new ventures.',
      descriptionMr: 'सोने घ्या सोन्यासारखे रहा! आपट्याची पाने देऊन शुभेच्छा देण्याचा व सीमोल्लंघनाचा पावन दिवस.',
      descriptionHi: 'बुराई पर अच्छाई की विजय! नए कार्यों की शुरुआत हेतु परम शुभ दिन।',
    });
  }
  if (monthIdx === 6 && tithiNum === 15) {
    events.push({
      titleEn: 'Kojagiri Purnima',
      titleMr: 'कोजागिरी पौर्णिमा (मसाला दूध व लक्ष्मी जागरण) 🌕',
      titleHi: 'कोजागरी पूर्णिमा',
      type: 'festival',
      descriptionEn: 'Chandra Darshan with saffron masala milk under the moonlight; Goddess Lakshmi descends with boons.',
      descriptionMr: 'चंद्राच्या शीतल चांदण्यात आटीव मसाला दूध पिण्याचा व कोजागराचा अमृत सोहळा.',
      descriptionHi: 'शरद पूर्णिमा की शीतल चांदनी में मां लक्ष्मी का आह्वान व खीर/मसाला दूध अर्पण।',
    });
  }
  if (monthIdx === 6 && tithiNum === 28) {
    events.push({
      titleEn: 'Dhanatrayodashi (Dhanteras)',
      titleMr: 'धनत्रयोदशी (धन्वंतरी पूजन व सोने खरेदी) 💰',
      titleHi: 'धनतेरस',
      type: 'festival',
      descriptionEn: 'Diwali begins! Worship of Lord Dhanvantari and Kubera with auspicious metal purchases.',
      descriptionMr: 'दिवाळीची पहिली मंगल पहाट! धन्वंतरी पूजन आणि घराघरांत दिव्यांची आरास.',
      descriptionHi: 'दीपावली का प्रथम पर्व, भगवान धन्वंतरि पूजन व समृद्धि आगमन।',
    });
  }
  if (monthIdx === 6 && tithiNum === 29) {
    events.push({
      titleEn: 'Narak Chaturdashi (Abhyanga Snan)',
      titleMr: 'नरक चतुर्दशी (मंगल अभ्यंगस्नान व उटणे) 🪔',
      titleHi: 'नरक चतुर्दशी (रूप चौदस)',
      type: 'festival',
      descriptionEn: 'Early morning Abhyanga Snan with aromatic Ubtan and lighting deepams.',
      descriptionMr: 'सुगंधी उटणे लावून पहाटे अभ्यंगस्नान आणि फराळाचा आनंद!',
      descriptionHi: 'प्रातःकाल अभ्यंग स्नान एवं दीप प्रज्वलन।',
    });
  }
  if (monthIdx === 6 && tithiNum === 30) {
    events.push({
      titleEn: 'Diwali Lakshmi Pujan 🪔✨',
      titleMr: 'दिवाळी लक्ष्मीपूजन (चोपडा पूजन व दीपदान) 🪔✨',
      titleHi: 'दीपावली महालक्ष्मी पूजन 🪔✨',
      type: 'festival',
      descriptionEn: 'Grand evening Lakshmi, Saraswati, and Ganesha worship during Pradosh Muhurat.',
      descriptionMr: 'प्रदोष काळात माता महालक्ष्मी व कुबेराचे भक्तिभावाने पूजन करून सर्वत्र दीप उजळले जातात.',
      descriptionHi: 'प्रदोष काल में मां महालक्ष्मी एवं गणेश जी का भव्य पूजन।',
    });
  }

  // Kartika (7)
  if (monthIdx === 7 && tithiNum === 1) {
    events.push({
      titleEn: 'Balipratipada & Diwali Padwa',
      titleMr: 'बलिप्रतिपदा व दिवाळी पाडवा (पती-पत्नी प्रेम सोहळा)',
      titleHi: 'गोवर्धन पूजा व बलिप्रतिपदा',
      type: 'festival',
      descriptionEn: 'Sade Teen Muhurat celebrating King Bali and spousal affection (Owalani).',
      descriptionMr: 'साडेतीन मुहूर्तांपैकी एक! पत्नी पतीला ओवाळते आणि नववर्षाच्या शुभेच्छा दिल्या जातात.',
      descriptionHi: 'बलिप्रतिपदा एवं पति-पत्नी के स्नेह का पावन पर्व।',
    });
  }
  if (monthIdx === 7 && tithiNum === 2) {
    events.push({
      titleEn: 'Bhaubeej (Bhai Dooj)',
      titleMr: 'भाऊबीज (बहिण-भावाचे पवित्र बंधन)',
      titleHi: 'भाई दूज (यम द्वितीया)',
      type: 'festival',
      descriptionEn: 'Sisters perform aarti for their brothers, wishing them protection and long life.',
      descriptionMr: 'बहिण आपल्या लाडक्या भावाला ओवाळते आणि भाऊ प्रेमाची भेट देतो.',
      descriptionHi: 'बहन द्वारा भाई के दीर्घायु व मंगल की प्रार्थना।',
    });
  }
  if (monthIdx === 7 && tithiNum === 11) {
    events.push({
      titleEn: 'Kartiki Ekadashi (Prabodhini)',
      titleMr: 'कार्तिकी एकादशी (पंढरपूर यात्रा सोहळा) 🚩',
      titleHi: 'कार्तिकी एकादशी (देवउठनी)',
      type: 'festival',
      descriptionEn: 'Awakening of Lord Vishnu and the second major Pandharpur pilgrimage in Maharashtra.',
      descriptionMr: 'भगवान विष्णू योगनिद्रेतून जागे होतात. पंढरपुरात वारकऱ्यांचा अथांग भक्तिसागर उसळतो.',
      descriptionHi: 'भगवान विष्णु का जागरण एवं पावन पंढरपुर कार्तिक यात्रा।',
    });
  }
  if (monthIdx === 7 && (tithiNum === 12 || tithiNum === 15)) {
    events.push({
      titleEn: 'Tulsi Vivah Arambha',
      titleMr: 'तुलसी विवाह प्रारंभ 🌿👰',
      titleHi: 'तुलसी विवाह प्रारंभ',
      type: 'festival',
      descriptionEn: 'Ceremonial wedding of Holy Tulsi with Lord Shaligram, marking the start of Hindu wedding season.',
      descriptionMr: 'तुळशी वृंदावनाची सजावट करून बाळकृष्णासोबत मंगल विवाह लावला जातो. लग्नसराईचा प्रारंभ.',
      descriptionHi: 'माता तुलसी एवं भगवान शालिग्राम का मंगल विवाह, विवाह मुहूर्त प्रारंभ।',
    });
  }

  // Margashirsha (8)
  if (monthIdx === 8 && tithiNum === 6) {
    events.push({
      titleEn: 'Champa Shashthi (Khandoba Utsav)',
      titleMr: 'चंपाषष्ठी (येळकोट येळकोट जय मल्हार!) 🚩',
      titleHi: 'चंपा षष्ठी (खंडोबा उत्सव)',
      type: 'festival',
      descriptionEn: 'Grand celebration of Lord Khandoba (Malhari Martand), kuldaivat of Maharashtra.',
      descriptionMr: 'महाराष्ट्राचे कुलदैवत जेजुरीच्या खंडेरायाचा उत्सव! भंडाऱ्याची उधळण व वांग्याचे भरीत-रोडगा नैवेद्य.',
      descriptionHi: 'भगवान मल्हारी मार्तंड (खंडोबा) का पावन उत्सव, भंडारा उछाला जाता है।',
    });
  }
  if (monthIdx === 8 && tithiNum === 15) {
    events.push({
      titleEn: 'Datta Jayanti',
      titleMr: 'श्री दत्त जयंती (गुरुचरित्र पारायण व जन्मोत्सव)',
      titleHi: 'दत्तात्रेय जयंती',
      type: 'festival',
      descriptionEn: 'Divine birth of Lord Dattatreya, celebrated across temples in Gangapur, Narsobachi Wadi, and Audumbar.',
      descriptionMr: 'दुपारी किंवा सायंकाळी त्रिमूर्ती श्री दत्तात्रेयांचा जन्मोत्सव! वाडी, औदुंबर व गाणगापुरात महासोहळा.',
      descriptionHi: 'त्रिमूर्ति भगवान दत्तात्रेय का पावन जन्मोत्सव।',
    });
  }

  // Magha (10)
  if (monthIdx === 10 && tithiNum === 4) {
    events.push({
      titleEn: 'Maghi Ganesh Jayanti',
      titleMr: 'माघी गणेश जयंती (अष्टविनायक जन्मोत्सव) 🐘',
      titleHi: 'माघी गणेश जयंती',
      type: 'festival',
      descriptionEn: 'Birth of Lord Ganesha in the month of Magha, celebrated enthusiastically in Ashtavinayak temples.',
      descriptionMr: 'अष्टविनायक तीर्थक्षेत्रांत आणि घराघरांत माघी गणपतीचा जन्मोत्सव अतिशय श्रद्धेने साजरा होतो.',
      descriptionHi: 'माघ मास में विघ्नहर्ता गणेश जी का जन्मोत्सव।',
    });
  }
  if (monthIdx === 10 && tithiNum === 29) {
    events.push({
      titleEn: 'Maha Shivratri 🔱',
      titleMr: 'महाशिवरात्री (अखंड शिव आराधना व रुद्राभिषेक) 🔱',
      titleHi: 'महाशिवरात्रि 🔱',
      type: 'festival',
      descriptionEn: 'The great night of Shiva! Overnight vigil, Bel leaves offering, and Rudrabhishek in Jyotirlingas.',
      descriptionMr: 'त्र्यंबकेश्वर, भीमाशंकर, घृष्णेश्वर व सर्व शिवमंदिरांत रुद्राभिषेक व जागरण.',
      descriptionHi: 'देवाधिदेव महादेव की महापूजा, अभिषेक एवं रात्रि जागरण।',
    });
  }

  // Phalguna (11)
  if (monthIdx === 11 && tithiNum === 15) {
    events.push({
      titleEn: 'Holi / Shimga 🔥',
      titleMr: 'होळी / शिमगा (होलिका दहन व पुरणपोळी नैवेद्य) 🔥',
      titleHi: 'होलिका दहन',
      type: 'festival',
      descriptionEn: 'Bonfire celebrating the destruction of evil, with Puran Poli offered to the sacred fire.',
      descriptionMr: 'महाराष्ट्रात कोकणात शिमग्याची पालखी आणि घरोघरी पुरणपोळीचा नैवेद्य दाखवून होलिकोत्सव.',
      descriptionHi: 'होलिका दहन एवं बुराई पर भक्ति की विजय का पावन उत्सव।',
    });
  }
  if (monthIdx === 11 && tithiNum === 16) {
    events.push({
      titleEn: 'Dhulivandan',
      titleMr: 'धुळवड (धूलिवंदन उत्सव)',
      titleHi: 'धुलेंडी',
      type: 'festival',
      descriptionEn: 'Post-Holi celebration greeting spring and good fellowship.',
      descriptionMr: 'होळीच्या दुसऱ्या दिवशी धुळवड साजरी करून एकमेकांना शुभेच्छा दिल्या जातात.',
      descriptionHi: 'रंगोत्सव का प्रथम दिवस।',
    });
  }

  return events;
}

export function resolveCity(cityNameOrId?: string): MaharashtraCity {
  if (!cityNameOrId) return MAHARASHTRA_CITIES[0]; // Default: Pune
  const clean = cityNameOrId.trim().toLowerCase();

  // 1. Direct match on ID or Names
  const directMatch = MAHARASHTRA_CITIES.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.nameEn.toLowerCase() === clean ||
      c.nameMr.toLowerCase() === clean ||
      c.nameHi.toLowerCase() === clean ||
      clean.includes(c.nameEn.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(clean)
  );
  if (directMatch) return directMatch;

  // 2. Common Maharashtra sub-regions and aliases
  if (clean.includes('pimpri') || clean.includes('chinchwad') || clean.includes('haveli') || clean.includes('baramati') || clean.includes('pune')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'pune')!;
  }
  if (clean.includes('navi mumbai') || clean.includes('bandra') || clean.includes('andheri') || clean.includes('borivali') || clean.includes('dadar') || clean.includes('kurla') || clean.includes('mumbai') || clean.includes('bombay')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'mumbai')!;
  }
  if (clean.includes('kalyan') || clean.includes('dombivli') || clean.includes('ulhasnagar') || clean.includes('bhiwandi') || clean.includes('mira') || clean.includes('bhayandar') || clean.includes('thane')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'thane')!;
  }
  if (clean.includes('aurangabad') || clean.includes('sambhajinagar')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'csn')!;
  }
  if (clean.includes('nasik') || clean.includes('nashik') || clean.includes('panchavati') || clean.includes('trimbak')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'nashik')!;
  }
  if (clean.includes('nagpur') || clean.includes('vidarbha') || clean.includes('wardha')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'nagpur')!;
  }
  if (clean.includes('kolhapur') || clean.includes('ichalkaranji') || clean.includes('panhala')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'kolhapur')!;
  }
  if (clean.includes('solapur') || clean.includes('pandharpur')) {
    return MAHARASHTRA_CITIES.find((c) => c.id === 'solapur')!;
  }

  // Fallback: Use user city name with central Maharashtra coordinates
  return {
    id: clean.replace(/\s+/g, '-'),
    nameEn: cityNameOrId.trim(),
    nameMr: cityNameOrId.trim(),
    nameHi: cityNameOrId.trim(),
    lat: 18.5204,
    lng: 73.8567,
    elevation: 500,
  };
}

// ─── Main Exported Function ───────────────────────────────────────────────────

export function getPanchangForDate(
  date: Date = new Date(),
  cityIdOrName: string = 'pune',
  customCoords?: { lat: number; lng: number; name?: string }
): PanchangDetail {
  // 1. Resolve Location dynamically from city name/ID
  const city = resolveCity(cityIdOrName);
  let lat = city.lat;
  let lng = city.lng;
  let elevation = city.elevation;
  let nameEn = city.nameEn;
  let nameMr = city.nameMr;
  let nameHi = city.nameHi;

  if (customCoords) {
    lat = customCoords.lat;
    lng = customCoords.lng;
    elevation = 400;
    if (customCoords.name) {
      nameEn = customCoords.name;
      nameMr = customCoords.name;
      nameHi = customCoords.name;
    }
  }

  const observer = new Astronomy.Observer(lat, lng, elevation);

  // 2. Real Sun & Moon Astronomical Positions
  const angles = getSunMoonAngles(date);
  const tithiNum = Math.floor(angles.diff / 12) + 1; // 1 to 30
  const nakshatraIdx = Math.floor(angles.moonSidereal / (360 / 27)); // 0 to 26
  const yogaIdx = Math.floor(((angles.sunSidereal + angles.moonSidereal) % 360) / (360 / 27)); // 0 to 26
  const karanaIdx = Math.floor(angles.diff / 6) % 11; // 0 to 10

  const isShukla = tithiNum <= 15;
  const tithiInPaksha = isShukla ? tithiNum : tithiNum - 15;
  const tithiIndexInArray = tithiInPaksha === 15 ? (isShukla ? 14 : 15) : tithiInPaksha - 1;

  const tithiItem = TITHIS[tithiIndexInArray] || TITHIS[0];
  const nakshatraItem = NAKSHATRAS[nakshatraIdx] || NAKSHATRAS[0];
  const yogaItem = YOGAS[yogaIdx] || YOGAS[0];
  const karanaItem = KARANAS[karanaIdx] || KARANAS[0];

  // 3. Exact Tithi & Nakshatra End Time (Astronomical Search)
  const tithiUntil = findTithiEndTime(date, tithiNum);
  const nakshatraUntil = findNakshatraEndTime(date, nakshatraIdx);

  // 4. City-Specific Sunrise & Sunset (Observer-based)
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);

  const sunriseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, midnight, 1);
  const sunsetEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, midnight, 1);
  const moonriseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, midnight, 1);

  const sunriseTime = sunriseEvent ? formatTime(sunriseEvent.date) : '06:18 AM';
  const sunsetTime = sunsetEvent ? formatTime(sunsetEvent.date) : '06:45 PM';
  const moonriseTime = moonriseEvent ? formatTime(moonriseEvent.date) : '07:30 PM';

  // 5. Exact Rahu Kaal, Yamaganda, Gulika Kaal & Abhijit Muhurat
  const sunriseMs = sunriseEvent ? sunriseEvent.date.getTime() : midnight.getTime() + 6.3 * 3600000;
  const sunsetMs = sunsetEvent ? sunsetEvent.date.getTime() : midnight.getTime() + 18.75 * 3600000;
  const dayDuration = Math.max(sunsetMs - sunriseMs, 11 * 3600000);
  const eighthPart = dayDuration / 8;

  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  // Rahu Kalam part of day (0-indexed):
  const rahuPartMap = [7, 1, 6, 4, 5, 3, 2];
  const rahuPart = rahuPartMap[dayOfWeek];
  const rahuStart = new Date(sunriseMs + rahuPart * eighthPart);
  const rahuEnd = new Date(sunriseMs + (rahuPart + 1) * eighthPart);

  // Yamaganda part of day:
  const yamaPartMap = [4, 3, 2, 1, 0, 6, 5];
  const yamaPart = yamaPartMap[dayOfWeek];
  const yamaStart = new Date(sunriseMs + yamaPart * eighthPart);
  const yamaEnd = new Date(sunriseMs + (yamaPart + 1) * eighthPart);

  // Gulika Kaal part of day:
  const gulikaPartMap = [6, 5, 4, 3, 2, 1, 0];
  const gulikaPart = gulikaPartMap[dayOfWeek];
  const gulikaStart = new Date(sunriseMs + gulikaPart * eighthPart);
  const gulikaEnd = new Date(sunriseMs + (gulikaPart + 1) * eighthPart);

  // Abhijit Muhurat (Local Noon +/- 24 mins)
  const solarNoonMs = (sunriseMs + sunsetMs) / 2;
  const abhijitStart = new Date(solarNoonMs - 24 * 60000);
  const abhijitEnd = new Date(solarNoonMs + 24 * 60000);

  // Brahma Muhurat (Sunrise - 96m to Sunrise - 48m)
  const brahmaStart = new Date(sunriseMs - 96 * 60000);
  const brahmaEnd = new Date(sunriseMs - 48 * 60000);

  // 6. Maharashtra Shalivahana Shaka & Amanta Month
  // Sidereal Sun longitude 0 = Mesha (Chaitra), 30 = Vrishabha (Vaishakha)...
  const monthIdx = Math.floor(angles.sunSidereal / 30) % 12;
  const monthItem = MARATHI_MONTHS[monthIdx] || MARATHI_MONTHS[0];

  const currentYear = date.getFullYear();
  // Shalivahana Shaka year is Gregorian Year - 78
  const shakaYear = currentYear - 78;

  // 7. Maharashtra Events & Festivals
  const events = getMaharashtraEvents(monthIdx, tithiNum, dayOfWeek);

  // 8. Auspicious Status
  const isSpecialDay = events.length > 0;
  const isAuspiciousTithi = tithiInPaksha === 11 || tithiInPaksha === 5 || tithiInPaksha === 8 || tithiNum === 15;
  const isHighlyAuspicious = isSpecialDay || isAuspiciousTithi;

  let auspiciousEn = isHighlyAuspicious ? 'Highly Auspicious Day in Maharashtra' : 'Auspicious Timing for Pooja';
  let auspiciousMr = isHighlyAuspicious ? 'महाराष्ट्रात अत्यंत शुभ व मंगल दिवस' : 'पूजा व विधीसाठी शुभ मुहूर्त';
  let auspiciousHi = isHighlyAuspicious ? 'अत्यंत शुभ व मंगलकारी दिन' : 'पूजन हेतु शुभ समय';

  if (events.length > 0) {
    auspiciousEn = events[0].titleEn;
    auspiciousMr = events[0].titleMr;
    auspiciousHi = events[0].titleHi;
  }

  // 9. Recommended Poojas
  const recommendedPoojas = [
    {
      poojaId: 'p1',
      nameEn: 'Satyanarayan Katha',
      nameHi: 'श्री सत्यनारायण व्रत कथा',
      nameMr: 'श्री सत्यनारायण पूजा व कथा',
      reasonEn: 'Promotes prosperity, family well-being, and fulfills vows.',
      reasonHi: 'सुख-समृद्धि, पारिवारिक शांति और मनोकामना पूर्ति हेतु उत्तम।',
      reasonMr: 'कुटुंबात सुख, शांती, समृद्धी आणि इच्छित मनोरथ पूर्ण करण्यासाठी सर्वोत्तम.',
      panditId: '1',
    },
    {
      poojaId: 'p2',
      nameEn: 'Rudra Abhishek',
      nameHi: 'रुद्राभिषेक पूजन',
      nameMr: 'महादेव रुद्राभिषेक पूजन',
      reasonEn: 'Alleviates doshas, brings mental peace and health benefits.',
      reasonHi: 'स्वास्थ्य लाभ, मानसिक शांति और कष्ट निवारण के लिए शुभ।',
      reasonMr: 'आरोग्य लाभ, मानसिक शांती आणि सर्व संकटांच्या निवारणासाठी फलदायी.',
      panditId: '1',
    },
    {
      poojaId: 'p3',
      nameEn: 'Navagraha Shanti',
      nameHi: 'नवग्रह शांति पूजा',
      nameMr: 'नवग्रह शांती व दोष निवारण',
      reasonEn: 'Harmonizes planetary alignments and welcomes positive energies.',
      reasonHi: 'ग्रह दोषों के प्रभाव को शांत करने और सकारात्मक ऊर्जा प्राप्त करने हेतु।',
      reasonMr: 'ग्रहदोष शांत करून जीवनात सकारात्मक ऊर्जा आणि प्रगती मिळवण्यासाठी.',
      panditId: '2',
    },
    {
      poojaId: 'p4',
      nameEn: 'Griha Pravesh & Vastu Shanti',
      nameHi: 'गृह प्रवेश एवं वास्तु शांति',
      nameMr: 'वास्तुशांती व गृहप्रवेश विधी',
      reasonEn: 'Purifies the home and establishes positive vibrations for new beginnings.',
      reasonHi: 'नए घर के प्रवेश और वास्तु शांति के लिए स्थिर शुभ मुहूर्त।',
      reasonMr: 'घरातील वास्तुदोष दूर करून सुख-समाधानाने नवीन घरात प्रवेश करण्यासाठी.',
      panditId: '3',
    },
  ];

  return {
    tithi: {
      en: tithiItem.en,
      hi: tithiItem.hi,
      mr: tithiItem.mr,
      number: tithiNum,
      pakshaEn: isShukla ? 'Shukla' : 'Krishna',
      pakshaHi: isShukla ? 'शुक्ल' : 'कृष्ण',
      pakshaMr: isShukla ? 'शुक्ल' : 'कृष्ण',
      until: tithiUntil,
    },
    nakshatra: {
      en: nakshatraItem.en,
      hi: nakshatraItem.hi,
      mr: nakshatraItem.mr,
      number: nakshatraIdx + 1,
      until: nakshatraUntil,
    },
    yoga: {
      en: yogaItem.en,
      hi: yogaItem.hi,
      mr: yogaItem.mr,
      number: yogaIdx + 1,
    },
    karana: {
      en: karanaItem.en,
      hi: karanaItem.hi,
      mr: karanaItem.mr,
      number: karanaIdx + 1,
    },
    sunrise: sunriseTime,
    sunset: sunsetTime,
    moonrise: moonriseTime,
    rahukalam: {
      start: formatTime(rahuStart),
      end: formatTime(rahuEnd),
    },
    yamaganda: {
      start: formatTime(yamaStart),
      end: formatTime(yamaEnd),
    },
    gulikaKaal: {
      start: formatTime(gulikaStart),
      end: formatTime(gulikaEnd),
    },
    abhijitMuhurat: {
      start: formatTime(abhijitStart),
      end: formatTime(abhijitEnd),
    },
    brahmaMuhurat: {
      start: formatTime(brahmaStart),
      end: formatTime(brahmaEnd),
    },
    shaka: {
      en: `Shalivahana Shaka ${shakaYear}`,
      mr: `शालिवाहन शक ${shakaYear}`,
      hi: `शालिवाहन शक ${shakaYear}`,
    },
    month: {
      en: monthItem.en,
      hi: monthItem.hi,
      mr: monthItem.mr,
    },
    samvatsara: {
      en: 'Krodhi Samvatsara',
      mr: 'क्रोधी संवत्सर',
    },
    city: {
      nameEn,
      nameMr,
      nameHi,
    },
    events,
    auspiciousStatus: {
      en: auspiciousEn,
      hi: auspiciousHi,
      mr: auspiciousMr,
      isHighlyAuspicious,
    },
    recommendedPoojas,
  };
}

export interface UpcomingFestival {
  id: string;
  date: Date;
  dateStr: string;
  daysRemaining: number;
  titleEn: string;
  titleMr: string;
  titleHi: string;
  descriptionEn: string;
  descriptionMr: string;
  descriptionHi: string;
  type: 'festival' | 'vrat' | 'jayanti' | 'muhurat';
}

export function getUpcomingMaharashtraFestivals(
  fromDate: Date = new Date(),
  limit: number = 8
): UpcomingFestival[] {
  const result: UpcomingFestival[] = [];
  const seenTitles = new Set<string>();

  const base = new Date(fromDate);
  base.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 60 && result.length < limit; offset++) {
    const target = new Date(base);
    target.setDate(base.getDate() + offset);

    const panchang = getPanchangForDate(target);
    if (panchang.events && panchang.events.length > 0) {
      for (const ev of panchang.events) {
        if (!seenTitles.has(ev.titleEn)) {
          seenTitles.add(ev.titleEn);
          result.push({
            id: `${ev.titleEn}-${offset}`,
            date: target,
            dateStr: target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            daysRemaining: offset,
            titleEn: ev.titleEn,
            titleMr: ev.titleMr,
            titleHi: ev.titleHi,
            descriptionEn: ev.descriptionEn,
            descriptionMr: ev.descriptionMr,
            descriptionHi: ev.descriptionHi,
            type: ev.type,
          });
        }
      }
    }
  }

  return result;
}

export function getTonightMoonriseCountdown(
  date: Date = new Date(),
  cityIdOrName: string = 'pune'
): {
  timeStr: string;
  minutesRemaining: number;
  isTonight: boolean;
  statusTextEn: string;
  statusTextMr: string;
  statusTextHi: string;
} {
  const panchang = getPanchangForDate(date, cityIdOrName);
  const now = new Date();

  const city = resolveCity(cityIdOrName);
  const observer = new Astronomy.Observer(city.lat, city.lng, city.elevation);
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);

  const moonriseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, midnight, 1);
  if (!moonriseEvent) {
    return {
      timeStr: panchang.moonrise,
      minutesRemaining: 0,
      isTonight: false,
      statusTextEn: `Moonrise at ${panchang.moonrise}`,
      statusTextMr: `चंद्रोदय ${panchang.moonrise}`,
      statusTextHi: `चंद्रोदय ${panchang.moonrise}`,
    };
  }

  const moonriseMs = moonriseEvent.date.getTime();
  const diffMs = moonriseMs - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins <= 0) {
    return {
      timeStr: panchang.moonrise,
      minutesRemaining: 0,
      isTonight: true,
      statusTextEn: `Moon has risen (${panchang.moonrise})`,
      statusTextMr: `चंद्रोदय झाला आहे (${panchang.moonrise})`,
      statusTextHi: `चंद्रोदय हो चुका है (${panchang.moonrise})`,
    };
  }

  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  const timeRemainingStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  const timeRemainingMr = hrs > 0 ? `${hrs} तास ${mins} मिनिटे` : `${mins} मिनिटे`;

  return {
    timeStr: panchang.moonrise,
    minutesRemaining: diffMins,
    isTonight: true,
    statusTextEn: `Rises in ${timeRemainingStr} (${panchang.moonrise})`,
    statusTextMr: `चंद्रोदय ${timeRemainingMr} बाकी (${panchang.moonrise})`,
    statusTextHi: `चंद्रोदय ${timeRemainingStr} शेष (${panchang.moonrise})`,
  };
}
