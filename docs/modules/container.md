# Module: Container

> จัดการ **Container** (กล่อง/ลิ้นชัก/บิน) ที่อยู่ใน Location และดูรายการ Item ข้างใน
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [location.md](location.md) · [item.md](item.md)

## 1. Purpose
ให้ผู้ใช้สร้าง/จัดการ container และดูของที่อยู่ในนั้น เป็น "จุดที่ item ถูกเก็บจริง" และเป็นทางลัดในการเพิ่มของเข้า container

## 2. User Stories
- ในฐานะ admin ฉันต้องการ **สร้าง container** ใต้ location พร้อมรหัส (code)
- ฉันต้องการเห็น **รายการ item** ในกล่องนี้
- ฉันต้องการ **เพิ่ม item** เข้า container นี้โดยตรง
- ฉันต้องการเห็น **QR/Code** ของกล่อง (QR = future) เพื่อแปะ/สแกน

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Container Detail | `/w/:wsId/containers/:containerId` | ข้อมูล container + รายการ item + add item |
| Add/Edit Container | dialog (จาก Explorer หรือหน้า detail) | ฟอร์ม code/ชื่อ/รูป |

## 4. Components
- `ContainerHeader` (รูป + code + QR placeholder), `ContainerFormDialog`
- `ItemList`, `ItemCard`, `StatusBadge`, `LocationBreadcrumb`
- `ConfirmDialog`
- UI primitives: `Card`, `Dialog`, `Button`, `Input`

## 5. Forms

**Add/Edit Container Form** — ภายใน `ContainerFormDialog`
| Field | Type | Validation |
|-------|------|------------|
| Code | `<Input>` | required 1–50 ตัวอักษร, unique ใน workspace (backend ยืนยัน) |
| Name | `<Input>` | optional |
| Location | `<Select>` | required ตอนสร้าง (เลือกจาก location tree ของ site) |
| Submit | button | disable + spinner ขณะ `isSubmitting` |

- Edit: code แก้ได้ แต่ต้อง unique — backend ส่ง 409 → map error ลง field `code`
- Location ไม่เปลี่ยนใน Edit (move container ต้องผ่าน admin action แยก)
- success → ปิด dialog + invalidate container list + location tree

## 6. API Calls
ผ่าน `src/api/container.api.ts`:
- `GET /workspaces/:wsId/containers/:id` → `Container`
- `GET /workspaces/:wsId/containers/:id/items` → `Item[]`
- `POST /workspaces/:wsId/containers` (body: `locationId`, `code`, …) → `Container`
- `PUT /workspaces/:wsId/containers/:id`
- `DELETE /workspaces/:wsId/containers/:id`

## 7. React Query Usage
- `useContainer(wsId, id)` = `useQuery(['ws', wsId, 'container', id])`
- `useContainerItems(wsId, id)` = `useQuery(['ws', wsId, 'container', id, 'items'])`
- `useCreateContainer/useUpdateContainer/useDeleteContainer` → invalidate container + location tree ([location.md](location.md)) + container items

## 8. Zustand Usage
- ไม่มี — server state ล้วน (ใช้ `workspaceStore` แค่ wsId/permissions)

## 9. Form Validation
Zod: `code` required 1–50 (ควร unique ใน workspace — backend ยืนยัน, FE แสดง error ถ้า 409); `name` optional; `locationId` required ตอนสร้าง

## 10. Navigation Flow
```
Explorer → คลิก container → Container Detail
[+ Add Item] → Add Item form (prefill containerId) — ดู item.md
คลิก item → Item Detail
Edit/Delete → dialog/confirm → invalidate
ลบ container ที่มี item → ต้องจัดการ item ก่อน (ดู Error State)
```

## 11. Permission Rules
- ดู: `container.view` + `item.view`
- จัดการ container: `container.create` / `container.update` / `container.delete`
- เพิ่ม item: `item.create`
- ปุ่มซ่อนตามสิทธิ์

## 12. Loading State
- header + item list → skeleton แยกส่วน

## 13. Empty State
- container ว่าง → `EmptyState` "ยังไม่มีของในกล่องนี้" + ปุ่ม Add Item (ถ้ามีสิทธิ์)

## 14. Error State
- โหลด/บันทึกล้มเหลว → `ErrorState`/toast + retry
- code ซ้ำ → 409 → error ใต้ field code
- ลบ container ที่มี item → 409/422 → "ย้าย/จัดการของในกล่องก่อน"

## 15. Responsive Behavior
- header: desktop แนวนอน (รูปซ้าย ข้อมูลขวา); mobile แนวตั้ง
- item grid: desktop 3–4 → tablet 2 → mobile 1
- QR แสดงเป็น block แยกบน mobile

## 16. Future Improvements
- **QR code** generate + print label + สแกนเพื่อเปิด container (future ตาม [../project-overview.md](../architecture/project-overview.md))
- ย้าย container ข้าม location, capacity/limit
- bulk add item

## 17. Definition of Done
- [ ] Container Detail (header + item list)
- [ ] Add/Edit/Delete container
- [ ] Add item เข้า container (prefill)
- [ ] `container.api.ts` ครบ + items endpoint
- [ ] Query + invalidation (รวม location tree)
- [ ] Validation + 409 code ซ้ำ
- [ ] Permission guard
- [ ] Loading/Empty/Error states
- [ ] Responsive
- [ ] QR placeholder (โครงไว้รองรับอนาคต)
