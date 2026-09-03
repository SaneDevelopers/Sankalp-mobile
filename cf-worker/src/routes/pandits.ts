import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const SEED_PANDITS = [
  { name: "Acharya V. Shastri", email: "acharya.v@sankalp.com", password: "password123", image_url: "https://randomuser.me/api/portraits/men/32.jpg", short_name: "Acharya V. Sh...", specialty: "Vedic Rituals Specialist", category: "vedic", rating: 4.9, experience: "15+ Yrs", bookings: 1240, age: 62, city: "Varanasi", address: "Vishwanath Gali, Dashashwamedh, Varanasi, UP 221001", available: "today", initials: "VS", avatar_color: "#7B4F2E", specializations: ["Vivah Sanskar","Griha Pravesh","Satyanarayan","Rudra Abhishek","Navagraha"], muhurats: ["6:00 AM","9:30 AM","11:45 AM","4:15 PM","6:30 PM","7:45 PM"], poojas: [{ id: "p1", name: "Satyanarayan Katha", duration: "1.5 Hrs", price: 2499, includesPrasad: true },{ id: "p2", name: "Rudra Abhishek", duration: "2 Hrs", price: 4499, includesPrasad: true },{ id: "p3", name: "Navagraha Shanti", duration: "1 Hr", price: 1999, includesPrasad: false },{ id: "p4", name: "Griha Pravesh", duration: "2.5 Hrs", price: 3499, includesPrasad: true },{ id: "p14", name: "Vivah Sanskar", duration: "3 Hrs", price: 7999, includesPrasad: true }] },
  { name: "Pandit K. Narayanan", email: "pandit.k@sankalp.com", password: "password123", image_url: "https://randomuser.me/api/portraits/men/44.jpg", short_name: "Pandit K. N...", specialty: "Astrology & Jyotish Expert", category: "astrology", rating: 4.8, experience: "12 Yrs", bookings: 890, age: 54, city: "Ujjain", address: "Mahakal Marg, Ujjain, MP 456001", available: "today", initials: "KN", avatar_color: "#4A3728", specializations: ["Kundali Analysis","Navagraha Puja","Mangal Dosha","Shani Shanti","Lakshmi Puja"], muhurats: ["7:00 AM","10:00 AM","1:00 PM","5:00 PM","7:00 PM"], poojas: [{ id: "p5", name: "Kundali Puja", duration: "1 Hr", price: 1499, includesPrasad: false },{ id: "p6", name: "Shani Shanti", duration: "1.5 Hrs", price: 2099, includesPrasad: true },{ id: "p7", name: "Mangal Dosha Puja", duration: "2 Hrs", price: 2799, includesPrasad: true },{ id: "p15", name: "Lakshmi Puja", duration: "1 Hr", price: 1799, includesPrasad: true },{ id: "p16", name: "Navagraha Shanti", duration: "1 Hr", price: 1999, includesPrasad: false }] },
  { name: "Acharya R. Joshi", email: "acharya.r@sankalp.com", password: "password123", image_url: "https://randomuser.me/api/portraits/men/62.jpg", short_name: "Acharya R. J...", specialty: "Griha Pravesh Specialist", category: "griha", rating: 4.7, experience: "8 Yrs", bookings: 560, age: 45, city: "Delhi NCR", address: "Sector 22, Dwarka, New Delhi 110075", available: "tomorrow", initials: "RJ", avatar_color: "#6B3A2A", specializations: ["Griha Pravesh","Vastu Puja","Bhoomi Puja","Office Inauguration","Ganesh Puja"], muhurats: ["8:00 AM","11:00 AM","3:00 PM","6:00 PM"], poojas: [{ id: "p8", name: "Griha Pravesh Puja", duration: "2 Hrs", price: 3499, includesPrasad: true },{ id: "p9", name: "Vastu Shanti", duration: "1.5 Hrs", price: 2499, includesPrasad: false },{ id: "p10", name: "Bhoomi Puja", duration: "1 Hr", price: 1799, includesPrasad: false },{ id: "p17", name: "Lakshmi Puja", duration: "1 Hr", price: 1799, includesPrasad: true },{ id: "p18", name: "Ganesh Puja", duration: "45 Mins", price: 999, includesPrasad: true }] },
  { name: "Pandit S. Mishra", email: "pandit.s@sankalp.com", password: "password123", image_url: "https://randomuser.me/api/portraits/men/78.jpg", short_name: "Pandit S. M...", specialty: "Havan & Yagna Expert", category: "havan", rating: 4.6, experience: "20 Yrs", bookings: 1560, age: 68, city: "Allahabad", address: "Triveni Sangam, Prayagraj, UP 211001", available: "today", initials: "SM", avatar_color: "#5C3317", specializations: ["Maha Havan","Gayatri Yagna","Navchandi Path","Durga Saptashati","Vivah Sanskar"], muhurats: ["5:00 AM","8:30 AM","12:00 PM","4:30 PM"], poojas: [{ id: "p11", name: "Maha Havan", duration: "3 Hrs", price: 5999, includesPrasad: true },{ id: "p12", name: "Gayatri Yagna", duration: "2 Hrs", price: 3999, includesPrasad: true },{ id: "p13", name: "Navchandi Path", duration: "4 Hrs", price: 7999, includesPrasad: true },{ id: "p19", name: "Vivah Sanskar", duration: "3 Hrs", price: 7999, includesPrasad: true }] },
]

