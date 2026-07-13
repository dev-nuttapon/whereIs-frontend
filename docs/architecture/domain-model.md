# Domain Model — WhereIs Frontend

> **คำศัพท์มาตรฐาน (canonical vocabulary)** ของ WhereIs — ทุกเอกสาร, type, route, label ต้องใช้คำเหล่านี้ให้ตรงกัน
> นี่คือ domain ที่ frontend มองเห็นและใช้สร้าง type ฝั่ง client (`src/types/`) — รูปร่าง JSON บน wire ดู [api-contract.md](../api/api-contract.md)

## 1. Glossary (คำศัพท์)
| คำ | ความหมาย |
|----|----------|
| **User** | บัญชีผู้ใช้หนึ่งคนในระบบ |
| **Workspace** | ขอบเขตข้อมูลหลักของระบบ ข้อมูลทุกอย่างสังกัด workspace เดียว และต้องแยกจาก workspace อื่น |
| **Member** | บทบาทของ User ภายใน Workspace หนึ่ง พร้อม primary role, extra permissions, และ container access scope |
| **Role** | ชุดสิทธิ์เริ่มต้นของสมาชิก: `owner`, `admin`, `member`, `viewer` |
| **Permission** | ความสามารถเดี่ยว เช่น ดูรายการ, แก้ข้อมูล, ย้ายของ, เบิกสต็อก, จัดการสมาชิก, หรือกำหนด scope |
| **Container** | โหนดในโครงสร้างที่เก็บของ ใช้แทนห้อง, ตู้, ชั้น, ลิ้นชัก, กล่อง หรือระดับอื่นที่ผู้ใช้กำหนดเองได้ |
| **Item** | ของที่ต้องติดตามใน workspace แยกเป็น 2 รูปแบบ: ของมีชิ้นเดียว และของแบบสต็อก |
| **ItemEvent** | บันทึก immutable ของรายการที่เกิดกับ item เพื่อใช้เป็นประวัติและ audit trail |
| **Notification** | การแจ้งเตือนของ workspace เช่น reminder, overdue, expiry, warranty, maintenance |
| **ReportSummary** | สรุปรายงานที่ frontend ใช้แสดง KPI / summary / export preview |

## 2. ความสัมพันธ์ (relationships)
```
User 1 ──< Member >── 1 Workspace
Workspace 1 ──< Container (tree via parentId) ──< Item ──< ItemEvent
Member 1 ──< ItemEvent           (เป็น actor ของ event)
Item >── 0..1 Member             (currentHolder เมื่อเป็นของมีชิ้นเดียวและถูกยืมออก)
```
- Workspace เป็นขอบเขตการใช้งานหลัก
- Container เป็น tree ที่กำหนดได้อิสระในแต่ละ Workspace
- Container อาจมีลูกเป็น container อื่นได้ตามโครงสร้างที่ผู้ใช้กำหนด
- Item ผูกกับ container ปลายทางปัจจุบันเสมอ เว้นแต่สถานะบางแบบที่ยังไม่ระบุที่อยู่ได้ชั่วคราว
- Container access scope ของ member ใช้กรองว่าเห็น container และ item ใดบ้าง
- ทุก entity ระดับ workspace ต้องมี `workspaceId`

## 3. โครงสร้างที่เก็บ
โครงสร้างที่เก็บต้องรองรับรูปแบบอิสระ เช่น:
```
ห้อง 3
└── ลิ้นชัก 4
    └── กล่อง 2
```
หรือ
```
ลิ้นชัก 3
└── ชั้นวาง 1
```
ความหมายคือผู้ใช้กำหนดชื่อระดับ, จำนวนระดับ, และลำดับความลึกได้เองในแต่ละ workspace

## 4. Item Types และ Lifecycle
| ประเภท | ความหมาย | ตัวอย่างข้อมูลหลัก |
|--------|----------|---------------------|
| `single` | Individual Item | ของมีเพียง 1 ชิ้น ต้องติดตามรายชิ้น |
| `stock` | Quantity Item | ของที่ติดตามเป็นจำนวน + หน่วย + lot |

> UI label ควรใช้ **Individual Item** / **Quantity Item** แต่ wire enum ปัจจุบันยังเป็น `single` / `stock`

### Individual Item (`single`)
สถานะหลัก:
| Status | ความหมาย |
|--------|----------|
| `stored` | อยู่ในที่เก็บ |
| `taken_out` | ถูกยืมหรือถูกนำออก |
| `missing` | หาไม่เจอ |
| `disposed` | จำหน่ายหรือทิ้ง |

ฟิลด์ที่ควรรองรับ:
- container ปัจจุบัน
- current holder
- due date แบบ optional
- reason สำหรับ missing/disposed
- primary workflow state ที่ UI ใช้แสดง borrow / return / withdraw / reserve / repair / dispose
- important dates เช่น warranty end, maintenance due, custom reminder

