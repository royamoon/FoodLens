import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAtom } from 'jotai';
import { authStateAtom, isAuthenticatedAtom } from '@/atoms/auth';
import { verifyTokenAtom } from '@/atoms/auth-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './auth/login';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { createClient } from '@supabase/supabase-js';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Direct Supabase client for OAuth
const supabase = createClient(
  'https://dgcxvpicsaxzrebmmnyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3h2cGljc2F4enJlYm1tbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTIwOTEsImV4cCI6MjA2NTE4ODA5MX0.DKXYJPfad_oHOvGfyBtcHCm7gi2pkL3VOPW_EMHesDs'
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [authState, setAuthState] = useAtom(authStateAtom);
  const [, verifyToken] = useAtom(verifyTokenAtom);

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('Received deep link:', url);
      
      // Handle OAuth callback URLs
      if (url.includes('foodlens://auth/callback') || url.includes('access_token') || url.includes('code=')) {
        console.log('Processing OAuth callback with exchangeCodeForSession');
        
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(url);
          
          if (error) {
            console.error('OAuth exchange error:', error);
            return;
          }
          
          if (data.session) {
            console.log('OAuth session obtained successfully');
            
            // Update auth state with session
            setAuthState({
              user: data.session.user,
              session: data.session,
              loading: false,
              error: null
            });
            
            // Store tokens
            await AsyncStorage.setItem('access_token', data.session.access_token);
            if (data.session.refresh_token) {
              await AsyncStorage.setItem('refresh_token', data.session.refresh_token);
            }
            
            // Navigate to main app
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Deep link processing error:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token && !authState.user) {
          await verifyToken(token);
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
      } finally {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkStoredToken();
  }, []);

  // Watch for auth state changes
  useEffect(() => {
    console.log('Auth state changed:', authState);
  }, [authState]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Debug logging
  console.log('Auth state:', { 
    user: !!authState.user, 
    loading: authState.loading, 
    session: !!authState.session 
  });

  // Show loading state
  if (authState.loading) {
    return null; // or a loading spinner
  }

  // Show login screen if not authenticated
  if (!authState.user) {
    console.log('Showing login screen - no user');
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
