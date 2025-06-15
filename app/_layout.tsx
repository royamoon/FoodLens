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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [authState, setAuthState] = useAtom(authStateAtom);
  const [, verifyToken] = useAtom(verifyTokenAtom);

  // Handle deep links for OAuth callbacks
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      console.log('Received deep link:', url);
      
      // Handle OAuth callback URLs
      if (url.includes('auth/login-callback') || url.includes('access_token') || url.includes('code=')) {
        console.log('Processing OAuth callback - redirecting to callback page');
        
        // Extract URL parameters and navigate to callback page
        const urlObj = new URL(url);
        let params: Record<string, string> = {};
        
        // Check if parameters are in hash or search
        if (urlObj.hash) {
          const hashParams = new URLSearchParams(urlObj.hash.replace('#', ''));
          hashParams.forEach((value, key) => {
            params[key] = value;
          });
        } else {
          urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
          });
        }
        
        // Navigate to callback page with parameters
        const queryString = new URLSearchParams(params).toString();
        router.replace(`/auth/login-callback?${queryString}`);
      }
    }
  }, [url]);

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
