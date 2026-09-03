import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', requireAuth)

// GET /addresses
app.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const sb = getSupabase(c.env)
    const { data, error } = await sb
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('id')
    if (error) return c.json({ message: error.message }, 500)
    return c.json((data || []).map(a => ({
      id: a.id, userId: a.user_id, label: a.label, name: a.name,
      address: a.address, phone: a.phone, pincode: a.pincode, city: a.city,
      isDefault: a.is_default, createdAt: a.created_at, updatedAt: a.updated_at,
    })))
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /addresses
app.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const sb = getSupabase(c.env)

    if (body.isDefault) {
      await sb.from('addresses').update({ is_default: false }).eq('user_id', userId)
    }

    const { data: addr, error } = await sb
      .from('addresses')
      .insert({
        user_id: userId, label: body.label, name: body.name,
        address: body.address, phone: body.phone, pincode: body.pincode,
        city: body.city, is_default: body.isDefault ?? false,
      })
      .select().single()

    if (error || !addr) return c.json({ message: error?.message || 'Failed to create address' }, 500)
    return c.json({
      id: addr.id, userId: addr.user_id, label: addr.label, name: addr.name,
      address: addr.address, phone: addr.phone, pincode: addr.pincode, city: addr.city,
      isDefault: addr.is_default, createdAt: addr.created_at, updatedAt: addr.updated_at,
    }, 201)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// PUT /addresses/:id
app.put('/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)

    const sb = getSupabase(c.env)
    const { data: existing } = await sb.from('addresses').select('id').eq('id', id).eq('user_id', userId).maybeSingle()
    if (!existing) return c.json({ message: 'Address not found' }, 404)

    const body = await c.req.json()
    if (body.isDefault) {
      await sb.from('addresses').update({ is_default: false }).eq('user_id', userId).neq('id', id)
    }

    const { data: updated, error } = await sb
      .from('addresses')
      .update({
        label: body.label, name: body.name, address: body.address,
        phone: body.phone, pincode: body.pincode, city: body.city, is_default: body.isDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id).select().single()

    if (error || !updated) return c.json({ message: error?.message || 'Failed to update' }, 500)
    return c.json({
      id: updated.id, userId: updated.user_id, label: updated.label, name: updated.name,
      address: updated.address, phone: updated.phone, pincode: updated.pincode, city: updated.city,
      isDefault: updated.is_default, createdAt: updated.created_at, updatedAt: updated.updated_at,
    })
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// DELETE /addresses/:id
app.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)

    const sb = getSupabase(c.env)
    const { data: existing } = await sb.from('addresses').select('id').eq('id', id).eq('user_id', userId).maybeSingle()
    if (!existing) return c.json({ message: 'Address not found' }, 404)

    const { error } = await sb.from('addresses').delete().eq('id', id)
    if (error) return c.json({ message: error.message }, 500)
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

export default app
