# VocabVerse Mobile

React Native + TypeScript app cho VocabVerse — nền tảng học từ vựng tiếng Anh tích hợp AI.

## Tech Stack

- React Native 0.76 (New Architecture)
- TypeScript 5.5
- React Navigation 7 (Stack + Bottom Tabs)
- Zustand (state) + TanStack Query (server state)
- Axios + JWT auto-refresh interceptor
- Zod (validation) + react-hook-form (forms)
- AsyncStorage (persistence)
- react-native-video (shadowing playback)

## Cấu trúc thư mục

```
src/
├── app/           # config (API base URL, storage keys)
├── components/
│   └── ui/        # base UI components (Button, Text, Input, Screen...)
├── navigation/    # RootNavigator, MainNavigator, AuthNavigator
├── screens/
│   ├── auth/      # Login, Register
│   └── main/      # Home, Collections, Practice, Profile
├── services/
│   ├── api/       # API client cho từng module (auth, user, collection...)
│   ├── api.ts     # axios instance + JWT refresh interceptor
│   └── storage.ts # AsyncStorage wrapper
├── stores/        # Zustand stores (authStore...)
├── theme/         # colors, spacing, typography, theme object
└── types/         # Shared TypeScript types
```

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Cài iOS pods (chỉ macOS)
npm run pod

# 3. Copy env và chỉnh base URL nếu cần
cp .env.example .env

# 4. Chạy
npm run android   # Android
npm run ios       # iOS (chỉ macOS)
```

## Scripts

- `npm start` — Metro bundler
- `npm run android` / `npm run ios` — build + run
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run test` — Jest

## Lưu ý khi dev với backend local

- Android emulator: backend chạy trên host = `http://10.0.2.2:8080` (config sẵn)
- iOS simulator: dùng `http://localhost:8080`
- Real device: thay bằng IP máy tính trong cùng mạng LAN, ví dụ `http://192.168.1.10:8080/api/v1`