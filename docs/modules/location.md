# Module: Location

> **Location Explorer** — เรียกดู/จัดการ Location แบบ **tree** ภายใน Site และเข้าถึง Container/Item
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md#3-ลำดับชั้นตำแหน่ง-location-explorer) · [container.md](container.md) · [site.md](site.md)

## 1. Purpose
ให้ผู้ใช้นำทางลำดับชั้นตำแหน่ง (Site → Location → Location → Container → Item) และจัดการ node ของ tree ได้ เป็นหัวใจของการ "จัดเก็บอย่างเป็นระบบ"

## 2. User Stories
- ในฐานะผู้ใช้ ฉันต้องการ **เรียกดู tree** ของ location ใน site
- ในฐานะ admin ฉันต้องการ **เพิ่ม/แก้/ลบ location** และ **เพิ่ม container** ใต้ location
- ฉันต้องการ **ขยาย/ยุบ** แต่ละ node และเห็นว่าข้างในมีอะไร
- ฉันต้องการคลิก container เพื่อดูของข้างใน

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Location Explorer | `/w/:wsId/sites/:siteId/explorer` | tree view ของ location + container ใน site |
(สามารถมี route ย่อ `/w/:wsId/explorer` ที่ให้เลือก site ก่อน)

## 4. Components
- `LocationTree`, `LocationTreeNode` (recursive), `ContainerNode`
- `LocationFormDialog`, `ContainerFormDialog`, `ConfirmDialog`
- `LocationBreadcrumb`
- UI primitives: `Collapsible`/`Accordion`, `Button`, `Dialog`, `ContextMenu`/`DropdownMenu`

## 5. Forms

**Add/Edit Location Form** — ภายใน `LocationFormDialog`
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 ตัวอักษร |
| Parent Location | `<Select>` (tree) | optional — null = top-level ของ site |
| Submit | button | disable + spinner ขณะ `isSubmitting` |

- Parent dropdown แสดง location tree ของ site ปัจจุบัน
- สร้างที่ root: `parentId = null`; สร้างภายใต้ location: `parentId = id` ของ parent ที่เลือก
- Edit: ห้ามเลือก parent ที่เป็น descendant ของตัวเอง (circular reference)
- success → ปิด dialog + invalidate tree + toast

## 6. API Calls
ผ่าน `src/api/location.api.ts` (+ container ผ่าน [container.md](container.md)):
- `GET /workspaces/:wsId/sites/:siteId/locations` → `Location[]` (flat, มี `parentId` → ประกอบ tree ฝั่ง client) **หรือ** `?parentId=` โหลดทีละชั้น (lazy)
- `POST /workspaces/:wsId/locations` (body มี `siteId`, `parentId`) → `Location`
- `PUT /workspaces/:wsId/locations/:id`
- `DELETE /workspaces/:wsId/locations/:id`
- containers ของ location: `GET /workspaces/:wsId/locations/:locId/containers`

## 7. React Query Usage
- `useLocations(wsId, siteId)` = `useQuery(['ws', wsId, 'locations', siteId])` — ดึง flat list แล้ว build tree ด้วย `useMemo`
- (ทางเลือก lazy) `useChildLocations(wsId, parentId)` ต่อ node
- mutations create/update/delete → invalidate `['ws', wsId, 'locations', siteId]`
- ย้าย location (เปลี่ยน parent) = update → invalidate tree

## 8. Zustand Usage
- `uiStore` (หรือ local) เก็บ **expanded node ids** + **selected node** ของ explorer (UI state ล้วน ไม่ใช่ server data)
- เลือกใช้ local `useState` ถ้าไม่ต้องคงข้ามหน้า; ใช้ store ถ้าต้องจำสถานะ expand

## 9. Form Validation
Zod (location): `name` required 2–80; `parentId` optional (null = top-level)

## 10. Navigation Flow
```
Site Detail / Sidebar → Explorer ของ site
คลิก location node → expand/แสดง children + containers
คลิก container → /w/:wsId/containers/:containerId (Container Detail)
Add Location: เลือก parent → dialog → invalidate tree
Add Container: เลือก location → dialog (ดู container.md)
```

## 11. Permission Rules
- ดู tree: `location.view`
- จัดการ location: `location.create` / `location.update` / `location.delete`
- เพิ่ม container: `container.create`
- ปุ่ม add/edit/delete ของแต่ละ node ซ่อนตามสิทธิ์

## 12. Loading State
- โหลด tree → skeleton ของ node (หรือ spinner ใน panel)
- lazy children → spinner เล็กที่ node ที่กำลังขยาย

## 13. Empty State
- site ไม่มี location → `EmptyState` "ยังไม่มีตำแหน่ง" + ปุ่ม Add Location
- location ไม่มี child/container → ข้อความ "ว่าง" ใต้ node

## 14. Error State
- โหลด tree ล้มเหลว → `ErrorState` + retry
- ลบ location ที่มี child/container/item → 409/422 → "ต้องย้าย/ลบของข้างในก่อน"

## 15. Responsive Behavior
- Desktop: split view (tree + detail)
- Tablet: tree เต็ม + detail เป็น drawer/ขวา
- Mobile: tree เต็มจอ, แตะ node → push หน้า detail (master-detail แบบ stack)

## 16. Future Improvements
- Drag & drop ย้าย location/container
- ค้นหาภายใน tree, virtualize tree ใหญ่
- แสดง count item ต่อ node, breadcrumb คลิกได้ลึก

## 17. Definition of Done
- [ ] Location Explorer (tree) + build จาก flat list
- [ ] Expand/collapse + selected node
- [ ] Add/Edit/Delete location + Add container entry
- [ ] `location.api.ts` ครบ
- [ ] Query + invalidation; expanded state ใน UI store/local
- [ ] Permission guard ต่อ node action
- [ ] Loading/Empty/Error (รวม 409 ตอนลบ)
- [ ] Responsive split/stack
