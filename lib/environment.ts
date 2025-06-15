import Constants from 'expo-constants';

export const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

export const isDevelopment = () => {
  return __DEV__;
};

export const getRedirectUrl = () => {
  if (isExpoGo() && isDevelopment()) {
    // For Expo Go in development - use localhost to avoid network issues
    return 'exp://localhost:8081/--/auth/login-callback';
  }
  
  // For development builds and production builds - use custom scheme
  return 'foodlens://auth/callback';
};

export const getApiBaseUrl = () => {
  if (isDevelopment()) {
    return 'http://localhost:3001';
  }
  
  // For production
  return 'https://your-production-api.com';
}; 