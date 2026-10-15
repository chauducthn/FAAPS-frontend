# FAAPS Frontend

React, TypeScript, Vite, and Tailwind CSS frontend for FAAPS.

## Local development

```powershell
pnpm install
pnpm dev
```

Start the Spring Boot backend with RDS and Google OAuth configured, then open `http://localhost:5173`. Vite proxies `/api` and `/oauth2` to the backend on port 8080. The Google OAuth redirect URI registered with Google must be `http://localhost:8080/login/oauth2/code/google`.

Admin signs in with username or email and password. Student and Advisor use the backend Google OAuth flow. After Google redirects to `/auth/callback`, the frontend loads `/api/auth/me` and routes by role. Sign-out calls `/api/auth/logout` and clears the session. Role pages are placeholders for later tasks.
