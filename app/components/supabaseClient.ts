import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Supabase project URL and public anon key.
// For production, use secure environment variables and never commit secrets to your repo!
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '<your-supabase-url>';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '<your-anon-key>';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);