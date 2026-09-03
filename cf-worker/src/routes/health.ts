import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/healthz', (c) => c.json({ status: 'ok' }))

export default app
