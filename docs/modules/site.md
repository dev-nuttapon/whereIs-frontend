# Module: Site

> จัดการ **Site** = สถานที่ระดับบนสุดของลำดับชั้นตำแหน่ง (อาคาร/บ้าน/สาขา) ใน workspace
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md#3-ลำดับชั้นตำแหน่ง-location-explorer) · [location.md](location.md) · [../permission-ui.md](../security/permission-ui.md)

## 1. Purpose
ให้ admin/owner สร้างและจัดการ Site เพื่อเป็นรากของ Location/Container/Item ทั้งหมด

## 2. User Stories
- ในฐานะ admin ฉันต้องการ **สร้าง Site** (เช่น "อาคาร A")
- ฉันต้องการ **แก้ไข/ลบ Site**
- ฉันต้องการเห็น **รายการ Site** พร้อมจำนวน location/item
- ฉันต้องการคลิก Site เพื่อเข้า **Location Explorer** ของ site นั้น

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Site List | `/w/:wsId/sites` | รายการ site + ปุ่ม Add Site |
| Site Detail | `/w/:wsId/sites/:siteId` | ข้อมูล site + entry ไป Location Explorer |
| Add/Edit Site | dialog | ฟอร์มชื่อ + คำอธิบาย |

## 4. Components
- `SiteList`, `SiteCard`/`SiteRow`, `SiteFormDialog`, `ConfirmDialog` (ลบ)
- UI primitives: `Table`/`Card`, `Dialog`, `Button`, `Input`, `Textarea`

## 5. Forms

**Add/Edit Site Form** — ภายใน `SiteFormDialog` (ใช้ dialog เดียวกันทั้ง Add และ Edit)
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 ตัวอักษร |
| Description | `<Textarea>` | optional, ≤500 ตัวอักษร |
| Submit | button | "เพิ่ม Site" / "บันทึก", disable + spinner ขณะ `isSubmitting` |

- Edit: prefill ค่าจาก cache ของ `useQuery`
- success → ปิด dialog + invalidate list + toast
- 400 validation error → แสดงใต้ field

## 6. API Calls
ผ่าน `src/api/site.api.ts`:
- `GET /workspaces/:wsId/sites` → `Site[]`
- `GET /workspaces/:wsId/sites/:id` → `Site`
- `POST /workspaces/:wsId/sites` → `Site`
- `PUT /workspaces/:wsId/sites/:id` → `Site`
- `DELETE /workspaces/:wsId/sites/:id`

## 7. React Query Usage
- `useSites(wsId)` = `useQuery(['ws', wsId, 'sites'])`
- `useSite(wsId, id)` = `useQuery(['ws', wsId, 'site', id])`
- `useCreateSite/useUpdateSite/useDeleteSite` mutations → invalidate `['ws', wsId, 'sites']` (+ detail)

## 8. Zustand Usage
- ไม่มี — เป็น server state ล้วน

## 9. Form Validation
Zod: `name` required 2–80; `description` optional ≤ 500

## 10. Navigation Flow
```
Sidebar "Sites" → /w/:wsId/sites
คลิก site → /sites/:siteId (Detail) → ปุ่ม "Open Explorer" → Location Explorer
Add/Edit → dialog → สำเร็จ → ปิด + invalidate list
Delete → ConfirmDialog → สำเร็จ → invalidate list
```

## 11. Permission Rules
- ดู: `site.view`
- สร้าง: `site.create` · แก้: `site.update` · ลบ: `site.delete`
- ปุ่ม Add/Edit/Delete ซ่อนถ้าไม่มีสิทธิ์ (ผ่าน `PermissionGuard`/`can()`)
- ค่าเริ่มต้น: admin/owner จัดการได้, member/viewer ดูอย่างเดียว (ดู [../permission-ui.md](../security/permission-ui.md))

## 12. Loading State
- list → skeleton rows/cards

## 13. Empty State
- ไม่มี site → `EmptyState` "ยังไม่มี Site" + ปุ่ม Add Site (ถ้ามีสิทธิ์)

## 14. Error State
- โหลด/บันทึก/ลบ ล้มเหลว → `ErrorState`/toast + retry
- ลบ site ที่มี location/item → backend อาจตอบ 409/422 → แสดงข้อความ "ต้องย้าย/ลบของข้างในก่อน"

## 15. Responsive Behavior
- desktop: table; mobile: card list
- ปุ่ม action ยุบเป็นเมนู `⋯` บน mobile

## 16. Future Improvements
- รูป/ที่อยู่/แผนที่ของ site
- archive site แทนลบ
- จัดเรียง/ค้นหา site

## 17. Definition of Done
- [ ] Site List + Detail + Add/Edit dialog + Delete confirm
- [ ] `site.api.ts` ครบ CRUD
- [ ] Query/Mutation + invalidation
- [ ] Validation (Zod)
- [ ] Permission guard ปุ่ม
- [ ] Loading/Empty/Error states (รวม 409 ตอนลบ)
- [ ] Responsive table/card
