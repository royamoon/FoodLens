import { atom } from 'jotai';
import { authStateAtom, API_BASE_URL } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearUserDataAtom } from './analysis';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// Login action
export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginCredentials) => {
    set(authStateAtom, { user: null, session: null, loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const data = await response.json();
      
      set(authStateAtom, {
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      // Save token to AsyncStorage
      if (data.session?.access_token) {
        await AsyncStorage.setItem('access_token', data.session.access_token);
      }

      return data;
    } catch (error) {
      set(authStateAtom, {
        user: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  }
);

// Google login action
export const googleLoginAtom = atom(
  null,
  async (get, set, tokens: { access_token: string; refresh_token?: string }) => {
    set(authStateAtom, { user: null, session: null, loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokens),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Google login failed');
      }

      const data = await response.json();
      
      set(authStateAtom, {
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      // Save token to AsyncStorage
      if (data.session?.access_token) {
        await AsyncStorage.setItem('access_token', data.session.access_token);
      }

      return data;
    } catch (error) {
      set(authStateAtom, {
        user: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      });
      throw error;
    }
  }
);

// Register action
export const registerAtom = atom(
  null,
  async (get, set, credentials: RegisterCredentials) => {
    set(authStateAtom, { user: null, session: null, loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Registration failed');
      }

      const data = await response.json();
      
      set(authStateAtom, {
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      set(authStateAtom, {
        user: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  }
);

// Logout action
export const logoutAtom = atom(
  null,
  async (get, set) => {
    const authState = get(authStateAtom);
    
    if (authState.session?.access_token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    // Clear stored token
    await AsyncStorage.removeItem('access_token');

    // Clear user-specific data
    set(clearUserDataAtom, null);

    set(authStateAtom, {
      user: null,
      session: null,
      loading: false,
      error: null,
    });
  }
);

// Verify token action
export const verifyTokenAtom = atom(
  null,
  async (get, set, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      
      set(authStateAtom, {
        user: data.user,
        session: { access_token: token },
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      set(authStateAtom, {
        user: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      });
      throw error;
    }
  }
); 