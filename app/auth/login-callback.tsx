import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import { authStateAtom } from '@/atoms/auth';
import { verifyTokenAtom } from '@/atoms/auth-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [, setAuthState] = useAtom(authStateAtom);
  const [, verifyToken] = useAtom(verifyTokenAtom);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Login callback params:', params);
        
        // Extract tokens from URL parameters
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;
        const error = params.error as string;
        
        if (error) {
          console.error('OAuth error:', error);
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            error: `OAuth error: ${error}` 
          }));
          router.replace('/auth/login');
          return;
        }
        
        if (accessToken) {
          console.log('Processing OAuth tokens...');
          
          // Store tokens
          await AsyncStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            await AsyncStorage.setItem('refresh_token', refreshToken);
          }
          
          // Verify token with backend to get user info
          console.log('Verifying token with backend...');
          await verifyToken(accessToken);
          
          // Navigate to main app
          console.log('OAuth login successful, navigating to home...');
          router.replace('/(tabs)');
        } else {
          console.error('No access token found in callback');
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'OAuth callback missing access token' 
          }));
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'OAuth callback processing failed' 
        }));
        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, [params, router, setAuthState, verifyToken]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Processing login...</Text>
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