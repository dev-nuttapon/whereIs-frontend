# Inventory Flow Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining inventory workflows so users can add and edit items with photos and placement, manage stock entries, and complete borrow/return flow end-to-end inside one workspace shell.

**Architecture:** Keep workspace-scoped pages as orchestration layers and move data access through the existing API wrappers and TanStack Query hooks. Reuse the established patterns already in the repo: dialogs for create/edit actions, cards for list views, and workspace routes under `/w/:wsId/*`. Borrow and stock flows should stay connected to item/asset placement so users do not need to re-enter workspace context.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Ant Design, existing ASP.NET Core workspace APIs.

## Global Constraints

- Keep all flows workspace-scoped; use the current `wsId` from the route instead of asking the user to reselect workspace.
- Preserve the existing UI language, spacing scale, and responsive card layout.
- Use the existing API layer pattern: `src/api/*.api.ts` plus `src/features/*/hooks/*`.
- Do not introduce new backend contracts unless the current API surface cannot support the UI flow.

## Current Status

- Auth is working with `email` as the login identifier.
- Master data is in place for products, categories, sites, and locations.
- Settings now reads and saves workspace settings.
- Stock list/adjust exists.
- Borrow orders list exists with approve/reject/checkout/return/cancel actions.
- API wrappers exist for assets, asset photos, stock, borrow orders, roles, settings, lookups, members, permissions, containers, products, categories, sites, and locations.

## What Is Still Missing

- Full item/asset lifecycle in the UI:
  - create
  - edit
  - upload/delete photos
  - clear placement rules for location/container
- Borrow request creation and item entry points from item/stock screens.
- Stock flow completion in the UI:
  - easier adjustment entry points
  - clearer stock selection for borrow
  - optional stock movement view if backend adds a history endpoint later

---

### Task 1: Finish the item/asset lifecycle

**Files:**
- Modify: `src/features/items/pages/ItemsPage.tsx`
- Modify: `src/features/items/components/CreateItemDialog.tsx`
- Modify: `src/features/items/components/ItemFormDialog.tsx`
- Modify: `src/features/items/components/UpdateItemDialog.tsx`
- Modify: `src/features/items/components/ItemDetailPage.tsx`
- Modify: `src/features/assets/hooks/useAssets.ts`
- Modify: `src/api/asset-photo.api.ts`
- Create: `src/features/assets/components/AssetPhotoManager.tsx`
- Modify: `src/routes/index.tsx` if a separate item/asset sub-route is needed

**Interfaces:**
- Consumes: `useProducts(wsId)`, `useSites(wsId)`, `useLocations(wsId, siteId?)`, `useContainers(wsId)`, `useAssets(wsId)`, `useAsset(wsId, assetId)`, `useCreateAsset(wsId)`, `useUpdateAsset(wsId, assetId)`, `uploadAssetPhoto(wsId, assetId, file, setAsMain)`, `deleteAssetPhoto(wsId, assetId, photoId)`
- Produces: a complete create/edit/detail workflow for assets with photo upload and placement controls

- [ ] **Step 1: Verify current item screens and identify the missing interaction points**

Run:

```bash
npm run typecheck
```

Expected: PASS before changes. The goal here is to confirm the current baseline and avoid introducing unrelated breakage.

- [ ] **Step 2: Add or extract a reusable asset photo manager**

Create a focused component that can:

```tsx
<AssetPhotoManager
  wsId={wsId}
  assetId={asset.id}
  photos={asset.photoUrls}
  onUploaded={() => void assetQuery.refetch()}
  onDeleted={() => void assetQuery.refetch()}
/>
```

Use `src/api/asset-photo.api.ts` for upload/delete and keep the upload UI inside the asset detail or edit surface.

- [ ] **Step 3: Make create/edit dialogs enforce placement**

Keep the current workspace selected, then require:
- product
- site
- location
- optional container

When editing, prefill the existing asset placement and keep the user in the same workspace context.

- [ ] **Step 4: Expose a contextual create/edit entry point from item and container screens**

Add or retain buttons that open the item dialog from:
- `ItemsPage`
- `ItemDetailPage`
- container-related screens where placement is obvious

- [ ] **Step 5: Re-run verification**

Run:

```bash
npm run typecheck && npm run build
```

Expected: PASS.

