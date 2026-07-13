# whereis-frontend

Frontend POC and documentation for the WhereIs workspace-based asset and stock tracking system.

## Runtime Mode

The app currently runs in demo mode by default. API modules expose the frontend-facing contract, while their implementations use the mock adapter in `src/mocks/demo-db.ts` until a backend service is connected.

```bash
cp .env.example .env
npm install
npm run dev
```

Environment variables:

- `VITE_DEMO_MODE=true` keeps mock auth bootstrapped for local demo flows.
- `VITE_API_BASE_URL` is reserved for the real backend base URL.

## Verification

```bash
npm run typecheck
npm run build
npm run smoke
```
