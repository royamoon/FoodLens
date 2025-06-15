# OAuth Login Test Guide - Expo Go Compatible

## ✅ Cấu hình đã hoàn thành:

### 1. **App Configuration (app.json)**
```json
{
  "expo": {
    "scheme": "foodlens",
    "extra": {
      "supabaseRedirectUri": "exp://localhost:8081/--/auth/login-callback",
      "supabaseUrl": "https://dgcxvpicsaxzrebmmnyl.supabase.co",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}
```

### 2. **Environment Detection (lib/environment.ts)**
- ✅ Auto-detect Expo Go vs production
- ✅ Dynamic redirect URL based on environment
- ✅ API base URL configuration

### 3. **Supabase Client (lib/supabase.ts)**
- ✅ AsyncStorage persistence
- ✅ autoRefreshToken: true
- ✅ Environment-aware redirect URLs

### 4. **Deep Link Handling**
- ✅ Login screen handles both Expo Go and production URLs
- ✅ App layout handles deep links
- ✅ Callback route for processing tokens

## 🧪 Testing Steps:

### 1. **Cập nhật Supabase Dashboard:**
```
Authentication → URL Configuration:
- Site URL: exp://localhost:8081
- Redirect URLs: 
  - exp://localhost:8081/--/auth/login-callback (for Expo Go)
  - foodlens://login-callback (for production)
```

### 2. **Start Development Server:**
```bash
npm start
# Note the port number (usually 8081)
# If different, update app.json accordingly
```

### 3. **Test OAuth Flow:**
1. Open app in Expo Go
2. Tap "Continue with Google"
3. Should open browser for Google OAuth
4. After login, should redirect back to Expo Go
5. Check console logs for token processing

### 4. **Debug Commands:**
```bash
# Check deep link handling
npx uri-scheme open "exp://localhost:8081/--/auth/login-callback" --ios
npx uri-scheme open "exp://localhost:8081/--/auth/login-callback" --android

# Check if scheme is registered
npx uri-scheme list
```

## 🔍 Expected Flow:

1. **User taps Google login** → `supabase.auth.signInWithOAuth()`
2. **Browser opens** → Google OAuth page
3. **User completes OAuth** → Google redirects to `exp://localhost:8081/--/auth/login-callback?code=...`
4. **Expo Go receives deep link** → Login screen processes authorization code
5. **Code exchanged** → `supabase.auth.exchangeCodeForSession()`
6. **Backend sync** → `googleLoginAtom` calls `/auth/oauth/callback`
7. **Success** → Navigate to main app

## 🐛 Common Issues:

### "Safari cannot open page" (FIXED)
- ✅ Now using Expo Go compatible URLs
- ✅ `exp://localhost:8081/--/auth/login-callback`

### "Network request failed"
- Check if backend is running on port 3001
- Verify API_BASE_URL in auth.ts
- Check CORS settings in backend

### Deep link not working
- Verify port number in redirect URL matches Expo dev server
- Check Supabase redirect URL configuration
- Test with `npx uri-scheme open`

### Token parsing errors
- Check URL parameter parsing in login screen
- Verify Supabase client configuration
- Check console logs for code exchange

## 📱 Test URLs:

```
# Test deep link manually (Expo Go):
exp://localhost:8081/--/auth/login-callback?code=test

# Test deep link manually (Production):
foodlens://login-callback?code=test

# Expected backend endpoints:
http://localhost:3001/auth/google
http://localhost:3001/auth/oauth/callback
```

## 🚀 Production Build Notes:

When building for production, the app will automatically use:
- Redirect URL: `foodlens://login-callback`
- Custom scheme: `foodlens://`

Update Supabase Dashboard accordingly for production. 