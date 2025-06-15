import { atom } from 'jotai';
import { getApiBaseUrl } from '@/lib/environment';

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

// API URL for backend - use environment-aware URL
export const API_BASE_URL = getApiBaseUrl(); 