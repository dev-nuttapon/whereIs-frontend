# PROJECT_CONTEXT.md

# WhereIs Frontend Project Context

This repo is the frontend POC for the WhereIs workspace-based asset and stock tracking system.

## Project Information

**Project Name:** WhereIs

**Version:** 0.1.0

**Project Type:** Workspace-based Asset and Stock Management System

**Frontend Stack:**

* React
* Vite
* TypeScript
* React Router
* TanStack Query
* React Hook Form
* Zustand
* Axios
* Tailwind CSS
* shadcn/ui

---

# Project Vision

WhereIs is a workspace-based asset and stock management system designed to help users organize, track, borrow, return, restock, and consume items.

The system is designed for multiple scenarios:

* Office
* Home
* Warehouse
* Retail Store
* School
* Workshop
* Small Organization

The primary goal is to answer the following questions:

* Where is this item?
* Who currently has this item?
* Is it a single item or a stock item?
* What container path does it belong to?
* When is it due back, if ever?
* Why was it marked missing, disposed, or sold?
* How much stock remains, who used it, and when was it restocked?

The frontend should make these answers available quickly with a simple and intuitive user experience, while still making the demo/POC nature obvious to anyone opening the app.

---

# UI Philosophy

The UI should prioritize:

* Fast Search
* Simple Navigation
* Clear Container Display
* Minimal Clicks
* Responsive Layout
* Consistent Design
* Permission-based UI
* Mobile Friendly

The Search page is the most important page of the application.

---

# Core Features

* Authentication
* Workspace Management
* Dashboard
* Container Management
* Item Management
* Stock Management
* Item Search
* Item Detail
* Move Item
* Take Out
* Return
* Missing Item
* Member Management
* Permission Management
* Activity Log
* Settings

---

# Navigation Structure

Workspace

↓

Dashboard

├── Search

├── Containers

├── Items

├── Stock

├── Members

├── Activity

└── Settings

---

# Frontend Architecture

Feature-based Architecture

Each feature owns:

* Pages
* Components
* Hooks
* API
* Types
* Validation

Shared components belong in the common component library.

---

# Folder Structure

src/

api/

assets/

components/

features/

hooks/

layouts/

routes/

stores/

types/

utils/

---

# State Management

Server State

TanStack Query

Global UI State

Zustand

Form State

React Hook Form

Never duplicate server state inside Zustand.

---

# Routing

React Router

Public Routes

* Login
* Register

Protected Routes

* Dashboard
* Search
* Items
* Members
* Settings

All protected routes require authentication.

---

# API Rules

Use Axios through a centralized API Client.

Never call fetch() directly.

Every API call should go through:

api/

Examples:

* auth.api.ts
* workspace.api.ts
* container.api.ts
* item.api.ts
* member.api.ts
* permission.api.ts

---

# React Rules

Use:

* Functional Components
* Hooks
* TypeScript
* Composition over inheritance

Avoid:

* Class Components
* Inline business logic
* Direct API calls inside pages

Business logic belongs in hooks or services.

---

# Component Design

Pages

Responsible for layout.

Components

Reusable UI.

Hooks

Business logic.

API

Communication with Backend.

Stores

Global UI State only.

---

# UI Components

Common reusable components:

* AppLayout
* Sidebar
* Topbar
* SearchBar
* ItemCard
* StatusBadge
* Breadcrumb
* ConfirmDialog
* Loading
* EmptyState
* ErrorState
* PermissionGuard

---

# Search Philosophy

Search is the primary feature.

Users should be able to search by:

* Item Name
* Item Code
* Description
* Tag (future)
* Barcode (future)
* QR Code (future)

Search results should always display:

* Item Image
* Item Name
* Current Status
* Current Container Path
* Current Holder

---

# Permission UI

Frontend must respect permissions.

Buttons and menus should be hidden when the user lacks permission.

Permission affects:

* Navigation
* Buttons
* Forms
* Actions

Never rely only on frontend permission.

Backend authorization remains the source of truth.

---

# Forms

Use React Hook Form.

Validation should match backend validation whenever possible.

All forms should display user-friendly validation messages.

---

# Error Handling

Display friendly error messages.

Handle:

* Validation Errors
* Unauthorized
* Forbidden
* Not Found
* Server Errors
* Network Errors

Never expose raw backend exceptions.

---

# Loading Strategy

Every API request should provide:

* Loading State
* Error State
* Empty State

Avoid blank screens.

---

# Responsive Design

Desktop First

Support:

* Desktop
* Tablet
* Mobile

The UI should remain usable on all supported devices.

---

# Coding Standards

Use:

* TypeScript Strict Mode
* Functional Components
* Named Exports
* Custom Hooks
* Feature Folder Structure

Avoid:

* Large Components
* Duplicate Logic
* Hardcoded Strings
* Magic Numbers

---

# Performance

Prefer:

* React.memo when appropriate
* Lazy Loading
* Route Splitting
* Query Caching
* Optimistic Updates (when appropriate)

Avoid unnecessary re-renders.

---

# Definition of Done

A feature is complete only when it includes:

* Page
* Components
* API Client
* Types
* Validation
* Loading State
* Empty State
* Error State
* Permission Guard
* Responsive Design

---

# AI Working Rules

Before writing any code:

1. Read PROJECT_CONTEXT.md
2. Read CURRENT_TASK.md
3. Read all relevant files inside /docs
4. Understand the current feature before coding

Never:

* Change UI Architecture without approval
* Change Folder Structure without approval
* Change API Contract without approval
* Ignore Permission Rules

If a better UI design is found:

* Explain the reason
* Suggest improvements
* Wait for approval before implementing

---

# Development Workflow

Read PROJECT_CONTEXT

↓

Read CURRENT_TASK

↓

Read related documents

↓

Implement only the current feature

↓

Verify against Definition of Done

↓

Update CURRENT_TASK if necessary

---

# Goal

The goal of this repository is to build a clean, scalable, reusable, AI-friendly frontend that provides an excellent user experience and integrates seamlessly with the WhereIs backend.
