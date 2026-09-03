import { Hono } from 'hono'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { z } from 'zod'
import crypto from 'node:crypto'
import { getSupabase } from '../lib/supabase'
import { hashPassword, verifyPassword, generateToken } from '../lib/auth'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

// ── POST /register ────────────────────────────────────────────────────────────
app.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      password: z.string().min(8),
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return c.json({ message: 'Validation failed', errors: parsed.error.issues }, 400)
    }
    const { name, email, phone, city, password } = parsed.data

    if (!email && !phone) {
      return c.json({ message: 'At least one of email or phone is required' }, 400)
    }

    const sb = getSupabase(c.env)

    // Check for duplicate
    if (email) {
      const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle()
      if (existing) return c.json({ message: 'Email already in use' }, 409)
    }
    if (phone) {
      const { data: existing } = await sb.from('users').select('id').eq('phone', phone).maybeSingle()
      if (existing) return c.json({ message: 'Phone number already in use' }, 409)
    }

    const password_hash = await hashPassword(password)
    const { data: user, error } = await sb
      .from('users')
      .insert({ name, email: email ?? null, phone: phone ?? null, city: city ?? null, password_hash })
      .select()
      .single()

    if (error || !user) return c.json({ message: error?.message || 'Failed to create user' }, 500)

    const token = await generateToken({ userId: user.id }, c.env.JWT_SECRET)
    return c.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        city: user.city, profileImage: user.profile_image ?? undefined,
        createdAt: user.created_at,
      },
    }, 201)
  } catch (err: any) {
    return c.json({ message: err.message || 'Internal server error' }, 500)
  }
})

// ── POST /login ───────────────────────────────────────────────────────────────
app.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return c.json({ message: 'Validation failed' }, 400)

    const { identifier, password } = parsed.data
    const sb = getSupabase(c.env)

    const { data: user } = await sb
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .maybeSingle()

    if (!user) return c.json({ message: 'Invalid credentials' }, 401)

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) return c.json({ message: 'Invalid credentials' }, 401)

    const token = await generateToken({ userId: user.id }, c.env.JWT_SECRET)
    return c.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        city: user.city, profileImage: user.profile_image ?? undefined,
        createdAt: user.created_at,
      },
    })
  } catch (err: any) {
    return c.json({ message: err.message || 'Internal server error' }, 500)
  }
})

