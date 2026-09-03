import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

function mapBooking(b: any) {
  return {
    id: b.id, userId: b.user_id, bookingId: b.booking_id,
    poojaId: b.pooja_id, poojaName: b.pooja_name,
    panditId: b.pandit_id, panditName: b.pandit_name,
    panditColor: b.pandit_color, panditInitials: b.pandit_initials,
    date: b.date, time: b.time, amount: b.amount, status: b.status,
    createdAt: b.created_at, updatedAt: b.updated_at,
  }
}

// GET /bookings
app.get('/', async (c) => {
  const authHeader = c.req.header('Authorization')
  const sb = getSupabase(c.env)

  // Admin bypass
  if (authHeader === 'Bearer admin-bypass-secret-2026') {
    const { data } = await sb.from('bookings').select('*').order('id')
    return c.json((data || []).map(mapBooking))
  }

  // Normal auth
  try {
    const { verifyToken } = await import('../lib/auth')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return c.json({ message: 'Authentication required' }, 401)
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const { data } = await sb.from('bookings').select('*').eq('user_id', payload.userId).order('id')
    return c.json((data || []).map(mapBooking))
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})

// POST /bookings
app.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const randNum = Math.floor(1000 + Math.random() * 9000)
    const booking_id = `SKL-${randNum}`
    const sb = getSupabase(c.env)
    const { data: booking, error } = await sb.from('bookings').insert({
      user_id: userId, booking_id, pooja_id: body.poojaId, pooja_name: body.poojaName,
      pandit_id: String(body.panditId), pandit_name: body.panditName,
      pandit_color: body.panditColor, pandit_initials: body.panditInitials,
      date: body.date, time: body.time, amount: body.amount, status: 'upcoming',
    }).select().single()
    if (error || !booking) return c.json({ message: error?.message || 'Failed to place booking' }, 500)
    return c.json(mapBooking(booking), 201)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /bookings/:id/cancel
app.post('/:id/cancel', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const sb = getSupabase(c.env)
    const { data: existing } = await sb.from('bookings').select('*').eq('id', id).maybeSingle()
    if (!existing) return c.json({ message: 'Booking not found' }, 404)
    if (existing.user_id !== userId) return c.json({ message: 'Not authorized to cancel this booking' }, 403)
    if (existing.status === 'cancelled') return c.json({ message: 'Booking is already cancelled' }, 400)
    const { data: updated, error } = await sb.from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error || !updated) return c.json({ message: 'Failed to cancel booking' }, 500)
    return c.json(mapBooking(updated))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// PUT /bookings/:id/status (admin)
app.put('/:id/status', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const body = await c.req.json()
    if (!body.status) return c.json({ message: 'status is required' }, 400)
    const sb = getSupabase(c.env)
    const { data: updated, error } = await sb.from('bookings').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error || !updated) return c.json({ message: 'Booking not found' }, 404)
    return c.json(mapBooking(updated))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

export default app
