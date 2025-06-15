import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAtom } from 'jotai';
import { loginAtom, registerAtom } from '@/atoms/auth-actions';
import { authStateAtom } from '@/atoms/auth';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { getRedirectUrl } from '@/lib/environment';

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
      // Use environment-aware redirect URI
      const redirectUri = getRedirectUrl();
      console.log('Redirect URI:', redirectUri);

      // Direct Supabase OAuth call
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

        if (result.type === 'cancel') {
          Alert.alert('Cancelled', 'Google login was cancelled');
        } else if (result.type === 'dismiss') {
          Alert.alert('Dismissed', 'Google login was dismissed');
        }
        // Success case will be handled by the callback page
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
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