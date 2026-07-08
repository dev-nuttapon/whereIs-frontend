# Module: Permission

> ดูและ **override permission รายบุคคล** เหนือค่าเริ่มต้นของ role + เป็นกลไกที่ UI ทั้งแอปใช้ซ่อน/แสดง
> อ้างอิง: [../permission-ui.md](../security/permission-ui.md) · [member.md](member.md) · [../state-management.md](../state-management.md)

## 1. Purpose
ให้ owner ปรับสิทธิ์ของ member เป็นรายคน (เพิ่ม/ถอน permission เฉพาะ) นอกเหนือจาก primary role และให้ทั้ง frontend มี helper กลาง (`can()`) ในการเช็คสิทธิ์อย่างสม่ำเสมอ รวมถึงการกำหนด container access scope

## 2. User Stories
- ในฐานะ owner ฉันต้องการเห็น permission ปัจจุบันของ member
- ฉันต้องการเปิด/ปิด permission เฉพาะให้ member บางคน
- ในฐานะ developer ฉันต้องการ helper เดียว (`can('item.move')`) ใช้ทั่วแอป
- ฉันต้องการกำหนด container access scope ของ member ได้จากหน้ากลางเดียว

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Member Permissions | `/w/:wsId/members/:memberId` (tab/section) | รายการ permission แบบ toggle จัดกลุ่มตาม domain + container scope |

## 4. Components
- `PermissionMatrix`, `PermissionGroup`, `PermissionToggle`
- `ContainerAccessScopeEditor`
- `RoleBadge`
- UI primitives: `Switch`/`Checkbox`, `Accordion`, `Button`, `Tooltip`
- `PermissionGuard` + `usePermission()` / `can()`

## 5. Forms

Permission matrix ไม่ใช่ฟอร์มแบบดั้งเดิม — เป็น toggle interface สำหรับ batch update

**Permission Override Interface**
| Element | Type | หมายเหตุ |
|---------|------|----------|
| Permission Toggle | `<Switch>` | เปิด/ปิด per-permission key |
| Save Changes | button | batch PUT override ทั้งหมดที่เปลี่ยน |
| Reset to Default | button | คืนเป็น role default (ล้าง override ทั้งหมด) |
| Container Scope | picker/editor | กำหนด container ที่ member เข้าถึงได้ |

- Owner row: toggle ทั้งหมด disabled
- Save ทีเดียว ไม่ save ต่อ toggle
- error → toast + คงค่าที่แก้ไว้
- container scope ต้องคง descendant rule ที่ backend กำหนด

## 6. API Calls
ผ่าน `src/api/permission.api.ts`:
- `GET /workspaces/:wsId/members/:id/permissions` → `{ primaryRole, effective, overrides, containerAccessScope }`
- `PUT /workspaces/:wsId/members/:id/permissions` `{ overrides, containerAccessScope? }` → updated permissions
- permission ของผู้ใช้ปัจจุบันมากับ `GET /workspaces/:id`

## 7. React Query Usage
- `useMemberPermissions(wsId, memberId)` = `useQuery([... 'member', id, 'permissions'])`
- `useUpdatePermissions()` mutation → invalidate member permissions (+ member detail)
- ถ้าแก้ permission ของตัวเอง → invalidate `['workspace', wsId]`
- ถ้าแก้ container scope ของตัวเอง → invalidate search/dashboard/activity/report-related queries ด้วย

## 8. Zustand Usage
- `workspaceStore.permissions` = permission ของผู้ใช้ปัจจุบันใน ws
- `usePermission()` อ่านจาก store: `can(key)` / `canAny()` / `canAll()`
- `workspaceStore.containerAccessScope` (หรือ equivalent) ใช้กรองสิ่งที่มองเห็นได้

## 9. Form Validation
- ไม่มีฟอร์มข้อความ — เป็น toggle
- ตรวจ dependency เชิงตรรกะ เช่น เปิด `item.create` ควรมี `item.view`
- container access scope ต้องไม่เปิดกว้างเกิน role ที่ได้รับ

## 10. Navigation Flow
```
Members → คลิก member → Member Detail → tab Permissions
แก้ toggle → Save → mutation → toast
Members → tab Permissions → adjust container access scope → Save
```

## 11. Permission Rules
- เข้าถึง/แก้ override: `permission.override`
- ห้ามแก้ permission ของ owner
- การเช็คสิทธิ์ทั้งแอปต้องผ่าน `can()` ที่เดียว
- container scope UI ต้องแสดงผลต่อ search/dashboard/report โดยทันทีหลัง save

## 12. Loading State
- matrix → skeleton ของ group/toggle
- save → ปุ่ม spinner + disable toggles

## 13. Empty State
- ไม่มี override (ใช้ role default ล้วน) → แสดง baseline ปกติ

## 14. Error State
- โหลด/บันทึกล้มเหลว → `ErrorState`/toast + retry, คงค่าที่แก้ไว้
- backend ปฏิเสธ combination → แสดงข้อความ + revert toggle ที่เกี่ยว

## 15. Responsive Behavior
- desktop: matrix หลายคอลัมน์
- mobile: accordion ต่อ domain, toggle เรียงแนวตั้ง

## 16. Future Improvements
- Custom roles
- Permission templates / bulk apply
- Audit ว่าใครแก้สิทธิ์ใครเมื่อไหร่

## 17. Definition of Done
- [ ] Permission section ในหน้า Member Detail
- [ ] `permission.api.ts` get/update
- [ ] `usePermission()`/`can()` + `PermissionGuard` กลาง
- [ ] `workspaceStore.permissions` ตั้งตอนเข้า ws + refresh เมื่อแก้สิทธิ์ตัวเอง
- [ ] Container access scope editor + invalidate ที่เกี่ยวข้อง
- [ ] ล็อก owner + กฎ dependency เบื้องต้น
- [ ] Loading/Error states
- [ ] Responsive matrix/accordion
