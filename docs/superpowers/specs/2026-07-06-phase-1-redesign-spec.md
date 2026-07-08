# Phase 1 Redesign Spec

> **Scope:** historical redesign reference; the confirmed product requirements now include individual items, quantity items, reports, notifications, and additional workflows.

**Goal:** design the first usable version of WhereIs for managing workspace-scoped items, container trees, member permissions, item history, and search.

**Architecture:** workspace is the isolation boundary, containers form a user-defined tree, and navigation is workspace-scoped. The current documentation expands beyond the original single-item-only Phase 1 assumptions.

**Tech Stack:** React, TypeScript, React Router, TanStack Query, Zustand, React Hook Form, Tailwind CSS, shadcn/ui

---

## 1. Design Intent

The original Phase 1 sketch is kept here for reference. It should allow a workspace owner or admin to:
- organize storage using arbitrary nested containers
- add and manage single physical items
- borrow, return, move, mark missing, mark found, or dispose items
- search items quickly
- manage members and permissions inside a workspace
- inspect activity history

Stock management is intentionally excluded from this phase.

## 2. Scope Boundaries

### In Scope
- workspace selection and switching
- workspace dashboard
- container tree and container detail
- individual item create, edit, detail, and item actions
- item search by keyword, status, and container
- workspace member list and invite flow
- role management and permission override
- activity feed

### Out of Scope
- quantity item tracking
- consume/restock flows
- low stock alerts
- QR or barcode support
- reports beyond per-item history

## 3. Product Rules

- Workspace is the top-level boundary for all data.
- Container structure is freeform and user-defined.
- Phase 1 should optimize for answering: "where is it?", "who has it?", and "what happened?"
- All item actions must preserve history.
- All action availability must respect permissions.
- Search state should be shareable through URL query parameters.

## 4. Information Architecture

### Global Layout
- Auth pages use a centered login/register shell.
- Workspace selection uses a minimal workspace list shell.
- Workspace pages use AppLayout with:
  - Topbar
  - Sidebar
  - content area

### Workspace Navigation
- Dashboard
- Search
- Storage Structure
- Members
- Activity
- Settings

## 5. Phase 1 Screen Flow

1. User logs in or resumes session.
2. User chooses a workspace.
3. User lands on dashboard.
4. User opens search or storage structure.
5. User opens container detail to inspect nested containers and items.
6. User opens item detail to inspect history and act on the item.
7. User opens member management or permission override when needed.
8. User returns to the originating screen after mutation and sees refreshed data.

## 6. Screen Specifications

### 6.1 Workspace List

**Purpose**
- let the user choose the active workspace
- show role at a glance

**Primary content**
- workspace cards or list rows
- create workspace CTA
- last-used workspace highlight

**Primary actions**
- open workspace
- create workspace
- switch workspace

**States**
- loading: skeleton cards
- empty: prompt to create first workspace
- error: retry with friendly message

### 6.2 Dashboard

**Purpose**
- provide a fast summary of the active workspace

**Primary content**
- counts for total / stored / taken out / missing
- recent activity
- shortcut actions to search, storage structure, and members

**Primary actions**
- search item
- open storage structure
- open members

**States**
- loading: section-level skeletons
- empty: zero counts with a prompt to start adding items
- error: section-level retry

### 6.3 Storage Structure

**Purpose**
- let the user understand and edit the container tree

**Primary content**
- arbitrary container tree
- create child container
- visibility status

**Primary actions**
- add container
- edit container
- move container
- open container detail

**States**
- loading: tree skeleton
- empty: first-container prompt
- error: tree-level retry

### 6.4 Container Detail

**Purpose**
- show what exists inside one container node

**Primary content**
- container header
- child containers
- item list

**Primary actions**
- add child container
- add single item
- move item out
- open item detail

**States**
- loading: header + list skeletons
- empty: empty child section and empty item section separately
- error: section-level retry

### 6.5 Item Search

**Purpose**
- find an item fast with a shareable URL

**Primary content**
- keyword input
- status filter
- container filter
- result list

**Primary actions**
- refine filters
- open item detail

**States**
- loading: skeleton cards
- empty: no results or no items yet
- error: retry

### 6.6 Item Detail

**Purpose**
- present the current state and history of a single item

**Primary content**
- item header
- item type
- current status
- current container path
- current holder if borrowed
- reason for last state change
- event history

**Primary actions**
- edit item
- move item
- borrow item
- return item
- mark missing
- mark found
- dispose item

**State rules**
- `sold` is treated as a disposal reason in Phase 1
- all terminal or state-changing actions must write history

### 6.7 Members

**Purpose**
- manage who belongs to the workspace

**Primary content**
- member table
- role badge
- invite CTA

**Primary actions**
- invite member
- change role
- remove member
- open permission override

**States**
- loading: table skeleton
- empty: self-only workspace state
- error: retry

### 6.8 Permission Override

**Purpose**
- change permissions beyond the default role

**Primary content**
- grouped permission toggles
- effective permission summary

**Primary actions**
- toggle permission
- save override
- reset to role default

**States**
- loading: matrix skeleton
- empty: no overrides, role default only
- error: retry

### 6.9 Activity Feed

**Purpose**
- show what happened in the workspace and when

**Primary content**
- event feed
- actor
- action
- target item
- timestamp

**Primary actions**
- open item detail from feed

**States**
- loading: feed skeleton
- empty: no activity yet
- error: retry

## 7. Phase 1 Core Flows

### 7.1 Add Single Item
1. Open container detail or item search.
2. Choose add item.
3. Fill in item name and container.
4. Save.
5. Return to item detail or originating list.

### 7.2 Borrow and Return
1. Open item detail.
2. Choose take out.
3. Set holder and optional due date.
4. Save and show updated status.
5. Return item later and record note if needed.

### 7.3 Missing / Found / Dispose
1. Open item detail.
2. Choose missing, found, or dispose.
3. Enter a reason when required.
4. Save and refresh item history.

### 7.4 Container Management
1. Open storage structure.
2. Add child container or edit an existing one.
3. Save.
4. Refresh tree and detail views.

### 7.5 Member Management
1. Open members.
2. Invite a member or change a role.
3. Save.
4. Refresh the member list and permissions.

## 8. Permission Rules

### Workspace
- view workspace: member of workspace
- update/delete workspace: owner or explicit permission

### Container
- view: `container.view`
- create: `container.create`
- update: `container.update`
- delete: `container.delete`
- visibility control: `container.visibility.manage`

### Item
- view: `item.view`
- create: `item.create`
- update: `item.update`
- delete: `item.delete`
- move: `item.move`
- borrow: `item.borrow`
- return: `item.return`
- mark missing: `item.mark_missing`
- mark found: `item.mark_found`
- dispose: `item.dispose`

### Member and Permission
- invite: `member.invite`
- update role: `member.update_role`
- remove member: `member.remove`
- override permission: `permission.override`

## 9. Design Decisions Locked for Phase 1

- Site and location are not part of the product model.
- Single item is the only item workflow in Phase 1.
- Stock is a later phase.
- `sold` is treated as a disposal reason, not a separate product family.
- Container hierarchy depth is user-defined.
- Every item mutation must preserve history.
- URL query parameters are the source of truth for search filters.

## 10. What This Spec Enables Next

This spec should be used to produce:
- wireframes for each Phase 1 screen
- navigation map and breadcrumb rules
- form and dialog design
- empty/loading/error state design
- component inventory for implementation planning
