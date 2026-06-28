# Module: Item

> หัวใจของระบบ — จัดการ **Item** (CRUD), หน้า **Item Detail**, การกระทำกับของ (**Move / Take Out / Return / Mark Missing / Mark Found / Dispose**) และ **Activity (ItemEvent)**
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md#4-item-lifecycle-status) · [search.md](search.md) · [container.md](container.md) · [../permission-ui.md](../security/permission-ui.md)

## 1. Purpose
ให้ผู้ใช้เพิ่ม/แก้ไขของ และทำ action ตาม lifecycle (ยืม/คืน/ย้าย/หาย) โดยทุก action ถูกบันทึกเป็น ItemEvent เพื่อให้ตอบได้ว่า "ของอยู่ไหน ใครถือ ย้ายเมื่อไหร่"

## 2. User Stories
- ในฐานะ member ฉันต้องการ **เพิ่มของ** พร้อมรูป/รหัส/คำอธิบาย และเลือก container
- ฉันต้องการ **แก้ไข/ลบ** ของ
- ฉันต้องการดู **Item Detail**: รูป, สถานะ, ตำแหน่งปัจจุบัน, ผู้ถือ, ประวัติ
- ฉันต้องการ **Take Out** (ยืม) ของ และ **Return** (คืน)
- ฉันต้องการ **Move** ของไป container อื่น
- ฉันต้องการ **Mark Missing** เมื่อหาไม่เจอ และ **Mark Found** เมื่อเจอ
- ฉันต้องการเห็น **ประวัติ (Activity)** ของของชิ้นนั้น

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Item Detail | `/w/:wsId/items/:itemId` | ข้อมูล + action buttons + event history |
| Add Item | `/w/:wsId/items/new` (หรือ dialog, prefill container ได้) | ฟอร์มสร้าง |
| Edit Item | `/w/:wsId/items/:itemId/edit` (หรือ dialog) | ฟอร์มแก้ไข |
| Activity Log (workspace) | `/w/:wsId/activity` | feed ItemEvent ทั้ง ws |
(รายการ item ดูที่ [search.md](search.md) / [container.md](container.md))

## 4. Components
- `ItemDetailHeader`, `ItemActions` (กลุ่มปุ่ม + เปิด dialog), `ItemForm`
- Action dialogs: `TakeOutDialog` (เลือก holder + note), `ReturnDialog`, `MoveItemDialog` (เลือก container ปลายทาง), `MarkMissingDialog`, `DisposeDialog` (confirm)
- `ItemEventTimeline`, `ActivityItem`, `StatusBadge`, `LocationBreadcrumb`
- `ContainerPicker` (cascading Site→Location→Container)
- UI primitives: `Dialog`, `Select`, `Button`, `Input`, `Textarea`, `Tabs`

## 5. Forms

**Add/Edit Item Form** — `ItemForm`
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–120 ตัวอักษร |
| Code | `<Input>` | optional, ≤50 ตัว (unique ใน ws — backend 409 → map ลง field `code`) |
| Description | `<Textarea>` | optional, ≤1000 ตัวอักษร |
| Container | `ContainerPicker` | required ตอนสร้าง (cascading Site→Location→Container) |
| Submit | button | disable + spinner ขณะ `isSubmitting` |

**Action Dialogs**
| Dialog | Fields | Validation |
|--------|--------|------------|
| `TakeOutDialog` | Holder (`<Select>` สมาชิก ws), Note (optional) | holderId required |
| `ReturnDialog` | Note (optional) | — |
| `MoveItemDialog` | Target Container (`ContainerPicker`) | toContainerId required, ต้องต่างจาก container เดิม |
| `MarkFoundDialog` | Container (`ContainerPicker`) | containerId required |
| `DisposeDialog` | Confirm checkbox | irreversible — ต้อง confirm ก่อน submit |

- action dialog: submit → ปิด dialog อัตโนมัติ + toast + refetch item

