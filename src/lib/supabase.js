import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using local/offline mode.');
}

export const supabase = createClient(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token',
    },
  }
);

/** True when Vite env vars look configured (may still be unreachable). */
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== PLACEHOLDER_URL &&
    !supabaseUrl.includes('placeholder')
  );
};

/** Detect network / DNS / offline Supabase failures */
export const isSupabaseNetworkError = (error) => {
  if (!error) return false;
  const message = String(error.message || error.details || error || '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('err_name_not_resolved') ||
    message.includes('load failed') ||
    message.includes('network request failed') ||
    error.name === 'TypeError'
  );
};
