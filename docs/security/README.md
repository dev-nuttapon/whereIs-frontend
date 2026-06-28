# Security — WhereIs Frontend

เอกสารการจัดการสิทธิ์การเข้าถึง (authentication + authorization) ในฝั่ง UI

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| [permission-ui.md](permission-ui.md) | Roles, **permission keys (canonical list)**, role matrix, route guard, component guard, API error handling |

---

## ลำดับการอ่าน

1. `permission-ui.md` — อ่านก่อนสร้างปุ่ม/เมนูใดๆ ที่ต้องตรวจสิทธิ์

---

## หลักการสำคัญ

- **Frontend security = UX layer** — ซ่อนปุ่ม/เมนูได้แต่กัน request จริงไม่ได้ → backend ต้อง enforce เสมอ
- **`can(permission)` helper** เป็น single point of permission check — ห้ามเช็ค role โดยตรง
- **Effective permissions** มาจาก backend (หลัง apply role defaults + overrides) → เก็บใน `workspaceStore.permissions`

---

## Maintenance Guidelines

- **permission-ui.md** คือ canonical permission key list — ห้ามสร้าง key ใหม่ในโค้ดโดยไม่อัปเดตที่นี่
- อัปเดต role matrix เมื่อ backend เปลี่ยน role defaults
- ดู ADR: [decisions/permission-ui.md](../decisions/permission-ui.md) สำหรับเหตุผลของการออกแบบ
