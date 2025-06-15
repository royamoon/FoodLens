import Constants from 'expo-constants';

export type Environment = 'development' | 'production';

/**
 * Get current environment from Expo Constants
 */
export const getCurrentEnvironment = (): Environment => {
  const env = Constants.expoConfig?.extra?.EXPO_PUBLIC_ENV || 
              process.env.EXPO_PUBLIC_ENV || 
              'development';
  
  return env as Environment;
};

/**
 * Check if app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

/**
 * Check if app is running in production mode
 */
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

/**
 * Environment configuration object
 */
export const envConfig = {
  // Environment identifier
  ENV: getCurrentEnvironment(),
  
  // API Configuration
  API_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
           process.env.EXPO_PUBLIC_API_URL || 
           'http://localhost:3000',
  
  // Supabase Configuration
  SUPABASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
                process.env.EXPO_PUBLIC_SUPABASE_URL || 
                '',
  
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                     '',
  
  // Gemini AI Configuration
  GEMINI_API_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || 
                  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                  '',
  
  // Debug Settings
  DEBUG_MODE: Constants.expoConfig?.extra?.EXPO_PUBLIC_DEBUG_MODE === 'true' || 
              process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || 
              false,
  
  LOG_LEVEL: Constants.expoConfig?.extra?.EXPO_PUBLIC_LOG_LEVEL || 
             process.env.EXPO_PUBLIC_LOG_LEVEL || 
             'info',
  
  ENABLE_FLIPPER: Constants.expoConfig?.extra?.EXPO_PUBLIC_ENABLE_FLIPPER === 'true' || 
                  process.env.EXPO_PUBLIC_ENABLE_FLIPPER === 'true' || 
                  false,
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
  ];
  
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    const value = envConfig[varName as keyof typeof envConfig];
    if (!value || value === '') {
      missingVars.push(varName);
    }
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
};

/**
 * Log environment information (only in development)
 */
export const logEnvironmentInfo = (): void => {
  if (isDevelopment() && envConfig.DEBUG_MODE) {
    console.log('🌍 Environment Info:', {
      ENV: envConfig.ENV,
      API_URL: envConfig.API_URL,
      DEBUG_MODE: envConfig.DEBUG_MODE,
      LOG_LEVEL: envConfig.LOG_LEVEL,
      // Don't log sensitive keys in production
      SUPABASE_URL: envConfig.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: envConfig.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      GEMINI_API_KEY: envConfig.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
    });
  }
};

export const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

export const getRedirectUrl = () => {
  if (isDevelopment()) {
    // For development (Expo Go or dev client) - always use exp://localhost
    return 'exp://localhost:8081/--/auth/login-callback';
  }
  
  // For production builds - use custom scheme
  return 'foodlens://auth/callback';
};

export const getApiBaseUrl = () => {
  if (isDevelopment()) {
    // Use local IP address instead of localhost for mobile development
    return 'http://192.168.1.4:3001';
  }
  
  // For production
  return 'https://your-production-api.com';
}; 