---

### Task 2: Complete borrow request creation and connect it to item/stock entry points

**Files:**
- Modify: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`
- Create: `src/features/borrow-orders/pages/BorrowOrderDetailPage.tsx`
- Modify: `src/features/borrow-orders/hooks/useBorrowOrders.ts`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/layout/Breadcrumbs.tsx`
- Modify: `src/features/items/components/ItemDetailPage.tsx`
- Modify: `src/features/stock/pages/StockPage.tsx`
- Modify: `src/features/stock/hooks/useStock.ts`
- Modify: `src/lib/i18n.ts` for any missing borrow labels

**Interfaces:**
- Consumes: `useBorrowOrders(wsId)`, `useBorrowOrder(wsId, orderId)`, `useCreateBorrowOrder(wsId)`, `useAssets(wsId)`, `useStockEntries(wsId)`, `useProducts(wsId)`
- Produces: a reusable borrow creation flow and a detail page with all order actions and line visibility

- [ ] **Step 1: Split the current inline create dialog into a reusable component**

Keep the current multi-line borrow UI but move it into a dedicated component so the page and item/stock entry points can open the same flow.

Expected props:

```tsx
<CreateBorrowOrderDialog
  wsId={wsId}
  open={open}
  onOpenChange={setOpen}
  initialAssetId={assetId ?? null}
  initialProductId={productId ?? null}
  initialStockEntryId={stockEntryId ?? null}
/>
```

- [ ] **Step 2: Add a borrow order detail route**

Implement a detail page that shows:
- order metadata
- lines
- status
- line-level actions when applicable

Route:

```tsx
/w/:wsId/borrow-orders/:orderId
```

Breadcrumbs should render the workspace trail plus `Borrow orders`.

- [ ] **Step 3: Add entry points from item and stock screens**

From the item detail screen, allow creating a borrow order for the current asset.
From the stock page, allow creating a borrow order for the current stock entry or product.

This keeps users from hunting for the borrow page when they are already on the right record.

- [ ] **Step 4: Re-run verification**

Run:

```bash
npm run typecheck && npm run build
```

Expected: PASS.

---

### Task 3: Finish stock entry UX and clarify placement rules

**Files:**
- Modify: `src/features/stock/pages/StockPage.tsx`
- Modify: `src/features/stock/hooks/useStock.ts`
- Modify: `src/features/items/components/UpdateItemDialog.tsx`
- Modify: `src/features/items/components/ItemFormDialog.tsx`
- Modify: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`
- Modify: `src/api/stock.api.ts`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: `useAdjustStock(wsId)`, `useStockEntries(wsId, params)`, `useProducts(wsId)`, `useLocations(wsId, siteId?)`, `useContainers(wsId)`
- Produces: a stock-adjust workflow that can be reached from the stock page, item detail, and borrow creation screens

- [ ] **Step 1: Make stock adjustment the canonical way to create stock**

Keep the stock page as the entry point for:
- selecting a stock-tracked product
- choosing site/location/container placement
- adjusting quantity up or down

If the backend later exposes stock movement history, attach it to the same page rather than creating a separate flow.

- [ ] **Step 2: Tighten placement rules in item and borrow forms**

Ensure the form copy clearly states:
- item placement requires a site and location
- container is optional unless the current container flow requires it
- stock borrow lines must pick a valid stock entry

- [ ] **Step 3: Add any missing localized copy and empty states**

Update the i18n file for:
- stock labels
- borrow detail labels
- create-borrow labels
- asset photo labels

- [ ] **Step 4: Final verification**

Run:

```bash
npm run typecheck && npm run build
```

Expected: PASS.

## Handoff Notes

- If the next worker only has time for one task, start with Task 1. It unlocks the rest of the inventory flow.
- Task 2 depends on the stock and asset entry points being clear enough that users can launch a borrow request from the right place.
- Task 3 is mostly UX polish, but it is the piece that makes the whole flow feel complete.

## Immediate Next Step for Codex

1. Start with Task 1 and finish the asset/item lifecycle.
2. Reuse the existing workspace context from the route and do not add any workspace re-selection step.
3. After Task 1 is stable, move to Task 2 so borrow creation can launch from item and stock screens.
4. Finish with Task 3 to normalize stock entry, placement rules, and missing labels.
