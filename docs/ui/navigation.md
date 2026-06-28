# Navigation — WhereIs Frontend

โครงสร้าง navigation ของ WhereIs ประกอบด้วย 3 ชั้น: **Topbar**, **Sidebar**, และ **Breadcrumb**
ดูโครงหน้าจอที่ [layout.md](layout.md) และ route ทั้งหมดที่ [screen-flow.md](screen-flow.md)

---

## 1. Topbar

แสดงทุกหน้าที่อยู่ใน `AppLayout` — ผู้ใช้เข้าถึงได้ตลอดเวลา

```
┌──────────────────────────────────────────────────────┐
│ [≡]  [Workspace A ▾]   [🔍 ค้นหาของ…]   [🔔] [User ▾]│
└──────────────────────────────────────────────────────┘
```

| ส่วนประกอบ | component | หน้าที่ |
|------------|-----------|---------|
| Sidebar toggle `[≡]` | `SidebarToggle` | เปิด/ปิด sidebar (mobile/tablet) |
| Workspace Switcher | `WorkspaceSwitcher` | dropdown เลือก/สลับ workspace |
| Global Search Bar | `GlobalSearchBar` | ค้นหาของจากทุกหน้า → `/w/:wsId/search?q=…` |
| Notifications *(future)* | — | การแจ้งเตือน |
| User Menu | `UserMenu` | profile, logout |

### Workspace Switcher
- แสดงชื่อ workspace ปัจจุบัน
- dropdown รายการ workspace ที่ user เป็นสมาชิก
- เลือก workspace → อัปเดต `workspaceStore` → navigate ไป `/w/:wsId`
- ดูรายละเอียดที่ [modules/workspace.md](../modules/workspace.md)

### Global Search Bar
- เด่น ทุกหน้า — เป็น primary entry point ของ core feature
- placeholder: `ค้นหาของ…`
- กด Enter หรือ debounce 300ms → navigate `/w/:wsId/search?q=<keyword>`
- คีย์ลัด `Cmd+K` / `/` (future) เพื่อ focus
- ดูรายละเอียดที่ [modules/search.md](../modules/search.md)

---

## 2. Sidebar

แสดงเฉพาะใน `AppLayout` — เมนูหลักของ workspace ปัจจุบัน

### รายการเมนู

| ลำดับ | เมนู | Route | Permission ที่ต้องมี | หมายเหตุ |
|-------|------|-------|---------------------|----------|
| 1 | Dashboard | `/w/:wsId` | — (member ทุกคน) | หน้าหลัก |
| 2 | Search | `/w/:wsId/search` | `item.view` | ฟีเจอร์หลัก |
| 3 | Sites | `/w/:wsId/sites` | `site.view` | จัดการสถานที่ |
| 4 | Members | `/w/:wsId/members` | `member.view` | จัดการสมาชิก |
| 5 | Activity | `/w/:wsId/activity` | `activity.view` | ประวัติกิจกรรม |
| 6 | Settings | `/w/:wsId/settings` | — (member ทุกคน) | ตั้งค่า |

> เมนูที่ user ไม่มี permission → **ซ่อน** ทั้งรายการ (ไม่ disable) ดู [permission-ui.md](../security/permission-ui.md)

### Active State
- เปรียบเทียบ pathname ปัจจุบันกับ route ของแต่ละเมนู
- ไฮไลต์ด้วย `bg-primary/10 text-primary font-medium`
- nested route (เช่น `/w/:wsId/sites/:siteId`) → parent `Sites` active ด้วย (prefix match)

### Collapse / Responsive
| Breakpoint | พฤติกรรม | State |
|------------|----------|-------|
| Desktop ≥1024px | แสดงถาวร (pin) | `sidebarOpen: true` (default) |
| Tablet 640–1023px | collapse เป็น icon / toggle ได้ | `uiStore.sidebarOpen` |
| Mobile <640px | ซ่อน → เปิดเป็น Drawer overlay | `uiStore.sidebarOpen` |

