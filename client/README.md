# SUVIDHA Client

React + TypeScript + Vite client for SUVIDHA auth flows.

## Implemented Stack

- React Router DOM for page navigation
- Zustand for state management
- Tailwind CSS for styling
- Modular API client aligned to backend response standards

## Folder Structure

```text
src/
  app/
    App.tsx
    routes/
      AppRoutes.tsx
  api/
    authApi.ts
    httpClient.ts
  components/
    layout/
      AppLayout.tsx
  config/
    env.ts
  pages/
    auth/LoginPage.tsx
    home/HomePage.tsx
    profile/ProfilePage.tsx
    not-found/NotFoundPage.tsx
  stores/
    authStore.ts
    userStore.ts
  types/
    api.ts
    user.ts
  utils/
    jwt.ts
    storage.ts
  main.tsx
  index.css
```

## Routing

- `/` -> Home
- `/login` -> OTP login
- `/profile` -> User profile (auth-protected)
- `*` -> Not found

## State Management

- `authStore`: token + auth status
- `userStore`: user profile data from login response

## Environment Variables

Create a `.env` from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_AUTH_API_PREFIX=/api/v1/auth
```

## API Contract

The client expects backend standard envelopes:

- Success: `{ success: true, message, data }`
- Error: `{ success: false, error: { code, message, details } }`

## Commands

```bash
npm install
npm run dev
npm run build
```
