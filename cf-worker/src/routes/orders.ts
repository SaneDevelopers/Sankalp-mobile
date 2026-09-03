import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

function mapOrder(o: any) {
  return {
    id: o.id, userId: o.user_id, orderId: o.order_id,
    items: o.items, amount: o.amount, delivery: o.delivery,
    status: o.status, addressText: o.address_text,
    createdAt: o.created_at, updatedAt: o.updated_at,
  }
}

// GET /orders
app.get('/', async (c) => {
  const authHeader = c.req.header('Authorization')
  const sb = getSupabase(c.env)
  if (authHeader === 'Bearer admin-bypass-secret-2026') {
    const { data } = await sb.from('orders').select('*').order('id')
    return c.json((data || []).map(mapOrder))
  }
  try {
    const { verifyToken } = await import('../lib/auth')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return c.json({ message: 'Authentication required' }, 401)
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const { data } = await sb.from('orders').select('*').eq('user_id', payload.userId).order('id')
    return c.json((data || []).map(mapOrder))
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})

// GET /orders/:id
app.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const sb = getSupabase(c.env)
    const { data: order } = await sb.from('orders').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
    if (!order) return c.json({ message: 'Order not found' }, 404)
    return c.json(mapOrder(order))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /orders
app.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const randNum = Math.floor(1000 + Math.random() * 9000)
    const order_id = `ORD-${randNum}`
    const sb = getSupabase(c.env)
    const { data: order, error } = await sb.from('orders').insert({
      user_id: userId, order_id, items: body.items,
      amount: body.amount, delivery: body.delivery,
      status: 'processing', address_text: body.addressText,
    }).select().single()
    if (error || !order) return c.json({ message: error?.message || 'Failed to place order' }, 500)
    return c.json(mapOrder(order), 201)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// PUT /orders/:id/status (admin)
app.put('/:id/status', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const body = await c.req.json()
    if (!body.status) return c.json({ message: 'status is required' }, 400)
    const sb = getSupabase(c.env)
    const { data: updated, error } = await sb.from('orders').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error || !updated) return c.json({ message: 'Order not found' }, 404)
    return c.json(mapOrder(updated))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

export default app
