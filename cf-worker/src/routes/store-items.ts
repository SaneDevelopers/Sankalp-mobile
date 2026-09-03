import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const SEED_ITEMS = [
  { name: "Complete Havan Kit", price: 1250, unit: "100% organic · 750g", category: "premium", featured: true, description: "Complete kit for all havan rituals", color: "#C89A3C", image_url: "" },
  { name: "Brass Pooja Thali", price: 1299, unit: "Set of 7 items", category: "samagri", featured: false, description: "Traditional brass thali with all accessories", color: "#D4722A", image_url: "" },
  { name: "Sandalwood Agarbatti", price: 249, unit: "Pack of 40 sticks", category: "samagri", featured: false, description: "Pure sandalwood incense sticks", color: "#7B4F2E", image_url: "" },
  { name: "Rudraksh Mala", price: 899, unit: "108 beads · 5 Mukhi", category: "samagri", featured: false, description: "Authentic 5 mukhi rudraksh mala", color: "#5C3317", image_url: "" },
  { name: "Panchamrit Kit", price: 399, unit: "Ready to use", category: "samagri", featured: false, description: "All ingredients for panchamrit abhishek", color: "#C89A3C", image_url: "" },
  { name: "Pure Cow Ghee", price: 599, unit: "500ml · Pure A2", category: "samagri", featured: false, description: "Pure A2 cow ghee for havan and pooja", color: "#D4722A", image_url: "" },
  { name: "Brass Diya (Set of 5)", price: 199, unit: "Handcrafted brass", category: "utensils", featured: false, description: "Traditional brass diyas for aarti", color: "#C89A3C", image_url: "" },
  { name: "Copper Kalash", price: 449, unit: "500ml · Pure copper", category: "utensils", featured: false, description: "Pure copper water pot for rituals", color: "#D4722A", image_url: "" },
]

// GET /store-items
app.get('/', async (c) => {
  try {
    const sb = getSupabase(c.env)
    let { data: items } = await sb.from('store_items').select('*')
    if (!items || items.length === 0) {
      await sb.from('store_items').insert(SEED_ITEMS)
      const { data: seeded } = await sb.from('store_items').select('*')
      items = seeded || []
    }
    return c.json(items)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// POST /store-items (admin)
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const sb = getSupabase(c.env)
    const { data: item, error } = await sb.from('store_items').insert({
      name: body.name, price: body.price, unit: body.unit,
      category: body.category, featured: body.featured ?? false,
      description: body.description ?? null, color: body.color ?? null,
      image_url: body.imageUrl ?? null,
    }).select().single()
    if (error || !item) return c.json({ message: error?.message || 'Failed to create item' }, 500)
    return c.json(item, 201)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// PUT /store-items/:id (admin)
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const body = await c.req.json()
    const sb = getSupabase(c.env)
    const { data: updated, error } = await sb.from('store_items').update({
      name: body.name, price: body.price, unit: body.unit, category: body.category,
      featured: body.featured, description: body.description, color: body.color,
      image_url: body.imageUrl, updated_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error || !updated) return c.json({ message: 'Store item not found' }, 404)
    return c.json(updated)
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

// DELETE /store-items/:id (admin)
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) return c.json({ message: 'Invalid ID parameter' }, 400)
    const sb = getSupabase(c.env)
    const { error } = await sb.from('store_items').delete().eq('id', id)
    if (error) return c.json({ message: 'Store item not found' }, 404)
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ message: err.message }, 500)
  }
})

export default app
