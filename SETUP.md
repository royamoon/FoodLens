# FoodLens Setup Guide

## Cấu hình API Key

Để sử dụng tính năng nhận diện thức ăn, bạn cần cấu hình Gemini API key:

### 1. Lấy Gemini API Key
1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Sao chép API key

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc của dự án:

```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

**Hoặc** set environment variable trong terminal:

```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

### 3. Khởi động lại ứng dụng
```bash
npm run start
# hoặc
npx expo start
```

## Troubleshooting

### Lỗi "API key not configured"
- Kiểm tra file `.env.local` đã được tạo đúng cách
- Đảm bảo API key đã được copy chính xác
- Khởi động lại Expo development server

### Lỗi HTTP 500 khác
- Kiểm tra console logs để xem chi tiết lỗi
- Đảm bảo kết nối internet ổn định
- Thử với ảnh có độ phân giải nhỏ hơn

### Lỗi "Invalid image data"
- Đảm bảo quyền truy cập camera/photo library đã được cấp
- Thử chọn ảnh khác hoặc chụp ảnh mới 