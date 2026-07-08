# Permission UI — WhereIs Frontend

แนวทางจัดการสิทธิ์การเข้าถึง (authentication + authorization) ในฝั่ง UI

## Access Model
สิทธิ์ที่ UI ใช้ตัดสินใจไม่ได้มาจาก role อย่างเดียว แต่เป็นผลรวมของ:

- **Primary Role**: baseline behavior ของ member
- **Extra Permissions**: เพิ่ม/ลดความสามารถเฉพาะบุคคล
- **Container Access Scope**: กำหนดพื้นที่ที่ member มองเห็นได้

> UI เป็นแค่ UX layer — backend ต้อง enforce จริงเสมอ

## Roles
| Role | สิทธิ์โดยสรุป |
|------|---------------|
| **Owner** | ทุกอย่าง + Permission Override + ลบ Workspace + จัดการสมาชิก/structure |
| **Admin** | จัดการข้อมูลส่วนใหญ่ใน workspace, structure, item, quantity item, reports, notifications, member ตามสิทธิ์ |
| **Member** | งานประจำวัน: เพิ่ม/แก้ item, borrow/return/withdraw/reserve, quantity workflows ตาม permission |
| **Viewer** | ดูอย่างเดียว |

> สิทธิ์จริงมาจาก backend ในรูป effective permission list ต่อ workspace — Frontend สะท้อนผล ไม่ใช่แหล่งความจริง
> สิทธิ์ผูกกับ **workspace ปัจจุบัน** เก็บใน `workspaceStore.permissions`
> Container access scope ต้องถูกอ่านร่วมกับ permission ก่อนแสดง item/container/report/search result

## ระดับการบังคับสิทธิ์
สิทธิ์ฝั่ง UI เป็นแค่ **UX layer** — backend ต้องตรวจซ้ำเสมอ

### 1. Route-level
```
<ProtectedRoute>                  → ต้อง login
<PermissionRoute perm="...">      → ต้องมี permission ที่กำหนด
<ContainerScopeGate>              → ต้องอยู่ใน container scope ที่อนุญาต
```

### 2. Component-level
```tsx
{can('item.create') && <AddItemButton />}
<PermissionGuard perm="item.borrow"><BorrowButton /></PermissionGuard>
```

### 3. API-level
- **401** → token หมดอายุ/ไม่ valid → logout + redirect login
- **403** → ไม่มีสิทธิ์ → แสดง toast/หน้าข้อความ "ไม่มีสิทธิ์"

## Permission keys (canonical — แหล่งความจริงเดียว)
> รายการ key ทั้งหมดของระบบ ทุก module + UI อ้างอิงจากที่นี่

| Permission | ควบคุม UI |
|------------|-----------|
| `workspace.view` | เข้าถึง workspace |
| `workspace.update` | แก้ชื่อ/ตั้งค่า workspace |
| `workspace.delete` | ลบ workspace |
| `member.view` | เมนู/หน้า Members |
| `member.invite` | ปุ่ม Invite |
| `member.update_role` | เปลี่ยน primary role สมาชิก |
| `member.remove` | ลบสมาชิก |
| `permission.override` | จัดการ Permission Override |
| `container.view` | ดู container |
| `container.create` / `container.update` / `container.delete` | จัดการ container tree |
| `container.visibility.manage` | กำหนดว่าใครเห็น container ได้บ้าง |
| `container.access.manage` | จัดการ container access scope ของ member |
| `item.view` | Search / Item Detail / รายการของ |
| `item.create` | ปุ่ม Add Item |
| `item.update` | ปุ่ม Edit Item |
| `item.delete` | ปุ่ม Delete Item |
| `item.move` | ปุ่ม Move |
| `item.borrow` | ปุ่ม Borrow |
| `item.return` | ปุ่ม Return |
| `item.withdraw` | ปุ่ม Withdraw |
| `item.reserve` | ปุ่ม Reserve |
| `item.mark_missing` | ปุ่ม Mark Missing |
| `item.mark_found` | ปุ่ม Mark Found |
| `item.repair` | ปุ่ม Repair / Mark Repairing / Mark Repaired |
| `item.dispose` | ปุ่ม Dispose |
| `stock.view` | ดู item แบบสต็อก / stock summary |
| `stock.consume` | เบิกสต็อก |
| `stock.restock` | เติมสต็อก |
| `stock.count` | ตรวจนับสต็อก |
| `stock.adjust` | ปรับยอดสต็อก |
| `report.view` | ดูรายงาน |
| `report.export` | export report |
| `notification.view` | ดู notification |
| `notification.manage` | จัดการ notification rules / preferences |
| `activity.view` | ดู Activity Log + recent activity |

