// Shared Bindings and Variables types used across all routes

export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_ANON_KEY: string
  JWT_SECRET: string
  GOOGLE_CLIENT_ID_WEB: string
}

export type Variables = {
  userId: number
}
