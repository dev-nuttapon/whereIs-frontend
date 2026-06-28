# Component Rules — WhereIs Frontend

กติกาการเขียนและจัดระเบียบ React component ให้สอดคล้องกันทั้งทีม

## ประเภทของ Component (4 ชั้น)
1. **UI primitives** (`src/components/ui/`) — shadcn/ui ที่ copy เข้ามา (Button, Input, Dialog, Select…) แก้ style ได้ ไม่มี business logic
2. **Common components** (`src/components/common/`, `forms/`, `feedback/`) — component กลางของเรา ที่ห่อ primitives + เพิ่ม convention (ItemCard, StatusBadge, EmptyState…)
3. **Layout components** (`src/layouts/`, `src/components/layout/`) — โครงหน้า (AppLayout, Sidebar, Topbar) ดู [layout.md](layout.md)
4. **Feature components** (`src/features/<x>/components/`) — ผูกกับ domain เฉพาะ
5. **Pages/Screens** (`src/features/<x>/pages/`) — ประกอบ component + เรียก hook, บางที่สุด

> ลำดับการ reuse: ใช้ของที่มีอยู่ก่อน (common → ui primitive) สร้างใหม่เมื่อจำเป็นเท่านั้น

## Component กลางที่ต้องมี
| Component | หน้าที่ |
|-----------|---------|
| `AppLayout` | layout หลักหลัง login |
| `Sidebar` | เมนูหลัก (ซ่อน/แสดงตาม permission) |
| `Topbar` | workspace ปัจจุบัน + user menu |
| `SearchBar` | ค้นหา item (ฟีเจอร์เด่น) |
| `ItemCard` | รูป + ชื่อ + สถานะ + ตำแหน่ง |
| `StatusBadge` | Stored / TakenOut / Missing / Disposed |
| `LocationBreadcrumb` | `Site > Location > Container` |
| `ConfirmDialog` | ยืนยันก่อน delete / dispose |
| `PermissionGuard` | ซ่อน/แสดง UI ตาม permission |
| `EmptyState` / `LoadingState` / `ErrorState` | UI states มาตรฐาน |

## กฎทั่วไป
- 1 component = 1 ไฟล์ ตั้งชื่อ `PascalCase.tsx`
- ใช้ **function component + hooks** เท่านั้น (ไม่มี class)
- Props ต้องมี type ชัดเจน (`interface XxxProps`)
- หลีกเลี่ยง `any` และ inline type ที่ซับซ้อน
- Component ควรสั้น — ถ้าเกิน ~150 บรรทัด พิจารณาแยก
- แยก logic ที่ reuse ได้ออกเป็น custom hook

## Props
```tsx
interface ItemCardProps {
  item: Item;
  onSelect?: (id: string) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) { ... }
```
- ตั้งชื่อ event handler prop ว่า `onXxx`, ฟังก์ชันภายในว่า `handleXxx`
- หลีกเลี่ยงการส่ง prop เกินจำเป็น (prop drilling ลึกๆ → พิจารณา context/store)
- ไม่ใส่ค่า default ผ่าน `defaultProps` ใช้ default parameter แทน

## การแยก Logic
- **Data fetching** → ทำใน custom hook (`useItems`) ที่ใช้ TanStack Query ไม่ fetch ตรงใน component
- **Local UI state** → `useState` / `useReducer` ภายใน component
- **Global state** → Zustand (ดู [state-management.md](../state/state-management.md))

## Forms (React Hook Form)
- ใช้ `useForm` + schema validation (เช่น Zod) ทุกฟอร์ม
- ผูก input ด้วย `register` หรือ `Controller` (สำหรับ controlled component)
- แสดง error ใต้ field จาก `formState.errors`
- ปุ่ม submit ต้อง disable ตอน `isSubmitting`
```tsx
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

## UI States ในทุก component ที่โหลดข้อมูล
ต้องครอบ loading / empty / error / success เสมอ (ดู [ui-overview.md](ui-overview.md))

## Styling (Tailwind + shadcn/ui)
- ใช้ **Tailwind utility classes** เป็นหลัก ไม่เขียนไฟล์ CSS แยกต่อ component
- ใช้ **design token** จาก theme (สี/spacing/typography) ไม่ hardcode hex/px พร่ำเพรื่อ (ดู [theme.md](theme.md))
- รวม conditional classes ด้วย helper `cn()` (clsx + tailwind-merge) ไม่ต่อ string เอง
- variant ของ component ใช้แนวทาง `cva` (class-variance-authority) ตามแบบ shadcn/ui
- ไม่เขียน inline `style` เว้นแต่ค่าที่ dynamic จริงๆ (เช่น ความสูงที่คำนวณ)
- ปรับ shadcn primitive ได้ที่ `src/components/ui/` แต่ต้องคง accessibility ของ Radix ไว้

## Accessibility
- ปุ่มต้องเป็น `<button>`, link ต้องเป็น `<a>`/`<Link>`
- input ต้องมี `label` ผูกกัน
- รองรับ keyboard focus

## สิ่งที่ห้าม
- ❌ fetch ข้อมูลตรงใน component ด้วย axios (ต้องผ่าน hook + Query, เรียก `api/*.api.ts`)
- ❌ เก็บ server data ลง Zustand/useState
- ❌ business logic ใน JSX (ดึงออกมาเป็นตัวแปร/ฟังก์ชัน)
- ❌ import ข้าม feature ตรงๆ
- ❌ แสดงปุ่ม action โดยไม่เช็ค permission (Add/Edit/Move/TakeOut/Return ต้องผ่าน `PermissionGuard`/`can()`)
- ❌ Item Card ที่ไม่มีรูป/สถานะ/ตำแหน่ง

## เอกสารที่เกี่ยวข้อง
- [state-management.md](../state/state-management.md) — แบ่ง state
- [coding-style.md](../architecture/coding-style.md) — มาตรฐานโค้ด
- [folder-structure.md](../architecture/folder-structure.md) — ไฟล์อยู่ที่ไหน