function mapPandit(p: any) {
  return {
    id: p.id, name: p.name, shortName: p.short_name, specialty: p.specialty,
    category: p.category, rating: p.rating, experience: p.experience,
    bookings: p.bookings, age: p.age, city: p.city, address: p.address,
    available: p.available, initials: p.initials, avatarColor: p.avatar_color,
    email: p.email, imageUrl: p.image_url, specializations: p.specializations,
    muhurats: p.muhurats, poojas: p.poojas,
    createdAt: p.created_at, updatedAt: p.updated_at,
  }
}

// GET /pandits
app.get('/', async (c) => {
  try {
    const sb = getSupabase(c.env)
    let { data: list } = await sb.from('pandits').select('*').order('id')
    if (!list || list.length === 0) {
      await sb.from('pandits').insert(SEED_PANDITS)
      const { data: seeded } = await sb.from('pandits').select('*').order('id')
      list = seeded || []
    }
    return c.json((list).map(mapPandit))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /pandits (admin)
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const sb = getSupabase(c.env)
    const { data: pandit, error } = await sb.from('pandits').insert({
      name: body.name, email: body.email, password: body.password,
      image_url: body.imageUrl, short_name: body.shortName, specialty: body.specialty,
      category: body.category, rating: body.rating, experience: body.experience,
      bookings: body.bookings ?? 0, age: body.age, city: body.city, address: body.address,
      available: body.available ?? 'today', specializations: body.specializations,
      muhurats: body.muhurats, poojas: body.poojas, initials: body.initials,
      avatar_color: body.avatarColor,
    }).select().single()
    if (error || !pandit) return c.json({ message: error?.message || 'Failed to create pandit' }, 500)
    return c.json(mapPandit(pandit), 201)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// PUT /pandits/:id (admin)
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const body = await c.req.json()
    const sb = getSupabase(c.env)
    const { data: updated, error } = await sb.from('pandits').update({
      name: body.name, email: body.email, password: body.password,
      image_url: body.imageUrl, short_name: body.shortName, specialty: body.specialty,
      category: body.category, rating: body.rating, experience: body.experience,
      bookings: body.bookings, age: body.age, city: body.city, address: body.address,
      available: body.available, specializations: body.specializations,
      muhurats: body.muhurats, poojas: body.poojas, initials: body.initials,
      avatar_color: body.avatarColor, updated_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error || !updated) return c.json({ message: 'Pandit not found' }, 404)
    return c.json(mapPandit(updated))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// DELETE /pandits/:id (admin)
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const sb = getSupabase(c.env)
    const { error } = await sb.from('pandits').delete().eq('id', id)
    if (error) return c.json({ message: 'Pandit not found' }, 404)
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /pandits/forgot-password
app.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ message: 'Email is required' }, 400)
    const sb = getSupabase(c.env)
    const { data: pandit } = await sb.from('pandits').select('id,email').eq('email', email).maybeSingle()
    if (!pandit) return c.json({ message: 'Pandit with this email not found' }, 404)
    const resetToken = Math.random().toString(36).substring(2, 15)
    const resetLink = `https://admin.sankalp.com/reset-password?token=${resetToken}`
    console.log(`[MAIL MOCK] Password Reset Link for ${email}:\n => ${resetLink}`)
    return c.json({ message: 'Password reset link generated successfully', resetLink })
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

export default app
