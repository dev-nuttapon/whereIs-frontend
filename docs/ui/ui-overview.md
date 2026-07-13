# UI Overview — WhereIs Frontend

ภาพรวมของระบบ UI: โปรดักต์, ผู้ใช้, ฟีเจอร์หลัก, design principles และมาตรฐานการมองเห็น

## WhereIs คืออะไร
WhereIs เป็นเว็บสำหรับ **จัดการทรัพย์สิน สต็อก และ workflow** แยกตาม workspace
ผู้ใช้สามารถรู้ได้ว่าของแต่ละชิ้นอยู่ที่ไหน ใครถืออยู่ จำนวนเหลือเท่าไร อยู่ในล็อตไหน และเคลื่อนไหวอย่างไรที่ผ่านมา
หน้าตาใน repo นี้ถูกจัดให้เป็น **production-oriented** เพื่อให้ flow หลักอ่านง่ายและใช้งานจริงได้ทันที

### โครงสร้างข้อมูลหลัก (Entities)
```
Workspace
  └── Container (tree แบบอิสระ: ห้อง > ลิ้นชัก > กล่อง ...)
        └── Item (Individual / Quantity)
```
รวมถึง **Member** (ผู้ใช้ใน workspace) และ **Activity** (ประวัติเหตุการณ์)

## ผู้ใช้หลัก (Roles)
- **Owner** — เจ้าของ workspace สิทธิ์สูงสุด
- **Admin** — จัดการข้อมูลส่วนใหญ่ใน workspace
- **Member** — ใช้งานประจำวันตาม permission
- **Viewer** — ดูอย่างเดียว

> รายละเอียดสิทธิ์ดู [permission-ui.md](../security/permission-ui.md)

## ฟีเจอร์หลัก
- Login
- Workspace List
- Dashboard
- Storage Structure
- Container Detail
- Item Search
- Item Detail
- Add / Edit Item
- Move / Borrow / Return / Withdraw / Reserve / Repair / Dispose
- Stock Consume / Restock / Count / Adjustment
- Mark Missing / Mark Found
- Member Management
- Permission Override
- Reports
- Notifications
- Activity Log

## Design Principles
1. **Search ต้องเด่นที่สุด**
2. **Progressive disclosure ก่อน**: หน้า list แสดงสรุปที่สำคัญที่สุดก่อน แล้วค่อยเปิดรายละเอียด
3. **ทุก Item เห็นข้อมูลสถานะและตำแหน่งล่าสุด**
4. **ข้อมูล structure ต้องอ่านง่าย**
5. **Consistent**
6. **Feedback ชัดเจน**
7. **Action อยู่ที่ Item Detail**

## Layout หลัก

```
┌─────────────────────────────────────────────┐
│  Topbar (workspace ปัจจุบัน, search, user)  │
├──────────┬──────────────────────────────────┤
│ Sidebar  │   Main Content Area              │
└──────────┴──────────────────────────────────┘
```

- **Topbar** — แสดง workspace ปัจจุบัน, global search, เมนูผู้ใช้
- **Sidebar** — เมนูหลัก แสดง/ซ่อนตาม permission
- **Main** — เนื้อหาของแต่ละ page

## Item Status
| Status key | Label (UI) | ความหมาย |
|------------|-----------|----------|
| `stored` | Stored | อยู่ในที่จัดเก็บ |
| `taken_out` | Borrowed | ถูกนำออก/ยืมไป |
| `missing` | Missing | หาไม่เจอ |
| `disposed` | Disposed | ทิ้ง/จำหน่ายแล้ว |

## Design Tokens & Styling
ใช้ **Tailwind CSS + shadcn/ui**

## สถานะมาตรฐานของหน้าจอ (UI States)
ทุกหน้าจอที่โหลดข้อมูลต้องครอบคลุม:
1. **Loading**
2. **Empty**
3. **Error**
4. **Success**

## Access Awareness
- Navigation, search, dashboard, reports, and item detail ต้องกรองตาม permission และ container access scope
- UI ที่ไม่อยู่ใน scope ต้องหายไปจากเมนูและผลลัพธ์ ไม่ใช่แค่ disable
- ถ้าผู้ใช้เข้าถึงหน้าไม่ได้ ให้แสดง empty/forbidden state ที่เข้าใจง่าย

## เอกสารที่เกี่ยวข้อง
- [screen-flow.md](screen-flow.md)
- [permission-ui.md](../security/permission-ui.md)
- [component-rules.md](component-rules.md)
