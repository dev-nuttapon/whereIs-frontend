# Form Layout Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the borrow-order form easier to scan and use by applying a consistent field-group, spacing, and section hierarchy without changing its data flow.

**Architecture:** Keep the existing React state and API payload unchanged. Improve the shared `FormField` spacing contract and reorganize the create-borrow dialog into explicit sections: request details, add-line actions, and line-item cards. Use the existing Tailwind utility conventions and UI components.

**Tech Stack:** React 19, TypeScript, Ant Design wrappers, Tailwind CSS, Vite.

## Global Constraints

- Preserve the existing create-borrow state shape and `CreateBorrowOrderInput` payload.
- Keep translations and existing fallback copy; do not introduce a new i18n system.
- Do not add dependencies.
- Keep mobile layouts single-column and use two/three columns only at the existing responsive breakpoints.
- Verify with `npm run typecheck` and `npm run build`.

---

### Task 1: Standardize shared field-group spacing

**Files:**
- Modify: `src/components/forms/FormField.tsx`

**Interfaces:**
- Consumes: existing `FormFieldProps` and child controls.
- Produces: a consistent field group with stable label, control, helper, and error spacing.

- [ ] **Step 1: Update the field-group classes**

Use a consistent vertical rhythm, keep helper/error text attached to the control, and avoid changing the public props.

- [ ] **Step 2: Run the typecheck**

Run: `npm run typecheck`
Expected: PASS with no TypeScript errors.

### Task 2: Reorganize the create-borrow dialog layout

**Files:**
- Modify: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`

**Interfaces:**
- Consumes: existing `CreateBorrowDialog`, `BorrowLineDraft`, hooks, and UI components.
- Produces: visually separated request-details, line-actions, and line-item sections while preserving all handlers and payload behavior.

- [ ] **Step 1: Add section wrappers and headings**

Wrap purpose/date fields in a request-details section, add a heading/description for line items, and keep the add buttons in one dedicated action row.

- [ ] **Step 2: Improve line-item card hierarchy**

Keep line number and delete action in the card header, put the line type selector in a distinct control row, and give asset/stock fields their own content area. Use the existing responsive grid so stock fields stack on small screens and use three columns only from `sm` upward.

- [ ] **Step 3: Preserve behavior**

Do not alter `canSubmit`, state updates, reset behavior, mutation calls, or payload mapping. Keep all field IDs stable.

- [ ] **Step 4: Run verification**

Run: `npm run typecheck && npm run build`
Expected: PASS with a successful Vite production build.

### Task 3: Review the resulting layout against the standard

**Files:**
- Review: `src/components/forms/FormField.tsx`
- Review: `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`

- [ ] **Step 1: Inspect the diff**

Run: `git diff --check && git diff -- src/components/forms/FormField.tsx src/features/borrow-orders/pages/BorrowOrdersPage.tsx`
Expected: no whitespace errors; changes are limited to layout and presentation.

- [ ] **Step 2: Run the available unit suite**

Run: `npm run test:unit`
Expected: PASS; if an existing unrelated test fails, report its exact failure without changing unrelated logic.
