# 🔐 OAuth Setup Guide - Development Build Solution

## 🚨 Vấn Đề Đã Phát Hiện

**Root Cause:** Expo Go không hỗ trợ OAuth với custom scheme
- Expo Go chỉ hỗ trợ `exp://` scheme
- OAuth providers cần custom scheme để redirect về app
- "Network request failed" xảy ra do conflict này

## ✅ Solution: Development Build

### 1. 📱 Cài Đặt Development Build

```bash
# Fixed lockfile issues và force npm
rm -f bun.lock bun.lockb
echo "package-manager=npm" > .npmrc

# Build đang chạy trên EAS cloud
npx eas build --platform android --profile development
```

**Khi build xong:**
- Download APK từ EAS dashboard
- Install APK lên Android device của bạn

### 2. 🔧 Cập Nhật Supabase Dashboard

**Truy cập:** https://supabase.com/dashboard/project/dgcxvpicsaxzrebmmnyl/auth/url-configuration

**Site URL:**
```
foodlens://
```

**Redirect URLs (thêm tất cả):**
```
foodlens://auth/callback
foodlens://auth/login-callback
exp://localhost:8081/--/auth/login-callback
```

**⚠️ QUAN TRỌNG:** Đảm bảo Supabase Dashboard có đúng redirect URLs này!

### 3. 🎯 Cấu Hình Đã Thực Hiện

#### app.json
```json
{
  "scheme": "foodlens",
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [{"scheme": "foodlens"}],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  "plugins": ["expo-router", "expo-dev-client"]
}
```

#### environment.ts
```typescript
export const getRedirectUrl = () => {
  if (isExpoGo() && isDevelopment()) {
    return 'exp://localhost:8081/--/auth/login-callback';
  }
  return 'foodlens://auth/callback';
};
```

#### Deep Link Handler
- `_layout.tsx` - Xử lý deep link với `exchangeCodeForSession()`
- Tự động parse OAuth callback và update auth state
- Không cần manual token parsing

### 4. 🧪 Testing Flow

1. **Install Development Build APK**
2. **Mở app và click "Continue with Google"**
3. **OAuth flow sẽ:**
   - Mở browser với Google OAuth
   - User login Google
   - Redirect về `foodlens://auth/callback`
   - App mở callback route
   - Parse tokens và login thành công

### 5. 🔍 Debug Commands

```bash
# Kiểm tra build status
ps aux | grep "eas build"

# Xem logs nếu có lỗi
npx expo logs --platform android

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "foodlens://auth/callback" com.creativelabs.foodlens
```

### 6. 📋 Checklist

- [ ] Development Build APK được tạo thành công
- [ ] Install APK lên Android device
- [ ] Cập nhật Supabase Dashboard với custom scheme
- [ ] Test OAuth flow trong Development Build
- [ ] Verify deep linking hoạt động

## 🎉 Kết Quả Mong Đợi

- OAuth login hoạt động mượt mà
- Không còn "Network request failed"
- Deep linking redirect về đúng app
- User được login thành công

## 🔄 Fallback Plan

Nếu vẫn có vấn đề:
1. Kiểm tra Android intent filters
2. Verify Supabase redirect URLs
3. Test với `adb` commands
4. Check app logs với `npx expo logs` 