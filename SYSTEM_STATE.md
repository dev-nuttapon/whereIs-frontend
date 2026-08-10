# SYSTEM_STATE.md

> Current implementation state for the frontend. The backend contract reference is `/Users/nuttapon/Github-dev/whereIs-backend/docs/FRONTEND_ALIGNMENT_REQUIREMENTS.md`.

## Product direction

The frontend-first POC uses:

`Workspace → Category → Product → Asset | StockEntry`

and

`Workspace → Site → Location → Container`

with `BorrowOrder → BorrowOrderLine → BorrowEvent`. `Item` remains a legacy redirect-only compatibility path and is not the primary UI model.

## Implemented frontend areas

- Auth, workspace selection and workspace creation
- Product/category management
- Asset and optional Asset photos
- Stock adjustment with lot, expiry date and alert lead days
- Site, location and nestable container management
- Borrow order creation, approval, checkout, return, partial return and cancellation
- Workspace members, invitations, roles, permission overrides and member removal
- Permission-aware routes for product, asset, stock, container, borrow, master data and member pages
- Activity feed with the new `sourceType`, `sourceId`, `eventType` and `metadata` response shape
- Reports using Product/Asset/Stock/Borrow report keys
- Notifications with Product/Asset/StockEntry/BorrowOrder source links
- Product default expiry alert days and Borrow Order due-date alert days
- Settings for local alert preferences, theme and locale

## API contract status

The frontend API modules and forms are aligned with the backend contract changes dated 2026-08-10, including expiry/lot fields, activity feed, notification sources and borrow due-date lead days.

The frontend build and typecheck pass. Runtime integration against the real database is not claimed complete until the backend migrations are applied and the endpoint flows are tested with real credentials/data.

## Known limitations

- Browser smoke testing is currently blocked in this environment by Playwright/Chromium macOS permission failure.
- Notification generation depends on the backend notification scan trigger.
- Local Settings alert preferences are stored in browser localStorage until a persisted workspace settings contract is wired.
- Legacy Item components remain in the repository for compatibility but are not linked from the primary navigation.

## Verification

- `npm run typecheck` — passing
- `npm run build` — passing
- `git diff --check` — passing
