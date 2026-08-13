# Unified Inventory Tables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Products, Assets, Stock, Containers, and Borrow Orders use one consistent table presentation with shared status badges, spacing, actions, and pagination.

**Architecture:** Preserve each page's existing data queries and business actions. Introduce a small shared table styling/pagination layer only where it reduces duplication, then migrate each page without changing API contracts.

**Tech Stack:** React, TypeScript, Tailwind CSS, TanStack Query, existing UI components.

## Global Constraints

- Keep existing API calls and permissions unchanged.
- Do not remove page-specific actions or columns.
- Use Thai labels consistent with the current application.
- Verify with `npm run typecheck` and `npm run build`.

### Task 1: Inventory the five page table structures

**Files:**
- Inspect: `src/features/products/pages/ProductsPage.tsx`
- Inspect: `src/features/assets/pages/AssetsPage.tsx`
- Inspect: `src/features/stock/pages/StockPage.tsx`
- Inspect: `src/features/containers/pages/ContainersPage.tsx`
- Inspect: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`

- [ ] Record existing columns, row actions, filters, and pagination so migration preserves behavior.
- [ ] Identify pages that still render cards or have no pagination.

### Task 2: Add shared table presentation primitives

**Files:**
- Create: `src/components/common/DataTableShell.tsx`
- Create: `src/components/common/DataTablePagination.tsx`

- [ ] Implement shared table wrapper classes: rounded border, themed header, row divider, hover state, horizontal overflow, and consistent cell padding.
- [ ] Implement pagination props `{ page, pageSize, total, onPageChange, onPageSizeChange }` with 10/25/50 options.
- [ ] Keep primitives presentational and independent of API types.

### Task 3: Migrate Products and Assets

**Files:**
- Modify: `src/features/products/pages/ProductsPage.tsx`
- Modify: `src/features/assets/pages/AssetsPage.tsx`

- [ ] Render product and asset rows through the shared table shell.
- [ ] Use consistent status badges and action cell alignment.
- [ ] Add or preserve page/pageSize state and reset page to 1 when filters change.

### Task 4: Migrate Stock and Containers

**Files:**
- Modify: `src/features/stock/pages/StockPage.tsx`
- Modify: `src/features/containers/pages/ContainersPage.tsx`

- [ ] Render stock and storage rows through the shared table shell.
- [ ] Preserve stock adjustment, borrow, edit, delete, expand, and navigation actions.
- [ ] Add consistent pagination controls and status presentation.

### Task 5: Migrate Borrow Orders

**Files:**
- Modify: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`

- [ ] Render borrow order rows with the shared table styling.
- [ ] Preserve approval, checkout, return, cancel, and detail actions.
- [ ] Add consistent pagination without changing order filters or API behavior.

### Task 6: Verify all five pages

**Files:**
- Verify: all files from Tasks 2-5

- [ ] Run `npm run typecheck` and confirm exit code 0.
- [ ] Run `npm run build` and confirm Vite completes successfully.
- [ ] Inspect each route for table header alignment, status badge visibility, action alignment, and pagination presence.
