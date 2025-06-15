import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAtom } from 'jotai';
import { googleLoginAtom } from '@/atoms/auth-actions';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

// Direct Supabase client for OAuth
const supabase = createClient(
  'https://dgcxvpicsaxzrebmmnyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3h2cGljc2F4enJlYm1tbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTIwOTEsImV4cCI6MjA2NTE4ODA5MX0.DKXYJPfad_oHOvGfyBtcHCm7gi2pkL3VOPW_EMHesDs'
);

export default function LoginCallbackScreen() {
  const params = useLocalSearchParams();
  const [, googleLogin] = useAtom(googleLoginAtom);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback params from route:', params);

        // Also check the current URL for hash parameters
        const currentUrl = await Linking.getInitialURL();
        console.log('Current URL:', currentUrl);

        let tokenParams: Record<string, string> = {};

        // First try to get from route params
        Object.keys(params).forEach(key => {
          if (params[key]) {
            tokenParams[key] = params[key] as string;
          }
        });

        // If no tokens in route params, try to parse from URL
        if (!tokenParams.access_token && currentUrl) {
          const urlObj = new URL(currentUrl);
          
          // Check hash parameters
          if (urlObj.hash) {
            const hashParams = new URLSearchParams(urlObj.hash.replace('#', ''));
            hashParams.forEach((value, key) => {
              tokenParams[key] = value;
            });
          }
          
          // Check search parameters
          urlObj.searchParams.forEach((value, key) => {
            tokenParams[key] = value;
          });
        }

        console.log('Extracted token params:', tokenParams);

        const accessToken = tokenParams.access_token;
        const refreshToken = tokenParams.refresh_token;
        const code = tokenParams.code;
        const error = tokenParams.error;

        if (error) {
          console.error('OAuth error:', error);
          router.replace('/auth/login');
          return;
        }

        if (code) {
          // Handle authorization code flow
          console.log('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            router.replace('/auth/login');
            return;
          }
          
          if (data.session) {
            console.log('Session obtained, logging in...');
            await googleLogin({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || undefined,
            });
            
            // Navigate to main app
            router.replace('/(tabs)');
            return;
          }
        } else if (accessToken) {
          // Handle implicit flow (most common for mobile)
          console.log('Using access token directly...');
          await googleLogin({
            access_token: accessToken,
            refresh_token: refreshToken || undefined,
          });
          
          // Navigate to main app
          router.replace('/(tabs)');
          return;
        }

        // If we get here, something went wrong
        console.error('No valid tokens found in callback');
        router.replace('/auth/login');
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        router.replace('/auth/login');
      }
    };

    // Add a small delay to ensure URL is properly set
    const timer = setTimeout(handleOAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Completing Google login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
}); 