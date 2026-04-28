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
    // Provide a dummy object to prevent "Cannot read properties of undefined"
    const dummy = {
      from: () => dummy,
      select: () => dummy,
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => dummy,
      delete: () => dummy,
      eq: () => dummy,
      neq: () => dummy,
      gt: () => dummy,
      lt: () => dummy,
      order: () => dummy,
      limit: () => dummy,
      single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      on: () => dummy,
      subscribe: () => dummy,
      isDummy: true
    };
    supabaseInstance = dummy;

  }
} catch (e) {
  console.error('Failed to initialize Supabase:', e);
  supabaseInstance = { 
    from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: e }) }) }) }),
    isDummy: true
  };
}

if (supabaseInstance && !supabaseInstance.isDummy) {
  supabaseInstance.isDummy = false;
}

export const supabase = supabaseInstance;
window.supabase = supabase;
