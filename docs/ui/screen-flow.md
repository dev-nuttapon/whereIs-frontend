# Screen Flow — WhereIs Frontend

แผนผังหน้าจอ, route mapping และ flow การเดินระหว่างหน้าจอ

## Route Map

> path เป็นค่าเริ่มต้น ปรับตาม requirement จริง ทุก route หลัง login ผูกกับ workspace ปัจจุบัน

| Route | หน้าจอ | สิทธิ์ที่ต้องมี | หมายเหตุ |
|-------|--------|----------------|----------|
| `/login` | Login | public | login แล้ว redirect ออก |
| `/register` | Register | public | สมัครใช้งาน |
| `/workspaces` | Workspace List | authenticated | เลือก/สร้าง workspace |
| `/w/:wsId` | Dashboard | member ของ ws | หน้าหลักของ workspace |
| `/w/:wsId/search` | Item Search | `item.view` | ค้นหาสิ่งของ |
| `/w/:wsId/items/:id` | Item Detail | `item.view` | รายละเอียด + actions |
| `/w/:wsId/items/new` | Add Item | `item.create` | ฟอร์มเพิ่มของ |
| `/w/:wsId/items/:id/edit` | Edit Item | `item.update` | ฟอร์มแก้ไข |
| `/w/:wsId/sites` | Site List | `site.view` | จัดการ Site |
| `/w/:wsId/sites/:siteId` | Site Detail | `site.view` | รายละเอียด site |
| `/w/:wsId/sites/:siteId/explorer` | Location Explorer | `location.view` | tree ของ location/container ใน site |
| `/w/:wsId/containers/:id` | Container Detail | `container.view` | ของในกล่อง + QR |
| `/w/:wsId/members` | Members | `member.view` | จัดการสมาชิก |
| `/w/:wsId/members/:memberId` | Member Detail / Permissions | `member.view` (+`permission.override` แก้สิทธิ์) | role + permission override |
| `/w/:wsId/activity` | Activity Log | `activity.view` | ประวัติเหตุการณ์ |
| `/w/:wsId/settings` | Settings | member ของ ws | ตั้งค่า workspace/ผู้ใช้ |
| `*` | Not Found | public | 404 |

> สิทธิ์บังคับใช้ผ่าน route guard — ดู [permission-ui.md](../security/permission-ui.md)

## Flow หลัก

### 1. Main Flow (ค้นหาของ)
```
[Login] → [Workspace List] → [Dashboard] → [Search Item] → [Item Detail]
```

### 2. Manage Storage Flow
```
[Dashboard] → [Sites] → [Site Detail] → [Location Explorer]
                                              → [Container Detail] → [Add Item]
```

### 3. Item Action Flow (ที่ Item Detail)
```
[Item Detail]
   ├─ Move Item      (item.move)
   ├─ Take Out       (item.takeout)
   ├─ Return         (item.return)
   ├─ Mark Missing   (item.mark_missing)
   └─ Mark Found
```
แต่ละ action = mutation → สำเร็จแล้ว invalidate query ที่เกี่ยว (ดู [state-management.md](../state/state-management.md#cache-rules))

### 4. Member Flow
```
[Dashboard] → [Members] → [Invite Member] → [Change Role] → [Permission Override]
```

### 5. Auth Flow
```
[เปิดแอป]
   ├─ มี token valid? ── ใช่ ──► [Workspace List / last workspace]
   └─ ไม่ ──► [Login] ── submit ──► API auth
                                      ├─ สำเร็จ → เก็บ token → [Workspace List]
                                      └─ ล้มเหลว → error บนฟอร์ม
```

## รายละเอียดหน้าจอหลัก

### Login
Email, Password, Login Button, Register Link

### Workspace List
รายการ Workspace, ปุ่ม Create Workspace

### Dashboard
Search Bar (เด่น), Total Items, Stored, Taken Out, Missing, Recent Activity

### Location Explorer
Tree View (Site → Location → Container), Add Location, Add Container, View Container

### Container Detail
Container Photo, Code, QR Code, Item List, Add Item

### Item Search
Keyword Search, Filter by Site, Filter by Status, Result Card (รูป/สถานะ/ตำแหน่ง)

### Item Detail
Photo, Name, Status, Current Location, Current Holder, Event History, Action Buttons

### Members
Member List, Role, Invite, Permission Override

## Navigation Rules
- ใช้ `<Link>` / `useNavigate` ของ React Router เท่านั้น ห้าม `window.location` ตรงๆ
- หลัง mutation สำเร็จ → navigate + invalidate query ที่เกี่ยวข้อง
- redirect จาก permission จัดการรวมที่ guard ที่เดียว
- ทุกหน้าที่โหลดข้อมูลรองรับ loading / empty / error / success (ดู [ui-overview.md](ui-overview.md))

## เอกสารที่เกี่ยวข้อง
- [permission-ui.md](../security/permission-ui.md) — guard และการซ่อน/แสดงตามสิทธิ์
- [api-contract.md](../api/api-contract.md) — endpoint ที่แต่ละหน้าเรียก
- [ui-overview.md](ui-overview.md) — layout และ UI states
