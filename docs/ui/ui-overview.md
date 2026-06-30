# UI Overview — WhereIs Frontend

ภาพรวมของระบบ UI: โปรดักต์, ผู้ใช้, ฟีเจอร์หลัก, design principles และมาตรฐานการมองเห็น

## WhereIs คืออะไร
WhereIs เป็นเว็บสำหรับ **ค้นหา จัดเก็บ ย้าย ยืม คืน และติดตามสิ่งของ** (item tracking)
ผู้ใช้สามารถรู้ได้ว่าของแต่ละชิ้นอยู่ที่ไหน ใครถืออยู่ และเคลื่อนไหวอย่างไรที่ผ่านมา
หน้าตาใน repo นี้ถูกจัดให้เป็น **POC / demo-first** เพื่อให้ flow หลักอ่านง่ายและสาธิตได้ทันที

### โครงสร้างข้อมูลหลัก (Entities)
```
Workspace
  └── Site            (สถานที่ เช่น อาคาร/บ้าน)
        └── Location  (โซน/ห้อง/ชั้นวาง)
              └── Container (กล่อง/ลิ้นชัก มี QR/Code)
                    └── Item  (สิ่งของจริง)
```
รวมถึง **Member** (ผู้ใช้ใน workspace) และ **Activity** (ประวัติเหตุการณ์)

## ผู้ใช้หลัก (Roles)
- **Owner** — เจ้าของ workspace สิทธิ์สูงสุด
- **Admin** — จัดการ Site/Location/Container/Member
- **Member** — เพิ่มของ, take out, return
- **Viewer** — ดูอย่างเดียว

> รายละเอียดสิทธิ์ดู [permission-ui.md](../security/permission-ui.md)

## ฟีเจอร์หลัก
- Login
- Workspace List
- Dashboard
- Site Management
- Location Explorer
- Container Detail
- Item Search
- Item Detail
- Add / Edit Item
- Move Item / Take Out / Return
- Mark Missing / Mark Found
- Member Management
- Permission Override
- Activity Log

## Design Principles
1. **Search ต้องเด่นที่สุด** — เป็นฟีเจอร์หลักของระบบ เข้าถึงได้ทุกที่
2. **ทุก Item เห็นรูป สถานะ และตำแหน่งล่าสุด** เสมอ
3. **ใช้ง่ายสำหรับคนทั่วไป** — ไม่ต้องเทรน
4. **Consistent** — ใช้ component กลางชุดเดียว
5. **Feedback ชัดเจน** — ทุก action มี loading / success / error
6. **Action อยู่ที่ Item Detail** — ปุ่มทำงานกับของรวมอยู่จุดเดียว

## Layout หลัก

```
┌─────────────────────────────────────────────┐
│  Topbar (workspace ปัจจุบัน, search, user)    │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │   Main Content Area              │
│ (เมนู)   │   (page content)                 │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

- **Topbar** — แสดง workspace ปัจจุบัน, global search, เมนูผู้ใช้
- **Sidebar** — เมนูหลัก แสดง/ซ่อนตาม permission (ดู [permission-ui.md](../security/permission-ui.md))
- **Main** — เนื้อหาของแต่ละ page

## Item Status
| Status key | Label (UI) | ความหมาย |
|------------|-----------|----------|
| `stored` | Stored | อยู่ในที่จัดเก็บ |
| `taken_out` | Taken Out | ถูกนำออก/ยืมไป (มีผู้ถือ) |
| `missing` | Missing | หาไม่เจอ |
| `disposed` | Disposed | ทิ้ง/จำหน่ายแล้ว |

key เป็น canonical (ดู [domain-model.md](../architecture/domain-model.md)) แสดงด้วย `StatusBadge` สีตาม [theme.md](theme.md#3-status-colors-item)

## Design Tokens & Styling
ใช้ **Tailwind CSS + shadcn/ui** — design token (สี, typography, spacing, status colors, dark mode) นิยามที่เดียวใน [theme.md](theme.md)
โครงหน้า (Topbar/Sidebar/Content) + responsive อยู่ใน [layout.md](layout.md)

## สถานะมาตรฐานของหน้าจอ (UI States)
ทุกหน้าจอที่โหลดข้อมูลต้องครอบคลุม:
1. **Loading** — `LoadingState` (skeleton / spinner)
2. **Empty** — `EmptyState` + คำแนะนำ action ถัดไป
3. **Error** — `ErrorState` + ปุ่ม retry
4. **Success** — แสดงข้อมูลปกติ

## เอกสารที่เกี่ยวข้อง
- [screen-flow.md](screen-flow.md) — flow การเดินของหน้าจอ
- [permission-ui.md](../security/permission-ui.md) — การแสดง UI ตามสิทธิ์
- [component-rules.md](component-rules.md) — มาตรฐาน component
