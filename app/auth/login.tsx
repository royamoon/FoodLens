import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useAtom } from 'jotai';
import { loginAtom, registerAtom } from '@/atoms/auth-actions';
import { authStateAtom } from '@/atoms/auth';
import { getRedirectUrl, getApiBaseUrl } from '@/lib/environment';

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
      console.log('Starting Google OAuth flow...');
      
      // Use backend OAuth endpoint to get the authorization URL
      const apiBaseUrl = getApiBaseUrl();
      const redirectUri = getRedirectUrl();
      
      console.log('API Base URL:', apiBaseUrl);
      console.log('Redirect URI:', redirectUri);
      
      // Test network connectivity first
      console.log('Testing network connectivity...');
      
      const response = await fetch(`${apiBaseUrl}/auth/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUri: redirectUri,
        }),
        timeout: 10000, // 10 second timeout
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.url) {
        console.log('Opening OAuth URL:', data.url);
        
        // Open the OAuth URL directly with Linking
        const supported = await Linking.canOpenURL(data.url);
        console.log('URL supported:', supported);
        
        if (supported) {
          await Linking.openURL(data.url);
          console.log('OAuth URL opened successfully');
        } else {
          throw new Error('Cannot open OAuth URL - not supported');
        }
      } else {
        throw new Error('No OAuth URL received from backend');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // More detailed error logging
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          message: error.message,
          stack: error.stack,
          apiBaseUrl: getApiBaseUrl(),
          redirectUri: getRedirectUrl(),
        });
        Alert.alert('Network Error', 'Cannot connect to server. Please check if backend is running on localhost:3001');
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
      }
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
    marginBottom: 15,
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