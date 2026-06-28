# API Contract — WhereIs Frontend

สัญญาการเรียก API ที่ **frontend สมมติจาก backend** (backend เป็นอีก service, stack-agnostic)

> ⚠️ นี่คือ **contract ที่ frontend ยึด** — backend คือ source of truth จริง ถ้าไม่ตรงให้ **อัปเดตไฟล์นี้ก่อน** แล้วค่อยแก้โค้ด
> Frontend ใช้ไฟล์นี้สร้าง: API client (`src/api/*.api.ts`), TypeScript types (`src/types/`), React Query hooks, และ Mock data
> type ระดับ field ทั้งหมดดู [domain-model.md](../architecture/domain-model.md#7-field-reference-type-ฝั่ง-frontend)

## หลักการทั่วไป
- Protocol: **REST over HTTPS**, รูปแบบข้อมูล **JSON**
- Base URL: ตั้งผ่าน env `VITE_API_BASE_URL`
- Client: **Axios instance เดียว** ที่ `src/api/client.ts`
- request ที่ต้อง auth แนบ `Authorization: Bearer <token>` ผ่าน interceptor
- request ภายใต้ workspace แนบ workspace id (header หรือ path `/workspaces/:wsId/...`)

## Convention
- ชื่อ field: `camelCase`
- เวลา: ISO 8601 (UTC) เช่น `2026-06-28T10:00:00Z`
- pagination: `?page=1&limit=20`
- id เป็น string (UUID)

## รูปแบบ Response มาตรฐาน

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
| 400 | validation ผิด | แสดง error ราย field |
| 401 | ไม่ได้ auth / token หมดอายุ | logout + redirect `/login` |
| 403 | ไม่มีสิทธิ์ | แสดง "ไม่มีสิทธิ์" (ดู [permission-ui.md](../security/permission-ui.md)) |
| 404 | ไม่พบข้อมูล | empty / not found |
| 422 | semantic error | ข้อความรวม |
| 5xx | server error | error + ปุ่ม retry |

> 401 จัดการรวมที่ axios response interceptor ไม่กระจายในแต่ละ hook

## Endpoint (เริ่มต้น — sync กับ backend)
> จัดเป็นไฟล์ตาม `src/api/*.api.ts` (ดู [folder-structure.md](../architecture/folder-structure.md))

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
| GET | `/workspaces` | (auth) | `{ data: Workspace[] }` |
| POST | `/workspaces` | (auth) | `{ data: Workspace }` |
| GET | `/workspaces/:id` | `workspace.view` | `{ data: Workspace & { permissions } }` |
| PUT | `/workspaces/:id` | `workspace.update` | `{ data: Workspace }` |
| DELETE | `/workspaces/:id` | `workspace.delete` | `{ data: { success } }` |

### Dashboard (`dashboard.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/dashboard` | `item.view` | `{ data: { totalItems, stored, takenOut, missing } }` |

### Sites (`site.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/sites` | `site.view` | `{ data: Site[] }` |
| GET | `/workspaces/:wsId/sites/:id` | `site.view` | `{ data: Site }` |
| POST | `/workspaces/:wsId/sites` | `site.create` | `{ data: Site }` |
| PUT | `/workspaces/:wsId/sites/:id` | `site.update` | `{ data: Site }` |
| DELETE | `/workspaces/:wsId/sites/:id` | `site.delete` | `{ data: { success } }` |

### Locations (`location.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/sites/:siteId/locations` | `location.view` | `{ data: Location[] }` (flat, มี parentId) |
| POST | `/workspaces/:wsId/locations` | `location.create` | `{ data: Location }` |
| PUT | `/workspaces/:wsId/locations/:id` | `location.update` | `{ data: Location }` |
| DELETE | `/workspaces/:wsId/locations/:id` | `location.delete` | `{ data: { success } }` |

### Containers (`container.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/locations/:locId/containers` | `container.view` | `{ data: Container[] }` |
| GET | `/workspaces/:wsId/containers/:id` | `container.view` | `{ data: Container }` |
| GET | `/workspaces/:wsId/containers/:id/items` | `item.view` | `{ data: Item[] }` |
| POST | `/workspaces/:wsId/containers` | `container.create` | `{ data: Container }` |
| PUT | `/workspaces/:wsId/containers/:id` | `container.update` | `{ data: Container }` |
| DELETE | `/workspaces/:wsId/containers/:id` | `container.delete` | `{ data: { success } }` |

### Items (`item.api.ts`)
| Method | Endpoint | Body / Query | Response |
|--------|----------|--------------|----------|
| GET | `/workspaces/:wsId/items` | `?q&siteId&status&page&limit` | `{ data: Item[], meta }` |
| GET | `/workspaces/:wsId/items/:id` | — | `{ data: Item }` |
| POST | `/workspaces/:wsId/items` | `CreateItemInput` | `{ data: Item }` |
| PUT | `/workspaces/:wsId/items/:id` | `UpdateItemInput` | `{ data: Item }` |
| DELETE | `/workspaces/:wsId/items/:id` | — | `{ data: { success } }` |
| POST | `/workspaces/:wsId/items/:id/move` | `{ toContainerId }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/take-out` | `{ holderId, note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/return` | `{ note? }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/mark-missing` | — | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/mark-found` | `{ containerId }` | `{ data: Item }` |
| POST | `/workspaces/:wsId/items/:id/dispose` | `{ reason? }` | `{ data: Item }` |
| GET | `/workspaces/:wsId/items/:id/events` | — | `{ data: ItemEvent[] }` |

> action endpoints ต้องการ permission ตามชื่อ action (`item.move`, `item.takeout`, `item.return`, `item.mark_missing`, `item.mark_found`, `item.dispose`) ดู [permission-ui.md](../security/permission-ui.md)

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
| GET | `/workspaces/:wsId/members/:id/permissions` | `permission.override` | `{ data: { role, effective, overrides } }` |
| PUT | `/workspaces/:wsId/members/:id/permissions` | `permission.override` | `{ data: { effective } }` |

### Activity (`item.api.ts` หรือ `activity.api.ts`)
| Method | Endpoint | Perm | Response |
|--------|----------|------|----------|
| GET | `/workspaces/:wsId/activity` | `activity.view` | `{ data: ItemEvent[], meta }` |

## Entity Types
รูปร่าง entity ทั้งหมด (User, Workspace, Site, Location, Container, Item, Member, ItemEvent) อยู่ที่เดียวใน [domain-model.md](../architecture/domain-model.md#7-field-reference-type-ฝั่ง-frontend) — ห้ามนิยามซ้ำที่นี่

Envelope + error:
```ts
interface ApiResponse<T> { data: T; meta?: { page: number; limit: number; total: number }; }
interface ApiError { error: { code: string; message: string; fields?: Record<string, string> }; }
```

## Request DTO (ตัวอย่างที่ใช้บ่อย)
```ts
interface CreateItemInput { name: string; code?: string; description?: string; containerId: string; }
interface UpdateItemInput { name?: string; code?: string; description?: string; }
interface TakeOutInput { holderId: string; note?: string; }
interface MoveItemInput { toContainerId: string; }
interface MarkFoundInput { containerId: string; }
interface InviteMemberInput { email: string; role: 'admin' | 'member' | 'viewer'; }
```

## ตัวอย่างเต็ม (1 endpoint)
**`POST /workspaces/:wsId/items/:id/take-out`** — ยืม/นำของออก · permission: `item.takeout`

Request:
```json
{ "holderId": "a3f1...uuid", "note": "ยืมไปประชุม" }
```
Response `200`:
```json
{ "data": {
    "id": "item-uuid", "name": "เครื่องโปรเจกเตอร์", "status": "taken_out",
    "containerId": "cont-uuid", "currentHolderId": "a3f1...uuid",
    "updatedAt": "2026-06-28T10:00:00Z"
} }
```
Error `409` (status เปลี่ยนไปแล้ว):
```json
{ "error": { "code": "INVALID_STATE", "message": "ของชิ้นนี้ถูกนำออกไปแล้ว" } }
```
รูปแบบ/สถานะ error ทั้งหมดดูตาราง [HTTP Status](#http-status-ที่-frontend-ต้องจัดการ) ด้านบน

## การ map กับ TanStack Query
- endpoint อ่าน → `useQuery`; endpoint เขียน → `useMutation` + invalidate
- query key ผ่าน factory ที่ `src/lib/queryKeys.ts` (ดู [state-management.md](../state/state-management.md))
- กฎ invalidate ของ action (move/takeout/return) อยู่ใน [state-management.md](../state/state-management.md#cache-rules)

## เอกสารที่เกี่ยวข้อง
- [state-management.md](../state/state-management.md) — query key + caching
- [permission-ui.md](../security/permission-ui.md) — การจัดการ 401/403
- [screen-flow.md](../ui/screen-flow.md) — หน้าไหนเรียก endpoint อะไร
