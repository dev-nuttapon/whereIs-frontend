# whereis-frontend

Frontend application for the WhereIs workspace-based asset and stock tracking system.

## Runtime Mode

The app is configured to use the live API backend. Login is submitted to the API, which exchanges credentials with Keycloak and returns the session tokens.

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables:

- `VITE_API_BASE_URL` is the backend API base URL, including the `/api/v1` prefix.

## Verification

```bash
npm run typecheck
npm run build
npm run smoke
```
