# API Contract — WhereIs Frontend

สัญญาการเรียก API ที่ **frontend สมมติจาก backend** (backend เป็นอีก service, stack-agnostic)

> ⚠️ นี่คือ **contract ที่ frontend ยึด** — backend คือ source of truth จริง ถ้าไม่ตรงให้ **อัปเดตไฟล์นี้ก่อน** แล้วค่อยแก้โค้ด
> Frontend ใช้ไฟล์นี้สร้าง: API client, TypeScript types, React Query hooks, และ Mock data

## หลักการทั่วไป
- Protocol: **REST over HTTPS**
- รูปแบบข้อมูล: **JSON**
- Base URL: `VITE_API_BASE_URL`
- request ที่ต้อง auth แนบ `Authorization: Bearer <token>`
- request ภายใต้ workspace แนบ workspace id ใน path `/workspaces/:wsId/...`
- ทุก response ต้องพร้อมถูกกรองด้วย permission + container access scope

## Convention
- ชื่อ field: `camelCase`
- เวลา: ISO 8601 (UTC)
- pagination: `?page=1&limit=20`
- id เป็น string (UUID)
- UI label ใช้ Individual Item / Quantity Item แต่ wire enum ปัจจุบันยัง `single` / `stock`

## Response มาตรฐาน

### สำเร็จ (single)
```json
{ "data": { "...": "..." } }
```

### สำเร็จ (list + pagination)
```json
{ "data": [ { "...": "..." } ], "meta": { "page": 1, "limit": 20, "total": 135 } }
```

### Error
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "name": "ห้ามว่าง" } } }
```

## HTTP Status ที่ Frontend ต้องจัดการ
| Status | ความหมาย | การจัดการฝั่ง FE |
|--------|----------|------------------|
| 200/201 | สำเร็จ | render data |
| 400 | validation ผิด | error ราย field |
| 401 | auth ไม่ผ่าน / token หมดอายุ | logout + redirect `/login` |
| 403 | ไม่มีสิทธิ์ | แสดง "ไม่มีสิทธิ์" |
| 404 | ไม่พบข้อมูล | empty / not found |
| 422 | semantic error | ข้อความรวม |
| 5xx | server error | error + retry |

## Endpoint

### Auth (`auth.api.ts`)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ data: { token, user } }` |
| POST | `/auth/register` | `{ email, password, name }` | `{ data: { token, user } }` |
| POST | `/auth/logout` | — | `{ data: { success } }` |
| GET | `/auth/me` | — | `{ data: User }` |

### Workspaces (`workspace.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces` | auth | `{ data: Workspace[] }` |
| POST | `/workspaces` | auth | `{ data: Workspace }` |
| GET | `/workspaces/:id` | `workspace.view` | `{ data: Workspace & { permissions, containerAccessScope } }` |
| PUT | `/workspaces/:id` | `workspace.update` | `{ data: Workspace }` |
| DELETE | `/workspaces/:id` | `workspace.delete` | `{ data: { success } }` |
| PUT | `/workspaces/:id/settings/notifications` | `notification.manage` | `{ data: NotificationSettings }` |

### Dashboard (`dashboard.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/dashboard` | `item.view` | `{ data: { totalItems, stored, borrowed, reserved, missing, repair, lowStock, outOfStock, overdueReturn, reservationWaiting, reminderCount } }` |

### Containers (`container.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/containers/tree` | `container.view` | `{ data: Container[] }` (flat, parentId) |
| GET | `/workspaces/:wsId/containers/:id` | `container.view` | `{ data: Container }` |
| GET | `/workspaces/:wsId/containers/:id/items` | `item.view` | `{ data: Item[] }` |
| GET | `/workspaces/:wsId/containers/:id/children` | `container.view` | `{ data: Container[] }` |
| POST | `/workspaces/:wsId/containers` | `container.create` | `{ data: Container }` |
| PUT | `/workspaces/:wsId/containers/:id` | `container.update` | `{ data: Container }` |
| DELETE | `/workspaces/:wsId/containers/:id` | `container.delete` | `{ data: { success } }` |

### Items (`item.api.ts`)
| Method | Endpoint | Body / Query | Response |
|--------|----------|--------------|----------|
| GET | `/workspaces/:wsId/items` | `?q&type&status&containerId&page&limit&sort&holderId&location&expiry&warranty&maintenance&reservationWaiting&overdueReturn` | `{ data: Item[], meta }` |
| GET | `/workspaces/:wsId/items/:id` | — | `{ data: Item }` |
| POST | `/workspaces/:wsId/items` | `CreateItemInput` | `{ data: Item }` |
| PUT | `/workspaces/:wsId/items/:id` | `UpdateItemInput` | `{ data: Item }` |
| DELETE | `/workspaces/:wsId/items/:id` | — | `{ data: { success } }` |
| POST | `/workspaces/:wsId/items/:id/move` | `{ toContainerId }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/borrow` | `{ holderId, dueDate?, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/return` | `{ note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/withdraw` | `{ destinationId?, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/reserve` | `{ holderId, startDate?, endDate?, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/repair` | `{ reason, etaDate?, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/mark-missing` | `{ reason? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/mark-found` | `{ containerId }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/dispose` | `{ reason }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/consume-stock` | `{ quantity, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/restock-stock` | `{ quantity, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/count-stock` | `{ countedQuantity, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/adjust-stock` | `{ variance, reason, approvalNote? }` | `{ data: Item }` |
| GET | `/workspaces/:wsId/items/:id/events` | — | `{ data: ItemEvent[] }` |

