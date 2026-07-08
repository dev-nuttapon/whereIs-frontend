# Project Overview — WhereIs Frontend

> **อ่านไฟล์นี้ก่อนเป็นอันดับแรก** แล้วทำตาม [reading-order.md](../ai/reading-order.md)
> Repository นี้คือ **frontend อย่างเดียว** (React + Vite + TypeScript SPA)

## 1. WhereIs คืออะไร
WhereIs เป็นระบบจัดการทรัพย์สิน สต็อก และ workflow แบบแยกตาม `Workspace`
เป้าหมายคือช่วยให้ผู้ใช้ติดตามได้ว่า:
- ของรายชิ้นอยู่ที่ไหนหรืออยู่กับใคร
- ของแบบจำนวนเหลือเท่าไร อยู่ในล็อตไหน และเคลื่อนไหวอย่างไร
- พื้นที่เก็บของถูกจัดเป็นโครงสร้างแบบอิสระและกำหนดได้เอง
- ใครมีสิทธิ์เห็นหรือจัดการข้อมูลส่วนไหนได้บ้าง
- มี workflow ใดกำลังรอ ยืม คืน เบิก สำรอง ตรวจนับ ปรับยอด ซ่อม หรือจำหน่ายอยู่

repo นี้คือ **frontend documentation + mockup-first implementation guide** ของระบบดังกล่าว จึงเน้น flow หลักและหน้าจอที่สาธิตแนวทางการทำงานของระบบใหม่

## 2. ขอบเขตของ repo นี้ (สำคัญ)
- repo นี้ = **frontend SPA เท่านั้น**
- **backend แยกเป็นอีก service** (REST API, database, auth, authorization) — *ไม่อยู่ในขอบเขตการ implement ที่นี่*
- เอกสารชุดนี้ครอบคลุม: frontend + **contract ที่ frontend สมมติจาก backend** (API + รูปร่างข้อมูล + permission)

> ⚠️ [api-contract.md](../api/api-contract.md) และ [domain-model.md](domain-model.md) อธิบาย **contract ที่ frontend สมมติ** — backend คือ source of truth จริง ถ้าไม่ตรงให้ **แก้เอกสารก่อน** แล้วค่อยแก้โค้ด (ดู [coding-style.md](coding-style.md))

## 3. เป้าหมายของ frontend
ส่ง UI ที่ **เข้าใจง่าย, เคารพ permission, และตอบคำถามทางงานได้เร็ว**
หน้าที่หลักของระบบคือ:
- ค้นหา
- ดูรายละเอียดของ item
- ยืม/คืน/เบิก/ถอน/สำรอง/ซ่อม/จำหน่าย
- ตรวจนับและปรับยอดของจำนวน
- จัดการ workspace, members, permissions, notifications, และ reports

## 4. Core Features → Module docs
| Feature | เอกสาร |
|---------|--------|
| Authentication | [modules/auth.md](../modules/auth.md) |
| Workspace + การสลับ workspace | [modules/workspace.md](../modules/workspace.md) |
| Dashboard | [modules/dashboard.md](../modules/dashboard.md) |
| Storage structure | [modules/container.md](../modules/container.md) |
| Container management | [modules/container.md](../modules/container.md) |
| Item management + actions | [modules/item.md](../modules/item.md) |
| Item search | [modules/search.md](../modules/search.md) |
| Member management | [modules/member.md](../modules/member.md) |
| Permission + override | [modules/permission.md](../modules/permission.md) |
| Activity log | [modules/activity.md](../modules/activity.md) |
| Reports | [modules/reports.md](../modules/reports.md) |
| Notifications | [modules/notifications.md](../modules/notifications.md) |

## 5. Navigation (ภาพรวม)
```
Login → Workspace List → Dashboard
                            ├── Search
                            ├── Storage Structure / Containers → Items
                            ├── Members / Permissions
                            ├── Activity / Reports / Notifications
                            └── Settings
```
รายละเอียด route + flow: [screen-flow.md](../ui/screen-flow.md)

## 6. หลักการออกแบบ UI
Fast Search · Clear ownership · Minimal clicks · Permission-based UI · Mobile friendly · Responsive desktop-first
รายละเอียด: [ui-overview.md](../ui/ui-overview.md)

## 7. สถาปัตยกรรม frontend (สรุป)
- **Feature-based architecture** — แต่ละ feature เป็นเจ้าของ pages/components/hooks/api/types/validation
- **Server state → TanStack Query**, **Global UI state → Zustand**, **Form → React Hook Form** (ดู [state-management.md](../state/state-management.md))
- เรียก API ผ่าน `src/api/*.api.ts` เท่านั้น ห้าม `fetch()` ตรง
- **Tailwind + shadcn/ui** สำหรับ styling (ดู [theme.md](../ui/theme.md))

## 8. ไปต่อที่ไหน
ทำตาม [reading-order.md](../ai/reading-order.md) — อย่างน้อยอ่านต่อ: [domain-model.md](domain-model.md), [tech-stack.md](tech-stack.md), [coding-style.md](coding-style.md), [state-management.md](../state/state-management.md)
