# System Flow Standard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the WhereIs frontend around one canonical asset lifecycle, one master-data layer, one operational transaction layer, and one audit layer so data entry and user flow follow a consistent order.

**Architecture:** Start by aligning docs and route semantics to one canonical vocabulary, then update the app shell so navigation surfaces the correct primary entry points. After that, refactor item/container/member flows to separate setup from transaction work, and finish by wiring audit/report/notification surfaces to the same workspace-scoped lifecycle.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Zustand, Ant Design, shadcn/ui, Vite

## Global Constraints

- `Workspace` is the isolation boundary for data, members, permissions, notifications, and reports.
- `Container` is the only primary term for the storage tree; `Location` and `Site` are legacy-only bridge terms.
- `Item` is the primary tracked object; `Asset` is legacy-only and must not remain the product vocabulary.
- `Stock` is a tracking mode of item lifecycle, not a separate product universe.
- `Transaction` and `Event / History` must be separate from reference/master data.
- `Search` is the primary entry point for daily work.
- `Audit / Visibility` must be read from event/history and summaries, not from form state.
- Every screen and action must be scoped to the active workspace.
- Every destructive action must require confirmation.

---

### Task 1: Canonical vocabulary and route map alignment

**Files:**
- Modify: `docs/architecture/requirement-summary.md`
- Modify: `docs/architecture/domain-model.md`
- Modify: `docs/ui/navigation.md`
- Modify: `docs/ui/screen-flow.md`
- Modify: `docs/modules/README.md`
- Modify: `docs/modules/item.md`
- Modify: `docs/modules/container.md`
- Modify: `docs/modules/member.md`
- Modify: `docs/modules/search.md`
- Modify: `docs/modules/activity.md`
- Modify: `docs/modules/reports.md`
- Modify: `docs/modules/notifications.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-14-system-flow-standard-design.md`
- Produces: canonical vocabulary, screen-role definitions, and route map language that later code changes must follow

- [ ] **Step 1: Update the vocabulary sections so `Item`, `Container`, `Stock`, `Transaction`, and `Event` are the primary terms everywhere.**

Replace any primary-product wording that still treats `Asset` or `Location` as the system center with the canonical terms below:

```md
- Item is the primary tracked object.
- Stock is an item lifecycle mode, not a separate product.
- Container is the storage node.
- Location and Site are legacy-only bridge terms.
- Event / History records what happened, who did it, and when.
```

- [ ] **Step 2: Update the screen-flow and navigation docs so search, activity, reports, and notifications are first-class routes.**

Add these canonical routes to the docs:

```md
/w/:wsId/search
/w/:wsId/activity
/w/:wsId/reports
/w/:wsId/notifications
```

And state the navigation order as:

```md
Login -> Workspace -> Master Data -> Container Structure -> Item / Stock Creation -> Search / Browse -> Transaction -> Activity / Reports / Notifications
```

- [ ] **Step 3: Add explicit screen roles to the module docs so each page has one primary purpose.**

Use these role definitions:

```md
- Master Data pages: setup/configuration
- Container pages: structure management
- Item pages: operational transaction
- Search page: discovery
- Activity page: audit
- Reports page: summary/decision support
- Notifications page: reminder/follow-up
```

- [ ] **Step 4: Run a consistency check against the edited docs.**

Run:

```bash
rg -n "Asset|Location|Site|search|activity|reports|notifications|Transaction|Event" docs/architecture docs/ui docs/modules
```

Expected:
- `Asset`, `Location`, and `Site` should only appear where they are explicitly labeled legacy or bridge terms.
- `search`, `activity`, `reports`, and `notifications` should appear as canonical first-class system routes.

---

### Task 2: App shell navigation standardization

**Files:**
- Modify: `src/constants/routes.ts`
- Modify: `src/constants/navigation.ts`
- Modify: `src/components/layout/Topbar.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/WorkspaceSwitcher.tsx`
- Modify: `src/components/layout/GlobalSearchBar.tsx`
- Modify: `src/layouts/AppLayout.tsx`
- Modify: `src/components/layout/Breadcrumbs.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: route names from Task 1 and workspace context from `workspaceStore`
- Produces: shell navigation that exposes search as a primary entry point and mounts all system-level routes

- [ ] **Step 1: Add missing workspace routes to `ROUTES` and mount them in `AppRoutes`.**

Use these route constants:

```ts
workspaceSearch: (wsId: string) => `/w/${wsId}/search`,
workspaceActivity: (wsId: string) => `/w/${wsId}/activity`,
workspaceReports: (wsId: string) => `/w/${wsId}/reports`,
workspaceNotifications: (wsId: string) => `/w/${wsId}/notifications`,
```

And add lazy-loaded pages for those paths in `src/routes/index.tsx`.

- [ ] **Step 2: Put global search into the topbar so it is always available in the workspace shell.**

Update `Topbar.tsx` to render `GlobalSearchBar` in the main action region, keeping `WorkspaceSwitcher` and `UserMenu` visible.

Example layout target:

```tsx
<div className="min-w-0 flex-1 sm:max-w-sm lg:max-w-[28rem]">
  <GlobalSearchBar />
