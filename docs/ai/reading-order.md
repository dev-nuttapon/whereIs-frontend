# Reading Order — WhereIs Frontend

ลำดับการอ่านเอกสารสำหรับ developer (และ AI) ก่อนเริ่มทำงาน
อ่านตามลำดับนี้เพื่อให้เข้าใจภาพรวม → กติกา → รายละเอียด feature

## Step 0 — Context (ราก repo)
1. `../PROJECT_CONTEXT.md` — วิสัยทัศน์, สถาปัตยกรรม, กฎรวม
2. `../CURRENT_TASK.md` — งานที่กำลังทำ + ขอบเขต (ทำเฉพาะ task ปัจจุบัน)

## Step 1 — Foundation (อ่านครั้งเดียว เข้าใจทั้งระบบ)
3. [project-overview.md](../architecture/project-overview.md) — WhereIs คืออะไร, ขอบเขต repo
4. [domain-model.md](../architecture/domain-model.md) — **คำศัพท์มาตรฐาน** + entities + lifecycle (อ้างอิงบ่อยสุด)
5. [tech-stack.md](../architecture/tech-stack.md) — เทคโนโลยี + เหตุผล

## Step 2 — Rules (ต้องยึดทุกครั้งที่เขียนโค้ด)
6. [folder-structure.md](../architecture/folder-structure.md) — ไฟล์อยู่ที่ไหน
7. [coding-style.md](../architecture/coding-style.md) — มาตรฐานโค้ด + naming
8. [state-management.md](../state/state-management.md) — server vs client state + cache rules
9. [component-rules.md](../ui/component-rules.md) — กติกา component + form

## Step 3 — UI System
10. [ui-overview.md](../ui/ui-overview.md) — design principles + UI states
11. [layout.md](../ui/layout.md) — โครงหน้า (Auth/App layout) + responsive
12. [theme.md](../ui/theme.md) — design tokens, สี, Tailwind/shadcn
13. [screen-flow.md](../ui/screen-flow.md) — route map + navigation flow

## Step 4 — Contracts
14. [api-contract.md](../api/api-contract.md) — endpoint + request/response + error
15. [permission-ui.md](../security/permission-ui.md) — roles, permission keys, การซ่อน/แสดง UI

## Step 5 — Module ที่จะทำ (อ่านเฉพาะ module ของ task)
16. [modules/](../modules/) — เลือกอ่านไฟล์ของ feature ที่กำลัง implement:
    [auth](../modules/auth.md) · [workspace](../modules/workspace.md) · [dashboard](../modules/dashboard.md) ·
    [container](../modules/container.md) ·
    [item](../modules/item.md) · [member](../modules/member.md) · [permission](../modules/permission.md) · [search](../modules/search.md) ·
    [activity](../modules/activity.md) · [reports](../modules/reports.md) · [notifications](../modules/notifications.md) · [settings](../modules/settings.md)

## Step 6 — ก่อนเริ่มจริง
17. [ai-prompt.md](ai-prompt.md) — context block + prompt templates + ข้อห้าม

---

## สรุปกฎทอง (ก่อนเขียนโค้ดทุกครั้ง)
- ทำ **เฉพาะ task ใน CURRENT_TASK.md**
- ใช้ **คำศัพท์ตาม domain-model.md** ห้ามคิดคำใหม่
- server state = TanStack Query, client state = Zustand (ห้ามปน)
- เรียก API ผ่าน `api/*.api.ts` เท่านั้น
- ปุ่ม action ต้องเช็ค permission
- ทุกหน้าโหลดข้อมูล = มี loading/empty/error
- ไม่เปลี่ยน architecture / folder / API contract โดยไม่ขออนุมัติ
