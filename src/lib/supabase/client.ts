import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const URL = 'https://uiaoqkkefjwgvstuuube.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYW9xa2tlZmp3Z3ZzdHV1dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM1MjcsImV4cCI6MjA5NDMyOTUyN30.Mxt40c4ZVMb_Flo3j3T5i7rqPLvfOC9B_1RomQ-ckus'

export function createClient() {
  return createSupabaseClient(URL, KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}