</div>
```

- [ ] **Step 3: Extend sidebar navigation to include Search, Activity, Reports, and Notifications with permission filtering.**

Add these entries to `WORKSPACE_NAV_ITEMS`:

```ts
{ labelKey: 'nav.search', labelFallback: 'Search', iconKey: 'search', to: (wsId) => `/w/${wsId}/search`, roles: ['member', 'admin', 'owner', 'viewer'] },
{ labelKey: 'nav.activity', labelFallback: 'Activity', iconKey: 'activity', to: (wsId) => `/w/${wsId}/activity`, roles: ['member', 'admin', 'owner', 'viewer'] },
{ labelKey: 'nav.reports', labelFallback: 'Reports', iconKey: 'reports', to: (wsId) => `/w/${wsId}/reports`, roles: ['member', 'admin', 'owner'] },
{ labelKey: 'nav.notifications', labelFallback: 'Notifications', iconKey: 'notifications', to: (wsId) => `/w/${wsId}/notifications`, roles: ['member', 'admin', 'owner', 'viewer'] },
```

Then map the icons in `Sidebar.tsx`.

- [ ] **Step 4: Update breadcrumb generation so each new route shows a stable workspace context path.**

Target breadcrumb shapes:

```md
/w/:wsId/search -> Search
/w/:wsId/activity -> Activity
/w/:wsId/reports -> Reports
/w/:wsId/notifications -> Notifications
```

- [ ] **Step 5: Verify the shell renders without regressions.**

Run:

```bash
npm run typecheck
```

Expected:
- no missing imports for new layout components
- no route compile errors

---

### Task 3: Search as the primary daily-work entry

**Files:**
- Create: `src/features/search/pages/SearchPage.tsx`
- Create: `src/features/search/hooks/useSearchItems.ts`
- Create: `src/features/search/components/SearchFilters.tsx`
- Create: `src/features/search/components/SearchResults.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/layout/GlobalSearchBar.tsx`
- Modify: `src/lib/queryKeys.ts`
- Modify: `src/api/item.api.ts`

**Interfaces:**
- Consumes: workspace route params, `queryKeys`, item list/search API
- Produces: `/w/:wsId/search` page with URL-based filters and permission-aware results

- [ ] **Step 1: Write the search page to read and write URL query params only.**

The page must keep search state in the URL:

```ts
q
type
status
containerId
page
```

Do not add Zustand state for search criteria.

- [ ] **Step 2: Implement search query hooks with stable query keys.**

Use a query key shape like:

```ts
['ws', wsId, 'items', 'search', params]
```

The hook must call the item list/search endpoint and keep previous data while the user changes filters.

- [ ] **Step 3: Add search result cards that show only canonical item data.**

Each result card should show:

```md
- item name
- code if available
- container path or container name
- current holder if available
- status
- type
```

Do not present `Asset` wording on the page.

- [ ] **Step 4: Wire the global search bar to navigate into the search page with `q`.**

Keep the existing Enter behavior, but make the search page the actual home for discovery.

- [ ] **Step 5: Add a smoke test for the search route.**

Run:

```bash
npm run smoke
```

Expected:
- `/w/:wsId/search?q=...` loads
- filters update the URL
- results remain workspace-scoped

---

### Task 4: Item and stock lifecycle standardization

**Files:**
- Modify: `src/types/domain.types.ts`
- Modify: `src/api/asset.api.ts`
- Modify: `src/features/assets/hooks/useAssets.ts`
- Modify: `src/features/items/components/CreateItemDialog.tsx`
- Modify: `src/features/items/components/UpdateItemDialog.tsx`
- Modify: `src/features/items/components/ItemFormDialog.tsx`
- Modify: `src/features/items/components/ItemDetailPage.tsx`
- Modify: `src/features/items/validation/createItemSchema.ts`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: canonical `Item` and `Stock` terms from Task 1
- Produces: item creation/edit/detail flows that are step-based and lifecycle-aware

- [ ] **Step 1: Align the domain types to prefer `Item` over `Asset` in the public surface.**

Keep legacy adapters if needed, but the visible frontend contract should read like:

```ts
interface Item {
  id: string;
  workspaceId: string;
  name: string;
  kind: 'single' | 'stock';
  status: 'stored' | 'taken_out' | 'reserved' | 'missing' | 'repair' | 'disposed';
  containerId: string | null;
  currentHolderId: string | null;
}
```

- [ ] **Step 2: Split item creation into setup-first fields and lifecycle fields.**

The create/edit form should treat these as required before submit:

```md
- workspace
- item kind
- name
- container
- tracking mode
```

And these as conditional lifecycle fields:

```md
- quantity
- unit
- base unit
- lot code
- received date
- expiry date
- warranty date
- maintenance due date
```

- [ ] **Step 3: Make item detail the transaction hub instead of a static detail page.**

The detail page must present:

```md
- current state
- current container path
- current holder
- lifecycle metadata
- available actions based on permission and item type
- history / event timeline
```

- [ ] **Step 4: Keep stock actions in the same lifecycle model.**

Stock-specific actions such as consume, restock, count, and adjust must be treated as lifecycle transactions with event output, not as a separate UI universe.

- [ ] **Step 5: Add UI copy and validation text that use the canonical vocabulary.**

Replace user-facing copy that still says `Asset` where the product language should say `Item`.

- [ ] **Step 6: Run typecheck after the item refactor.**

Run:

```bash
npm run typecheck
```

Expected:
- no broken item form imports
- no stale `Asset` references in the primary item flow

---

### Task 5: Container structure and master-data separation

**Files:**
- Modify: `src/features/containers/pages/ContainersPage.tsx`
- Modify: `src/features/containers/pages/ContainerDetailPage.tsx`
- Modify: `src/features/containers/components/ContainerFormDialog.tsx`
- Modify: `src/features/containers/hooks/useContainers.ts`
- Modify: `src/api/container.api.ts`
- Create: `src/features/master-data/pages/MasterDataPage.tsx` if the existing page does not yet separate setup clearly enough
- Modify: `src/features/master-data/components/CategoryFormDialog.tsx`
- Modify: `src/features/master-data/components/ProductFormDialog.tsx`
- Modify: `src/features/master-data/components/LocationFormDialog.tsx`
- Modify: `src/features/master-data/components/SiteFormDialog.tsx`

**Interfaces:**
- Consumes: canonical container and master-data rules from Tasks 1 and 4
- Produces: setup pages that are clearly separate from transaction pages

- [ ] **Step 1: Make container pages represent structure management only.**

Container list/detail should focus on:

```md
- tree position
- children
- contents
- visibility/access scope summary
```

- [ ] **Step 2: Separate master-data setup from day-to-day container actions.**

If the existing master-data page mixes too many concepts, split the page into a setup dashboard with explicit sections:

```md
- category
- product
- container template
- site/location bridge only if needed
```

- [ ] **Step 3: Make container create/edit forms reflect parent-child hierarchy clearly.**

The create/edit dialog must make parent selection explicit and show whether a node is root or nested.

- [ ] **Step 4: Update invalidation so container tree, detail, and content lists stay in sync after mutations.**

Mutations must invalidate:

```ts
queryKeys.containers.all(wsId)
queryKeys.containers.detail(wsId, containerId)
queryKeys.containers.tree(wsId)
```

- [ ] **Step 5: Run the container page smoke path.**

Manually verify:

```md
Containers list -> Container detail -> edit -> back to list
```

Expected:
- no lost tree context
- no mixed master-data transaction actions

---

### Task 6: Activity, reports, and notifications as first-class audit outputs

**Files:**
- Create: `src/features/activity/pages/ActivityPage.tsx`
- Create: `src/features/activity/hooks/useActivity.ts`
- Create: `src/features/activity/components/ActivityFeed.tsx`
- Create: `src/features/activity/components/ActivityItem.tsx`
- Create: `src/features/reports/pages/ReportsPage.tsx`
- Create: `src/features/reports/hooks/useReports.ts`
- Create: `src/features/notifications/pages/NotificationsPage.tsx`
- Create: `src/features/notifications/hooks/useNotifications.ts`
- Modify: `src/routes/index.tsx`
- Modify: `src/constants/navigation.ts`
- Modify: `src/lib/queryKeys.ts`

**Interfaces:**
- Consumes: item event output, workspace scope, permission keys
- Produces: dedicated audit/summary/reminder screens

- [ ] **Step 1: Add activity feed page wired to workspace item events.**

The activity page must show who did what, when, and on which object.

- [ ] **Step 2: Add report page wired to workspace summaries.**

The report page should summarize the accessible workspace state, not raw setup forms.

- [ ] **Step 3: Add notifications page wired to reminders and workflow follow-ups.**

It should surface:

```md
- expiry
- warranty
- maintenance
- overdue return
- reservation waiting
```

- [ ] **Step 4: Add query keys for activity, reports, and notifications.**

Use a stable shape such as:

```ts
['ws', wsId, 'activity']
['ws', wsId, 'reports']
['ws', wsId, 'notifications']
```

- [ ] **Step 5: Ensure search and item mutations invalidate the downstream audit surfaces.**

Any item/container/permission mutation that changes state should invalidate related activity/report/notification queries.

- [ ] **Step 6: Verify the new routes load and are permission-gated.**

Run:

```bash
npm run typecheck
```

Then verify these routes manually:

```md
/w/:wsId/activity
/w/:wsId/reports
/w/:wsId/notifications
```

---

### Task 7: Permission and access-scope enforcement across the shell and work surfaces

**Files:**
- Modify: `src/components/common/PermissionGuard.tsx`
- Modify: `src/routes/permission-route.tsx`
- Modify: `src/hooks/usePermission.ts`
- Modify: `src/stores/workspace.store.ts`
- Modify: `src/features/permissions/components/PermissionMatrix.tsx`
- Modify: `src/features/permissions/hooks/usePermissions.ts`
- Modify: `src/features/members/pages/MemberDetailPage.tsx`
- Modify: `src/features/items/pages/ItemsPage.tsx`
- Modify: `src/features/containers/pages/ContainersPage.tsx`
- Modify: `src/features/search/pages/SearchPage.tsx`
- Modify: `src/features/activity/pages/ActivityPage.tsx`
- Modify: `src/features/reports/pages/ReportsPage.tsx`
- Modify: `src/features/notifications/pages/NotificationsPage.tsx`

**Interfaces:**
- Consumes: permissions from workspace state and per-member override model
- Produces: consistent access checks and scope filtering across all visible surfaces

- [ ] **Step 1: Make the permission helper the single source of truth for `can()` checks.**

No page should invent its own permission logic when a shared helper exists.

- [ ] **Step 2: Ensure container access scope is used as a visibility filter, not just a UI hint.**

Apply scope filtering to:

```md
- search results
- item visibility
- container visibility
- activity visibility
- reports visibility
```

- [ ] **Step 3: Keep permission and access-scope edits isolated to the member permission screen.**

Permission changes should remain in the member detail / permission area, not scattered across operational pages.

- [ ] **Step 4: Ensure the current workspace store refreshes when permissions change.**

If the active user's permissions change, invalidate workspace-scoped data and refresh shell navigation visibility.

- [ ] **Step 5: Verify that hidden routes and hidden nav items match the same permission policy.**

Expected:
- no nav item that opens a forbidden route
- no route that renders with a hidden nav item but no guard

---

### Task 8: System verification and migration checklist

**Files:**
- Create: `docs/superpowers/plans/2026-07-14-system-flow-standard-migration-checklist.md` if needed for a cutover checklist
- Modify: `README.md`
- Modify: `docs/README.md`
- Modify: `docs/architecture/project-overview.md`
- Modify: `docs/ai/reading-order.md`

**Interfaces:**
- Consumes: completed code and documentation changes from Tasks 1-7
- Produces: migration checklist and repo index entries that tell the team how to use the new standard

- [ ] **Step 1: Update the repo index and reading order to point at the new standard.**

Make the new system-flow standard easy to find for future work.

- [ ] **Step 2: Create a migration checklist for the legacy-to-standard cutover.**

Include concrete checks for:

```md
- legacy Asset wording
- legacy Location/Site wording
- missing search route
- missing activity/reports/notifications routes
- pages mixing setup and transaction
```

- [ ] **Step 3: Run the full verification commands.**

Run:

```bash
npm run typecheck
npm run build
npm run smoke
```

Expected:
- typecheck passes
- build passes
- smoke covers the primary workspace flow and the new shell routes

- [ ] **Step 4: Commit the standardization pass.**

Use a commit message like:

```bash
git commit -m "feat: standardize system flow and vocabulary"
```