### Members (`member.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/members` | `member.view` | `{ data: Member[] }` |
| GET | `/workspaces/:wsId/members/:id` | `member.view` | `{ data: Member }` |
| POST | `/workspaces/:wsId/members/invite` | `member.invite` | `{ data: Member }` |
| PUT | `/workspaces/:wsId/members/:id/role` | `member.update_role` | `{ data: Member }` |
| DELETE | `/workspaces/:wsId/members/:id` | `member.remove` | `{ data: { success } }` |

### Permissions (`permission.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/members/:id/permissions` | `permission.override` | `{ data: { primaryRole, effective, overrides, containerAccessScope } }` |
| PUT | `/workspaces/:wsId/members/:id/permissions` | `permission.override` | `{ data: { primaryRole, effective, containerAccessScope } }` |

### Activity (`activity.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/activity` | `activity.view` | `{ data: ItemEvent[], meta }` |

### Reports (`report.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/reports` | `report.view` | `{ data: ReportSummary[] }` |
| GET | `/workspaces/:wsId/reports/export` | `report.export` | file / download |

### Notifications (`notification.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/notifications` | `notification.view` | `{ data: Notification[], meta }` |
| POST | `/workspaces/:wsId/notifications/:id/read` | `notification.view` | `{ data: Notification }` |
| POST | `/workspaces/:wsId/notifications/read-all` | `notification.view` | `{ data: { success } }` |

## Entity Types
รูปร่าง entity หลักดูที่ [domain-model.md](../architecture/domain-model.md#7-field-reference-type-ฝั่ง-frontend)

```ts
interface Notification {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

interface ReportSummary {
  key: string;
  label: string;
  value: number;
  unit?: string;
  trend?: string;
}

interface NotificationSettings {
  enabled: boolean;
  emailDigest: boolean;
  inAppReminder: boolean;
  scheduleAlerts: boolean;
}
```

## Request DTO
```ts
interface CreateItemInput {
  type: 'single' | 'stock';
  name: string;
  code?: string;
  description?: string;
  containerId: string;
  quantity?: number;
  unit?: string;
  baseUnit?: string;
  batchCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number;
}

interface UpdateItemInput {
  name?: string;
  code?: string;
  description?: string;
  containerId?: string | null;
  quantity?: number;
  unit?: string;
  baseUnit?: string;
  batchCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number;
}

interface BorrowInput { holderId: string; dueDate?: string | null; note?: string; }
interface ReturnInput { note?: string; }
interface WithdrawInput { destinationId?: string; note?: string; }
interface ReserveInput { holderId: string; startDate?: string | null; endDate?: string | null; note?: string; }
interface RepairInput { reason: string; etaDate?: string | null; note?: string; }
interface MoveItemInput { toContainerId: string; }
interface MarkFoundInput { containerId: string; }
interface ConsumeStockInput { quantity: number; note?: string; }
interface RestockStockInput { quantity: number; note?: string; }
interface StockCountInput { countedQuantity: number; note?: string; }
interface StockAdjustInput { variance: number; reason: string; approvalNote?: string; }
interface InviteMemberInput { email: string; primaryRole: 'owner' | 'admin' | 'member' | 'viewer'; }
interface UpdateMemberRoleInput { primaryRole: 'owner' | 'admin' | 'member' | 'viewer'; }
```

## Example
**`POST /workspaces/:wsId/items/:id/borrow`**

Request:
```json
{ "holderId": "a3f1...uuid", "dueDate": "2026-07-31T00:00:00Z", "note": "ยืมไปประชุม" }
```
Response `200`:
```json
{ "data": {
    "id": "item-uuid",
    "name": "เครื่องโปรเจกเตอร์",
    "status": "taken_out",
    "containerId": "cont-uuid",
    "currentHolderId": "a3f1...uuid",
    "updatedAt": "2026-06-28T10:00:00Z"
} }
```

## การ map กับ TanStack Query
- endpoint อ่าน → `useQuery`
- endpoint เขียน → `useMutation` + invalidate
- query key ผ่าน factory ที่ `src/lib/queryKeys.ts`

## Open Questions
- รายละเอียด field ของ `Notification` และ `ReportSummary` ยังต้อง sync กับ backend contract
- ชื่อ endpoint จริงสำหรับ withdraw / reserve / repair / count / adjust อาจปรับได้ตาม backend final contract
- `ItemEvent.type` ฝั่ง backend อาจแตกต่างจาก label ที่ UI แสดง

## เอกสารที่เกี่ยวข้อง
- [state-management.md](../state/state-management.md)
- [permission-ui.md](../security/permission-ui.md)
- [screen-flow.md](../ui/screen-flow.md)
