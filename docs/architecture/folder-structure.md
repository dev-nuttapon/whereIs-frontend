# Folder Structure — WhereIs Frontend

โครงสร้างโฟลเดอร์มาตรฐานของ Frontend — แยก **API layer**, **feature modules** และ **shared layer**

## โครงสร้างหลัก

```
src/
├── api/                    # API client + ฟังก์ชันเรียก endpoint (1 ไฟล์ / domain, ชื่อ "เอกพจน์")
│   ├── client.ts           # axios instance + interceptors
│   ├── auth.api.ts
│   ├── workspace.api.ts
│   ├── dashboard.api.ts
│   ├── site.api.ts
│   ├── location.api.ts
│   ├── container.api.ts
│   ├── item.api.ts         # รวม search + actions + events + activity
│   ├── member.api.ts
│   └── permission.api.ts
│
├── features/               # business logic แยกตาม domain
│   ├── auth/
│   ├── workspaces/
│   ├── dashboard/
│   ├── sites/
│   ├── locations/
│   ├── containers/
│   ├── items/
│   ├── members/
│   ├── permissions/
│   ├── activity/
│   └── settings/
│       # ภายในแต่ละ feature:
│       #   pages/        หน้าจอ (route target)
│       #   components/   component เฉพาะ feature
│       #   hooks/        query/mutation hooks (ใช้ api/*.api.ts)
│       #   validation/   zod schemas เฉพาะ feature
│       #   types.ts      type เฉพาะ feature
│
├── components/             # UI ใช้ซ้ำทั้งแอป (ไม่ผูก domain)
│   ├── ui/               # shadcn/ui primitives (copy-in: Button, Dialog, Select…)
│   ├── common/           # component กลางของเรา (ItemCard, StatusBadge, SearchBar…)
│   ├── layout/           # Sidebar, Topbar, Breadcrumb (ชิ้นส่วนของ layout)
│   ├── forms/            # field components ที่ reuse (FormField…)
│   └── feedback/         # EmptyState, LoadingState, ErrorState, ConfirmDialog
│
├── layouts/
│   ├── AppLayout.tsx       # layout หลักหลัง login
│   ├── AuthLayout.tsx      # layout หน้า login/register
│   └── WorkspaceSelectLayout.tsx  # หน้าเลือก workspace
│
├── routes/
│   ├── index.tsx           # กำหนด routes ทั้งหมด
│   └── protected-route.tsx # route guard (auth + permission)
│
├── stores/                 # zustand stores
│   ├── auth.store.ts
│   ├── workspace.store.ts
│   └── ui.store.ts
│
├── hooks/                  # shared hooks (เช่น useAuth, usePermission)
│
├── lib/                    # config กลาง
│   ├── queryClient.ts      # config TanStack Query
│   ├── queryKeys.ts        # query key factory
│   └── cn.ts               # helper รวม class (clsx + tailwind-merge)
│
├── types/
│   ├── api.types.ts
│   ├── domain.types.ts
│   └── permission.types.ts
│
├── utils/
│   ├── date.ts
│   ├── format.ts
│   └── permission.ts       # helper can() / hasPermission()
│
├── constants/              # route paths, roles, config
├── styles/
│   └── globals.css         # Tailwind directives + CSS variables (design tokens, ดู theme.md)
├── main.tsx                # entry point
└── vite-env.d.ts

# root: tailwind.config.ts · postcss.config.js · components.json (shadcn) · .env
```

> ชื่อไฟล์ api เป็น **เอกพจน์** (`item.api.ts`) ให้ตรงกับ PROJECT_CONTEXT และ module docs

## หลักการจัดวาง
1. **API layer แยกชัด** — ฟังก์ชันเรียก endpoint อยู่ใน `api/*.api.ts` เท่านั้น component/hook ไม่เรียก axios ตรง
2. **Feature-first** — โค้ดของ domain เดียวกันอยู่ใน `features/<name>/`; hook ใน feature เรียกผ่าน `api/*.api.ts`
3. **Shared ขึ้นบน** — อะไรที่ใช้ข้าม feature ย้ายขึ้น `components/`, `hooks/`, `utils/`
4. **ห้าม import ข้าม feature ตรงๆ** — ถ้าใช้ร่วมกันให้ยกขึ้น shared layer

## กฎการตั้งชื่อไฟล์
| ประเภท | รูปแบบ | ตัวอย่าง |
|--------|--------|----------|
| Component | `PascalCase.tsx` | `ItemCard.tsx` |
| API module | `xxx.api.ts` (เอกพจน์) | `item.api.ts` |
| Hook | `useXxx.ts` | `useItems.ts` |
| Store | `xxx.store.ts` | `auth.store.ts` |
| Type | `xxx.types.ts` | `domain.types.ts` |
| Util | `camelCase.ts` | `permission.ts` |

> มาตรฐานเพิ่มเติมดู [coding-style.md](coding-style.md) และ [component-rules.md](../ui/component-rules.md)

## เอกสารที่เกี่ยวข้อง
- [state-management.md](../state/state-management.md) — store อยู่ที่ไหน เก็บอะไร
- [api-contract.md](../api/api-contract.md) — endpoint ของแต่ละ `*.api.ts`
- [component-rules.md](../ui/component-rules.md) — กติกาเขียน component
