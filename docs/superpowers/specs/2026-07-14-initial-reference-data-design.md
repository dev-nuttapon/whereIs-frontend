# Initial Reference Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish initial reference data for the product by making backend seed data idempotent and exposing the existing admin screens needed to view and edit lookup tables, system roles, role-permission mappings, and workspace settings.

**Architecture:** Keep seed/reference data separate from demo content. Backend owns the canonical seeded catalog for permissions, system roles, role-permission defaults, and lookup tables. Frontend reuses the existing master data, permission, and settings pages as the editing surface, with workspace-scoped state coming from the current workspace and lookup data loaded from `/api/v1/lookups`.

**Tech Stack:** ASP.NET Core Web API, EF Core MySQL, MediatR, React, Vite, TanStack Query, Zustand, Zod

## Global Constraints

- Reference/master data is setup-only.
- Do not create demo workspace, demo containers, or demo items.
- System roles (`Owner`, `Admin`, `Member`, `Viewer`) are seeded, immutable, and global.
- Permission catalog is global and seeded.
- Lookup tables (`SiteType`, `LocationType`, `ContainerType`, `UnitType`) are seeded and idempotent.
- `WorkspaceId` isolation and permission checks must remain unchanged.
- UI should reuse existing screens and patterns instead of introducing a new setup wizard.

---

### Task 1: Audit backend seed source of truth

**Files:**
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/SeedData/PermissionSeed.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/SeedData/RoleSeed.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/SeedData/RolePermissionSeed.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/PermissionConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/RoleConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/RolePermissionConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/SiteTypeConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/LocationTypeConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/ContainerTypeConfiguration.cs`
- Read: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Persistence/Configurations/UnitTypeConfiguration.cs`

**Interfaces:**
- Consumes: current seed arrays and EF `HasData` wiring
- Produces: confirmed list of seed tables and any missing idempotency gaps

- [ ] **Step 1: Verify the full seed set**

Confirm these are already seeded and documented:

```text
Permission
Role
RolePermission
SiteType
LocationType
ContainerType
UnitType
```

- [ ] **Step 2: Check for any missing canonical codes**

Compare the permission catalog in backend docs against the actual seed arrays and list any drift before coding.

- [ ] **Step 3: Record whether startup seeding is needed**

Decide whether migrations alone are enough or whether an idempotent startup seeder must be added for dev/test parity.

### Task 2: Expose reference data through existing API contracts

**Files:**
- Modify: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Api/Controllers/LookupsController.cs`
- Read/modify as needed: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Api/Controllers/RolesController.cs`
- Read/modify as needed: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Api/Controllers/SettingsController.cs`
- Read/modify as needed: `/Users/nuttapon/Github-dev/whereIs-backend/src/WhereIs.Api/Controllers/WorkspacesController.cs`

**Interfaces:**
- Consumes: seeded lookups and role catalog
- Produces: stable API responses used by frontend master data/settings screens

- [ ] **Step 1: Keep `/api/v1/lookups` as the single lookup endpoint**

Return all lookup tables in one response:

```jsonc
{
  "siteTypes": [],
  "locationTypes": [],
  "containerTypes": [],
  "unitTypes": []
}
```

- [ ] **Step 2: Keep role catalog and permission catalog readable**

Expose the role list and permission catalog needed by the UI without inventing a new setup endpoint.

- [ ] **Step 3: Keep workspace settings API as the place for editable setup defaults**

Do not add demo provisioning endpoints; keep only actual editable settings such as timezone and default unit.

### Task 3: Align frontend master data and settings pages

**Files:**
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/features/master-data/pages/MasterDataPage.tsx`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/features/settings/pages/SettingsPage.tsx`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/features/permissions/components/PermissionMatrix.tsx`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/features/roles/*`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/api/lookups.api.ts`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/api/roles.api.ts`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/api/settings.api.ts`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/src/lib/i18n.ts`

**Interfaces:**
- Consumes: `/api/v1/lookups`, workspace settings, roles API
- Produces: screens that let the user view and edit reference/master data

- [ ] **Step 1: Reuse existing master data page sections**

Keep the page focused on actual editable reference data: sites, locations, containers, categories, products, assets, and stock-related setup, not demo data.

- [ ] **Step 2: Keep settings as the workspace setup hub**

Make sure workspace defaults, theme, and profile sections remain available and clearly separate from reference data.

- [ ] **Step 3: Keep permission UI consistent**

Show seeded roles and the canonical permission catalog so admin/owner can inspect role matrices without adding new concepts.

### Task 4: Keep docs and labels aligned with “setup-only”

**Files:**
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/docs/architecture/requirement-summary.md`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/docs/modules/settings.md`
- Modify: `/Users/nuttapon/Github-dev/whereIs-frontend/docs/modules/permission.md`
- Modify: `/Users/nuttapon/Github-dev/whereIs-backend/docs/database/migrations.md`
- Modify: `/Users/nuttapon/Github-dev/whereIs-backend/docs/modules/permission.md`

**Interfaces:**
- Consumes: confirmed seed scope
- Produces: docs that explain no demo workspace/content is created

- [ ] **Step 1: Remove ambiguity about initial setup**

State explicitly that initial data = lookup tables + roles + permissions + role matrices only.

- [ ] **Step 2: Keep the UI wording away from demo/onboarding**

Use “setup”, “reference data”, or “master data”, not “starter workspace”.

- [ ] **Step 3: Validate the module docs still match the APIs**

Make sure the user-facing docs point to the same routes and permissions the app actually uses.

## Self-Review Checklist

- Seed scope only covers reference/master data.
- No demo workspace/container/item appears in any task.
- API tasks map to existing controllers/endpoints.
- Frontend tasks map to existing screens/hooks.
- Documentation tasks explain the setup-only rule clearly.

