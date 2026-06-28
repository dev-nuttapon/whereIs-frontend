# ADR: Tech Stack Selection

> Status: **Accepted**
> อ้างอิง: [../architecture/tech-stack.md](../architecture/tech-stack.md) (รายละเอียดการใช้งานแต่ละ library)

## Problem

ต้องเลือก tech stack สำหรับ WhereIs Frontend ซึ่งเป็น Single-Page Application (SPA) ที่มี:
- หลาย route + permission guard
- ข้อมูล server-side หนัก (item list, search, activity)
- ฟอร์มหลายหน้า + dialog
- Global state เล็กน้อย (auth, workspace ปัจจุบัน, theme)
- ต้องรองรับภาษาไทย + UI kit ที่ปรับแต่งได้

## Decision

เลือก stack ดังนี้:

| หมวด | เทคโนโลยี |
|------|-----------|
| Framework | React 18 + Vite + TypeScript (strict) |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Client State | Zustand |
| HTTP | Axios |
| Styling | Tailwind CSS |
| UI Kit | shadcn/ui (copy-in) |

## Alternatives Considered

### Build tool: Vite vs Next.js
- **Next.js**: SSR/SSG พร้อม, routing ในตัว, ecosystem ใหญ่
- **Vite + React Router** (เลือก): SPA เท่านั้น, dev server เร็วกว่ามาก (ESBuild), bundle เล็ก, ไม่มี SSR overhead ที่ไม่จำเป็นสำหรับ internal tool ที่ต้องการ auth ก่อนเห็นข้อมูล

### Server State: TanStack Query vs SWR vs Redux Toolkit Query
- **SWR**: API คล้ายกัน, bundle เล็กกว่า แต่ ecosystem น้อยกว่า, mutation API อ่อนกว่า
- **RTK Query**: tight coupling กับ Redux; เหมาะถ้าใช้ Redux อยู่แล้ว
- **TanStack Query** (เลือก): mutation + invalidation ชัดเจน, devtools ดีที่สุด, `keepPreviousData` / `optimistic update` พร้อมใช้

### Client State: Zustand vs Redux vs Jotai
- **Redux Toolkit**: boilerplate มากแม้จะลดลงแล้ว; overkill สำหรับ state ขนาดเล็ก
- **Jotai**: atom-based, ดีสำหรับ derived state; learning curve สูงกว่าสำหรับทีมใหม่
- **Zustand** (เลือก): API เรียบง่าย, ไม่มี Provider wrapper, แยก store ต่อ domain ได้, bundle ~1KB

### Forms: React Hook Form vs Formik vs native
- **Formik**: controlled components → re-render ทุก keystroke; API verbose
- **native `useState`**: ดีกับฟอร์ม 1–2 field แต่ validation และ error management ยาก
- **React Hook Form** (เลือก): uncontrolled → performance ดี, `resolver` เชื่อม Zod ได้ตรง, API กระชับ

### UI Kit: shadcn/ui vs MUI vs Chakra UI vs Radix Primitives
- **MUI**: theme system หนัก, override style ยาก, bundle ใหญ่
- **Chakra UI**: style props ดี แต่ runtime overhead; Thai font support ต้องปรับเพิ่ม
- **Radix Primitives (raw)**: accessible แต่ต้องเขียน style ทั้งหมดเอง
- **shadcn/ui** (เลือก): copy component เข้า project → แก้ style เต็มที่, built on Radix (accessible), Tailwind-first → ตรงกับ design token ที่เลือก

## Reason

1. **Vite + React Router**: WhereIs เป็น auth-gated internal tool — ไม่ต้องการ SSR; Vite DX เร็วกว่า Next.js ชัดเจนในโปรเจกต์ SPA
2. **TanStack Query**: ข้อมูลใน WhereIs เปลี่ยนบ่อย (item status, member role) ต้องการ invalidation ที่ละเอียด; mutation API ของ TanStack Query ตรงกับ pattern REST มากที่สุด
3. **Zustand**: state ที่ต้องเป็น global มีน้อย (authStore, workspaceStore, uiStore) — ไม่คุ้มกับ Redux
4. **React Hook Form + Zod**: ฟอร์มใน WhereIs มี validation ซับซ้อน (cross-field, server error map); Zod schema เป็น single source of truth ทั้ง frontend validation และ type inference
5. **shadcn/ui**: โปรเจกต์ต้องการ Thai font + ปรับ brand color — copy-in model ทำให้ override ไม่ต้องต่อสู้กับ CSS specificity

## Consequences

**บวก:**
- DX ดี: Vite HMR เร็ว, TypeScript strict ช่วย catch bug ก่อน runtime
- Bundle เล็ก: ไม่มี library ขนาดใหญ่ที่ไม่ใช้
- Separation of concern ชัด: server state (Query) / client state (Zustand) / form state (RHF) แยกกัน
- shadcn/ui component แก้ได้เต็มที่ — ไม่มี lock-in

**ลบ:**
- ต้องตั้ง routing + code splitting เอง (Next.js ทำให้อัตโนมัติ)
- shadcn copy-in: อัปเดต component ต้องทำมือ (ไม่มี `npm update`)
- ทีมต้องเข้าใจ "server state vs client state" ก่อนเขียน — เส้นแบ่งนี้เป็น rule ที่ enforce ผ่าน docs ไม่ใช่ tooling
