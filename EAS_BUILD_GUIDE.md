# EAS Build Guide - FoodLens

Hướng dẫn sử dụng EAS Build với 2 môi trường: Development và Production.

## 🚀 Quick Start

### 1. Thiết lập Environment Variables

Tạo 2 file environment variables từ template:

```bash
# Copy template và điền thông tin thực
cp env.example .env.development
cp env.example .env.production
```

**Cấu hình `.env.development`:**
```bash
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=your_dev_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_dev_supabase_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_ENABLE_FLIPPER=true
```

**Cấu hình `.env.production`:**
```bash
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_SUPABASE_URL=your_prod_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_prod_supabase_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_ENABLE_FLIPPER=false
```

### 2. Cài đặt EAS CLI và setup project

```bash
# Cài đặt EAS CLI
npm install -g @expo/eas-cli

# Đăng nhập
eas login

# Khởi tạo project với EAS (nếu chưa có)
eas init

# Cấu hình EAS Update
npm run update:configure
```

## 🚀 EAS Workflows (Recommended)

### Automated CI/CD với GitHub

```bash
# Chạy development workflow (tự động build khi push lên develop/feature branches)
npm run workflow:dev

# Chạy production workflow (tự động build + submit khi push lên main)
npm run workflow:prod
```

**Workflow triggers:**
- **Development**: Tự động chạy khi push lên `develop` hoặc `feature/*` branches
- **Production**: Tự động chạy khi push lên `main` branch
- **Manual**: Có thể trigger thủ công bằng `workflow_dispatch`

## 📱 Manual Build Commands

### Development Builds (APK/IPA cho testing)

```bash
# Android APK cho testing
npm run build:dev:android
# hoặc
eas build --profile development --platform android

# iOS IPA cho testing (simulator)
npm run build:dev:ios
# hoặc
eas build --profile development --platform ios

# Build cả 2 platform
npm run build:dev:all
# hoặc
eas build --profile development --platform all
```

### Production Builds (AAB/IPA cho app stores)

```bash
# Android AAB cho Google Play Store
npm run build:prod:android
# hoặc
eas build --profile production --platform android

# iOS IPA cho App Store
npm run build:prod:ios
# hoặc
eas build --profile production --platform ios

# Build cả 2 platform
npm run build:prod:all
# hoặc
eas build --profile production --platform all
```

## 🔧 Cấu hình Chi Tiết

### EAS Workflows Features
- **Fingerprint checking**: Tự động kiểm tra xem có cần build mới không
- **Smart deployment**: Nếu không cần build mới, sẽ gửi OTA update thay vì build lại
- **Parallel builds**: Build Android và iOS song song để tiết kiệm thời gian
- **Auto submission**: Tự động submit lên app stores sau khi build thành công
- **Branch-based triggers**: Tự động trigger dựa trên branch được push

### Development Profile
- **Android**: Tạo APK file có thể cài trực tiếp trên device
- **iOS**: Build cho simulator và device testing
- **Environment**: Sử dụng `.env.development`
- **Debug**: Bật debug mode và logging chi tiết
- **Distribution**: Internal (không lên store)

### Production Profile
- **Android**: Tạo AAB (Android App Bundle) cho Google Play
- **iOS**: Build release cho App Store
- **Environment**: Sử dụng `.env.production`
- **Debug**: Tắt debug mode, chỉ log errors
- **Auto Increment**: Tự động tăng version number

## 📤 Submit to Stores

```bash
# Submit Android AAB to Google Play
npm run submit:android
# hoặc
eas submit --platform android

# Submit iOS IPA to App Store
npm run submit:ios
# hoặc
eas submit --platform ios
```

## 🛠️ Sử dụng Environment trong Code

```typescript
import { envConfig, isDevelopment, isProduction, logEnvironmentInfo } from '@/lib/environment';

// Kiểm tra environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Sử dụng config
const apiUrl = envConfig.API_URL;
const supabaseUrl = envConfig.SUPABASE_URL;

// Log environment info (chỉ trong development)
logEnvironmentInfo();

// Validate environment variables
const { isValid, missingVars } = validateEnvironment();
if (!isValid) {
  console.error('Missing environment variables:', missingVars);
}
```

## 🔍 Troubleshooting

### 1. Environment Variables không load

```bash
# Kiểm tra file .env có đúng tên không
ls -la .env.*

# Kiểm tra dotenv đã được cài đặt
npm list dotenv
```

### 2. Build fails với missing credentials

```bash
# Đăng nhập lại EAS
eas login

# Kiểm tra project ID
eas project:info
```

### 3. Android build fails

```bash
# Clear cache và rebuild
eas build --profile development --platform android --clear-cache
```

### 4. iOS build fails

```bash
# Kiểm tra Apple Developer account
eas credentials

# Regenerate certificates nếu cần
eas credentials --platform ios
```

## 📋 Checklist trước khi Build

### Development Build
- [ ] File `.env.development` đã được tạo và cấu hình
- [ ] API backend đang chạy local (nếu test local)
- [ ] EAS CLI đã đăng nhập

### Production Build
- [ ] File `.env.production` đã được cấu hình với production URLs
- [ ] Production API đã sẵn sàng
- [ ] Apple Developer / Google Play Console credentials đã setup
- [ ] Version number đã được cập nhật (nếu cần)

## 🔗 Useful Links

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Environment Variables Guide](https://docs.expo.dev/build-reference/variables/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Constants Documentation](https://docs.expo.dev/versions/latest/sdk/constants/)

## 📝 Notes

- Development builds tạo ra APK có thể cài trực tiếp, không cần Google Play
- Production builds tạo ra AAB/IPA optimized cho app stores
- Environment variables được inject tại build time, không phải runtime
- Sử dụng `expo-constants` để access environment variables trong app code
- File `.env.*` đã được thêm vào `.gitignore` để bảo mật 