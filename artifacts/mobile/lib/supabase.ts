import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gypelfezbulqzgsntsfa.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cGVsZmV6YnVscXpnc250c2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzE3NDgsImV4cCI6MjA5NzAwNzc0OH0.2VMfnYbouPYxV-K1KBWLHeIQJg9zFqDTdww_SE7wXHM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

