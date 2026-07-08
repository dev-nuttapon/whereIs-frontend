# WhereIs Requirement Summary

> Compact reference for the current confirmed product direction.

## Goal
Build a workspace-based system for tracking items, stock, and item lifecycle workflows in a way that is permission-aware, container-scoped, and easy to navigate with progressive disclosure.

## Core Model
- Workspace is the isolation boundary for data, members, permissions, notifications, and reports.
- Container is a freeform tree with unlimited depth. The system does not impose a fixed level structure.
- Item has two user-facing tracking modes:
  - Individual Item: one physical item, tracked per item.
  - Quantity Item: item tracked by quantity, unit, batch/lot, and dates.
- Permission is composed of:
  - Primary Role
  - Extra Permissions
  - Container Access Scope

## Confirmed Product Principles
- Workspace-first: every screen and action is scoped to the active workspace.
- Progressive disclosure: show the minimum useful information first, then reveal details and workflows on demand.
- Search-first: users must be able to answer "where is it?", "who has it?", and "what is happening?" quickly.
- History-first: actions, changes, and adjustments must be visible as activity/history.
- Access-aware: navigation, search, dashboard, reports, and item visibility must respect permission and container access scope.

## Confirmed Scope

### Workspace
- create workspace
- switch workspace
- invite members
- manage invitations
- leave workspace if allowed
- manage workspace settings

### Members and Permissions
- list members
- change primary role
- grant and revoke extra permissions
- configure container access scope
- remove members if allowed

### Containers
- create nested containers at unlimited depth
- move containers
- control container visibility/access
- inspect container contents

### Items
- create and edit individual items and quantity items
- item-specific unit conversion
- batch / lot, received date, expiry date, warranty, maintenance, and custom schedule metadata
- borrow, return, withdraw, reserve, mark missing, repair, dispose
- stock count, variance, and adjustment
- keep item history and activity trail

### Search
- keyword search
- permission-filtered results
- container-access-filtered results
- filters for current location, current holder, quantity, expiry, warranty, maintenance, overdue return, reservation waiting, missing, repair, and disposal

### Dashboard, Activity, Reports, Notifications
- dashboard overview cards and shortcuts
- recent activity / history
- notifications for important dates and reminders
- reports for workspace and item summaries

## Screen Groups to Design
- Workspace list and workspace switcher
- Dashboard
- Member management and invitation flow
- Permission management and container access scope UI
- Container tree and container detail
- Item list, item detail, and action dialogs
- Search page
- Activity page
- Reports page
- Notifications page
- Settings

## Shared Screen Rules
- All screens are scoped to the active workspace.
- All item screens must show container path and relevant metadata when available.
- All action screens must clearly show permission and access scope context.
- All history screens must show who did what, when, and why.
- All destructive actions must use confirmation.

## Open Questions
- What is the final backend action naming for borrow, withdraw, reserve, repair, and adjustment workflows?
- What is the exact data shape of Container Access Scope?
- Which report types are in the first frontend mockup set?
- Which notification delivery surfaces are in scope for the first implementation?

## Design Rules
- Never reintroduce `site` or `location` as core concepts.
- All scope is workspace-scoped.
- Container structure is user-defined and not fixed by the system.
- Search and UI state should be shareable through URL when practical.
- Server state stays in TanStack Query; UI state stays in Zustand or local state.
- Prefer flow clarity over feature completeness when designing the first usable mockup set.
