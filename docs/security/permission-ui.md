# Permission UI — WhereIs Frontend

แนวทางจัดการสิทธิ์การเข้าถึง (authentication + authorization) ในฝั่ง UI

## Roles
| Role | สิทธิ์โดยสรุป |
|------|---------------|
| **Owner** | ทุกอย่าง + Permission Override + ลบ Workspace |
| **Admin** | จัดการ Site / Location / Container / Member + Invite |
| **Member** | Search, Add Item, Take Out, Return (Move ถ้ามี permission) |
| **Viewer** | ดูอย่างเดียว (Search + Item Detail) ไม่มีปุ่ม action |

> สิทธิ์จริงมาจาก backend ในรูป **permission list** ต่อ workspace — Frontend สะท้อนผล ไม่ใช่แหล่งความจริง
> สิทธิ์ผูกกับ **workspace ปัจจุบัน** เก็บใน `workspaceStore.permissions` (ดู [state-management.md](../state/state-management.md))

## ระดับการบังคับสิทธิ์
สิทธิ์ฝั่ง UI เป็นแค่ **UX layer** — backend ต้องตรวจซ้ำเสมอ (FE ซ่อนปุ่มได้แต่กัน request จริงไม่ได้)

### 1. Route-level (Route Guard)
```
<ProtectedRoute>                  → ต้อง login
<PermissionRoute perm="...">      → ต้องมี permission ที่กำหนด
```
- ยังไม่ login → redirect `/login`
- login แล้วแต่ไม่มีสิทธิ์ → แสดงหน้า `403 / ไม่มีสิทธิ์`

### 2. Component-level (`PermissionGuard` / `can()`)
ซ่อน/แสดง element ตาม permission
```tsx
{can('item.create') && <AddItemButton />}
// หรือ
<PermissionGuard perm="item.move"><MoveButton /></PermissionGuard>
```
ใช้ helper กลาง (`useAuth()` / `usePermission()`) — ห้ามเช็ค `role === 'admin'` กระจายทั่วโค้ด

### 3. API-level (Response handling)
- **401** → token หมดอายุ/ไม่ valid → logout + redirect login (รวมที่ axios interceptor)
- **403** → ไม่มีสิทธิ์ → แสดง toast/หน้าข้อความ "ไม่มีสิทธิ์"

ดูตาราง status ใน [api-contract.md](../api/api-contract.md#http-status-ที่-frontend-ต้องจัดการ)

## Permission keys (canonical — แหล่งความจริงเดียว)
> นี่คือรายการ key ทั้งหมดของระบบ ทุก module + UI อ้างอิงจากที่นี่ ห้ามคิด key ใหม่นอกรายการนี้โดยไม่อัปเดตที่นี่ก่อน

| Permission | ควบคุม UI |
|------------|-----------|
| `workspace.view` | เข้าถึง workspace |
| `workspace.update` | แก้ชื่อ/ตั้งค่า workspace |
| `workspace.delete` | ลบ workspace (Owner) |
| `member.view` | เมนู/หน้า **Members** |
| `member.invite` | ปุ่ม **Invite** |
| `member.update_role` | เปลี่ยน role สมาชิก |
| `member.remove` | ลบสมาชิก |
| `permission.override` | จัดการ **Permission Override** (Owner) |
| `site.view` | ดู Site |
| `site.create` / `site.update` / `site.delete` | ปุ่ม Add/Edit/Delete Site |
| `location.view` | ดู Location Explorer |
| `location.create` / `location.update` / `location.delete` | จัดการ Location |
| `container.view` | ดู Container |
| `container.create` / `container.update` / `container.delete` | จัดการ Container |
| `item.view` | Search / Item Detail / รายการของ |
| `item.create` | ปุ่ม **Add Item** |
| `item.update` | ปุ่ม **Edit Item** |
| `item.delete` | ปุ่ม **Delete Item** |
| `item.move` | ปุ่ม **Move** |
| `item.takeout` | ปุ่ม **Take Out** |
| `item.return` | ปุ่ม **Return** |
| `item.mark_missing` | ปุ่ม **Mark Missing** |
| `item.mark_found` | ปุ่ม **Mark Found** |
| `item.dispose` | ปุ่ม **Dispose** |
| `activity.view` | ดู Activity Log + recent activity |

> ตั้งชื่อ key เป็น `domain.action` (snake_case) เสมอ ดู [domain-model.md](../architecture/domain-model.md#8-กฎการตั้งชื่อ)

## Role → Permission defaults (matrix)
> ค่าเริ่มต้นต่อ role; per-member **override** ปรับเพิ่ม/ลดได้ (ดู [modules/permission.md](../modules/permission.md)) effective = role default ± override

| Permission group | viewer | member | admin | owner |
|------------------|:------:|:------:|:-----:|:-----:|
| `*.view` (workspace/site/location/container/item) | ✅ | ✅ | ✅ | ✅ |
| `activity.view` | ✅ | ✅ | ✅ | ✅ |
| `item.create` / `item.update` | ❌ | ✅ | ✅ | ✅ |
| `item.takeout` / `item.return` | ❌ | ✅ | ✅ | ✅ |
| `item.move` | ❌ | ⚠️* | ✅ | ✅ |
| `item.mark_missing` / `item.mark_found` | ❌ | ✅ | ✅ | ✅ |
| `item.delete` / `item.dispose` | ❌ | ❌ | ✅ | ✅ |
| `site/location/container.create/update/delete` | ❌ | ❌ | ✅ | ✅ |
| `member.view` | ❌ | ❌ | ✅ | ✅ |
| `member.invite` / `member.update_role` / `member.remove` | ❌ | ❌ | ✅ | ✅ |
| `workspace.update` | ❌ | ❌ | ✅ | ✅ |
| `permission.override` / `workspace.delete` | ❌ | ❌ | ❌ | ✅ |

\* `item.move` ค่าเริ่มต้นปิดสำหรับ member; เปิดได้ผ่าน override
> owner มี permission ครบเสมอ (แก้ไม่ได้)

## แหล่งเก็บสถานะ Auth
- token + user เก็บใน **Zustand** `authStore`
- permission ของ workspace ปัจจุบันเก็บใน `workspaceStore.permissions`
- `useAuth()` / `usePermission()` เป็น hook กลางสำหรับอ่าน user/role และ `can(permission)`
- token persist ใน storage ตามนโยบาย (ดู [state-management.md](../state/state-management.md))

## หลักการ UX
- ไม่มีสิทธิ์ → **ซ่อน** ปุ่ม (ดีกว่า disable เฉยๆ)
- redirect ที่เกิดจากสิทธิ์ ทำที่ guard ที่เดียว
- หน้า 403 มีปุ่มกลับ Dashboard

## เอกสารที่เกี่ยวข้อง
- [screen-flow.md](../ui/screen-flow.md) — route ไหนต้องสิทธิ์อะไร
- [state-management.md](../state/state-management.md) — authStore / workspaceStore
- [api-contract.md](../api/api-contract.md) — การจัดการ 401/403
