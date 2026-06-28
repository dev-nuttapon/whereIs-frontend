# Project Overview — WhereIs Frontend

> **อ่านไฟล์นี้ก่อนเป็นอันดับแรก** แล้วทำตาม [reading-order.md](../ai/reading-order.md)
> Repository นี้คือ **frontend อย่างเดียว** (React + Vite + TypeScript SPA)

## 1. WhereIs คืออะไร
WhereIs เป็น **Inventory / Storage Management System** — ระบบช่วย **ค้นหา จัดเก็บ ย้าย ยืม คืน และติดตามสิ่งของจริง**

ออกแบบให้ใช้ได้หลายสถานการณ์: Office, Home, Warehouse, Retail, School, Workshop, องค์กรเล็ก

คำถามหลักที่ระบบต้องตอบให้ได้เร็ว:
- ของชิ้นนี้อยู่ที่ไหน?
- ตอนนี้ใครถืออยู่?
- ก่อนหน้านี้เก็บที่ไหน?
- ถูกย้ายเมื่อไหร่?
- คืนแล้วหรือยัง?

## 2. ขอบเขตของ repo นี้ (สำคัญ)
- repo นี้ = **frontend SPA เท่านั้น**
- **backend แยกเป็นอีก service** (REST API, database, auth, authorization) — *ไม่อยู่ในขอบเขตการ implement ที่นี่*
- เอกสารชุดนี้จึงครอบคลุม: ทุกอย่างของ frontend + **contract ที่ frontend assume จาก backend** (API + รูปร่างข้อมูล + permission)

> ⚠️ [api-contract.md](../api/api-contract.md) และ [domain-model.md](domain-model.md) อธิบาย **contract ที่ frontend สมมติ** — backend คือ source of truth จริง ถ้าไม่ตรงให้ **แก้เอกสารก่อน** แล้วค่อยแก้โค้ด (ดู [coding-style.md](coding-style.md))
> backend ยังไม่ fix stack — เอกสารเขียนแบบ stack-agnostic

## 3. เป้าหมายของ frontend
ส่ง UI ที่ **เร็ว เรียบง่าย และเคารพ permission** ให้ผู้ใช้หาและจัดการของได้โดยคลิกน้อยที่สุด
หน้าที่สำคัญที่สุดคือ **Search** (ดู [modules/search.md](../modules/search.md))

## 4. Core Features → Module docs
| Feature | เอกสาร |
|---------|--------|
| Authentication | [modules/auth.md](../modules/auth.md) |
| Workspace + การสลับ workspace | [modules/workspace.md](../modules/workspace.md) |
| Dashboard | [modules/dashboard.md](../modules/dashboard.md) |
| Site management | [modules/site.md](../modules/site.md) |
| Location explorer | [modules/location.md](../modules/location.md) |
| Container management | [modules/container.md](../modules/container.md) |
| Item management + actions | [modules/item.md](../modules/item.md) |
| Item search | [modules/search.md](../modules/search.md) |
| Member management | [modules/member.md](../modules/member.md) |
| Permission + override | [modules/permission.md](../modules/permission.md) |
| Activity log | อยู่ใน [modules/item.md](../modules/item.md) (ItemEvent) |

## 5. Navigation (ภาพรวม)
```
Login → Workspace List → Dashboard
                            ├── Search
                            ├── Sites → Locations → Containers → Items
                            ├── Members
                            ├── Activity
                            └── Settings
```
รายละเอียด route + flow: [screen-flow.md](../ui/screen-flow.md)

## 6. หลักการออกแบบ UI
Fast Search · Simple Navigation · Clear Location Display · Minimal Clicks · Responsive (desktop-first) · Consistent · Permission-based UI · Mobile friendly
รายละเอียด: [ui-overview.md](../ui/ui-overview.md)

## 7. สถาปัตยกรรม frontend (สรุป)
- **Feature-based architecture** — แต่ละ feature เป็นเจ้าของ pages/components/hooks/api/types/validation
- **Server state → TanStack Query**, **Global UI state → Zustand**, **Form → React Hook Form** (ดู [state-management.md](../state/state-management.md))
- เรียก API ผ่าน `src/api/*.api.ts` เท่านั้น ห้าม `fetch()` ตรง
- **Tailwind + shadcn/ui** สำหรับ styling (ดู [theme.md](../ui/theme.md))

## 8. ไปต่อที่ไหน
ทำตาม [reading-order.md](../ai/reading-order.md) — อย่างน้อยอ่านต่อ: [domain-model.md](domain-model.md), [tech-stack.md](tech-stack.md), [coding-style.md](coding-style.md), [state-management.md](../state/state-management.md)
