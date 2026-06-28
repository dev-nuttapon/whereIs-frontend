# Layout — WhereIs Frontend

โครงหน้าจอ (shell) ระดับแอป: layout มีกี่แบบ, ประกอบด้วยอะไร, responsive อย่างไร
ดูกติกาเขียน component ที่ [component-rules.md](component-rules.md) และ navigation ที่ [screen-flow.md](screen-flow.md)

## 1. Layout มี 3 แบบ
| Layout | ใช้กับ | ไฟล์ |
|--------|--------|------|
| **AuthLayout** | หน้า public: Login, Register | `src/layouts/AuthLayout.tsx` |
| **WorkspaceSelectLayout** | หน้า Workspace List (login แล้ว แต่ยังไม่เลือก ws) | `src/layouts/WorkspaceSelectLayout.tsx` |
| **AppLayout** | ทุกหน้าใน workspace (Dashboard, Search, Sites…) | `src/layouts/AppLayout.tsx` |

## 2. AuthLayout
```
┌───────────────────────────────┐
│                               │
│        [ WhereIs Logo ]       │
│      ┌─────────────────┐      │
│      │   form card     │      │
│      │  (login/register)│     │
│      └─────────────────┘      │
│                               │
└───────────────────────────────┘
```
- จัดกึ่งกลาง, ความกว้าง card คงที่ (เช่น `max-w-sm`)
- ไม่มี sidebar/topbar
- mobile: card เต็มความกว้างมี padding

## 3. AppLayout (หลัก)
```
┌──────────────────────────────────────────────────────┐
│ Topbar:  [≡] [Workspace ▾]   [ Global Search ]   [🔔][User ▾] │
├───────────┬──────────────────────────────────────────┤
│ Sidebar   │  Breadcrumb                              │
│           │  ┌────────────────────────────────────┐  │
│ • Dashboard│  │                                    │  │
│ • Search  │  │        Main Content (page)         │  │
│ • Sites   │  │                                    │  │
│ • Members │  │                                    │  │
│ • Activity│  └────────────────────────────────────┘  │
│ • Settings│                                          │
└───────────┴──────────────────────────────────────────┘
```

### Topbar
- ปุ่ม toggle sidebar (mobile/tablet)
- **Workspace switcher** (dropdown) — เปลี่ยน workspace ปัจจุบัน (ดู [modules/workspace.md](../modules/workspace.md))
- **Global Search** — เด่นเสมอ, เข้าถึงได้ทุกหน้า (ดู [modules/search.md](../modules/search.md))
- Notifications (future), **User menu** (profile, logout)

### Sidebar
- เมนูหลัก ตาม [navigation](screen-flow.md)
- แต่ละ item **ซ่อน/แสดงตาม permission** (ดู [permission-ui.md](../security/permission-ui.md))
- ไฮไลต์ route ปัจจุบัน (active state)
- collapse ได้ (เก็บสถานะใน `uiStore.sidebarOpen` — ดู [state-management.md](../state/state-management.md))

### Content area
- มี **Breadcrumb** ด้านบน (เช่น `Sites > Building A > Room 1`)
- page content render ตรงนี้ (ผ่าน `<Outlet/>` ของ React Router)
- กว้างสุด `max-w-screen-xl` จัดกึ่งกลาง สำหรับจอใหญ่

## 4. Responsive behavior
| Breakpoint | Sidebar | Topbar search | Content |
|------------|---------|---------------|---------|
| **Desktop** (≥1024px) | แสดงถาวร (คง pin) | inline ใน topbar | หลาย column ได้ |
| **Tablet** (640–1023px) | collapse เป็น icon / toggle ได้ | inline ย่อ | 1–2 column |
| **Mobile** (<640px) | ซ่อน → เปิดเป็น **drawer** overlay | ย่อเป็น icon → กดแล้วขยาย / ไปหน้า Search | 1 column, card เรียงแนวตั้ง |

- **Desktop-first** แต่ต้องใช้งานได้จริงบน mobile
- Tailwind breakpoints: `sm`/`md`/`lg`/`xl` (ดู [theme.md](theme.md))
- บน mobile ปุ่ม action ที่อยู่บน topbar/sidebar ให้ย้ายเข้า drawer หรือ bottom area ตามเหมาะสม

## 5. กฎของ layout
- page **ไม่จัดการ** topbar/sidebar เอง — เป็นหน้าที่ของ AppLayout
- page รับผิดชอบเฉพาะเนื้อหา + breadcrumb ของตัวเอง
- ตั้ง breadcrumb ผ่าน convention เดียว (เช่น hook `usePageBreadcrumb()` หรือ prop ของ page wrapper) ไม่ render breadcrumb ซ้ำซ้อน
- redirect ที่เกิดจาก auth/permission ทำที่ route guard ไม่ทำใน layout

## 6. Definition of Done (layout)
- [ ] AuthLayout / WorkspaceSelectLayout / AppLayout ครบ
- [ ] Sidebar ซ่อน/แสดงเมนูตาม permission + active state
- [ ] Topbar มี workspace switcher + global search + user menu
- [ ] Responsive: desktop pin / tablet collapse / mobile drawer
- [ ] Breadcrumb แสดงตามตำแหน่งจริง
- [ ] รองรับ loading/empty ของ shell (เช่น ตอนโหลด workspace)
