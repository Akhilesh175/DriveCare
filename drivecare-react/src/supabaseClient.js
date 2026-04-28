import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance;

try {
  // Only attempt to create the client if we have a seemingly valid URL
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn('Supabase URL is missing or invalid. Admin features will be disabled.');
    // Provide a dummy object to prevent "Cannot read properties of undefined (reading 'from')"
    const dummy = {
      eq: () => dummy,
      select: () => dummy,
      single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      from: () => dummy
    };
    supabaseInstance = dummy;

  }
} catch (e) {
  console.error('Failed to initialize Supabase:', e);
  supabaseInstance = { from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: e }) }) }) }) };
}

export const supabase = supabaseInstance;
window.supabase = supabase;
