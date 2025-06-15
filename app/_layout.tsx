import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, useColorScheme, Text } from 'react-native';
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            Please restart the app or check the console for more details.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

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
      
      // Handle OAuth callback URLs - extract tokens manually to avoid exchangeCodeForSession hang
      if (url.includes('exp://localhost:8081/--/auth/login-callback') || url.includes('access_token') || url.includes('code=')) {
        console.log('Processing OAuth callback');
        
        try {
          console.log('Full callback URL:', url);
          
          // Parse URL parameters manually - handle both hash and query params
          let accessToken = null;
          let refreshToken = null;
          let expiresIn = null;
          let tokenType = null;
          let error = null;
          
          // Try to parse as URL object
          try {
            const urlObj = new URL(url);
            console.log('URL parsed successfully:', {
              protocol: urlObj.protocol,
              host: urlObj.host,
              pathname: urlObj.pathname,
              search: urlObj.search,
              hash: urlObj.hash
            });
            
            // Check hash parameters first (common for OAuth implicit flow)
            if (urlObj.hash) {
              const fragment = urlObj.hash.substring(1); // Remove #
              const hashParams = new URLSearchParams(fragment);
              accessToken = hashParams.get('access_token');
              refreshToken = hashParams.get('refresh_token');
              expiresIn = hashParams.get('expires_in');
              tokenType = hashParams.get('token_type');
              error = hashParams.get('error');
              console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error });
            }
            
            // Check query parameters if no hash params
            if (!accessToken && urlObj.search) {
              const searchParams = new URLSearchParams(urlObj.search);
              accessToken = searchParams.get('access_token');
              refreshToken = searchParams.get('refresh_token');
              expiresIn = searchParams.get('expires_in');
              tokenType = searchParams.get('token_type');
              error = searchParams.get('error');
              console.log('Query params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error });
            }
          } catch (urlError) {
            console.error('URL parsing failed, trying manual parsing:', urlError);
            
            // Manual parsing as fallback
            if (url.includes('access_token=')) {
              const match = url.match(/access_token=([^&]+)/);
              accessToken = match ? decodeURIComponent(match[1]) : null;
            }
            if (url.includes('refresh_token=')) {
              const match = url.match(/refresh_token=([^&]+)/);
              refreshToken = match ? decodeURIComponent(match[1]) : null;
            }
            if (url.includes('error=')) {
              const match = url.match(/error=([^&]+)/);
              error = match ? decodeURIComponent(match[1]) : null;
            }
            console.log('Manual parsing result:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error });
          }
          
          // Handle OAuth error
          if (error) {
            console.error('OAuth error from callback:', error);
            setAuthState(prev => ({ 
              ...prev, 
              loading: false, 
              error: `OAuth error: ${error}` 
            }));
            return;
          }
          
          if (accessToken) {
            console.log('Access token found, processing...');
            
            // Store tokens immediately
            await AsyncStorage.setItem('access_token', accessToken);
            if (refreshToken) {
              await AsyncStorage.setItem('refresh_token', refreshToken);
            }
            
            // Verify token with backend to get user info
            console.log('Verifying token with backend...');
            await verifyToken(accessToken);
            
            // Navigate to main app
            console.log('Navigating to main app...');
            router.replace('/(tabs)');
          } else {
            console.error('No access token found in callback URL');
            console.error('Full URL for debugging:', url);
            setAuthState(prev => ({ 
              ...prev, 
              loading: false, 
              error: 'OAuth callback missing access token' 
            }));
          }
        } catch (error) {
          console.error('Deep link processing error:', error);
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            error: `OAuth callback processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }));
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    }).catch((error) => {
      console.error('Error getting initial URL:', error);
    });

    return () => {
      subscription.remove();
    };
  }, [verifyToken, setAuthState]);

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token && !authState.user) {
          console.log('Found stored token, verifying...');
          await verifyToken(token);
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
      } finally {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkStoredToken();
  }, [verifyToken, setAuthState, authState.user]);

  // Watch for auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { 
      user: !!authState.user, 
      loading: authState.loading, 
      error: authState.error 
    });
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
  console.log('Render decision:', { 
    user: !!authState.user, 
    loading: authState.loading, 
    session: !!authState.session 
  });

  // Show loading state
  if (authState.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!authState.user) {
    console.log('Showing login screen - no user');
    return (
      <ErrorBoundary>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
          </Stack>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
