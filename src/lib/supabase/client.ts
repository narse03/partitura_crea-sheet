import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uiaoqkkefjwgvstuuube.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYW9xa2tlZmp3Z3ZzdHV1dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM1MjcsImV4cCI6MjA5NDMyOTUyN30.Mxt40c4ZVMb_Flo3j3T5i7rqPLvfOC9B_1RomQ-ckus'

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: 'partitura-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
    }
  })
}