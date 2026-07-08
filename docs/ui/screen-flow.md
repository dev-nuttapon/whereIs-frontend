# Screen Flow — WhereIs Frontend

แผนผังหน้าจอ, route mapping และ flow การเดินระหว่างหน้าจอ

## Route Map

| Route | หน้าจอ | สิทธิ์ที่ต้องมี | หมายเหตุ |
|-------|--------|----------------|----------|
| `/login` | Login | public | login แล้ว redirect ออก |
| `/register` | Register | public | สมัครใช้งาน |
| `/workspaces` | Workspace List | authenticated | เลือก/สร้าง workspace |
| `/w/:wsId` | Dashboard | member ของ ws | หน้าหลักของ workspace |
| `/w/:wsId/search` | Item Search | `item.view` | ค้นหาของ |
| `/w/:wsId/items/:id` | Item Detail | `item.view` | individual/quantity detail + actions |
| `/w/:wsId/items/new` | Add Item | `item.create` | ฟอร์มเพิ่มของ |
| `/w/:wsId/items/:id/edit` | Edit Item | `item.update` | ฟอร์มแก้ไข |
| `/w/:wsId/structure` | Storage Structure | `container.view` | tree ของ container ทั้ง workspace |
| `/w/:wsId/containers/:id` | Container Detail | `container.view` | child containers + items |
| `/w/:wsId/members` | Members | `member.view` | จัดการสมาชิก |
| `/w/:wsId/members/:memberId` | Member Detail / Permissions | `member.view` (+`permission.override`) | role + permission override |
| `/w/:wsId/activity` | Activity Log | `activity.view` | ประวัติเหตุการณ์ |
| `/w/:wsId/reports` | Reports | `report.view` | summary / export |
| `/w/:wsId/notifications` | Notifications | `notification.view` | reminders / important dates |
| `/w/:wsId/settings` | Settings | member ของ ws | ตั้งค่า workspace/ผู้ใช้ |
| `/w/:wsId/settings/notifications` | Notification Settings | `notification.manage` | reminder / preference controls |
| `*` | Not Found | public | 404 |

## Flow หลัก

### 1. Main Flow (ค้นหาของ)
```
[Login] → [Workspace List] → [Dashboard] → [Search Item] → [Item Detail]
```

### 2. Manage Storage Flow
```
[Dashboard] → [Storage Structure] → [Container Detail] → [Add Item]
```

### 3. Item Action Flow (ที่ Item Detail)
```
[Item Detail]
   ├─ Move Item      (item.move)
   ├─ Borrow         (item.borrow)
   ├─ Return         (item.return)
   ├─ Withdraw       (item.withdraw)
   ├─ Reserve        (item.reserve)
   ├─ Repair         (item.repair)
   ├─ Consume Stock  (stock.consume)
   ├─ Restock Stock  (stock.restock)
   ├─ Count Stock    (stock.count)
   ├─ Adjust Stock   (stock.adjust)
   ├─ Mark Missing   (item.mark_missing)
   └─ Mark Found
```

### 4. Member Flow
```
[Dashboard] → [Members] → [Invite Member] → [Change Role] → [Permission Override]
```

### 5. Progressive Disclosure Flow
```
[Dashboard / Search / Container]
   ├─ แสดง summary ก่อน
   ├─ เปิด detail เมื่อจำเป็น
   └─ เปิด workflow dialog เฉพาะ action ที่ผู้ใช้มีสิทธิ์
```
### 6. Auth Flow
```
[เปิดแอป]
   ├─ มี token valid? ── ใช่ ──► [Workspace List / last workspace]
   └─ ไม่ ──► [Login] ── submit ──► API auth
                                      ├─ สำเร็จ → เก็บ token → [Workspace List]
                                      └─ ล้มเหลว → error บนฟอร์ม
```

## รายละเอียดหน้าจอหลัก

### Dashboard
- Search Bar
- Total Items
- Stored / Borrowed / Missing
- Low Stock / Out of Stock / Reservation Waiting / Overdue Return / Repair Queue
- Recent Activity
- Notifications preview
- Reports shortcut

### Storage Structure
- Tree View ของ container
- เพิ่ม/แก้/ลบ node
- แสดง visibility rule ถ้ามี

### Container Detail
- Container name
- Child containers
- Item list

### Item Search
- Keyword Search
- Filter by type / status / container / current holder / location / expiry / warranty / maintenance / overdue return / reservation waiting / missing / repair / disposal

### Item Detail
- ข้อมูลหลัก
- สถานะ
- current container / holder
- unit conversion / batch / lot / received date / expiry date
- warranty / maintenance / custom schedule
- event history
- action buttons ตาม type

### Members
- Member List
- Role
- Extra Permissions
- Container Access Scope
- Invite
- Permission Override

## Navigation Rules
- ใช้ `<Link>` / `useNavigate` ของ React Router เท่านั้น
- หลัง mutation สำเร็จ → navigate + invalidate query ที่เกี่ยวข้อง
- redirect จาก permission จัดการรวมที่ guard ที่เดียว

## เอกสารที่เกี่ยวข้อง
- [permission-ui.md](../security/permission-ui.md)
- [api-contract.md](../api/api-contract.md)
- [ui-overview.md](ui-overview.md)
