import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://dgcxvpicsaxzrebmmnyl.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3h2cGljc2F4enJlYm1tbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTIwOTEsImV4cCI6MjA2NTE4ODA5MX0.DKXYJPfad_oHOvGfyBtcHCm7gi2pkL3VOPW_EMHesDs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: AsyncStorage,
    detectSessionInUrl: false, // Important for React Native
  },
});

import { getRedirectUrl } from './environment';

// Helper function to handle OAuth redirects
export const getOAuthRedirectUrl = () => {
  return getRedirectUrl();
}; 