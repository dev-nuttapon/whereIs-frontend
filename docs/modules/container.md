# Module: Container

> จัดการ **Container tree** และดูรายการ item ภายใน container แต่ละ node
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [item.md](item.md)

## 1. Purpose
ให้ผู้ใช้สร้าง/จัดการ container ซึ่งเป็นโหนดในโครงสร้างที่เก็บ และดูของที่อยู่ใต้โหนดนั้น

## 2. User Stories
- ฉันต้องการสร้าง container ใหม่ใต้ container อื่นหรือที่ root
- ฉันต้องการเห็นของที่อยู่ใน container นี้
- ฉันต้องการย้ายของเข้าหรือออกจาก container
- ฉันต้องการกำหนดว่าใครเห็น container นี้ได้บ้าง
- ฉันต้องการให้ container tree ซ้อนกันได้ไม่จำกัด depth

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Container Detail | `/w/:wsId/containers/:containerId` | ข้อมูล container + child containers + items |
| Add/Edit Container | dialog | ฟอร์มชื่อ/parent/visibility |

## 4. Components
- `ContainerHeader`, `ContainerFormDialog`
- `ContainerTree`, `ChildContainerList`, `ItemList`
- `ConfirmDialog`
- `ContainerScopeSummary`

## 5. Forms

**Add/Edit Container Form**
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 |
| Parent Container | `<Select>` | optional |
| Visibility | control | เลือกว่าใครเห็น container นี้ได้ |
| Submit | button | disable + spinner |

- success → ปิด dialog + invalidate tree/detail/items
- visibility/access scope ต้องแสดงว่า container นี้เห็นได้กับใครบ้าง

## 6. API Calls
ผ่าน `src/api/container.api.ts`:
- `GET /workspaces/:wsId/containers/:id` → `Container`
- `GET /workspaces/:wsId/containers/:id/items` → `Item[]`
- `GET /workspaces/:wsId/containers/:id/children` → `Container[]`
- `POST /workspaces/:wsId/containers` → `Container`
- `PUT /workspaces/:wsId/containers/:id` → `Container`
- `DELETE /workspaces/:wsId/containers/:id`

## 7. React Query Usage
- `useContainer(wsId, id)` = `useQuery(['ws', wsId, 'container', id])`
- `useContainerItems(wsId, id)` = `useQuery(['ws', wsId, 'container', id, 'items'])`
- `useContainerChildren(wsId, id)` = `useQuery(['ws', wsId, 'container', id, 'children'])`

## 8. Zustand Usage
- ไม่มี — server state ล้วน

## 9. Form Validation
- `name` required 2–80
- `parentId` optional

## 10. Navigation Flow
```
Structure Explorer → click container → Container Detail
Add/Edit → dialog → refresh tree/detail/items
```

## 11. Permission Rules
- ดู: `container.view`
- จัดการ container: `container.create` / `container.update` / `container.delete`
- กำหนด visibility: `container.visibility.manage`
- ดู item ภายใน: `item.view`
- container tree และผลลัพธ์ที่แสดงต้องถูกกรองด้วย container access scope

## 12. Loading State
- header + lists → skeleton แยกส่วน

## 13. Empty State
- ไม่มี child/items → empty state แยกตามส่วน

## 14. Error State
- โหลด/บันทึกล้มเหลว → error/toast + retry
- ลบ container ที่ยังมี child/items → โยน error เชิงธุรกิจ

## 15. Responsive Behavior
- desktop: detail + lists
- mobile: stack แนวตั้ง

## 16. Future Improvements
- QR label
- capacity / limit
- bulk create child nodes

## 17. Definition of Done
- [ ] Container Detail + child container list + item list
- [ ] Add/Edit/Delete container
- [ ] Query + invalidation
- [ ] Permission guard
- [ ] Loading/Empty/Error states
