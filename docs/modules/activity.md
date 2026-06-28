# Module: Activity

> บันทึกกิจกรรมทั้งหมดของ Workspace — ทุก action ที่เกิดกับ Item จะปรากฏที่นี่
> อ้างอิง: [domain-model.md](../architecture/domain-model.md) · [item.md](item.md) · [security/permission-ui.md](../security/permission-ui.md)

---

## 1. Purpose

แสดง ItemEvent feed ระดับ Workspace ให้ผู้ใช้เห็นว่า "ใครทำอะไรกับของชิ้นไหน เมื่อไหร่" — ตอบโจทย์ audit trail และ transparency ในทีม

---

## 2. User Stories

- ในฐานะ admin ฉันต้องการดู **ประวัติกิจกรรมทั้งหมด** ของ Workspace เพื่อ audit
- ฉันต้องการรู้ว่า **ใครนำของออกไป** และ **คืนมาแล้วหรือยัง**
- ฉันต้องการเห็นว่า **มีของหายเมื่อไหร่** และใครแจ้ง
- ฉันต้องการ **scroll ย้อนดูประวัติ** ได้โดยไม่ต้องออกจากหน้า

---

## 3. Screen Description

| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Activity Log | `/w/:wsId/activity` | feed ItemEvent ของ workspace + pagination |
| (ส่วน Dashboard) | `/w/:wsId` | recent activity 10 รายการล่าสุด (ดู [dashboard.md](dashboard.md)) |
| (ส่วน Item Detail) | `/w/:wsId/items/:id` | event timeline เฉพาะของชิ้นนั้น (ดู [item.md](item.md)) |

---

## 4. Components

| Component | ที่อยู่ | หน้าที่ |
|-----------|---------|---------|
| `ActivityFeed` | `features/activity/components/` | รายการ event แบบ feed + pagination |
| `ActivityItem` | `features/activity/components/` | 1 event: icon + actor + action + item + timestamp |
| `ActivityFilter` | `features/activity/components/` | filter by type / actor (future) |
| `ActivityPage` | `features/activity/pages/` | หน้า `/activity` — wraps ActivityFeed |
| `RecentActivity` | `features/dashboard/components/` | widget บน Dashboard (limit 10) |

### ActivityItem layout
```
┌────────────────────────────────────────────────────┐
│ [🔄 icon]  นุตตะพน  ย้าย  กล้อง Canon  →  ห้อง A1  │
│            เมื่อ 5 นาทีที่แล้ว                       │
└────────────────────────────────────────────────────┘
```

icon ตาม event type:
| type | icon | label |
|------|------|-------|
| `created` | ➕ | เพิ่มของ |
| `updated` | ✏️ | แก้ไขข้อมูล |
| `moved` | 🔄 | ย้ายไปยัง |
| `taken_out` | 📤 | ยืมออกไป |
| `returned` | 📥 | คืนแล้ว |
| `marked_missing` | ❓ | แจ้งหาย |
| `marked_found` | ✅ | พบแล้ว |
| `disposed` | 🗑️ | จำหน่ายแล้ว |

---

## 5. Forms

Activity Log เป็น **read-only** — ไม่มีฟอร์ม ไม่มี input ยกเว้น filter (future)

Filter (future):
- กรองตาม event type (checkbox group)
- กรองตาม actor (member picker)
- กรองตาม item (search + select)
- กรองตาม date range (date picker)

---

## 6. API Calls

ผ่าน `src/api/item.api.ts` (ดู [api/api-contract.md](../api/api-contract.md)):

| Method | Endpoint | Query Params | Response |
|--------|----------|--------------|----------|
| GET | `/workspaces/:wsId/activity` | `?page=1&limit=20` | `{ data: ItemEvent[], meta }` |

`ItemEvent` field ดูที่ [domain-model.md](../architecture/domain-model.md):
```ts
interface ItemEvent {
  id: string;
  workspaceId: string;
  itemId: string;
  type: 'created' | 'updated' | 'moved' | 'taken_out' | 'returned' |
        'marked_missing' | 'marked_found' | 'disposed';
  actor: Pick<User, 'id' | 'name'>;
  payload?: Record<string, unknown>;   // รายละเอียด เช่น fromContainer, toContainer
  createdAt: string;  // ISO 8601
}
```

---

## 7. React Query

```ts
// hook อยู่ใน features/activity/hooks/useActivity.ts
useActivity(wsId: string, params: ActivityParams)
  → useQuery(['ws', wsId, 'activity', params], ...)

// ใช้ queryKeys factory:
queryKeys.activity(wsId) → ['ws', wsId, 'activity']
```

