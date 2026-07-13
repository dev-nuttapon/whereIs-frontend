# Items Search and Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact search and filter bar to the Items page so users can narrow assets by text, status, product, location, and container without changing backend contracts.

**Architecture:** Keep the Items page as the orchestration layer. Pull options from the existing asset, product, and container queries, then pass a stable params object into the existing `useAssets` hook. Render the filter bar above the stats/cards and keep all edit/delete/create flows unchanged.

**Tech Stack:** React, TypeScript, TanStack Query, existing UI components (`Input`, `Select`, `Card`, `Button`), existing asset/product/container hooks.

## Global Constraints

- Preserve existing create/edit/delete behavior for items.
- Do not change backend contracts.
- Keep the UI compact and responsive.
- Use existing design system components where possible.

---

### Task 1: Wire filter state into the Items query

**Files:**
- Modify: `src/features/items/pages/ItemsPage.tsx`

**Interfaces:**
- Consumes: `useAssets(wsId, params)`, `useProducts(wsId)`, `useContainers(wsId)`
- Produces: stable query params for search/filtering and derived option lists

- [ ] **Step 1: Add state for `search`, `status`, `productId`, `locationId`, and `containerId`.**
- [ ] **Step 2: Build a stable params object and pass it to `useAssets`.**
- [ ] **Step 3: Add a second asset query for option derivation with `pageSize: 1000`.**
- [ ] **Step 4: Derive unique location options and map product/container options.**

### Task 2: Render the filter bar and empty-state behavior

**Files:**
- Modify: `src/features/items/pages/ItemsPage.tsx`

**Interfaces:**
- Consumes: filter state and option lists from Task 1
- Produces: a responsive filter bar, clear-filters action, and filtered empty state copy

- [ ] **Step 1: Add a `Card` section above the stats cards for search and filters.**
- [ ] **Step 2: Add `Input` and `Select` controls for the filter fields.**
- [ ] **Step 3: Add a clear button that resets all filters to defaults.**
- [ ] **Step 4: Show a different empty-state message when filters are active.**

### Task 3: Verify the page still builds cleanly

**Files:**
- Modify: none

**Interfaces:**
- Consumes: the updated Items page
- Produces: a verified build and typecheck result

- [ ] **Step 1: Run `npm run typecheck`.**
- [ ] **Step 2: Run `npm run build`.**
- [ ] **Step 3: Confirm both commands pass without new warnings or errors.**
