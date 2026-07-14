# Frontend / Backend Integration Contract

> เอกสารนี้กำหนดวิธีทำงานร่วมกันของ `whereIs-frontend` และ `whereIs-backend`
> เป้าหมายคือให้ UI เป็นตัวเรียก API เพื่อบันทึกข้อมูลจริงลงฐานข้อมูลผ่าน backend เท่านั้น

## 1. Core Rule

- Frontend ห้ามเขียนฐานข้อมูลตรง
- ทุก create / update / delete / workflow action ต้องผ่าน backend API
- Backend เป็นตัว enforce permission, workspace scope, validation, และ persistence
- Frontend ทำหน้าที่:
  - render UI
  - collect input
  - call API
  - refetch / invalidate cache

## 2. Working Model

```text
UI page/dialog
  -> src/features/* hook
  -> src/api/*.api.ts
  -> backend controller
  -> backend application handler
  -> EF Core / MySQL
```

### Expected behavior

- เมื่อผู้ใช้กดบันทึกข้อมูลในหน้าเว็บ
  - frontend เรียก mutation hook
  - mutation ส่ง request ไป backend
  - backend เขียนข้อมูลจริงลง DB
  - backend ส่ง response กลับ
  - frontend invalidate query ที่เกี่ยวข้อง

## 3. Path Mapping

### Frontend paths

| Frontend file | Role |
|---|---|
| `src/features/items/pages/ItemsPage.tsx` | list / search / filter items |
| `src/features/items/components/ItemFormDialog.tsx` | create/update item form |
| `src/features/items/components/ItemDetailPage.tsx` | item detail + history + delete |
| `src/features/search/pages/SearchPage.tsx` | discovery entry point |
| `src/features/activity/pages/ActivityPage.tsx` | workspace audit feed |
| `src/features/reports/pages/ReportsPage.tsx` | summary / export surface |
| `src/features/notifications/pages/NotificationsPage.tsx` | notification feed |
| `src/features/containers/pages/ContainerDetailPage.tsx` | container contents + quick item creation |
| `src/api/item.api.ts` | item API client |
| `src/api/activity.api.ts` | activity API client |
| `src/api/report.api.ts` | reports API client |
| `src/api/notification.api.ts` | notifications API client |

### Backend paths

| Backend file | Role |
|---|---|
| `src/WhereIs.Api/Controllers/ItemsController.cs` | `/items` endpoints |
| `src/WhereIs.Api/Controllers/ActivityController.cs` | `/activity` endpoint |
| `src/WhereIs.Api/Controllers/ReportsController.cs` | `/reports` + export |
| `src/WhereIs.Api/Controllers/NotificationsController.cs` | `/notifications` + read actions |
| `src/WhereIs.Application/Features/Items/*` | item queries and commands |
| `src/WhereIs.Application/Features/Activity/*` | activity query |
| `src/WhereIs.Application/Features/Reports/*` | report query |
| `src/WhereIs.Application/Features/Notifications/*` | notification queries and commands |
| `src/WhereIs.Domain/Entities/Item.cs` | canonical item aggregate |
| `src/WhereIs.Domain/Entities/ItemEvent.cs` | item audit trail |
| `src/WhereIs.Domain/Entities/Notification.cs` | notification feed row |

## 4. Route Mapping

### Frontend route -> backend endpoint

| Frontend route | Backend endpoint |
|---|---|
| `/w/:wsId/items` | `GET /api/v1/workspaces/{wsId}/items` |
| `/w/:wsId/items/new` | `POST /api/v1/workspaces/{wsId}/items` |
| `/w/:wsId/items/:itemId` | `GET /api/v1/workspaces/{wsId}/items/{itemId}` |
| `/w/:wsId/items/:itemId/edit` | `PUT /api/v1/workspaces/{wsId}/items/{itemId}` |
| `/w/:wsId/items/:itemId` delete action | `DELETE /api/v1/workspaces/{wsId}/items/{itemId}` |
| `/w/:wsId/items/:itemId` activity tab / feed | `GET /api/v1/workspaces/{wsId}/items/{itemId}/events` |
| `/w/:wsId/search` | `GET /api/v1/workspaces/{wsId}/items?q=&kind=&status=&containerId=&holderId=` |
| `/w/:wsId/activity` | `GET /api/v1/workspaces/{wsId}/activity` |
| `/w/:wsId/reports` | `GET /api/v1/workspaces/{wsId}/reports` |
| `/w/:wsId/reports` export | `GET /api/v1/workspaces/{wsId}/reports/export` |
| `/w/:wsId/notifications` | `GET /api/v1/workspaces/{wsId}/notifications` |
| notifications read action | `POST /api/v1/workspaces/{wsId}/notifications/{notificationId}/read` |
| notifications mark-all action | `POST /api/v1/workspaces/{wsId}/notifications/read-all` |

## 5. Data Flow Standard

### Create item

1. User fills `ItemFormDialog`
2. `useCreateItem()` sends mutation
3. `src/api/item.api.ts` posts to backend
4. `ItemsController.Create()` receives request
5. Application handler writes `Item`, `ItemEvent`, and `Notification`
6. Frontend invalidates `items`, `dashboard`, `activity`, `reports`, `notifications`

### Update item

1. User edits item in `UpdateItemDialog`
2. `useUpdateItem()` sends mutation
3. Backend updates item row and writes follow-up event/notification
4. Frontend refetches current item and dependent workspace views

### Search / browse

1. User changes URL query params
2. `SearchPage` reads params as source of truth
3. `useSearchItems()` calls `GET /items`
4. Results render from backend data only

### Audit / reporting / notification

- `ActivityPage` reads workspace events from backend
- `ReportsPage` reads summaries from backend
- `NotificationsPage` reads/updates notifications from backend

## 6. Non-Negotiable Rules

- Do not add direct DB access in frontend
- Do not duplicate write logic in UI state
- Do not derive audit history from form state
- Do not invent frontend-only source of truth for data that backend owns
- If backend contract changes, update this file and `docs/api/api-contract.md` together

## 7. Maintenance Checklist

- New frontend form or workflow:
  - add/extend `src/api/*.api.ts`
  - add/extend `src/features/*/hooks/*`
  - add/update backend controller and application handler
  - update this document
- New backend endpoint:
  - add controller route
  - add application handler
  - update API contract docs
  - update frontend API client if the UI consumes it

