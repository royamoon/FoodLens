import { atom } from 'jotai';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export const authStateAtom = atom<AuthState>({
  user: null,
  session: null,
  loading: false,
  error: null,
});

export const isAuthenticatedAtom = atom((get) => {
  const authState = get(authStateAtom);
  return authState.user !== null && authState.session !== null;
});

export const userAtom = atom((get) => {
  const authState = get(authStateAtom);
  return authState.user;
});

// API URL for backend
export const API_BASE_URL = 'http://192.168.1.6:3001'; 