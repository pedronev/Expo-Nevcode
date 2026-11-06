import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Solo la llave publishable (anon). La tabla está cerrada con RLS y la página
// guarda a través de una función que exige el código del equipo.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null

export const isConfigured = supabase !== null
