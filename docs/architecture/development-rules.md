# Development Rules — WhereIs Frontend

กฎความรับผิดชอบของแต่ละ layer ใน codebase — ใช้เป็นเกณฑ์ตัดสินใจว่าโค้ดควรอยู่ที่ไหน
ดูโครงสร้างโฟลเดอร์จริงที่ [folder-structure.md](folder-structure.md)

---

## 1. Folder Responsibilities

### `src/api/` — API Layer
**อยู่ที่นี่:** ฟังก์ชันเรียก HTTP endpoint + TypeScript request/response types

**ห้าม:** React hooks, state management, business logic, UI concerns

```ts
// ✅ ถูก: ฟังก์ชันเรียก endpoint + type
export async function getItem(wsId: string, id: string): Promise<Item> {
  const { data } = await client.get(`/workspaces/${wsId}/items/${id}`);
  return data.data;
}

// ❌ ผิด: ไม่ควรมี useQuery ใน api/*.api.ts
export function useItem(wsId: string, id: string) {  // ← ต้องย้ายไป features/items/hooks/
  return useQuery(...)
}
```

**กฎตั้งชื่อ:** เอกพจน์ (`item.api.ts` ไม่ใช่ `items.api.ts`)

---

### `src/features/<name>/` — Feature Layer
**อยู่ที่นี่:** โค้ดทุกอย่างที่เป็นของ domain นั้น และใช้เฉพาะ domain นั้น

```
features/items/
  pages/          ← หน้าจอ (route target ที่ routes/index.tsx ชี้มา)
  components/     ← component ที่ใช้แค่ใน items feature
  hooks/          ← useQuery/useMutation hooks
  validation/     ← Zod schemas
  types.ts        ← TypeScript types เฉพาะ feature
```

**กฎ:** hook ใน `features/<x>/hooks/` ต้องเรียกผ่าน `api/<x>.api.ts` เท่านั้น
**ห้าม:** `features/items/` import จาก `features/containers/` โดยตรง — ถ้าต้องใช้ร่วมให้ยกขึ้น `components/common/`

---

### `src/components/` — Shared Component Layer

| โฟลเดอร์ | ใช้กับ | ตัวอย่าง |
|---------|--------|----------|
| `ui/` | shadcn/ui primitives (copy-in) | `Button`, `Dialog`, `Select`, `Input` |
| `common/` | domain-aware แต่ใช้ข้าม feature | `ItemCard`, `StatusBadge`, `SearchBar`, `ContainerPicker` |
| `layout/` | ชิ้นส่วนของ layout shell | `Sidebar`, `Topbar`, `Breadcrumb` |
| `forms/` | reusable form field components | `FormField`, `FormError` |
| `feedback/` | UI states | `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog` |

---

### `src/stores/` — Client State Layer
**อยู่ที่นี่:** สถานะ client-side ที่ใช้ข้าม component และไม่ใช่ server data

| Store | เก็บอะไร |
|-------|---------|
| `auth.store.ts` | `accessToken`, `user`, `isAuthenticated` |
| `workspace.store.ts` | `currentWorkspaceId`, `currentWorkspace`, `permissions` |
| `ui.store.ts` | `sidebarOpen`, `theme` |

**ห้าม:** เก็บ server data (items, members, sites) ใน store — ใช้ TanStack Query

---

### `src/routes/` — Routing Layer
**อยู่ที่นี่:** route definitions และ guard components

- `index.tsx` กำหนด route tree ทั้งหมด รวม layout nesting
- `protected-route.tsx` ตรวจ auth + permission — redirect ที่นี่ที่เดียว ไม่กระจาย

---

### `src/lib/` — Config + Utility Layer
- `queryClient.ts`: config `QueryClient` (staleTime, retry, errorBoundary)
- `queryKeys.ts`: query key factory — ทุก `useQuery` ต้องใช้ key จากที่นี่
- `cn.ts`: `clsx + tailwind-merge` helper

---

### `src/layouts/` — Layout Shell Layer
- `AppLayout.tsx`: Topbar + Sidebar + `<Outlet />` — ไม่รู้จัก page content
- `AuthLayout.tsx`: centered card, ไม่มี sidebar/topbar
- `WorkspaceSelectLayout.tsx`: minimal layout สำหรับเลือก workspace

---

## 2. Feature Ownership

