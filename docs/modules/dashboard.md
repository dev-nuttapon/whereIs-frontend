# Module: Dashboard

> หน้าแรกหลังเข้า workspace — ภาพรวมสถานะ + quick search + กิจกรรมล่าสุด
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [search.md](search.md) · [item.md](item.md)

## 1. Purpose
ให้ผู้ใช้เห็นภาพรวมของ workspace ทันทีที่เข้า (มีของกี่ชิ้น สถานะเป็นอย่างไร อะไรเพิ่งเกิดขึ้น) และเริ่มค้นหาได้เร็วที่สุด

## 2. User Stories
- ในฐานะผู้ใช้ ฉันต้องการเห็น **จำนวนของรวม / stored / taken out / missing** แบบ glance
- ฉันต้องการ **ค้นหาของได้ทันที** จากหน้าแรก
- ฉันต้องการเห็น **กิจกรรมล่าสุด** (ใครย้าย/ยืม/คืนอะไร)
- ฉันต้องการ **shortcut** ไปฟีเจอร์หลัก (Add Item, Add Container, Members)
- ฉันต้องการเห็นสัญญาณสำคัญ เช่น reservation waiting, overdue return, repair queue, low stock, และ out of stock
- ฉันต้องการให้ dashboard เคารพ container access scope

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Dashboard | `/w/:wsId` | search bar เด่น + stat cards + recent activity + quick actions + notifications preview + reports shortcut |
ใช้ **AppLayout**

## 4. Components
- `SearchBar` (กลาง, ดู [search.md](search.md))
- `StatCard` (label + number + ไอคอน + สีตามสถานะ)
- `QuickActionButton`
- `ActivityList` / `ActivityItem` (reuse จาก [item.md](item.md) — ItemEvent)
- `StatusBadge`
- `NotificationPreview`
- `ReportSummaryCard`

## 5. Forms

Dashboard ไม่มีฟอร์ม — SearchBar เป็น navigation control ไม่ใช่ form submission

- Search input ส่งค่าผ่าน `onKeyDown Enter` → navigate ไป `/w/:wsId/search?q=`
- Quick Actions (Add Item / Add Container / Reports / Notifications) เป็น link/ปุ่ม navigate ไม่ใช่ form

## 6. API Calls
ผ่าน `src/api/dashboard.api.ts` (หรือรวม endpoint ที่มีอยู่):
- `GET /workspaces/:wsId/dashboard` → summary cards ที่รวม item / quantity / activity / reminders
- `GET /workspaces/:wsId/activity?limit=10` → `ItemEvent[]` (ดู [item.md](item.md))
- dashboard summary ต้องถูกคำนวณจากข้อมูลที่ผู้ใช้เข้าถึงได้จริงตาม permission + container access scope

## 7. React Query Usage
- `useDashboardSummary(wsId)` = `useQuery(['ws', wsId, 'dashboard'])`
- `useRecentActivity(wsId)` = `useQuery(['ws', wsId, 'activity', { limit: 10 }])`
- `useDashboardNotifications(wsId)` = `useQuery(['ws', wsId, 'notifications', 'preview'])` (if enabled)
- `staleTime` สั้น (เช่น 30s) เพราะตัวเลขเปลี่ยนบ่อย; refetch on window focus

## 8. Zustand Usage
- ไม่มี state เฉพาะ — อ่าน `workspaceStore.currentWorkspace` เพื่อแสดงชื่อ ws
- ค่าทั้งหมดเป็น server state (Query) **ห้ามเก็บใน Zustand**

## 9. Form Validation
- ไม่มีฟอร์ม (search bar = field เดียว ไม่ต้อง validate; ส่ง q ว่างได้ → ไป search ว่าง)

## 10. Navigation Flow
```
เข้า ws → /w/:wsId (Dashboard)
SearchBar submit → /w/:wsId/search?q=<keyword>
StatCard "Borrowed" คลิก → /search?status=taken_out (filter preset)
Quick Action → หน้าเป้าหมาย (Add Item / Add Container / Members)
Quick Action → หน้า Reports / Notifications
Activity item คลิก → Item Detail ของ event นั้น
```

## 11. Permission Rules
- ทุก member เห็น Dashboard + stats + activity (`item.view` / `activity.view`)
- Quick Actions ซ่อนตาม permission: `+ Add Item` ต้องมี `item.create`; `Members` ต้องมี `member.view`
- reports / notifications / access-aware summary ต้องซ่อนตาม permission และ scope
- ดู [../permission-ui.md](../security/permission-ui.md)

## 12. Loading State
- Stat cards → skeleton ตัวเลข
- Activity → skeleton list

## 13. Empty State
- workspace ใหม่ยังไม่มีของ → stats เป็น 0 + `EmptyState` ใน activity "ยังไม่มีกิจกรรม" + ชวน Add Item / Add Container
- ถ้าไม่มีสิทธิ์ add → แสดงข้อความแนะนำติดต่อ admin

## 14. Error State
- summary หรือ activity ล้มเหลว → `ErrorState` เฉพาะ section นั้น + retry (ไม่ล้มทั้งหน้า)

## 15. Responsive Behavior
- Stat cards: desktop 4+ คอลัมน์ → tablet 2 → mobile 1 (หรือ 2 เล็ก)
- SearchBar เด่นเต็มกว้างทุกขนาด
- Quick actions ยุบเป็นปุ่มเรียง/เมนูบน mobile

## 16. Future Improvements
- กราฟ trend (item เพิ่ม/ยืมตามเวลา)
- การ์ด "ของที่ฉันถืออยู่" / "ของที่ค้างคืนนาน"
- widget ปรับแต่งได้, pinned items
- แจ้งเตือน missing items / reservation / expiry / maintenance / overdue return

## 17. Definition of Done
- [ ] Dashboard page + AppLayout
- [ ] SearchBar เด่น → ไปหน้า Search
- [ ] Stat cards + reminder cards จาก API
- [ ] Recent activity list (คลิกไป item detail)
- [ ] Quick actions ซ่อนตาม permission
- [ ] Reports / Notifications shortcut
- [ ] React Query (summary + activity) แยก loading/error ราย section
- [ ] Empty state (ws ใหม่)
- [ ] Responsive grid
