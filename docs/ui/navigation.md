# Navigation — WhereIs Frontend

โครงสร้าง navigation ของ WhereIs ประกอบด้วย 3 ชั้น: **Topbar**, **Sidebar**, และ **Breadcrumb**
ดูโครงหน้าจอที่ [layout.md](layout.md) และ route ทั้งหมดที่ [screen-flow.md](screen-flow.md)

---

## 1. Topbar

แสดงทุกหน้าที่อยู่ใน `AppLayout`

| ส่วนประกอบ | component | หน้าที่ |
|------------|-----------|---------|
| Sidebar toggle `[≡]` | `SidebarToggle` | เปิด/ปิด sidebar |
| Workspace Switcher | `WorkspaceSwitcher` | เลือก/สลับ workspace |
| Global Search Bar | `GlobalSearchBar` | ค้นหาของจากทุกหน้า และเข้า search flow |
| Notification Bell | `NotificationButton` | เปิด notification center / reminder feed |
| User Menu | `UserMenu` | profile, logout |

### Workspace Switcher
- แสดงชื่อ workspace ปัจจุบัน
- เลือก workspace → อัปเดต `workspaceStore` → navigate ไป `/w/:wsId`

### Global Search Bar
- primary entry point ของระบบ
- navigate ไป `/w/:wsId/search?q=...`

---

## 2. Sidebar

แสดงเฉพาะใน `AppLayout`

| เมนู | Route | Permission | หมายเหตุ |
|------|-------|------------|----------|
| Dashboard | `/w/:wsId` | — | หน้าหลัก |
| Search | `/w/:wsId/search` | `item.view` | ค้นหาของ |
| Storage Structure | `/w/:wsId/structure` | `container.view` | tree หลัก |
| Members | `/w/:wsId/members` | `member.view` | จัดการสมาชิก |
| Activity | `/w/:wsId/activity` | `activity.view` | ประวัติกิจกรรม |
| Reports | `/w/:wsId/reports` | `report.view` | รายงาน |
| Notifications | `/w/:wsId/notifications` | `notification.view` | แจ้งเตือนและ reminder |
| Settings | `/w/:wsId/settings` | — | ตั้งค่า |

> เมนูที่ user ไม่มี permission → ซ่อนทั้งรายการ

---

## 3. Breadcrumb

| Route | Breadcrumb |
|-------|------------|
| `/w/:wsId` | Dashboard |
| `/w/:wsId/structure` | Storage Structure |
| `/w/:wsId/containers/:id` | Storage Structure > {containerName} |
| `/w/:wsId/items/:id` | Storage Structure > {containerName} > {itemName} |
| `/w/:wsId/members` | Members |
| `/w/:wsId/members/:memberId` | Members > {memberName} |
| `/w/:wsId/activity` | Activity |
| `/w/:wsId/search` | Search |
| `/w/:wsId/reports` | Reports |
| `/w/:wsId/notifications` | Notifications |

---

## 4. Menu Hierarchy

```
Root (authenticated)
├── /workspaces
│   └── /workspaces/new
└── /w/:wsId
    ├── /
    ├── /search
    ├── /items/:id
    ├── /items/new
    ├── /items/:id/edit
    ├── /structure
    │   └── /containers/:id
    ├── /members
    │   └── /members/:memberId
    ├── /activity
    ├── /reports
    ├── /notifications
    └── /settings
```

## 5. Guard ลำดับ
```
AppLayout routes
  → ProtectedRoute
    → WorkspaceRoute
      → PermissionRoute
```

---

## เอกสารที่เกี่ยวข้อง
- [layout.md](layout.md)
- [screen-flow.md](screen-flow.md)
- [security/permission-ui.md](../security/permission-ui.md)
- [state/state-management.md](../state/state-management.md)
