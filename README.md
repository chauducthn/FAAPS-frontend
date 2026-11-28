# FAAPS Frontend

React, TypeScript, Vite, and Tailwind CSS frontend for FAAPS.

## Local development

```bash
npm install
npm run dev
```

Start the Spring Boot backend with RDS and Google OAuth configured, then open `http://localhost:5173`. Vite proxies `/api` and `/oauth2` to the backend on port 8080. The Google OAuth redirect URI registered with Google must be `http://localhost:8080/login/oauth2/code/google`.

Admin signs in with username or email and password. Student and Advisor use the backend Google OAuth flow. After Google redirects to `/auth/callback`, the frontend loads `/api/auth/me` and routes by role. Sign-out calls `/api/auth/logout` and clears the session. Role pages are placeholders for later tasks.

## Documentation

UI rules for this repo are in [docs/UI_RULES.md](docs/UI_RULES.md). API notes, the database schema and team guides
live in [faaps-doc](https://github.com/chauducthn/faaps-doc).