Feature folder เป็นเจ้าของ:

| สิ่งที่ feature ควบคุม | ตัวอย่าง |
|----------------------|----------|
| Pages ที่ render ที่ route ของตัวเอง | `features/items/pages/ItemDetailPage.tsx` |
| Component ที่ใช้เฉพาะ feature นั้น | `features/items/components/TakeOutDialog.tsx` |
| Hooks ที่ query/mutate data ของ feature นั้น | `features/items/hooks/useItem.ts` |
| Zod schemas สำหรับฟอร์มของตัวเอง | `features/items/validation/itemSchema.ts` |
| TypeScript types เฉพาะ feature | `features/items/types.ts` |

**เมื่อไหร่ต้อง promote ขึ้น shared:**
- Component ถูกใช้ใน 2 feature ขึ้นไป → `components/common/`
- Hook ถูกใช้ข้าม feature → `hooks/`
- Util ถูกใช้ข้าม feature → `utils/`

---

## 3. Component Ownership

Decision tree สำหรับวาง component ใหม่:

```
Component ใหม่จะวางที่ไหน?
│
├─ เป็น shadcn/ui primitive (copy-in)?
│   └─ → src/components/ui/
│
├─ เป็นส่วนของ layout shell (Sidebar, Topbar, Breadcrumb)?
│   └─ → src/components/layout/
│
├─ เป็น feedback UI (Loading, Empty, Error, Confirm)?
│   └─ → src/components/feedback/
│
├─ ใช้ข้าม feature หลาย feature?
│   └─ → src/components/common/
│
└─ ใช้เฉพาะ feature เดียว?
    └─ → src/features/<name>/components/
```

---

## 4. API Responsibilities

ไฟล์ `src/api/<domain>.api.ts` ต้องทำ:

- [x] รับ parameter ที่ typed
- [x] เรียก `client` (axios instance) จาก `api/client.ts`
- [x] return typed response
- [x] ไม่มี React hooks หรือ state
- [x] ไม่มี business logic

`api/client.ts` รับผิดชอบ:
- Base URL จาก `VITE_API_BASE_URL`
- แนบ `Authorization: Bearer <token>` ทุก request (interceptor)
- จัดการ 401 → logout + redirect login (interceptor — ที่เดียว)

---

## 5. State Responsibilities

| สถานะ | วางที่ไหน | เหตุผล |
|-------|----------|--------|
| ข้อมูลจาก API (items, sites, members) | TanStack Query | caching, sync, revalidation |
| Auth token + user | `authStore` | ต้องการทุก request |
| Workspace ปัจจุบัน + permissions | `workspaceStore` | ใช้ทั่วแอป + persist |
| Sidebar open/close, theme | `uiStore` | UI state global |
| Modal/dialog open | local `useState` | ใช้เฉพาะ component เดียว |
| Form values | React Hook Form | lifecycle ของฟอร์ม |
| Search/filter parameters | URL query params | shareable, browser history |
| Pagination page | URL query params | shareable, browser history |

**กฎทอง:**
- ถ้าข้อมูลมาจาก API → ใช้ **Query เท่านั้น**, ห้าม copy ลง Zustand
- ถ้า filter/search → ใช้ **URL params เท่านั้น**, ห้ามใช้ Zustand

---

## 6. Naming Rules

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|----------------|--------|----------|
| Component | PascalCase | `ItemCard.tsx` |
| API module | singular.api.ts | `item.api.ts` |
| Hook | useXxx | `useItems.ts` |
| Zustand store | domain.store.ts | `auth.store.ts` |
| Zod schema | camelCaseSchema | `createItemSchema` |
| Query key | เป็น constant object ใน `queryKeys.ts` | `queryKeys.items.detail(wsId, id)` |
| Route path | เป็น constant ใน `constants/routes.ts` | `ROUTES.itemDetail(wsId, id)` |

---

## เอกสารที่เกี่ยวข้อง
- [folder-structure.md](folder-structure.md) — โครงสร้างไฟล์ทั้งหมด
- [coding-style.md](coding-style.md) — มาตรฐานการเขียนโค้ด
- [state/state-management.md](../state/state-management.md) — รายละเอียด store + query
- [api/api-contract.md](../api/api-contract.md) — endpoint ทั้งหมด
- [ui/component-rules.md](../ui/component-rules.md) — กติกา component