- `staleTime`: 60s (ไม่ต้อง real-time มาก)
- `keepPreviousData: true` ระหว่างเปลี่ยนหน้า (pagination)
- ไม่ต้อง invalidate เอง — mutation ของ item actions จาก [item.md](item.md) จะ invalidate `queryKeys.activity(wsId)` อัตโนมัติ

---

## 8. Zustand

- ไม่เก็บ activity data ใน Zustand (เป็น server state ทั้งหมด)
- อ่าน `workspaceStore.currentWorkspaceId` เพื่อ query
- อ่าน `authStore.user` เพื่อ highlight activity ของตัวเอง (future)

---

## 9. Validation

ไม่มี form validation — หน้านี้เป็น read-only

---

## 10. Navigation

```
[Sidebar: Activity] → [Activity Log page]

[Dashboard: StatCard "Taken Out"] → [Search?status=taken_out]
[Dashboard: Recent Activity widget] → คลิก activity item → [Item Detail]

[Item Detail: Activity tab] → แสดง event ของ item นั้นโดยตรง (ไม่ navigate)
```

- คลิก item name ใน ActivityItem → navigate ไป `/w/:wsId/items/:itemId`
- คลิก actor name (future) → filter activity โดย actor

---

## 11. Permission Rules

| Action | Permission ที่ต้องมี |
|--------|---------------------|
| ดู Activity Log | `activity.view` |
| ดู Recent Activity บน Dashboard | `activity.view` |

- ถ้าไม่มี `activity.view` → ซ่อนเมนู **Activity** ใน Sidebar
- ถ้าไม่มี `activity.view` → ไม่แสดง Recent Activity section บน Dashboard
- ดูตาราง permission ครบที่ [security/permission-ui.md](../security/permission-ui.md)

---

## 12. Loading State

| ส่วน | Pattern |
|------|---------|
| Activity Feed (ครั้งแรก) | Skeleton ActivityItem × 5 รายการ |
| เปลี่ยนหน้า pagination | keepPreviousData — content ไม่หาย |
| Recent Activity บน Dashboard | Skeleton × 3 รายการ |

---

## 13. Error State

| กรณี | การจัดการ |
|------|----------|
| Network error | `<ErrorState onRetry={refetch} />` |
| 403 (ไม่มี permission) | redirect จาก route guard → ไม่ถึงหน้านี้ |
| Empty response | แสดง Empty State (ดูหัวข้อ 14) |

---

## 14. Empty State

```
Component: <EmptyState
  icon={<ClipboardList />}
  title="ยังไม่มีกิจกรรม"
  description="กิจกรรมจะปรากฏเมื่อมีการเพิ่ม ย้าย หรือยืมสิ่งของใน Workspace นี้"
/>
```

- ไม่มี action button (เป็น read-only)
- Recent Activity บน Dashboard: แสดงข้อความสั้น "ยังไม่มีกิจกรรมล่าสุด"

---

## 15. Responsive Design

| Breakpoint | พฤติกรรม |
|------------|----------|
| Desktop | ActivityFeed เต็มกว้าง, pagination ด้านล่าง |
| Tablet | เหมือน desktop ย่อขนาด font เล็กลง |
| Mobile | 1 column, timestamp ย้ายไปบรรทัดใหม่ |

- icon ของ event type ขนาดเล็กบน mobile (24px)
- actor name ย่อด้วย truncate ถ้ายาว

---

## 16. Future Improvements

- Filter ตาม type / actor / item / date range
- Export CSV / PDF
- Real-time update (WebSocket หรือ polling)
- Activity ของ item เฉพาะ (ตอนนี้ embed ใน Item Detail แล้ว)
- Notification เมื่อมี event ที่เกี่ยวกับตัวเอง
- Summary view (กี่ครั้ง take out, กี่ชิ้นหาย, ฯลฯ)

---

## 17. Definition of Done

- [ ] Activity Log page (`/w/:wsId/activity`) แสดง ItemEvent feed
- [ ] ActivityItem component: icon + actor + action + item name + timestamp
- [ ] Pagination ทำงานถูกต้อง (keepPreviousData, URL param)
- [ ] Recent Activity widget บน Dashboard (limit 10, คลิกไป item detail)
- [ ] ซ่อนเมนูและ widget เมื่อไม่มี `activity.view`
- [ ] Loading skeleton (feed + dashboard widget)
- [ ] Empty state (feed ว่าง)
- [ ] Error state + retry
- [ ] Responsive (mobile: timestamp ใหม่บรรทัด, icon ย่อ)
- [ ] คลิก item name ใน ActivityItem → navigate Item Detail
