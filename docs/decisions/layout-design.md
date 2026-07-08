# ADR: Layout Design

**สถานะ:** Accepted
**วันที่:** 2026-06-28
**เกี่ยวข้อง:** [ui/layout.md](../ui/layout.md) · [ui/navigation.md](../ui/navigation.md)

---

## Problem

WhereIs เป็นแอปที่มี 3 context ชัดเจน:
1. **Unauthenticated** — ผู้ใช้ยังไม่ login (Login, Register)
2. **Authenticated แต่ไม่มี workspace** — ผู้ใช้ login แล้วแต่ต้องเลือก workspace ก่อน
3. **Inside workspace** — ผู้ใช้อยู่ใน workspace และทำงานกับ containers/items/members

โจทย์: จะออกแบบ layout shell อย่างไรให้ context แต่ละอันชัดเจน ไม่ปนกัน และ Topbar + Sidebar รู้สึก consistent

---

## Decision

ใช้ **3 layout แยกกัน**:
| Layout | ใช้กับ | มี Sidebar? | มี Topbar? |
|--------|--------|-------------|------------|
| `AuthLayout` | Login, Register | ❌ | ❌ |
| `WorkspaceSelectLayout` | Workspace List, Create | ❌ | minimal |
| `AppLayout` | ทุก route ใน `/w/:wsId/*` | ✅ | ✅ (full) |

`AppLayout` ประกอบด้วย: **Topbar** (workspace switcher + global search + notification center + user menu) + **Sidebar** (เมนูหลัก, permission-filtered) + `<Outlet/>` (page content)

---

## Alternatives Considered

### A. Single Layout for everything
ใช้ layout เดียว ซ่อน/แสดง sidebar/topbar ตาม route

**ปัญหา:** มี conditional logic เยอะ, ยากต่อการ debug, layout re-render โดยไม่จำเป็น

### B. Two layouts (Auth vs App)
รวม WorkspaceSelect เข้ากับ AppLayout

**ปัญหา:** WorkspaceSelect ไม่ควรมี sidebar เพราะยังไม่มี workspace context — การ render sidebar (ที่ต้องการ `workspaceStore`) ในขั้นนี้ทำให้ต้องจัดการ null/loading state ซ้ำซ้อน

### C. Nested layouts (AppLayout → WorkspaceLayout → PageLayout)
Layout ซ้อนกันลึก

**ปัญหา:** complexity สูง, ยาก maintain, React Router outlet หลายชั้นสร้าง confusion

---

## Reason

3 layouts สะท้อน **3 authentication state** ของผู้ใช้จริงๆ ทำให้:
- ไม่ต้องมี conditional ใน layout component
- แต่ละ layout simple และรับผิดชอบเรื่องเดียว
- การเพิ่ม route ใหม่ชัดว่าต้องใช้ layout ไหน
- Topbar/Sidebar ไม่ต้อง handle กรณี "ยังไม่มี workspace" เอง

---

## Consequences

**บวก:**
- แต่ละ layout อ่านง่าย ไม่มี conditional logic
- เพิ่ม route ใหม่ → แค่ระบุ layout ที่ถูกต้อง
- Test layout แยกกันได้ชัดเจน

**ลบ:**
- มี 3 layout files ต้อง maintain (เพิ่มขึ้น 1 จากแนวทาง 2-layout)
- ถ้า design ของ Topbar ต้องการเปลี่ยน → update 1 ที่ใน `AppLayout.tsx`
