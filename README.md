# whereis-frontend

Frontend application for the WhereIs workspace-based asset and stock tracking system.

## Runtime Mode

The app is configured to use the live API backend and Keycloak auth flow.

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables:

- `VITE_API_BASE_URL` is the backend base URL.
- `VITE_KEYCLOAK_BASE_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, and `VITE_KEYCLOAK_REDIRECT_URI` configure the real auth flow.

## Verification

```bash
npm run typecheck
npm run build
npm run smoke
```
