# State — WhereIs Frontend

เอกสารการจัดการ state ทั้งหมด: server state (TanStack Query), client state (Zustand), form state, filter state

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| [state-management.md](state-management.md) | หลักการแยก state, Query + Mutation patterns, Zustand stores (authStore/workspaceStore/uiStore), cache invalidation rules |

---

## ลำดับการอ่าน

1. `state-management.md` — อ่านก่อนเขียน hook หรือ store ใดๆ

---

## กฎทอง

| ชนิดข้อมูล | เก็บที่ไหน |
|------------|-----------|
| ข้อมูลจาก API | TanStack Query เท่านั้น |
| Auth token + user | authStore |
| Workspace ปัจจุบัน + permissions | workspaceStore |
| Sidebar/theme | uiStore |
| Form values | React Hook Form |
| Filter/search/pagination | URL query params |
| Modal open/close | local useState |

**ห้ามเด็ดขาด:** copy server data ลง Zustand หรือ useState

---

## Maintenance Guidelines

- `state-management.md` ส่วน **Cache Rules** ต้องตรงกับ mutation ใน module docs — เพิ่ม action ใหม่ต้องอัปเดตทั้งสอง
- Query key factory ใน `src/lib/queryKeys.ts` ต้องตรงกับตัวอย่างใน `state-management.md`
- เพิ่ม Zustand store ใหม่ → อัปเดต state-management.md + folder-structure.md
