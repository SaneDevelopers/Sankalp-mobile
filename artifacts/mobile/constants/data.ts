export interface Pandit {
  id: string;
  name: string;
  shortName: string;
  specialty: string;
  category: 'vedic' | 'astrology' | 'havan' | 'griha';
  rating: number;
  experience: string;
  bookings: number;
  age: number;
  city: string;
  address: string;
  available: 'today' | 'tomorrow' | 'next_week';
  specializations: string[];
  muhurats: string[];
  poojas: Pooja[];
  initials: string;
  avatarColor: string;
}

export interface Pooja {
  id: string;
  name: string;
  duration: string;
  price: number;
  includesPrasad: boolean;
}

export interface PoojaType {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  duration: string;
  priceFrom: number;
  description: string;
  panditIds: string[];
  bestseller?: boolean;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  featured: boolean;
  description: string;
  color: string;
}

export interface Booking {
  id: string;
  poojaName: string;
  panditName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
  panditInitials: string;
  panditColor: string;
  bookingId: string;
}

export const PANDITS: Pandit[] = [
  {
    id: '1',
    name: 'Acharya V. Shastri',
    shortName: 'Acharya V. Sh...',
    specialty: 'Vedic Rituals Specialist',
    category: 'vedic',
    rating: 4.9,
    experience: '15+ Yrs',
    bookings: 1240,
    age: 62,
    city: 'Varanasi',
    address: 'Vishwanath Gali, Dashashwamedh, Varanasi, UP 221001',
    available: 'today',
    initials: 'VS',
    avatarColor: '#7B4F2E',
    specializations: ['Vivah Sanskar', 'Griha Pravesh', 'Satyanarayan', 'Rudra Abhishek', 'Navagraha'],
    muhurats: ['6:00 AM', '9:30 AM', '11:45 AM', '4:15 PM', '6:30 PM', '7:45 PM'],
    poojas: [
      { id: 'p1', name: 'Satyanarayan Katha', duration: '1.5 Hrs', price: 2499, includesPrasad: true },
      { id: 'p2', name: 'Rudra Abhishek', duration: '2 Hrs', price: 4499, includesPrasad: true },
      { id: 'p3', name: 'Navagraha Shanti', duration: '1 Hr', price: 1999, includesPrasad: false },
      { id: 'p4', name: 'Griha Pravesh', duration: '2.5 Hrs', price: 3499, includesPrasad: true },
      { id: 'p14', name: 'Vivah Sanskar', duration: '3 Hrs', price: 7999, includesPrasad: true },
    ],
  },
  {
    id: '2',
    name: 'Pandit K. Narayanan',
    shortName: 'Pandit K. N...',
    specialty: 'Astrology & Jyotish Expert',
    category: 'astrology',
    rating: 4.8,
    experience: '12 Yrs',
    bookings: 890,
    age: 54,
    city: 'Ujjain',
    address: 'Mahakal Marg, Ujjain, MP 456001',
    available: 'today',
    initials: 'KN',
    avatarColor: '#4A3728',
    specializations: ['Kundali Analysis', 'Navagraha Puja', 'Mangal Dosha', 'Shani Shanti', 'Lakshmi Puja'],
    muhurats: ['7:00 AM', '10:00 AM', '1:00 PM', '5:00 PM', '7:00 PM'],
    poojas: [
      { id: 'p5', name: 'Kundali Puja', duration: '1 Hr', price: 1499, includesPrasad: false },
      { id: 'p6', name: 'Shani Shanti', duration: '1.5 Hrs', price: 2099, includesPrasad: true },
      { id: 'p7', name: 'Mangal Dosha Puja', duration: '2 Hrs', price: 2799, includesPrasad: true },
      { id: 'p15', name: 'Lakshmi Puja', duration: '1 Hr', price: 1799, includesPrasad: true },
      { id: 'p16', name: 'Navagraha Shanti', duration: '1 Hr', price: 1999, includesPrasad: false },
    ],
  },
  {
    id: '3',
    name: 'Acharya R. Joshi',
    shortName: 'Acharya R. J...',
    specialty: 'Griha Pravesh Specialist',
    category: 'griha',
    rating: 4.7,
    experience: '8 Yrs',
    bookings: 560,
    age: 45,
    city: 'Delhi NCR',
    address: 'Sector 22, Dwarka, New Delhi 110075',
    available: 'tomorrow',
    initials: 'RJ',
    avatarColor: '#6B3A2A',
    specializations: ['Griha Pravesh', 'Vastu Puja', 'Bhoomi Puja', 'Office Inauguration', 'Ganesh Puja'],
    muhurats: ['8:00 AM', '11:00 AM', '3:00 PM', '6:00 PM'],
    poojas: [
      { id: 'p8', name: 'Griha Pravesh Puja', duration: '2 Hrs', price: 3499, includesPrasad: true },
      { id: 'p9', name: 'Vastu Shanti', duration: '1.5 Hrs', price: 2499, includesPrasad: false },
      { id: 'p10', name: 'Bhoomi Puja', duration: '1 Hr', price: 1799, includesPrasad: false },
      { id: 'p17', name: 'Lakshmi Puja', duration: '1 Hr', price: 1799, includesPrasad: true },
      { id: 'p18', name: 'Ganesh Puja', duration: '45 Mins', price: 999, includesPrasad: true },
    ],
  },
  {
    id: '4',
    name: 'Pandit S. Mishra',
    shortName: 'Pandit S. M...',
    specialty: 'Havan & Yagna Expert',
    category: 'havan',
    rating: 4.6,
    experience: '20 Yrs',
    bookings: 1560,
    age: 68,
    city: 'Allahabad',
    address: 'Triveni Sangam, Prayagraj, UP 211001',
    available: 'today',
    initials: 'SM',
    avatarColor: '#5C3317',
    specializations: ['Maha Havan', 'Gayatri Yagna', 'Navchandi Path', 'Durga Saptashati', 'Vivah Sanskar'],
    muhurats: ['5:00 AM', '8:30 AM', '12:00 PM', '4:30 PM'],
    poojas: [
      { id: 'p11', name: 'Maha Havan', duration: '3 Hrs', price: 5999, includesPrasad: true },
      { id: 'p12', name: 'Gayatri Yagna', duration: '2 Hrs', price: 3999, includesPrasad: true },
      { id: 'p13', name: 'Navchandi Path', duration: '4 Hrs', price: 7999, includesPrasad: true },
      { id: 'p19', name: 'Vivah Sanskar', duration: '3 Hrs', price: 7999, includesPrasad: true },
    ],
  },
];

