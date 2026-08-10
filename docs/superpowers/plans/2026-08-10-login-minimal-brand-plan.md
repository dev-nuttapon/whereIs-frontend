# WhereIs Minimal Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ปรับหน้า `/login` ให้เป็น minimal, เป็นมิตร และเข้าถึงง่าย โดยเพิ่ม visual identity แบบหมุดตำแหน่งเส้นเดียวและจัดลำดับ action ใหม่

**Architecture:** คง auth flow เดิมทั้งหมดไว้ ปรับการนำเสนอที่ `AuthLayout` และการจัดกลุ่ม action ใน `LoginPage` ใช้ Ant Design และ utility classes ที่มีอยู่แล้ว ไม่เพิ่ม dependency หรือสร้าง design system ใหม่

**Tech Stack:** React 19, TypeScript, React Router, Ant Design 6, Tailwind CSS 4, Vite

## Global Constraints

- ใช้โลโก้หมุดตำแหน่งแบบเรียบง่าย ไม่มีภาพประกอบใหญ่หรือรายละเอียดซับซ้อน
- ใช้ฟ้าอมเขียวเป็นสีหลัก และพื้นหลังขาวหรือฟ้าอมเทาอ่อน
- “เข้าสู่ระบบ” เป็น action หลักเพียงปุ่มเดียว
- “สมัครสมาชิก” และ “ลืมรหัสผ่าน” เป็น action รอง
- คง authentication behavior และ route เดิม
- รองรับ keyboard focus, autocomplete และ validation ที่อ่านเข้าใจง่าย

---

### Task 1: Add minimal login brand header

**Files:**
- Modify: `src/layouts/AuthLayout.tsx`
- Modify: `src/styles/globals.css` only if an existing token/class cannot express the selected color

**Interfaces:**
- Consumes: existing `AuthLayoutProps`, `useI18n`, and app translation keys
- Produces: reusable branded header visible on auth pages without changing child form behavior

- [ ] **Step 1: Inspect existing auth translations and styling tokens**

Run: `grep -nE "app\.name|app\.subtitle|auth\.login" src/lib/i18n.ts src/styles/globals.css`

Expected: identify existing copy and color utility conventions before adding text or styles.

- [ ] **Step 2: Implement the minimal brand mark and welcome copy**

Add a small inline SVG mark shaped as a single-stroke location pin, with an accessible label, above the existing title. Keep the existing `app.name` title and replace the generic auth subtitle only if the current translation does not match the approved Thai copy.

- [ ] **Step 3: Apply friendly minimal visual treatment**

Use the existing background/card styles with a restrained teal accent, rounded card, readable spacing, and no large illustration or gradient.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: PASS with no TypeScript errors.

### Task 2: Clarify login actions and accessibility

**Files:**
- Modify: `src/features/auth/pages/LoginPage.tsx`
- Modify: `src/lib/i18n.ts` only for missing login copy

**Interfaces:**
- Consumes: existing `onFinish`, `ROUTES.register`, and current validation behavior
- Produces: login form with one primary action, secondary registration link, and password recovery affordance

- [ ] **Step 1: Preserve current submit and validation behavior**

Do not change `login`, token updates, current-user loading, redirects, or existing validation rules.

- [ ] **Step 2: Add the forgot-password affordance**

Place a secondary text link near the password field. If no recovery route exists, render it as a non-navigating “ลืมรหัสผ่าน?” affordance only when the app has an existing handler; otherwise do not invent a broken route and document the gap in the final report.

- [ ] **Step 3: Make registration clearly secondary**

Replace the second default button with inline copy in the form footer: `ยังไม่มีบัญชี? สมัครสมาชิก`, while keeping the existing register route.

- [ ] **Step 4: Verify form semantics**

Ensure email/password autocomplete remains present, the password visibility control has an accessible label through Ant Design props, and the submit button remains keyboard reachable with loading state.

- [ ] **Step 5: Run typecheck and production build**

Run: `npm run typecheck && npm run build`

Expected: both commands PASS.

### Task 3: Visual verification

**Files:**
- No source changes unless verification identifies a concrete defect

**Interfaces:**
- Consumes: the completed auth layout and login form
- Produces: verified desktop and narrow viewport behavior

- [ ] **Step 1: Start the Vite dev server**

Run: `npm run dev -- --host 127.0.0.1`

- [ ] **Step 2: Inspect `/login` at desktop and mobile widths**

Verify that the brand mark, title, form, recovery link, primary action, and registration link are visible and ordered correctly; verify the mobile layout does not clip the form.

- [ ] **Step 3: Check interaction states**

Verify focus visibility, password show/hide behavior, validation messages, error alert, and loading state without changing backend behavior.

- [ ] **Step 4: Report verification evidence**

Record the commands run and any limitation, especially if password recovery is not implemented by the existing application.