// ── GET /google/callback & GET /google ─────────────────────────────────────────
const googleCallbackHandler = (c: any) => {
  return c.html(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sankalp - Signing in...</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF3E8; color: #7B1F1F; text-align: center; }
      .box { padding: 24px; border-radius: 16px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 320px; }
    </style>
  </head>
  <body>
    <div class="box">
      <h2>ॐ Sankalp</h2>
      <p>Completing Google sign-in...</p>
    </div>
    <script>
      (function() {
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);
        const state = hashParams.get('state') || searchParams.get('state');
        if (state) {
          const target = decodeURIComponent(state);
          const sep = target.includes('?') ? '&' : '?';
          const payload = hash || search;
          window.location.href = target + sep + payload;
        } else {
          document.querySelector('p').innerText = 'Signed in successfully! You can switch back to the app.';
        }
      })();
    </script>
  </body>
</html>`)
}

app.get('/google/callback', googleCallbackHandler)
app.get('/google', googleCallbackHandler)


// ── POST /google ──────────────────────────────────────────────────────────────
app.post('/google', async (c) => {
  try {
    const body = await c.req.json()
    const { idToken } = body
    if (!idToken) return c.json({ message: 'idToken is required' }, 400)

    let email: string, name: string, picture: string | null = null

    // Dev bypass
    if (idToken === 'mock_dev_google_id_token') {
      email = 'dev.google.user@sankalp.com'
      name = 'Dev Google User'
    } else {
      // Try Supabase JWT first
      const decoded = (() => {
        try {
          const parts = idToken.split('.')
          if (parts.length === 3) return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          return null
        } catch { return null }
      })()

      const issuer = decoded?.iss
      const supabaseUrl = c.env.SUPABASE_URL

      if (issuer && supabaseUrl && (issuer.includes('supabase.co') || issuer.includes(supabaseUrl))) {
        // Verify via Supabase REST
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: { apikey: c.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${idToken}` },
        })
        if (!res.ok) return c.json({ message: `Supabase auth failed: ${res.status}` }, 401)
        const userData = await res.json() as any
        const meta = userData?.user_metadata || {}
        email = userData.email
        name = meta.full_name || meta.name || email?.split('@')[0] || 'User'
        picture = meta.avatar_url || meta.picture || null
      } else {
        // Verify as Google ID token via JWKS
        const audience = [c.env.GOOGLE_CLIENT_ID_WEB].filter(Boolean)
        const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
          issuer: ['https://accounts.google.com', 'accounts.google.com'],
          audience: audience.length > 0 ? audience : undefined,
        })
        if (!payload.email) return c.json({ message: 'Google account has no email' }, 400)
        email = payload.email as string
        name = (payload.name as string) || email.split('@')[0]
        picture = (payload.picture as string) || null
      }
    }

    const sb = getSupabase(c.env)
    let { data: user } = await sb.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle()

    if (!user) {
      const password_hash = await hashPassword(crypto.randomUUID())
      const { data: newUser } = await sb
        .from('users')
        .insert({ name, email: email.toLowerCase(), profile_image: picture, password_hash })
        .select().single()
      user = newUser
    } else if (picture && !user.profile_image) {
      const { data: updated } = await sb
        .from('users').update({ profile_image: picture }).eq('id', user.id).select().single()
      user = updated ?? user
    }

    if (!user) return c.json({ message: 'Failed to create or find user' }, 500)

    const token = await generateToken({ userId: user.id }, c.env.JWT_SECRET)
    return c.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email ?? undefined,
        phone: user.phone ?? undefined, city: user.city ?? undefined,
        profileImage: user.profile_image ?? undefined, createdAt: user.created_at,
      },
    })
  } catch (err: any) {
    return c.json({ message: 'Token verification failed: ' + err.message }, 401)
  }
})

// ── GET /me ───────────────────────────────────────────────────────────────────
app.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const sb = getSupabase(c.env)
  const { data: user } = await sb.from('users').select('*').eq('id', userId).maybeSingle()
  if (!user) return c.json({ message: 'User not found' }, 401)
  return c.json({
    id: user.id, name: user.name, email: user.email, phone: user.phone,
    city: user.city, profileImage: user.profile_image ?? undefined, createdAt: user.created_at,
  })
})

// ── PUT /me ───────────────────────────────────────────────────────────────────
app.put('/me', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      profileImage: z.string().optional(),
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return c.json({ message: 'Validation failed' }, 400)

    const sb = getSupabase(c.env)

    if (parsed.data.email) {
      const { data: ex } = await sb.from('users').select('id').eq('email', parsed.data.email).maybeSingle()
      if (ex && ex.id !== userId) return c.json({ message: 'Email already in use' }, 409)
    }
    if (parsed.data.phone) {
      const { data: ex } = await sb.from('users').select('id').eq('phone', parsed.data.phone).maybeSingle()
      if (ex && ex.id !== userId) return c.json({ message: 'Phone number already in use' }, 409)
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.email !== undefined) updates.email = parsed.data.email
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone
    if (parsed.data.city !== undefined) updates.city = parsed.data.city
    if (parsed.data.profileImage !== undefined) updates.profile_image = parsed.data.profileImage

    const { data: updated, error: updateErr } = await sb
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select().single()

    if (!updated) return c.json({ message: 'User not found' }, 404)
    return c.json({
      id: updated.id, name: updated.name, email: updated.email ?? undefined,
      phone: updated.phone ?? undefined, city: updated.city ?? undefined,
      profileImage: updated.profile_image ?? undefined, createdAt: updated.created_at,
    })
  } catch (err: any) {
    return c.json({ message: err.message || 'Internal server error' }, 500)
  }
})

export default app
