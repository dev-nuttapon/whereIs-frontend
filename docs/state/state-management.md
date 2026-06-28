# State Management — WhereIs Frontend

แนวทางจัดการ state โดยแยกชัดเจนระหว่าง **server state** (TanStack Query) กับ **client state** (Zustand)

## หลักการสำคัญ
> **Server state ใช้ TanStack Query, Client state ใช้ Zustand — ห้ามปนกัน**

| ชนิด state | เครื่องมือ | ตัวอย่าง |
|------------|-----------|----------|
| Server state | **TanStack Query** | items, sites, containers, members, activity |
| Global client state | **Zustand** | auth token, workspace ปัจจุบัน, permissions, theme |
| Local UI state | **useState/useReducer** | modal open, tab ที่เลือก |
| Form state | **React Hook Form** | ค่าในฟอร์ม + validation |

## 1. Server State — TanStack Query

### ใช้กับ
Workspaces, Sites, Locations, Containers, Items, Members, Activity

### กติกา
- ข้อมูลจาก backend = server state → `useQuery` / `useMutation` เท่านั้น
- **ห้าม** copy server data ไปเก็บใน Zustand หรือ useState
- caching, refetch, retry ให้ Query จัดการ
- hook อยู่ใน `features/<x>/hooks/` เรียกผ่าน `api/*.api.ts`

### Query Key Factory (`src/lib/queryKeys.ts`)
```ts
export const queryKeys = {
  items: {
    all: (wsId: string) => ['ws', wsId, 'items'] as const,
    list: (wsId: string, params: ItemListParams) => ['ws', wsId, 'items', 'list', params] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'items', 'detail', id] as const,
    events: (wsId: string, id: string) => ['ws', wsId, 'items', id, 'events'] as const,
  },
  dashboard: (wsId: string) => ['ws', wsId, 'dashboard'] as const,
  activity: (wsId: string) => ['ws', wsId, 'activity'] as const,
};
```
> ใส่ `wsId` ใน key เสมอ เพราะข้อมูลแยกตาม workspace

### ตัวอย่าง Query / Mutation
```ts
export function useItems(wsId: string, params: ItemListParams) {
  return useQuery({
    queryKey: queryKeys.items.list(wsId, params),
    queryFn: () => itemsApi.list(wsId, params),
  });
}

export function useCreateItem(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateItemInput) => itemsApi.create(wsId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items.all(wsId) }),
  });
}
```

### Cache Rules {#cache-rules}
หลัง **Create / Update / Delete Item** ให้ invalidate:
- items search/list
- item detail
- dashboard
- activity

หลัง **Move / Take Out / Return / Mark Missing / Mark Found** ให้ invalidate:
- item detail
- item events
- items search/list
- dashboard

> ทุก mutation ของ item อย่างน้อยต้อง invalidate `queryKeys.items.all(wsId)` + dashboard + activity

## 2. Client State — Zustand

### Stores (`src/stores/`)
แยก store ตาม domain ไม่รวมเป็นก้อนเดียว

#### `auth.store.ts`
```ts
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
```

#### `workspace.store.ts`
```ts
interface WorkspaceState {
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  permissions: string[];          // สิทธิ์ของ ws ปัจจุบัน
  setWorkspace: (ws: Workspace) => void;
  clear: () => void;
}
```
> `permissions` ใช้โดย `usePermission()` / `can()` (ดู [permission-ui.md](../security/permission-ui.md))

#### `ui.store.ts`
```ts
interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}
```

### กติกา
- ใช้ selector subscribe เฉพาะที่ใช้ (กัน re-render เกิน)
- `accessToken` persist ผ่าน `persist` middleware ตามนโยบาย
- ห้ามเก็บ server data (items, members ฯลฯ) ใน store — ใช้ Query

## 3. Local & Form State
- UI state เฉพาะ component → `useState` / `useReducer`
- ฟอร์ม → React Hook Form (ดู [component-rules.md](../ui/component-rules.md))

## Flowchart การตัดสินใจ
```
ข้อมูลมาจาก API?  ── ใช่ ──► TanStack Query
        │
        └─ ไม่ ──► ใช้ข้าม component หลายตัว? ── ใช่ ──► Zustand
                          │
                          └─ ไม่ ──► useState / useReducer
```

## เอกสารที่เกี่ยวข้อง
- [api-contract.md](../api/api-contract.md) — endpoint + response
- [permission-ui.md](../security/permission-ui.md) — auth/workspace store + permissions
- [tech-stack.md](../architecture/tech-stack.md) — เครื่องมือแต่ละตัว
