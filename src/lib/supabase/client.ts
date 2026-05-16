import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = (typeof window !== 'undefined' ? (window as any).__SUPABASE_URL__ : '') 
    || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = (typeof window !== 'undefined' ? (window as any).__SUPABASE_ANON_KEY__ : '')
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      storageKey: 'partitura-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
    }
  })
}