# UI — WhereIs Frontend

เอกสาร UI/UX: design system, layout, navigation, patterns และกติกา component

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| [ui-overview.md](ui-overview.md) | design principles, UI states (Loading/Empty/Error/Success), status keys |
| [layout.md](layout.md) | 3 layout types + wireframe + responsive behavior |
| [theme.md](theme.md) | design tokens, Tailwind CSS variables, colors, typography, spacing |
| [screen-flow.md](screen-flow.md) | route map + navigation flow diagram + กฎ navigation |
| [component-rules.md](component-rules.md) | กฎ component tiers, styling (Tailwind/shadcn), forms, TypeScript |
| [navigation.md](navigation.md) | Topbar, Sidebar, Breadcrumb, menu hierarchy, route relationships |
| [ui-patterns.md](ui-patterns.md) | Loading, Empty, Error, Card, Dialog, Drawer, Search, Filter, Pagination, Status Badge |

---

## ลำดับการอ่าน

1. `ui-overview.md` — หลักการออกแบบ + 4 UI states
2. `layout.md` — โครงหน้าจอ 3 แบบ
3. `navigation.md` — Topbar + Sidebar + Breadcrumb
4. `theme.md` — design tokens + status colors
5. `component-rules.md` — กฎก่อนเขียน component
6. `ui-patterns.md` — pattern เฉพาะแต่ละ UI element
7. `screen-flow.md` — route ทั้งหมด + flow

> อ่าน `layout.md` และ `navigation.md` คู่กัน — layout บอกโครงสร้าง, navigation บอก behavior

---

## Maintenance Guidelines

- **theme.md** คือ single source of truth ของ design tokens — ห้าม hardcode สีหรือ spacing ในโค้ดถ้าไม่มีใน token
- **ui-patterns.md** อัปเดตเมื่อเพิ่ม pattern ใหม่ที่ใช้ >2 หน้า
- **screen-flow.md** ต้อง sync กับ `src/routes/index.tsx` เสมอ — เพิ่ม route ใหม่ให้อัปเดตพร้อมกัน
- **navigation.md** ต้อง sync กับ permission matrix ใน [security/permission-ui.md](../security/permission-ui.md)
