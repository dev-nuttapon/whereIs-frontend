# Tech Stack — WhereIs Frontend

เอกสารสรุปเทคโนโลยีหลักที่ใช้ใน Frontend ของโปรเจกต์ WhereIs และเหตุผลในการเลือกใช้

## ภาพรวม

| หมวด | เทคโนโลยี | หน้าที่ |
|------|-----------|---------|
| UI Library | **React 18** | สร้าง component-based UI |
| Build Tool | **Vite** | dev server + bundler ที่เร็ว (ESBuild/Rollup) |
| Language | **TypeScript** | type safety ทั้งโปรเจกต์ |
| Routing | **React Router** | client-side routing |
| Server State | **TanStack Query (React Query)** | fetch / cache / sync ข้อมูลจาก API |
| Forms | **React Hook Form** | จัดการฟอร์ม + validation |
| Client State | **Zustand** | global state ฝั่ง client (เบา) |
| HTTP Client | **Axios** | เรียก REST API + interceptors |
| Styling | **Tailwind CSS** | utility-first styling + design tokens |
| UI Kit | **shadcn/ui** | component พื้นฐาน (copy-in, แก้ได้) บน Radix + Tailwind |

## รายละเอียดแต่ละตัว

### React + Vite + TypeScript
- ใช้ React 18 (รองรับ concurrent features, `StrictMode`)
- Vite เป็น build tool หลัก — dev server เร็ว, HMR ทันที, build ด้วย Rollup
- TypeScript เปิด `strict: true` — ห้าม `any` โดยไม่จำเป็น (ดู [coding-style.md](coding-style.md))

### React Router
- ใช้สำหรับ navigation ทั้งหมด
- รวม route guard สำหรับ permission/auth (ดู [permission-ui.md](../security/permission-ui.md))
- โครงสร้าง route mapping อยู่ใน [screen-flow.md](../ui/screen-flow.md)

### TanStack Query
- รับผิดชอบ **server state** ทั้งหมด (ข้อมูลที่มาจาก backend)
- จัดการ caching, background refetch, retry, loading/error state
- **ห้าม** เก็บ server data ซ้ำใน Zustand — ดูกติกาใน [state-management.md](../state/state-management.md)

### React Hook Form
- จัดการ form state แบบ uncontrolled เพื่อ performance
- ใช้ร่วมกับ schema validation (เช่น Zod) สำหรับ validate
- กติกาเขียนฟอร์มอยู่ใน [component-rules.md](../ui/component-rules.md)

### Zustand
- เก็บ **client/UI state** ที่ไม่ได้มาจาก server เช่น auth token, theme, sidebar, filter ชั่วคราว
- store แยกตาม domain ไม่รวมเป็นก้อนเดียว

### Axios
- ตั้งค่า base instance เดียวที่ `src/api/client.ts` (`baseURL`, timeout)
- ใส่ interceptor สำหรับแนบ token + workspace และจัดการ error กลาง (401 → logout)
- ฟังก์ชันเรียก endpoint แยกเป็น `src/api/*.api.ts` ต่อ domain
- สัญญา API ทั้งหมดอยู่ใน [api-contract.md](../api/api-contract.md)

### Tailwind CSS
- ใช้ utility classes เป็นหลัก ไม่เขียน CSS ไฟล์แยกต่อ component
- สี/spacing/typography ทั้งหมดมาจาก **design token** ใน `tailwind.config` (ดู [theme.md](../ui/theme.md))
- ห้าม hardcode ค่าสี/ขนาดเป็น arbitrary value พร่ำเพรื่อ — ใช้ token ที่กำหนดไว้

### shadcn/ui
- เป็น component ที่ **copy เข้ามาในโปรเจกต์** (`src/components/ui/`) ไม่ใช่ dependency ที่ import จาก node_modules → แก้ไข/ปรับ style ได้เต็มที่
- สร้างบน Radix UI (accessible) + Tailwind
- ใช้เป็นฐานของ Button, Input, Dialog, Select, Dropdown, Toast ฯลฯ แล้วห่อเป็น component กลางของเราเมื่อจำเป็น (ดู [component-rules.md](../ui/component-rules.md))
- กติกา theme/variants ดู [theme.md](../ui/theme.md)

## เวอร์ชัน

> เติมเวอร์ชันจริงเมื่อ lock dependency แล้ว (ดู `package.json`)

| Package | เวอร์ชัน |
|---------|----------|
| react | 18.x |
| vite | (TBD) |
| typescript | (TBD) |
| react-router-dom | (TBD) |
| @tanstack/react-query | (TBD) |
| react-hook-form | (TBD) |
| zustand | (TBD) |
| axios | (TBD) |
| tailwindcss | (TBD) |
| shadcn/ui | (copy-in, ไม่มี version pin) |
| @hookform/resolvers + zod | (TBD) |

## เอกสารที่เกี่ยวข้อง
- [folder-structure.md](folder-structure.md) — โครงสร้างโฟลเดอร์
- [state-management.md](../state/state-management.md) — แบ่งงาน server vs client state
- [coding-style.md](coding-style.md) — มาตรฐานการเขียนโค้ด
