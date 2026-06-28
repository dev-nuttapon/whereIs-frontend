# Module: Permission

> ดูและ **override permission รายบุคคล** เหนือค่าเริ่มต้นของ role + เป็นกลไกที่ UI ทั้งแอปใช้ซ่อน/แสดง
> อ้างอิง: [../permission-ui.md](../security/permission-ui.md) (แหล่งความจริงของ keys/matrix) · [member.md](member.md) · [../state-management.md](../state/state-management.md)

## 1. Purpose
ให้ owner ปรับสิทธิ์ของ member เป็นรายคน (เพิ่ม/ถอน permission เฉพาะ) นอกเหนือจาก role และให้ทั้ง frontend มี helper กลาง (`can()`) ในการเช็คสิทธิ์อย่างสม่ำเสมอ

## 2. User Stories
- ในฐานะ owner ฉันต้องการ **เห็น permission ปัจจุบัน** ของ member (จาก role + override)
- ฉันต้องการ **เปิด/ปิด permission เฉพาะ** ให้ member บางคน (เช่นให้ member ทำ `item.move` ได้)
- ในฐานะ developer ฉันต้องการ **helper เดียว** (`can('item.move')`) ใช้ทั่วแอป

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Member Permissions | `/w/:wsId/members/:memberId` (tab/section) | รายการ permission แบบ toggle จัดกลุ่มตาม domain |
(ไม่มีหน้า standalone — อยู่ในหน้า Member Detail ของ [member.md](member.md))

## 4. Components
- `PermissionMatrix`, `PermissionGroup`, `PermissionToggle`
- `RoleBadge`
- UI primitives: `Switch`/`Checkbox`, `Accordion`, `Button`, `Tooltip` (อธิบาย key)
- **`PermissionGuard`** (component กลางทั้งแอป) + hook **`usePermission()` / `can()`**

## 5. Forms

Permission matrix ไม่ใช่ฟอร์มแบบดั้งเดิม — เป็น toggle interface สำหรับ batch update

**Permission Override Interface** — `PermissionMatrix`
| Element | Type | หมายเหตุ |
|---------|------|----------|
| Permission Toggle | `<Switch>` | เปิด/ปิด per-permission key |
| Save Changes | button | batch PUT override ทั้งหมดที่เปลี่ยน |
| Reset to Default | button | คืนเป็น role default (ล้าง override ทั้งหมด) |

- Dependency check: เปิด `item.create` → auto-enable `item.view` (หรือ warn ผู้ใช้)
- Owner row: toggle ทั้งหมด disabled (owner มีครบเสมอ)
- Save ทีเดียว (batch PUT) ไม่ save ต่อ toggle
- error → toast + คงค่าที่แก้ไว้ (ไม่ revert อัตโนมัติ)

## 6. API Calls
ผ่าน `src/api/permission.api.ts` (หรือรวมใน member.api):
- `GET /workspaces/:wsId/members/:id/permissions` → `{ role, effective: string[], overrides: {key: boolean}[] }`
- `PUT /workspaces/:wsId/members/:id/permissions` `{ overrides }` → updated permissions
- (อ้างอิง) permission ของ **ผู้ใช้ปัจจุบัน** มากับ `GET /workspaces/:id` (เก็บใน `workspaceStore.permissions`)

## 7. React Query Usage
- `useMemberPermissions(wsId, memberId)` = `useQuery([... 'member', id, 'permissions'])`
- `useUpdatePermissions()` mutation → invalidate member permissions (+ member detail)
- ถ้าแก้ permission ของ **ตัวเอง** → invalidate `['workspace', wsId]` เพื่อ refresh `workspaceStore.permissions` → เมนู/ปุ่มอัปเดตทันที

## 8. Zustand Usage
- `workspaceStore.permissions` = permission **ของผู้ใช้ปัจจุบัน** ใน ws (ตั้งตอนเข้า ws)
- `usePermission()` อ่านจาก store: `can(key) => permissions.includes(key)`; รองรับหลาย key (`canAny`, `canAll`)
- หน้าจัดการนี้แก้ permission **ของคนอื่น** = server state (Query) ไม่เก็บใน store

## 9. Form Validation
- ไม่มีฟอร์มข้อความ — เป็น toggle; ตรวจ dependency เชิงตรรกะ (เช่น ติ๊ก `item.create` ควรมี `item.view` ด้วย) → เตือนหรือ auto-enable

## 10. Navigation Flow
```
Members → คลิก member → Member Detail → tab Permissions
แก้ toggle → Save → mutation → toast
แก้ของตัวเอง → store refresh → sidebar/ปุ่มเปลี่ยนทันที
```

## 11. Permission Rules
- เข้าถึง/แก้ override: `permission.override` (owner เท่านั้นตามค่าเริ่มต้น)
- ห้ามแก้ permission ของ owner (owner มีครบเสมอ) — UI lock
- การเช็คสิทธิ์ทั้งแอปต้องผ่าน `can()` ที่เดียว ห้ามเทียบ `role === '...'` กระจาย (ดู [../permission-ui.md](../security/permission-ui.md))

## 12. Loading State
- matrix → skeleton ของ group/toggle
- save → ปุ่ม spinner + disable toggles

## 13. Empty State
- ไม่มี override (ใช้ role default ล้วน) → แสดง baseline ปกติ (ไม่ใช่ empty พิเศษ)

## 14. Error State
- โหลด/บันทึกล้มเหลว → `ErrorState`/toast + retry, คงค่าที่แก้ไว้
- backend ปฏิเสธ combination → แสดงข้อความ + revert toggle ที่เกี่ยว

## 15. Responsive Behavior
- desktop: matrix หลายคอลัมน์; mobile: accordion ต่อ domain, toggle เรียงแนวตั้ง

## 16. Future Improvements
- Custom roles (นิยาม role เอง)
- Permission templates / bulk apply
- Audit ว่าใครแก้สิทธิ์ใครเมื่อไหร่
- Dependency graph อัตโนมัติของ permission

## 17. Definition of Done
- [ ] Permission section ในหน้า Member Detail (matrix + toggle ตาม domain)
- [ ] `permission.api.ts` get/update
- [ ] `usePermission()`/`can()` + `PermissionGuard` กลาง (ใช้ทั้งแอป)
- [ ] `workspaceStore.permissions` ตั้งตอนเข้า ws + refresh เมื่อแก้สิทธิ์ตัวเอง
- [ ] ล็อก owner + กฎ dependency เบื้องต้น
- [ ] Loading/Error states
- [ ] Responsive matrix/accordion