export const POOJA_TYPES: PoojaType[] = [
  {
    id: 'pt1', name: 'Satyanarayan Katha', icon: 'sun', color: '#C89A3C', bgColor: '#C89A3C',
    duration: '1.5 Hrs', priceFrom: 2499, description: 'For peace, prosperity and divine blessings',
    panditIds: ['1', '2'], bestseller: true,
  },
  {
    id: 'pt2', name: 'Griha Pravesh', icon: 'home', color: '#7B1F1F', bgColor: '#7B1F1F',
    duration: '2 Hrs', priceFrom: 3499, description: 'Sacred home warming ceremony',
    panditIds: ['1', '3'], bestseller: true,
  },
  {
    id: 'pt3', name: 'Navagraha Shanti', icon: 'star', color: '#4A3728', bgColor: '#4A3728',
    duration: '1 Hr', priceFrom: 1999, description: 'Nine planet appeasement ritual',
    panditIds: ['1', '2'],
  },
  {
    id: 'pt4', name: 'Rudra Abhishek', icon: 'droplet', color: '#5C3317', bgColor: '#5C3317',
    duration: '2 Hrs', priceFrom: 4499, description: 'Lord Shiva worship with milk & water',
    panditIds: ['1'],
  },
  {
    id: 'pt5', name: 'Lakshmi Puja', icon: 'dollar-sign', color: '#D4722A', bgColor: '#D4722A',
    duration: '1 Hr', priceFrom: 1799, description: 'Invoke the goddess of wealth',
    panditIds: ['2', '3'], bestseller: true,
  },
  {
    id: 'pt6', name: 'Ganesh Puja', icon: 'circle', color: '#C89A3C', bgColor: '#C89A3C',
    duration: '45 Mins', priceFrom: 999, description: 'Remove obstacles, invite success',
    panditIds: ['2', '3'],
  },
  {
    id: 'pt7', name: 'Vivah Sanskar', icon: 'heart', color: '#7B1F1F', bgColor: '#7B1F1F',
    duration: '3 Hrs', priceFrom: 7999, description: 'Complete sacred wedding ceremony',
    panditIds: ['1', '4'],
  },
  {
    id: 'pt8', name: 'Maha Havan', icon: 'zap', color: '#5C3317', bgColor: '#5C3317',
    duration: '3 Hrs', priceFrom: 5999, description: 'Sacred fire ritual for purification',
    panditIds: ['4'],
  },
];

