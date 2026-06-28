# AI Prompt Guide — WhereIs Frontend

แนวทางและ context สำหรับใช้ AI (Claude, Codex, Copilot) ช่วยพัฒนา Frontend ของ WhereIs ให้ได้โค้ดที่ตรงมาตรฐานทีม

## Context หลักที่ต้องบอก AI เสมอ
> วางบล็อกนี้ตอนเริ่ม session กับ AI

```
โปรเจกต์: WhereIs — เว็บค้นหา/จัดเก็บ/ย้าย/ยืม/คืน/ติดตามสิ่งของ (frontend only)
Entities: Workspace → Site → Location → Container → Item; + Member, ItemEvent
         (Activity = view ของ ItemEvent) — ใช้คำตาม docs/domain-model.md เป๊ะ
Roles: owner / admin / member / viewer (สิทธิ์เป็น permission list ต่อ workspace)
Stack: React 18 + Vite + TypeScript, React Router, TanStack Query,
       React Hook Form + Zod, Zustand, Axios, Tailwind CSS, shadcn/ui

กติกาสำคัญ:
- Search เป็นฟีเจอร์หลัก / Item Card ต้องมีรูป+สถานะ+ตำแหน่ง / Action อยู่ใน Item Detail
- ปุ่ม action ต้องซ่อนตาม permission (item.create/update/move/takeout/return/mark_*/dispose)
- Server state ใช้ TanStack Query เท่านั้น, ห้ามเก็บ server data ใน Zustand
- Client state ใช้ Zustand (auth/workspace/ui), local ใช้ useState, filter ใช้ URL params
- เรียก API ผ่าน api/*.api.ts (เอกพจน์) + custom hook เท่านั้น (ห้าม fetch กระจาย)
- styling ด้วย Tailwind + shadcn/ui, ใช้ design token (ห้าม hardcode สี) ดู docs/theme.md
- function component + hooks, named export, TypeScript strict (ห้าม any)
- แยก feature folder ชัดเจน ตาม docs/folder-structure.md
- ใช้ Mock API ก่อนได้ถ้า Backend ยังไม่พร้อม (contract = docs/api-contract.md)
```

## ขั้นตอนก่อนเริ่มงานทุกครั้ง
0. ทำตามลำดับใน [reading-order.md](reading-order.md) + อ่าน `CURRENT_TASK.md` (ทำเฉพาะ task นั้น)
1. ยึดคำศัพท์ตาม [domain-model.md](../architecture/domain-model.md)
2. ยึด contract ตาม [api-contract.md](../api/api-contract.md) (ถ้าไม่ตรง backend → แก้เอกสารก่อน)
3. ยึด route/flow ตาม [screen-flow.md](../ui/screen-flow.md)
4. ตรวจ [permission-ui.md](../security/permission-ui.md) ก่อนสร้างปุ่ม action
5. อ่าน module doc ของ feature ที่จะทำใน [modules/](../modules/)
6. อย่าเปลี่ยน architecture / folder / API contract ถ้าไม่จำเป็น (ต้องขออนุมัติ)

## ไฟล์ docs ที่ควรให้ AI อ่านก่อน
| ต้องการทำอะไร | ให้ AI อ่าน |
|----------------|-------------|
| เข้าใจ domain/คำศัพท์ | [domain-model.md](../architecture/domain-model.md) |
| ทำ feature ใด feature หนึ่ง | [modules/](../modules/)`<feature>.md` |
| สร้าง component/screen | [component-rules.md](../ui/component-rules.md), [ui-overview.md](../ui/ui-overview.md) |
| layout / responsive | [layout.md](../ui/layout.md) |
| สี / theme / Tailwind / shadcn | [theme.md](../ui/theme.md) |
| ต่อ API / สร้าง query hook | [api-contract.md](../api/api-contract.md), [state-management.md](../state/state-management.md) |
| จัดการ state | [state-management.md](../state/state-management.md) |
| ทำ auth / สิทธิ์ / ปุ่ม action | [permission-ui.md](../security/permission-ui.md) |
| วางไฟล์ใหม่ | [folder-structure.md](../architecture/folder-structure.md) |
| flow / routing | [screen-flow.md](../ui/screen-flow.md) |
| มาตรฐานโค้ด | [coding-style.md](../architecture/coding-style.md) |

## Prompt Templates

### สร้าง Screen ใหม่
```
สร้างหน้า <ชื่อ> ที่ route <path>
- ดึงข้อมูลด้วย TanStack Query ผ่าน hook ใน features/<x>/hooks/ (เรียก api/<x>.api.ts)
- รองรับ LoadingState / EmptyState / ErrorState / success
- ใช้ component กลาง (ItemCard, StatusBadge, ฯลฯ)
- ซ่อนปุ่ม action ตาม permission (ดู docs/permission-ui.md)
- ตาม docs/component-rules.md และ docs/folder-structure.md
```

### สร้าง API Hook
```
สร้าง query/mutation hook สำหรับ endpoint <method path>
- ฟังก์ชันเรียก endpoint อยู่ใน api/<x>.api.ts (ใช้ client.ts)
- ใช้ query key factory จาก lib/queryKeys (ใส่ wsId เสมอ)
- mutation ให้ invalidate ตาม docs/state-management.md (Cache Rules)
- type request/response ตาม docs/api-contract.md
```

### สร้างฟอร์ม (Add/Edit Item)
```
สร้างฟอร์ม <ชื่อ> ด้วย React Hook Form + Zod
- แสดง error ราย field, disable submit ตอน isSubmitting
- submit แล้วเรียก mutation + invalidate + redirect
- ตาม docs/component-rules.md (ส่วน Forms)
```

### Refactor / Review
```
รีวิวโค้ดนี้ตาม docs/coding-style.md และ docs/component-rules.md
ชี้จุดที่ผิดกติกา (fetch ตรงใน component, any, server data ใน Zustand,
ปุ่ม action ที่ไม่เช็ค permission) แล้วเสนอวิธีแก้
```

## สิ่งที่ต้องย้ำกับ AI (ข้อผิดที่พบบ่อย)
- ❌ fetch ด้วย axios ตรงใน component → ต้องผ่าน `api/*.api.ts` + custom hook + Query
- ❌ เก็บ server data ลง Zustand/useState
- ❌ ปุ่ม Add/Edit/Move/TakeOut/Return ที่ไม่เช็ค permission
- ❌ ใช้ `any` / `@ts-ignore`
- ❌ hardcode สี/ระยะห่าง → ใช้ design token
- ❌ import ข้าม feature ตรงๆ
- ✅ type ครบ, จัดการ loading/error, named export, Item Card มีรูป+สถานะ+ตำแหน่ง

## เอกสารที่เกี่ยวข้อง
- ดู index ทั้งหมดที่ [README.md](../README.md)
