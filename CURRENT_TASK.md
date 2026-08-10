# CURRENT_TASK.md

# Current Development Task

This document represents the current development state of the frontend.

Before implementing any code:

1. Read PROJECT_CONTEXT.md
2. Read all related documents under /docs
3. Read this file
4. Implement ONLY the current task
5. Do not implement unrelated features

---

# Current Project Status

Project

WhereIs Frontend

Version

0.1.0

Environment

Development

Current Branch

main

---

# Current Sprint

Frontend contract alignment and flow completion

Sprint Goal

Keep the frontend screens and API adapters aligned with the Product/Asset/Stock/BorrowOrder backend contract.

---

# Current Milestone

MVP Definition

---

# Current Feature

Product / Asset / Stock / BorrowOrder flow

---

# Current Task

Verify and maintain frontend alignment with the backend contract while completing the UI flows.

---

# Current Objectives

The current objectives are:

* Keep Product, Asset, Stock and BorrowOrder as the primary vocabulary
* Keep workspace role and permission behavior consistent
* Keep expiry, lot, notification and activity contracts synchronized
* Validate frontend with typecheck, build and browser/integration checks where available

---

# Feature Progress

Authentication — Implemented

---

Workspace — Implemented

---

Dashboard — Implemented

---

Container — Implemented

---

Product / Asset — Implemented

---

Stock / Lot — Implemented in frontend; backend migration must be applied for runtime verification

---

Search — Implemented

---

Member / Invitation — Implemented

---

Permission — Implemented with route guards and UI guards

---

Activity / History — Implemented against the new activity response shape

---

Settings / Alerts — Implemented; persistence is currently local browser state

---

# Current Deliverables

This task is complete only if:

* Product/Asset/Stock/BorrowOrder screens and API adapters use the same contract
* Permission-aware workspace flows remain consistent
* Expiry, lot, notification and activity fields remain aligned
* `npm run typecheck` and `npm run build` pass
* Runtime verification limitations are recorded honestly

---

# Out of Scope

Backend database migration execution, backend code changes, and production deployment remain outside this frontend repository task.

Legacy Item compatibility components may remain in the repository, but new UI work must use Product, Asset, Stock and BorrowOrder.

---

# Known Decisions

Frontend Framework

React

Build Tool

Vite

Language

TypeScript

Routing

React Router

Server State

TanStack Query

Global UI State

Zustand

Forms

React Hook Form

HTTP Client

Axios

Styling

Tailwind CSS

UI Components

shadcn/ui

---

# Current Risks

No known risks.

---

# Blocking Issues

None

---

# Completion Checklist

Project

⬜ Created

Folder Structure

⬜ Created

Routing

⬜ Configured

Public Routes

⬜ Configured

Protected Routes

⬜ Configured

AppLayout

⬜ Created

AuthLayout

⬜ Created

API Client

⬜ Created

TanStack Query

⬜ Configured

Zustand

⬜ Configured

React Hook Form

⬜ Configured

Tailwind CSS

⬜ Configured

shadcn/ui

⬜ Configured

Environment Variables

⬜ Configured

Common Components

⬜ Created

Build

⬜ Success

---

# Next Task

After this task is completed:

Sprint 1

Authentication Feature

Tasks:

* Login Page
* Register Page
* Auth API Client
* Auth Store
* Token Storage
* Protected Route
* Current User
* Logout
* Basic Validation

---

# AI Instructions

Before generating code:

* Follow PROJECT_CONTEXT.md
* Follow all documents under /docs
* Stay inside the current scope
* Do not modify architecture
* Do not modify API contract
* Do not create additional features
* If something is unclear, ask before implementing

Only implement the current task.