export const SERVICES: Service[] = [
  { id: 's1', name: 'Pooja', icon: 'sun', color: '#D4722A' },
  { id: 's2', name: 'Havan', icon: 'zap', color: '#7B1F1F' },
];

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'si1', name: 'Complete Havan Kit', price: 1250, unit: '100% organic · 750g',
    category: 'premium', featured: true, description: 'Complete kit for all havan rituals', color: '#C89A3C',
  },
  {
    id: 'si2', name: 'Brass Pooja Thali', price: 1299, unit: 'Set of 7 items',
    category: 'samagri', featured: false, description: 'Traditional brass thali with all accessories', color: '#D4722A',
  },
  {
    id: 'si3', name: 'Sandalwood Agarbatti', price: 249, unit: 'Pack of 40 sticks',
    category: 'samagri', featured: false, description: 'Pure sandalwood incense sticks', color: '#7B4F2E',
  },
  {
    id: 'si4', name: 'Rudraksh Mala', price: 899, unit: '108 beads · 5 Mukhi',
    category: 'samagri', featured: false, description: 'Authentic 5 mukhi rudraksh mala', color: '#5C3317',
  },
  {
    id: 'si5', name: 'Panchamrit Kit', price: 399, unit: 'Ready to use',
    category: 'samagri', featured: false, description: 'All ingredients for panchamrit abhishek', color: '#C89A3C',
  },
  {
    id: 'si6', name: 'Pure Cow Ghee', price: 599, unit: '500ml · Pure A2',
    category: 'samagri', featured: false, description: 'Pure A2 cow ghee for havan and pooja', color: '#D4722A',
  },
];

export const UTENSILS: StoreItem[] = [
  {
    id: 'ut1', name: 'Brass Diya (Set of 5)', price: 199, unit: 'Handcrafted brass',
    category: 'utensils', featured: false, description: 'Traditional brass diyas for aarti', color: '#C89A3C',
  },
  {
    id: 'ut2', name: 'Copper Kalash', price: 449, unit: '500ml · Pure copper',
    category: 'utensils', featured: false, description: 'Pure copper water pot for rituals', color: '#D4722A',
  },
  {
    id: 'ut3', name: 'Puja Bell (Ghanta)', price: 299, unit: 'Brass · Medium size',
    category: 'utensils', featured: false, description: 'Brass bell for puja ceremonies', color: '#C89A3C',
  },
  {
    id: 'ut4', name: 'Incense Holder', price: 149, unit: 'Wooden · Handcrafted',
    category: 'utensils', featured: false, description: 'Decorative incense stick holder', color: '#7B4F2E',
  },
  {
    id: 'ut5', name: 'Camphor (Kapoor)', price: 99, unit: '50g · Pure',
    category: 'utensils', featured: false, description: 'Pure camphor tablets for aarti', color: '#8B7355',
  },
  {
    id: 'ut6', name: 'Silver Puja Thali', price: 1499, unit: 'Silver plated · Premium',
    category: 'utensils', featured: false, description: 'Premium silver-plated thali set', color: '#8B8B8B',
  },
];

