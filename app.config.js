import 'dotenv/config';

const IS_DEV = process.env.EXPO_PUBLIC_ENV === 'development';
const IS_PROD = process.env.EXPO_PUBLIC_ENV === 'production';

export default {
  expo: {
    name: 'FoodLens',
    slug: 'foodlens',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'foodlens',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.creativelabs.foodlens',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs access to camera to take photos of food for analysis.',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images of food for analysis.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      package: 'com.creativelabs.foodlens',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'foodlens',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'b3af6eae-e9f8-409d-a053-010b67a523a1',
      },
      // Environment-specific configuration
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV || 'development',
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      EXPO_PUBLIC_DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE || 'false',
      EXPO_PUBLIC_LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
      EXPO_PUBLIC_ENABLE_FLIPPER: process.env.EXPO_PUBLIC_ENABLE_FLIPPER || 'false',
      
      // Dynamic redirect URI based on environment
      supabaseRedirectUri: IS_DEV 
        ? 'exp://localhost:8081/--/auth/login-callback'  // For Expo Go
        : 'foodlens://auth/callback',  // For production builds
    },
    updates: {
      url: 'https://u.expo.dev/b3af6eae-e9f8-409d-a053-010b67a523a1',
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
      enabled: true,
    },
    runtimeVersion: {
      policy: 'fingerprint',
    },
  },
}; 