- สถานะ `sidebarOpen` เก็บใน `uiStore` (ดู [state/state-management.md](../state/state-management.md))
- ปิด sidebar อัตโนมัติหลัง navigate บน mobile

---

## 3. Breadcrumb

แสดงตำแหน่งปัจจุบันในระบบ — ทุก segment คลิกเพื่อ navigate ขึ้น

### Pattern ตาม route
| Route | Breadcrumb |
|-------|------------|
| `/w/:wsId` | Dashboard |
| `/w/:wsId/sites` | Sites |
| `/w/:wsId/sites/:siteId` | Sites > {siteName} |
| `/w/:wsId/sites/:siteId/explorer` | Sites > {siteName} > Explorer |
| `/w/:wsId/containers/:id` | Sites > {siteName} > {locationName} > {containerName} |
| `/w/:wsId/items/:id` | Sites > {siteName} > … > {containerName} > {itemName} |
| `/w/:wsId/members` | Members |
| `/w/:wsId/members/:memberId` | Members > {memberName} |
| `/w/:wsId/activity` | Activity |
| `/w/:wsId/search` | Search |

### กฎ
- แต่ละ segment เป็น `<Link>` คลิกได้ (ยกเว้น segment สุดท้าย = current page)
- ใช้ `usePageBreadcrumb()` hook หรือ prop `breadcrumb` บน page wrapper — ห้าม render breadcrumb ซ้ำหลายที่
- loading: แสดง skeleton หรือ fallback ชื่อ (ขณะรอ fetch ชื่อ site/item)

---

## 4. Menu Hierarchy

```
Root (authenticated)
├── /workspaces                     WorkspaceSelectLayout
│   └── /workspaces/new
│
└── /w/:wsId                        AppLayout (Topbar + Sidebar)
    ├── (Dashboard)
    ├── /search
    ├── /items/:id
    ├── /items/new
    ├── /items/:id/edit
    ├── /sites
    │   ├── /sites/:siteId
    │   └── /sites/:siteId/explorer
    │       └── /containers/:id
    ├── /members
    │   └── /members/:memberId
    ├── /activity
    └── /settings

Public (AuthLayout, no sidebar)
├── /login
└── /register
```

---

## 5. Route Relationships

### Layout → Route mapping
| Layout | Routes |
|--------|--------|
| `AuthLayout` | `/login`, `/register` |
| `WorkspaceSelectLayout` | `/workspaces`, `/workspaces/new` |
| `AppLayout` | ทุก route ที่ขึ้นต้นด้วย `/w/:wsId` |

### Sidebar item → sub-routes
- **Sites** เมนู active เมื่อ pathname มี `/sites` หรือ `/containers` (container อยู่ใต้ site tree)
- **Search** เมนู active เมื่อ pathname เป็น `/search` หรือ `/items/*` (item detail เป็นผลจาก search)

### Guard ลำดับ
```
AppLayout routes
  → ProtectedRoute (ต้อง login)
    → WorkspaceRoute (ต้องเป็นสมาชิก ws นั้น)
      → PermissionRoute (ต้องมี permission เฉพาะ route)
```
- 401 → redirect `/login`
- 403 (ไม่ใช่สมาชิก ws) → redirect `/workspaces`
- 403 (ไม่มี permission) → แสดงหน้า "ไม่มีสิทธิ์"

---

## เอกสารที่เกี่ยวข้อง
- [layout.md](layout.md) — โครงหน้าจอ AppLayout / AuthLayout
- [screen-flow.md](screen-flow.md) — route map + flow ทั้งหมด
- [security/permission-ui.md](../security/permission-ui.md) — กติกาซ่อน/แสดงเมนูตาม permission
- [state/state-management.md](../state/state-management.md) — uiStore (sidebarOpen), workspaceStore
- [modules/search.md](../modules/search.md) — Global Search
- [modules/workspace.md](../modules/workspace.md) — Workspace Switcher
