# POC Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the WhereIs frontend read clearly as a POC/demo system without changing the existing route structure or feature scaffolding.

**Architecture:** Update the app-wide branding and shared layout surfaces first so the POC label appears consistently in auth, workspace selection, and in-app pages. Then align the shared copy and metadata strings so the UI, browser title, and docs all describe the same demo-first scope.

**Tech Stack:** React, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS, shadcn/ui

---

### Task 1: Add POC branding to shared shells

**Files:**
- Modify: `src/components/common/PageShell.tsx`
- Modify: `src/layouts/AuthLayout.tsx`
- Modify: `src/layouts/WorkspaceSelectLayout.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/lib/i18n.ts`

- [ ] **Step 1: Update the shared shell components to show the POC badge and demo-first copy**

```tsx
// PageShell gets a visible "POC Demo" badge above the page title.
// AuthLayout, WorkspaceSelectLayout, and Sidebar use the same translated label.
```

- [ ] **Step 2: Run a quick app build**

Run: `npm run build`
Expected: Build completes without type errors.

### Task 2: Align browser metadata and visible page copy

**Files:**
- Modify: `index.html`
- Modify: `src/lib/i18n.ts`
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`
- Modify: `src/features/search/pages/SearchPage.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`
- Modify: `src/features/workspaces/pages/WorkspaceListPage.tsx`
- Modify: `src/features/workspaces/pages/WorkspaceNewPage.tsx`
- Modify: `src/features/auth/pages/LoginPage.tsx`
- Modify: `src/features/auth/pages/RegisterPage.tsx`

- [ ] **Step 1: Update the title, description, and page copy to mention the POC/demo scope**

```tsx
// Keep the product name as WhereIs, but make the demo nature explicit in titles and helper text.
```

- [ ] **Step 2: Rebuild and verify the app still compiles**

Run: `npm run build`
Expected: Build completes successfully.

### Task 3: Refresh the top-level documentation

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_CONTEXT.md`
- Modify: `docs/architecture/project-overview.md`
- Modify: `docs/ui/ui-overview.md`

- [ ] **Step 1: Update the top-level docs so they describe the repo as a frontend POC/demo**

```md
<!-- Keep the docs aligned with the UI copy so future readers do not assume this is a finished production product. -->
```

- [ ] **Step 2: Do a final text scan for stale "foundation scaffold" language**

Run: `rg -n "foundation scaffold|POC|demo" README.md PROJECT_CONTEXT.md docs src/lib/i18n.ts`
Expected: Demo/POC wording is consistent in the user-facing surfaces.

