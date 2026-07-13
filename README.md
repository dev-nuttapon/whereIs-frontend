# whereis-frontend

Frontend POC and documentation for the WhereIs workspace-based asset and stock tracking system.

## Runtime Mode

The app currently runs in demo mode by default. When `VITE_DEMO_MODE=false`, the auth flow switches to Keycloak PKCE and the app expects a live API backend.

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables:

- `VITE_DEMO_MODE=true` keeps mock auth bootstrapped for local demo flows.
- `VITE_API_BASE_URL` is reserved for the real backend base URL.
- `VITE_KEYCLOAK_BASE_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, and `VITE_KEYCLOAK_REDIRECT_URI` configure the real auth flow.

## Verification

```bash
npm run typecheck
npm run build
npm run smoke
```
