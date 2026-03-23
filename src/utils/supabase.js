/**
 * Supabase client initialization.
 * Ported from original MLB Matchups vanilla JS (~line 1483).
 *
 * Exports a singleton Supabase client, or null if the library is unavailable.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rclygejapjgpnanwevmo.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbHlnZWphcGpncG5hbndldm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODY2ODcsImV4cCI6MjA3OTE2MjY4N30.WKYxJYmLNhm0SsxDeJBy7qGGdLddCuaVUrEN5684uFM';

let supabase = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.warn('Supabase client creation failed:', e);
}

export { supabase };
