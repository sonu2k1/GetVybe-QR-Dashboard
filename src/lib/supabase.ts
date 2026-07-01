import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Verify environment variables are present (we fallback to empty strings to avoid crashing during build/parse)
export const getSupabaseConfig = () => {
  return {
    supabaseUrl,
    supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
  };
};

// Client components browser client
export const createBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env.local file.');
  }
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Route handlers / Server actions server client
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase URL or Service Role Key is missing. Check your .env.local file.');
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