## 6. API Calls
ผ่าน `src/api/item.api.ts` (ดู [../api-contract.md](../api/api-contract.md#items)):
- `GET /workspaces/:wsId/items/:id` → `Item`
- `POST /workspaces/:wsId/items` → `Item`
- `PUT /workspaces/:wsId/items/:id` → `Item`
- `DELETE /workspaces/:wsId/items/:id`
- `GET /workspaces/:wsId/items/:id/events` → `ItemEvent[]`
- Actions (ต่างก็ POST, คืน `Item` ใหม่):
  - `POST .../items/:id/move` `{ toContainerId }`
  - `POST .../items/:id/take-out` `{ holderId, note? }`
  - `POST .../items/:id/return` `{ note? }`
  - `POST .../items/:id/mark-missing`
  - `POST .../items/:id/mark-found` `{ containerId }`
  - `POST .../items/:id/dispose` `{ reason? }`
- Activity ทั้ง ws: `GET /workspaces/:wsId/activity?page&limit`

## 7. React Query Usage
- `useItem(wsId, id)` = `useQuery(['ws', wsId, 'item', id])`
- `useItemEvents(wsId, id)` = `useQuery(['ws', wsId, 'item', id, 'events'])`
- `useActivity(wsId, params)` = `useQuery(['ws', wsId, 'activity', params])` (Activity Log + dashboard recent)
- Mutations: `useCreateItem/useUpdateItem/useDeleteItem` + action mutations `useMoveItem/useTakeOutItem/useReturnItem/useMarkMissing/useMarkFound/useDisposeItem`
- **Cache invalidation rules** (สำคัญ — ดู [../state-management.md](../state/state-management.md#cache-rules)):
  - หลัง create/update/delete → invalidate: items search list, item detail, container items, dashboard summary, activity
  - หลัง action (move/takeout/return/missing/found/dispose) → invalidate: item detail, item events, search list, container items (ต้นทาง+ปลายทาง), dashboard, activity
- พิจารณา **optimistic update** ของ status badge เพื่อ UX เร็ว (rollback ถ้า error)

## 8. Zustand Usage
- ไม่เก็บ item ใน Zustand (เป็น server state)
- ใช้ `workspaceStore` (wsId, permissions) และ `authStore` (เพื่อ default holder = ตัวเองตอน take out)

## 9. Form Validation
Add/Edit (Zod): `name` required 2–120; `code` optional ≤ 50 (unique ใน ws → 409 map ลง field); `description` ≤ 1000; `containerId` required ตอนสร้าง (ของใหม่ต้องมีที่อยู่)
Action dialogs:
- Take Out: `holderId` required; `note` optional
- Move: `toContainerId` required, ต้องต่างจาก container เดิม
- Mark Found: `containerId` required (เลือกที่จะนำกลับไปเก็บ)
- Dispose: ต้อง confirm (พิมพ์ยืนยัน/checkbox) เพราะ irreversible

## 10. Navigation Flow
```
Search/Container/Dashboard → คลิก item → Item Detail
Add Item (จาก container = prefill / จาก global = เลือก container) → สำเร็จ → Item Detail
Edit → form → สำเร็จ → กลับ Item Detail
Action (dialog) → ยืนยัน → mutation → อยู่หน้าเดิม + refetch + toast
Delete → confirm → กลับไป container/search list
```

## 11. Permission Rules
| ปุ่ม/action | permission |
|-------------|-----------|
| ดู item/detail/events | `item.view` |
| Add | `item.create` |
| Edit | `item.update` |
| Delete | `item.delete` |
| Move | `item.move` |
| Take Out | `item.takeout` |
| Return | `item.return` |
| Mark Missing | `item.mark_missing` |
| Mark Found | `item.mark_found` |
| Dispose | `item.dispose` |
ปุ่มที่ไม่มีสิทธิ์ → **ซ่อน** (ดู [../permission-ui.md](../security/permission-ui.md))

## State changes (status → action ที่แสดง)
| status ปัจจุบัน | action ที่ valid |
|-----------------|------------------|
| `stored` | Take Out · Move · Mark Missing · Edit · Dispose |
| `taken_out` | Return · Mark Missing · Edit · Dispose |
| `missing` | Mark Found · Edit · Dispose |
| `disposed` | (none — terminal) · ดูได้อย่างเดียว |
UI ต้อง derive ปุ่มจาก status + permission เสมอ ห้าม hardcode แสดงทุกปุ่ม

## 12. Loading State
- detail → skeleton header + tabs
- events → skeleton timeline
- ปุ่ม action ตอน mutation → spinner + disable

## 13. Empty State
- item ไม่มี event (เพิ่งสร้าง) → timeline แสดงอย่างน้อย event `created`
- Activity Log ว่าง → `EmptyState` "ยังไม่มีกิจกรรม"

## 14. Error State
- โหลด item 404 → หน้า "ไม่พบรายการนี้" + ปุ่มกลับ
- action ล้มเหลว (เช่น 409 status เปลี่ยนไปแล้วโดยคนอื่น) → toast + refetch detail เพื่อ sync status ล่าสุด
- code ซ้ำ → field error
- ดู error format [../api-contract.md](../api/api-contract.md#error-format)

## 15. Responsive Behavior
- Detail: desktop = รูป/ข้อมูลซ้าย + actions ขวาบน; mobile = แนวตั้ง, action เป็นปุ่มเรียง/`⋯` menu หรือ bottom action bar
- Activity timeline: 1 คอลัมน์ทุกขนาด
- form: field เต็มกว้างบน mobile; ContainerPicker เป็น step/drawer บน mobile

## 16. Future Improvements
- Upload รูปจริง (หลาย รูป), tags, custom fields
- Barcode/QR scan เพื่อเปิด item, bulk actions
- ประวัติแบบ filter ตาม type, export
- การแจ้งเตือนของค้างคืน / missing นาน
- Optimistic UI เต็มรูปแบบ

## 17. Definition of Done
- [ ] Item Detail (header + status + location + holder + tabs)
- [ ] Add/Edit/Delete item + ContainerPicker
- [ ] Action dialogs ครบ: take out, return, move, mark missing, mark found, dispose
- [ ] ปุ่ม action derive จาก status + permission (ซ่อนถ้าทำไม่ได้)
- [ ] ItemEvent timeline + Activity Log page
- [ ] `item.api.ts` ครบ (CRUD + 6 actions + events + activity)
- [ ] React Query + **cache invalidation ตามกติกา**
- [ ] Validation (Zod) ทุกฟอร์ม/ dialog + 409 handling
- [ ] Loading/Empty/Error (รวม 404, 409 conflict)
- [ ] Responsive detail + action bar
