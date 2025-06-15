import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { googleLoginAtom } from '@/atoms/auth-actions';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

// Direct Supabase client for OAuth
const supabase = createClient(
  'https://dgcxvpicsaxzrebmmnyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3h2cGljc2F4enJlYm1tbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTIwOTEsImV4cCI6MjA2NTE4ODA5MX0.DKXYJPfad_oHOvGfyBtcHCm7gi2pkL3VOPW_EMHesDs'
);

export default function AuthCallbackScreen() {
  const [, googleLogin] = useAtom(googleLoginAtom);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('Custom scheme OAuth callback triggered');

        // Get the initial URL that opened the app
        const initialUrl = await Linking.getInitialURL();
        console.log('Initial URL:', initialUrl);

        if (!initialUrl) {
          console.error('No initial URL found');
          router.replace('/auth/login');
          return;
        }

        // Parse the URL to extract OAuth parameters
        const url = new URL(initialUrl);
        let tokenParams: Record<string, string> = {};

        // Check hash parameters (most common for OAuth)
        if (url.hash) {
          const hashParams = new URLSearchParams(url.hash.replace('#', ''));
          hashParams.forEach((value, key) => {
            tokenParams[key] = value;
          });
        }

        // Check search parameters as fallback
        url.searchParams.forEach((value, key) => {
          tokenParams[key] = value;
        });

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
  }, []);

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