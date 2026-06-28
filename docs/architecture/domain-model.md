# Domain Model — WhereIs Frontend

> **คำศัพท์มาตรฐาน (canonical vocabulary)** ของ WhereIs — ทุกเอกสาร, type, route, label ต้องใช้คำเหล่านี้ให้ตรงกัน
> นี่คือ domain ที่ frontend มองเห็นและใช้สร้าง type ฝั่ง client (`src/types/`) — รูปร่าง JSON บน wire ดู [api-contract.md](../api/api-contract.md)

## 1. Glossary (คำศัพท์)
| คำ | ความหมาย |
|----|----------|
| **User** | บัญชีผู้ใช้ (login เดียวทั้งระบบ) เข้าร่วม workspace ในรูปของ Member |
| **Workspace** | ขอบเขต tenant ระดับบนสุด ข้อมูลทุกอย่างสังกัด workspace เดียว และ **แยกขาดจากกัน** |
| **Member** | การเป็นสมาชิกของ User ใน workspace หนึ่ง พร้อม **Role** + **Permissions** (User เดียวเป็น member หลาย workspace ได้ คนละ role) |
| **Role** | ชุด permission เริ่มต้น: `owner`, `admin`, `member`, `viewer` |
| **Permission** | ความสามารถเดี่ยว เช่น `item.create` (effective = role default ± override) |
| **Site** | สถานที่จริงใน workspace (อาคาร/บ้าน) เป็น root ของลำดับชั้นตำแหน่ง |
| **Location** | ส่วนย่อยของ Site เป็น **tree** (ชั้น → ห้อง → ชั้นวาง) มี location ลูก และ/หรือ container |
| **Container** | ที่บรรจุ item อยู่ที่ location หนึ่ง มี **code** (และ QR ในอนาคต) |
| **Item** | สิ่งของที่ติดตาม สังกัด workspace ปกติอยู่ใน container มี **status** และมี **holder** เมื่อถูกนำออก |
| **ItemEvent** | บันทึก immutable ของสิ่งที่เกิดกับ item (created/moved/taken_out/…) = audit trail; **Activity Log** = view รวมของ ItemEvent ทั้ง workspace |

## 2. ความสัมพันธ์ (relationships)
```
User 1 ──< Member >── 1 Workspace
Workspace 1 ──< Site ──< Location ──< Location (tree, parentId) 
                                  └──< Container ──< Item ──< ItemEvent
Member 1 ──< ItemEvent           (เป็น actor ของ event)
Item >── 0..1 Member             (currentHolder เมื่อ status = taken_out)
```
- Workspace มีหลาย Site/Member/Item/ItemEvent
- Location เป็น tree (ลึกได้ไม่จำกัด) — `parentId = null` คือ location ระดับบนสุดของ site
- Container อยู่ใน 1 location, **ไม่ซ้อนใน container อื่น**
- Item อยู่ใน 1 container ตอน `stored`; ตอน `taken_out` ผูกกับ holder (จำ container เดิมไว้)
- ทุก entity ที่ระดับ workspace มี `workspaceId` → ฐานของ **workspace isolation**

## 3. ลำดับชั้นตำแหน่ง (Location Explorer)
```
Site
└── Location (tree)
    ├── Location (ลูก)
    │   └── Container ── Item
    └── Container ── Item
```
Breadcrumb ใน UI = `Site > Location > … > Container` เสมอ (component `LocationBreadcrumb`)

## 4. Item Lifecycle (status)
| Status | ความหมาย | มี holder? | อยู่ใน container? |
|--------|----------|:----------:|:-----------------:|
| `stored` | อยู่ในที่จัดเก็บ พร้อมใช้ | ไม่ | ใช่ |
| `taken_out` | ถูกนำออก/ยืม | ใช่ | ไม่ (จำ home container) |
| `missing` | หาไม่เจอ | ไม่ | ไม่ทราบ |
| `disposed` | จำหน่าย/ทิ้ง (terminal) | ไม่ | ไม่ |