## Role → Permission defaults (matrix)
> ค่าเริ่มต้นต่อ role; per-member override ปรับเพิ่ม/ลดได้

| Permission group | viewer | member | admin | owner |
|------------------|:------:|:------:|:-----:|:-----:|
| `*.view` (workspace/container/item/stock/activity/report/notification) | ✅ | ✅ | ✅ | ✅ |
| `item.create` / `item.update` | ❌ | ✅ | ✅ | ✅ |
| `item.borrow` / `item.return` | ❌ | ✅ | ✅ | ✅ |
| `item.withdraw` / `item.reserve` | ❌ | ⚠️* | ✅ | ✅ |
| `item.move` | ❌ | ⚠️* | ✅ | ✅ |
| `item.mark_missing` / `item.mark_found` | ❌ | ✅ | ✅ | ✅ |
| `item.repair` | ❌ | ✅ | ✅ | ✅ |
| `item.delete` / `item.dispose` | ❌ | ❌ | ✅ | ✅ |
| `stock.consume` / `stock.restock` / `stock.count` / `stock.adjust` | ❌ | ✅ | ✅ | ✅ |
| `container.create/update/delete` | ❌ | ❌ | ✅ | ✅ |
| `container.visibility.manage` / `container.access.manage` | ❌ | ❌ | ✅ | ✅ |
| `report.view` / `report.export` | ❌ | ❌ | ✅ | ✅ |
| `notification.view` | ❌ | ✅ | ✅ | ✅ |
| `notification.manage` | ❌ | ❌ | ✅ | ✅ |
| `member.view` | ❌ | ❌ | ✅ | ✅ |
| `member.invite` / `member.update_role` / `member.remove` | ❌ | ❌ | ✅ | ✅ |
| `workspace.update` | ❌ | ❌ | ✅ | ✅ |
| `permission.override` / `workspace.delete` | ❌ | ❌ | ❌ | ✅ |

\* `item.move`, `item.withdraw`, และ `item.reserve` อาจปิดสำหรับ member โดยค่าเริ่มต้น; เปิดได้ผ่าน override
> owner มี permission ครบเสมอ

## แหล่งเก็บสถานะ Auth
- token + user เก็บใน **Zustand** `authStore`
- permission ของ workspace ปัจจุบันเก็บใน `workspaceStore.permissions`
- `useAuth()` / `usePermission()` เป็น hook กลางสำหรับอ่าน user/role และ `can(permission)`

## Container Access Scope
Container access scope เป็นอีกชั้นที่แยกจาก permission:

- permission ตอบว่า "ทำอะไรได้"
- container access scope ตอบว่า "ทำกับพื้นที่ไหน"

ผลต่อ UI:
- Sidebar ซ่อน container tree ที่อยู่นอก scope
- Search แสดงผลเฉพาะ item ใน scope และ container ที่เห็นได้
- Dashboard cards, reports, และ item detail ต้องนับจากข้อมูลที่เข้าถึงได้จริง
- Recent activity / history ต้องไม่ leak รายการที่อยู่นอก scope

> Open question: backend จะส่ง scope เป็น container id list, subtree list, หรือ policy object แบบอื่น

## หลักการ UX
- ไม่มีสิทธิ์ → **ซ่อน** ปุ่ม
- redirect ที่เกิดจากสิทธิ์ ทำที่ guard ที่เดียว
- หน้า 403 มีปุ่มกลับ Dashboard

## เอกสารที่เกี่ยวข้อง
- [screen-flow.md](../ui/screen-flow.md)
- [state-management.md](../state/state-management.md)
- [api-contract.md](../api/api-contract.md)
