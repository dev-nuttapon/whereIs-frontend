# Items, Location, and Subcontainers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working item creation flow that uses the backend asset APIs and lets the user place an item into a location and optionally a container or subcontainer within the current workspace.

**Architecture:** Treat frontend "items" as the existing backend `assets` domain. Build a focused item creation surface that can be opened from the workspace container area, loads product/location/container data from workspace-scoped APIs, and submits a single create request to `/api/v1/workspaces/{wsId}/assets`. Container selection should support the current container plus child containers so nested storage is usable without requiring a separate navigation step.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Ant Design, existing backend ASP.NET Core APIs.

## Global Constraints

- Use the current workspace from route params; do not ask the user to reselect workspace on the create-item flow.
- Item creation must include a location selection and may include a container selection.
- Container selection must support subcontainers / child containers.
- Follow existing app styling and i18n patterns.
- Prefer small focused files that mirror existing feature structure.

---

### Task 1: Wire backend-backed data access for assets and products

**Files:**
- Create: `src/api/product.api.ts`
- Create: `src/api/asset.api.ts`
- Modify: `src/lib/queryKeys.ts`
- Modify: `src/types/domain.types.ts` if needed for asset-specific display fields
- Modify: `src/lib/i18n.ts` for any missing item labels used by the new flow

**Interfaces:**
- Consumes: `/api/v1/workspaces/{wsId}/products`, `/api/v1/workspaces/{wsId}/assets`, `/api/v1/workspaces/{wsId}/locations`, `/api/v1/workspaces/{wsId}/containers`
- Produces: `listProducts`, `listAssets`, `getAsset`, `createAsset`, `updateAsset`, `deleteAsset`, and related query keys

- [ ] **Step 1: Write the failing typecheck expectation**

Run: `npm run typecheck`

Expected: fail because `product.api.ts` and `asset.api.ts` imports do not exist yet.

- [ ] **Step 2: Implement minimal API clients and query keys**

```ts
export async function listProducts(wsId: string): Promise<Product[]> { /* map /products */ }
export async function listAssets(wsId: string, params: { locationId?: string | null; containerId?: string | null; search?: string | null; page?: number; pageSize?: number }): Promise<Asset[]> { /* map /assets */ }
export async function createAsset(wsId: string, input: CreateAssetInput): Promise<Asset> { /* post /assets */ }
```

- [ ] **Step 3: Re-run typecheck**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 2: Add item creation UI with location and container/subcontainer selection

**Files:**
- Create: `src/features/items/components/ItemFormDialog.tsx`
- Create: `src/features/items/components/CreateItemDialog.tsx`
- Create: `src/features/items/hooks/useAssets.ts`
- Create: `src/features/items/pages/ItemsPage.tsx`
- Modify: `src/features/containers/pages/ContainerDetailPage.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/constants/navigation.ts`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: `useProducts`, `useSites`, `useLocations`, `useContainers`, `createAsset`
- Produces: a workspace-scoped items page and a create-item dialog that can be opened from container detail

- [ ] **Step 1: Write the failing route/page expectation**

Run: `npm run typecheck`

Expected: fail because `ItemsPage` and item components are not wired yet.

- [ ] **Step 2: Implement item form dialog**

```tsx
<ItemFormDialog
  open={open}
  onOpenChange={setOpen}
  title={t('items.form.title')}
  description={t('items.form.description')}
  submitLabel={t('items.form.save')}
  onSubmit={...}
/>
```

Form fields: product, name, location, container, serial/barcode, notes, acquired date.

- [ ] **Step 3: Make container selection include subcontainers**

Use the current workspace container list and recursively render child containers so nested storage can be picked without extra navigation.

- [ ] **Step 4: Mount the new page and menu entry**

Add `/w/:wsId/items` route and workspace nav entry.

- [ ] **Step 5: Re-run typecheck/build**

Run: `npm run typecheck && npm run build`

Expected: PASS.

---

### Task 3: Expose item creation from container detail and keep placement contextual

**Files:**
- Modify: `src/features/containers/pages/ContainerDetailPage.tsx`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: the container currently being viewed
- Produces: a contextual "Add item" action that pre-fills container/location when possible

- [ ] **Step 1: Add a failing visual/interaction check**

Use the existing page flow and confirm the button is missing from the container detail page.

- [ ] **Step 2: Add the contextual action**

Show an add-item button on container detail that opens the item dialog with the current container preselected.

- [ ] **Step 3: Re-run typecheck/build**

Run: `npm run typecheck && npm run build`

Expected: PASS.