export const BESTSELLER_ITEMS = [
  { ...STORE_ITEMS[1], label: '🏆 Bestseller' },
  { ...STORE_ITEMS[2], label: '⭐ Popular' },
  { ...STORE_ITEMS[3], label: '✨ Trending' },
  { ...UTENSILS[0], label: '🔥 Top Pick' },
  { ...UTENSILS[2], label: '⭐ Popular' },
];

export const FEATURED_POOJAS = [
  { id: 'fp1', name: 'Satyanarayan Katha', duration: '1.5 Hrs', price: 2499, panditId: '1' },
  { id: 'fp2', name: 'Griha Pravesh', duration: '2 Hrs', price: 3499, panditId: '3' },
  { id: 'fp3', name: 'Navagraha Shanti', duration: '1 Hr', price: 1999, panditId: '2' },
  { id: 'fp4', name: 'Rudra Abhishek', duration: '2.5 Hrs', price: 4499, panditId: '1' },
];

export const BOOKINGS: Booking[] = [
  {
    id: 'b1', poojaName: 'Satyanarayan Katha', panditName: 'Acharya Shastri',
    date: '15 Oct', time: '9:30 AM', status: 'upcoming', amount: 2499,
    panditInitials: 'VS', panditColor: '#7B4F2E', bookingId: 'SKL-8821',
  },
  {
    id: 'b2', poojaName: 'Griha Pravesh', panditName: 'Pandit Mishra',
    date: '02 Oct', time: '6:00 AM', status: 'completed', amount: 3499,
    panditInitials: 'SM', panditColor: '#5C3317', bookingId: 'SKL-8820',
  },
  {
    id: 'b3', poojaName: 'Rudra Abhishek', panditName: 'Acharya Joshi',
    date: '16 Sep', time: '11:00 AM', status: 'completed', amount: 4499,
    panditInitials: 'RJ', panditColor: '#6B3A2A', bookingId: 'SKL-8819',
  },
  {
    id: 'b4', poojaName: 'Navagraha Shanti', panditName: 'Acharya Shastri',
    date: '05 Sep', time: '7:45 PM', status: 'cancelled', amount: 1999,
    panditInitials: 'VS', panditColor: '#7B4F2E', bookingId: 'SKL-8818',
  },
];

export const DATES = [
  { day: 'MON', date: 14, month: 'Oct' },
  { day: 'TUE', date: 15, month: 'Oct' },
  { day: 'WED', date: 16, month: 'Oct' },
  { day: 'THU', date: 17, month: 'Oct' },
  { day: 'FRI', date: 18, month: 'Oct' },
];

export const LOCAL_PINCODES: Record<string, string> = {
  "201301": "Noida",
  "201305": "Noida",
  "201308": "Greater Noida",
  "221001": "Varanasi",
  "221002": "Varanasi",
  "224123": "Ayodhya",
  "281001": "Mathura",
  "281121": "Vrindavan",
  "211001": "Prayagraj",
  "226001": "Lucknow",
  "226010": "Lucknow",
  "273001": "Gorakhpur",
  "208001": "Kanpur",
  "282001": "Agra"
};

export const validatePincodeOffline = (pin: string) => {
  if (pin.length !== 6 || !/^\d+$/.test(pin)) return null;
  const prefix = pin.substring(0, 2);
  const prefixInt = parseInt(prefix, 10);
  if (prefixInt >= 20 && prefixInt <= 28) {
    if (LOCAL_PINCODES[pin]) return LOCAL_PINCODES[pin];
    if (prefix === '20') return 'Noida/Western UP';
    if (prefix === '21') return 'Prayagraj/Southern UP';
    if (prefix === '22') return 'Lucknow/Central UP';
    if (prefix === '23') return 'Mirzapur/Varanasi region';
    if (prefix === '24') return 'Bareilly/Northern UP';
    if (prefix === '25') return 'Meerut/Western UP';
    return 'Uttar Pradesh';
  }
  return null;
};

