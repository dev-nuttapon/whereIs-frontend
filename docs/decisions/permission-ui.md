# ADR: Permission UI Design

**สถานะ:** Accepted
**วันที่:** 2026-06-28
**เกี่ยวข้อง:** [security/permission-ui.md](../security/permission-ui.md) · [state/state-management.md](../state/state-management.md)

---

## Problem

WhereIs มีระบบสิทธิ์ที่ซับซ้อน:
- มี **4 roles** (Owner, Admin, Member, Viewer)
- แต่ละ role มี **permission defaults** ที่ต่างกัน
- แต่ละ **member** สามารถมี **per-member override** เพิ่ม/ลด permission ได้
- UI ต้องซ่อนปุ่ม/เมนู/หน้าตาม permission ของ user ที่ login อยู่

โจทย์: Frontend จะ check permission ในโค้ดอย่างไร ให้ถูกต้อง, consistent, และ maintain ได้?

---

## Decision

1. Backend ส่ง **effective permission list** (string array) พร้อมกับ workspace data
2. Frontend เก็บ list นี้ใน `workspaceStore.permissions`
3. ทุก permission check ผ่าน **helper กลาง** `can(permission: string): boolean`
4. Permission keys มี **canonical list** เดียวที่ [security/permission-ui.md](../security/permission-ui.md) — ห้ามคิด key ใหม่โดยไม่อัปเดตที่นั้น

```ts
// helper อยู่ใน src/utils/permission.ts หรือ src/hooks/usePermission.ts
const can = (perm: string) => workspaceStore.permissions.includes(perm);

// ใช้ใน component
{can('item.create') && <AddItemButton />}
```

---

## Alternatives Considered

### A. Check role โดยตรง (`role === 'admin'`)
```ts
{userRole === 'admin' && <AddItemButton />}
```

**ปัญหา:**
- Role ไม่ใช่ permission จริง — member อาจมี override ที่ให้ permission บาง action ที่ปกติ admin เท่านั้นมี
- ต้องกระจาย role logic ทั่วโค้ด — ถ้า role matrix เปลี่ยน → update หลายที่
- "admin สร้างได้" อาจไม่จริงถ้า admin ถูก override ลบ `item.create`

### B. Permission check ใน component แต่ละอัน (กระจาย)
```ts
// ใน ItemDetailPage.tsx
const { permissions } = useWorkspaceStore();
const canTakeOut = permissions.includes('item.takeout');
```

**ปัญหา:** logic ซ้ำซ้อน, refactor ยาก, ลืมเช็คง่าย

### C. Permission HOC / Wrapper component เพียงอย่างเดียว
ใช้แค่ `<PermissionGuard>` ไม่มี `can()` function

**ปัญหา:** บางกรณีต้องการ boolean ในโค้ด (เช่น disable form field หรือ filter menu items) — `<PermissionGuard>` ไม่ยืดหยุ่นพอ

### D. Permission service แยก (class/singleton)
```ts
const permissionService = new PermissionService(user, workspace);
permissionService.can('item.create');
```

**ปัญหา:** overkill สำหรับ frontend — Zustand + simple helper เพียงพอ; service ต้องการ React context หรือ dependency injection เพิ่มความซับซ้อน

---

## Reason

- Backend ส่ง **effective permissions** มาเลย (หลัง apply role defaults + overrides) → Frontend ไม่ต้องคำนวณ permission matrix เอง
- `can()` helper เป็น **pure function** ง่ายต่อ test
- **1 canonical key list** ใน `security/permission-ui.md` ป้องกัน typo และ key drift
- ใช้ทั้ง `can()` function (สำหรับ conditional render ใน JS) และ `<PermissionGuard>` wrapper (สำหรับ JSX) — ครบทุก use case

---

## Consequences

**บวก:**
- ซ่อน/แสดง UI consistent — ทุกที่ใช้ `can()` เดียวกัน
- เปลี่ยน permission logic ที่ backend → frontend รับค่าใหม่อัตโนมัติ ไม่ต้องแก้โค้ด
- Test ง่าย: mock `workspaceStore.permissions` → test `can()` ได้ทันที
- Type-safe ได้ถ้า define `PermissionKey` union type

**ลบ:**
- Frontend **ไม่รู้** permission logic จริง (อยู่ที่ backend) → ถ้า backend เปลี่ยน key name ต้องอัปเดต canonical list ใน docs
- `permissions` array ใน store ต้อง refresh ทุกครั้งที่ permission ถูก override หรือ role เปลี่ยน
- UI permission เป็นแค่ UX layer — backend ต้อง enforce จริงอีกครั้ง
