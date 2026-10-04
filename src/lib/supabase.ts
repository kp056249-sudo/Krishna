import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client — DataNexus KP Enterprise
 * Uses publishable key only (never secret service key).
 */

const SUPABASE_DEFAULT_URL = 'https://ubgqojugqnneqlojrflm.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY = 'sb_publishable_BRVidkRMuzOZl0Nc06y0Lg_QTS29dcI';

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || SUPABASE_DEFAULT_URL;
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || SUPABASE_DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'datanexus_supabase_session',
  },
});

export type { Session, User } from '@supabase/supabase-js';
