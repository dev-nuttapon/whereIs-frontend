# Architecture Decisions — WhereIs Frontend

บันทึกการตัดสินใจสถาปัตยกรรม (Architecture Decision Records) — อธิบาย "ทำไม" เบื้องหลังแต่ละ design choice

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | ตัดสินใจเรื่อง |
|------|---------------|
| [layout-design.md](layout-design.md) | 3 layout types (Auth, WorkspaceSelect, App) แทน single layout |
| [search-ui.md](search-ui.md) | Global SearchBar ใน Topbar + URL params เป็น filter state + access filtering |
| [permission-ui.md](permission-ui.md) | `can()` helper + effective permissions จาก backend แทนการเช็ค role ตรงๆ |
| [tech-stack.md](tech-stack.md) | เหตุผลที่เลือก React/Vite/TanStack Query/Zustand/shadcn/ui |

---

## รูปแบบของทุก ADR

แต่ละไฟล์มี 5 sections:

| Section | เนื้อหา |
|---------|---------|
| **Problem** | ปัญหาหรือโจทย์ที่ต้องตัดสินใจ |
| **Decision** | การตัดสินใจที่เลือก |
| **Alternatives Considered** | ทางเลือกอื่นที่พิจารณา |
| **Reason** | เหตุผลที่เลือก decision นี้ |
| **Consequences** | ผลลัพธ์ (บวก/ลบ) |

---

## ลำดับการอ่าน

อ่านตาม feature ที่กำลังทำ:
- ทำ Layout/Navigation → อ่าน `layout-design.md` ก่อน
- ทำ Search → อ่าน `search-ui.md` ก่อน
- ทำ Permission check → อ่าน `permission-ui.md` ก่อน
- ทำ onboarding / เข้าใจ stack → อ่าน `tech-stack.md` ก่อน

---

## Maintenance Guidelines

- เพิ่ม ADR ใหม่เมื่อตัดสินใจเรื่อง **architecture ที่ไม่ obvious** หรือมีการ debate ในทีม
- **ห้ามลบ ADR** — ถ้า decision เปลี่ยนให้เพิ่ม ADR ใหม่ที่ supersede อันเก่า และอัปเดต status เป็น "Superseded"
- Status values: `Proposed` | `Accepted` | `Deprecated` | `Superseded`
- อัปเดต [README.md](../README.md) ทุกครั้งที่เพิ่ม ADR ใหม่
