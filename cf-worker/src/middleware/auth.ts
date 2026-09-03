import type { Context, Next } from 'hono'
import { verifyToken } from '../lib/auth'
import type { Bindings, Variables } from '../types'

export async function requireAuth(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
): Promise<Response | void> {
  const header = c.req.header('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    return c.json({ message: 'Authentication required' }, 401)
  }
  const token = header.slice(7)
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    c.set('userId', payload.userId)
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
}
