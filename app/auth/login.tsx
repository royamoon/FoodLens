import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAtom } from 'jotai';
import { loginAtom, registerAtom, googleLoginAtom } from '@/atoms/auth-actions';
import { authStateAtom, API_BASE_URL } from '@/atoms/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

// Direct Supabase client for OAuth
const supabase = createClient(
  'https://dgcxvpicsaxzrebmmnyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3h2cGljc2F4enJlYm1tbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTIwOTEsImV4cCI6MjA2NTE4ODA5MX0.DKXYJPfad_oHOvGfyBtcHCm7gi2pkL3VOPW_EMHesDs'
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const [authState] = useAtom(authStateAtom);
  const [, login] = useAtom(loginAtom);
  const [, register] = useAtom(registerAtom);
  const [, googleLogin] = useAtom(googleLoginAtom);

  // Check for OAuth callback URL on mount
  useEffect(() => {
    const checkForOAuthCallback = async () => {
      const url = await Linking.getInitialURL();
      if (url && url.includes('auth/callback')) {
        console.log('Found OAuth callback URL on mount:', url);
        await handleOAuthCallback(url);
      }
    };
    
    checkForOAuthCallback();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
    } catch (error) {
      // Error is already handled in the atoms
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Create redirect URI for this app
      const redirectUri = makeRedirectUri({
        scheme: 'foodlens',
        path: 'auth/callback',
      });

      console.log('Redirect URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        console.log('Opening OAuth URL:', data.url);
        
        // Use WebBrowser to handle OAuth flow properly
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
          {
            showInRecents: true,
          }
        );

        console.log('OAuth result:', result);

        if (result.type === 'success') {
          await handleOAuthCallback(result.url);
        } else if (result.type === 'cancel') {
          Alert.alert('Cancelled', 'Google login was cancelled');
        } else {
          Alert.alert('Error', 'Google login failed');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
    }
  };

  const handleOAuthCallback = async (url: string) => {
    try {
      console.log('Processing callback URL:', url);
      
      // Extract URL parameters from the callback
      const urlObj = new URL(url);
      let params: URLSearchParams;
      
      // Check if parameters are in hash or search
      if (urlObj.hash) {
        // Remove the # and create URLSearchParams
        params = new URLSearchParams(urlObj.hash.replace('#', ''));
      } else {
        params = urlObj.searchParams;
      }

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const code = params.get('code');

      console.log('Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, code: !!code });

      if (code) {
        // Handle authorization code flow
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        
        if (data.session) {
          await googleLogin({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token || undefined,
          });
          Alert.alert('Success', 'Google login successful!');
        }
      } else if (accessToken) {
        // Handle implicit flow
        await googleLogin({
          access_token: accessToken,
          refresh_token: refreshToken || undefined,
        });
        Alert.alert('Success', 'Google login successful!');
      } else {
        throw new Error('No access token or authorization code found in callback');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process authentication');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FoodLens</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={authState.loading}
        >
          <Text style={styles.buttonText}>
            {authState.loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={authState.loading}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>



        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>

      {authState.error && (
        <Text style={styles.errorText}>{authState.error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  switchText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
}); 