> หมายเหตุ: `status` ใน field reference ยังเป็น state แบบกว้าง ส่วน workflow labels อาจแสดงจาก event/state overlay เพิ่มเติม

### Quantity Item (`stock`)
สถานะเชิงปริมาณ:
- quantity ปัจจุบัน
- reorder point / low stock threshold
- restock history
- consume history
- who took what amount
- item-specific unit conversion
- batch / lot
- received date
- expiry date
- stock count / variance / adjustment history
- warranty / maintenance / custom schedule metadata

## 5. ItemEvent types
ItemEvent ต้องบันทึกการเปลี่ยนแปลงสำคัญทั้งหมด เช่น:
- `created`
- `updated`
- `moved`
- `borrow_requested`
- `borrow_approved`
- `borrowed`
- `returned`
- `withdrawn`
- `reserved`
- `reservation_released`
- `marked_repairing`
- `repaired`
- `stock_used`
- `stock_restocked`
- `stock_counted`
- `stock_adjusted`
- `received`
- `marked_missing`
- `marked_found`
- `disposed`

แต่ละ event เก็บ actor, timestamp, item อ้างอิง และ payload เฉพาะของเหตุการณ์นั้น
> คีย์ event ฝั่ง backend อาจต่างจาก label ที่ UI แสดง แต่ frontend ต้องรองรับกลุ่มเหตุการณ์ข้างต้น

## 6. Roles (defaults)
| Role | เจตนา |
|------|-------|
| `owner` | คุม workspace ทั้งหมด, เชิญ/ลบสมาชิก, ตั้ง role, จัดการ extra permissions, จัดการ container access scope, และจัดการข้อมูลทุกส่วน |
| `admin` | จัดการข้อมูลส่วนใหญ่ใน workspace, container, item, stock, reports, notifications, และสมาชิกได้ตามสิทธิ์ |
| `member` | ใช้งานงานประจำวัน เช่น เพิ่ม/แก้ข้อมูล, ยืมคืนของ, เบิก/ถอน/คืนสต็อก, ทำ count/adjustment ตามสิทธิ์ที่ได้รับ |
| `viewer` | อ่านอย่างเดียว |

mapping role → permission เต็มอยู่ที่ [permission-ui.md](../security/permission-ui.md)

## 7. Field reference (type ฝั่ง frontend)
> สรุป field ที่ UI ใช้ — ชนิดบน wire + endpoint ดู [api-contract.md](../api/api-contract.md)

```ts
type Role = 'owner' | 'admin' | 'member' | 'viewer';
type ItemType = 'single' | 'stock';
type ItemStatus = 'stored' | 'taken_out' | 'reserved' | 'missing' | 'repair' | 'disposed'; // coarse lifecycle status

interface User { id: string; email: string; name: string; avatarUrl?: string; }

interface Workspace {
  id: string;
  name: string;
  myRole: Role;
  permissions: string[];
  containerAccessScope?: {
    containerIds: string[];
    includeDescendants: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: string;
  workspaceId: string;
  user: User;
  role: Role;
  containerAccessScope: {
    containerIds: string[];
    includeDescendants: boolean;
  };
  permissions: string[];
  permissionOverrides?: Record<string, boolean>;
  createdAt: string;
}

interface Container {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  typeLabel: string;
  note?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Item {
  id: string;
  workspaceId: string;
  kind: ItemType;
  usageType: 'consumable' | 'returnable';
  returnPolicy: 'due' | 'indefinite';
  name: string;
  code?: string;
  description?: string;
  status: ItemStatus;
  containerId: string | null;
  currentHolderId: string | null;
  quantity?: number;
  reorderPoint?: number;
  dueDate?: string | null;
  reason?: string;
  unit?: string;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  importantDates?: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
}

interface ItemEvent {
  id: string;
  workspaceId: string;
  itemId: string;
  type: string;
  actor: Pick<User, 'id' | 'name'>;
  payload?: Record<string, unknown>;
  createdAt: string;
}
```
หมายเหตุ: ทุก id เป็น **UUID string**; timestamp เป็น **ISO 8601 (UTC)**; backend ใช้ soft delete → ปกติ FE จะไม่เห็น record ที่ถูกลบ

## 8. กฎการตั้งชื่อ
- ชื่อ entity = **PascalCase เอกพจน์**: `Workspace`, `Container`, `ItemEvent`
- status / permission key = **snake_case string**: `taken_out`, `item.mark_missing`
- ห้ามใช้คำพ้องใน identifier: ใช้ `Container` สำหรับโหนดในโครงสร้างที่เก็บ
