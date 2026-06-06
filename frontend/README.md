# Book LM — Frontend

React + TypeScript + Vite UI for the Library Management API.

## Structure

```text
src/
  api/           HTTP client and endpoint modules
  app/           Router and root App
  components/    layout + shared UI
  features/      books, users, borrows (forms + lists)
  pages/         route-level screens
  styles/        global CSS and design tokens
  types/         TypeScript models matching API schemas
public/          static assets (favicon)
```

## Run

1. Start the API (from repo root):

   ```bash
   python -m uvicorn app.main:app --reload
   ```

2. Copy env and install:

   ```bash
   cd frontend
   copy .env.example .env
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

## Google sign-in (your task later)

This repo includes a **placeholder** on `/auth`. To implement Google email verification you will typically:

1. Create an OAuth 2.0 **Web client** in [Google Cloud Console](https://console.cloud.google.com/).
2. Add authorized JavaScript origins: `http://localhost:5173`
3. Use [Google Identity Services](https://developers.google.com/identity/gsi/web) on the frontend to get an **ID token**.
4. Add a FastAPI endpoint that verifies the token with Google’s public keys and creates/finds the user by email.

No stock photos are required; add your own logo under `public/` if you want (e.g. `public/logo.svg`).

## Notes

- JWT `/auth/login` is commented out on the backend for now.
- Return-book API on the backend may still need fixes before a “Return” button is added here.
