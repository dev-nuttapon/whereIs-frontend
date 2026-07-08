# Modules — WhereIs Frontend

เอกสารระดับ **feature** แต่ละไฟล์ละเอียดพอให้ implement frontend ได้โดยไม่ต้องถามเพิ่ม
ทุก module ยึดคำศัพท์จาก [../architecture/domain-model.md](../architecture/domain-model.md) และ contract จาก [../api/api-contract.md](../api/api-contract.md) / [../security/permission-ui.md](../security/permission-ui.md)

---

## รายการ module

| Module | หน้าที่ | Routes |
|--------|---------|--------|
| [auth.md](auth.md) | login / register / session / logout | `/login`, `/register` |
| [workspace.md](workspace.md) | เลือก/สร้าง/สลับ workspace | `/workspaces`, `/workspaces/new` |
| [dashboard.md](dashboard.md) | ภาพรวม + quick search | `/w/:wsId` |
| [container.md](container.md) | จัดการ container tree + ดูของภายใน | `/w/:wsId/containers/:id` |
| [item.md](item.md) | Individual Item + Quantity Item + workflows + Item Detail | `/w/:wsId/items/*` |
| [member.md](member.md) | จัดการสมาชิก + invite + เปลี่ยน role | `/w/:wsId/members` |
| [permission.md](permission.md) | ดู/override permission ราย member | `/w/:wsId/members/:id` (tab) |
| [search.md](search.md) | ค้นหา item (ฟีเจอร์หลัก) | `/w/:wsId/search` |
| [activity.md](activity.md) | Activity Log — ประวัติ ItemEvent ทั้ง workspace | `/w/:wsId/activity` |
| [reports.md](reports.md) | Reports, summaries, exports | `/w/:wsId/reports` |
| [notifications.md](notifications.md) | Notifications, reminders, important dates | `/w/:wsId/notifications` |
| [settings.md](settings.md) | Workspace settings, User profile, Theme, Danger Zone | `/w/:wsId/settings` |

---

## โครงสร้างมาตรฐานของทุก module doc (17 sections)

| # | หัวข้อ | เนื้อหา |
|---|--------|---------|
| 1 | **Purpose** | จุดประสงค์ของ module นี้ |
| 2 | **User Stories** | สิ่งที่ผู้ใช้ต้องการทำ (ในฐานะ…) |
| 3 | **Screen Description** | ตารางหน้าจอ + route + คำอธิบาย |
| 4 | **Components** | component ที่ใช้ใน module นี้ (feature + shared) |
| 5 | **Forms** | ฟอร์มในหน้านี้: fields, validation, submit behavior |
| 6 | **API Calls** | endpoint ที่ใช้ (ผ่าน `api/*.api.ts`) |
| 7 | **React Query** | query/mutation hooks + cache invalidation |
| 8 | **Zustand** | store ที่อ่าน/เขียน |
| 9 | **Validation** | Zod schema + error messages |
| 10 | **Navigation** | flow diagram การเดินระหว่างหน้า |
| 11 | **Permission Rules** | ตาราง action → permission key |
| 12 | **Loading State** | skeleton/spinner pattern |
| 13 | **Error State** | error handling + toast + retry |
| 14 | **Empty State** | icon + message + CTA |
| 15 | **Responsive Design** | behavior ต่าง breakpoint |
| 16 | **Future Improvements** | features ที่วางแผนไว้แต่ยังไม่ทำ |
| 17 | **Definition of Done** | checklist ก่อนถือว่า feature สมบูรณ์ |

---

## ลำดับการอ่านก่อน implement feature ใด

1. [architecture/domain-model.md](../architecture/domain-model.md) — entity ที่ feature นี้ใช้
2. [api/api-contract.md](../api/api-contract.md) — endpoint ของ feature นี้
3. [security/permission-ui.md](../security/permission-ui.md) — permission ที่ต้องตรวจ
4. module doc ของ feature นั้น (ไฟล์ในโฟลเดอร์นี้)

---

## Maintenance Guidelines

- เพิ่ม feature ใหม่ → สร้าง module doc ใหม่ตาม 17-section template
- อัปเดตตาราง module list ด้านบนพร้อมกัน
- อัปเดต [README.md](../README.md) (master index) ด้วย
- เพิ่ม route ใหม่ → อัปเดต [screen-flow.md](../ui/screen-flow.md) พร้อมกัน