Transition ที่อนุญาต (backend บังคับ, UI แสดงเฉพาะ action ที่ทำได้):
```
stored ──takeout──► taken_out ──return──► stored
stored / taken_out ──mark_missing──► missing ──mark_found──► stored
stored ──move──► stored                 (เปลี่ยน container, status เดิม)
stored / taken_out / missing ──dispose──► disposed (terminal)
```
ทุก transition สร้าง **ItemEvent** 1 รายการ

## 5. ItemEvent types
`created` · `updated` · `moved` · `taken_out` · `returned` · `marked_missing` · `marked_found` · `disposed`
แต่ละ event เก็บ: actor (Member), timestamp, item อ้างอิง, และ payload เฉพาะ (เช่น move → from/to container)

## 6. Roles (defaults)
| Role | เจตนา |
|------|-------|
| `owner` | คุม workspace ทั้งหมด รวมลบ workspace + override permission |
| `admin` | จัดการโครงสร้าง (site/location/container) + member |
| `member` | งานประจำวันกับ item (create/edit/takeout/return) |
| `viewer` | อ่านอย่างเดียว (search + view) |

mapping role → permission เต็มอยู่ที่ [permission-ui.md](../security/permission-ui.md) (ที่เดียว ห้ามนิยามซ้ำ)

## 7. Field reference (type ฝั่ง frontend)
> สรุป field ที่ UI ใช้ — ชนิดบน wire + endpoint ดู [api-contract.md](../api/api-contract.md)

```ts
type Role = 'owner' | 'admin' | 'member' | 'viewer';
type ItemStatus = 'stored' | 'taken_out' | 'missing' | 'disposed';

interface User { id: string; email: string; name: string; avatarUrl?: string; }

interface Workspace {
  id: string; name: string;
  myRole: Role;
  permissions: string[];        // permission ของ user ปัจจุบันใน ws นี้
  createdAt: string; updatedAt: string;
}

interface Site { id: string; workspaceId: string; name: string; description?: string; createdAt: string; updatedAt: string; }

interface Location {
  id: string; workspaceId: string; siteId: string;
  parentId: string | null; name: string;
  createdAt: string; updatedAt: string;
}

interface Container {
  id: string; workspaceId: string; locationId: string;
  code: string; name?: string; photoUrl?: string; qrCode?: string; // qrCode = future
  createdAt: string; updatedAt: string;
}

interface Item {
  id: string; workspaceId: string;
  name: string; code?: string; description?: string; photoUrl?: string;
  status: ItemStatus;
  containerId: string | null;       // home container (null ได้ตอน missing/disposed)
  currentHolderId: string | null;   // member id เมื่อ taken_out
  tags?: string[];                  // future
  createdAt: string; updatedAt: string;
}

interface Member { id: string; workspaceId: string; user: User; role: Role; permissions: string[]; createdAt: string; }

interface ItemEvent {
  id: string; workspaceId: string; itemId: string;
  type: 'created'|'updated'|'moved'|'taken_out'|'returned'|'marked_missing'|'marked_found'|'disposed';
  actor: Pick<User,'id'|'name'>;
  payload?: Record<string, unknown>;   // เช่น { fromContainerId, toContainerId }
  createdAt: string;
}
```
หมายเหตุ: ทุก id เป็น **UUID string**; timestamp เป็น **ISO 8601 (UTC)**; backend ใช้ soft delete → ปกติ FE จะไม่เห็น record ที่ถูกลบ

## 8. กฎการตั้งชื่อ
- ชื่อ entity = **PascalCase เอกพจน์**: `Workspace`, `ItemEvent`
- status / permission key = **snake_case string**: `taken_out`, `item.mark_missing`
- ห้ามใช้คำพ้อง: เป็น **Container** ไม่ใช่ "box/bin"; เป็น **ItemEvent** ไม่ใช่ "history/log" ในชื่อ identifier
