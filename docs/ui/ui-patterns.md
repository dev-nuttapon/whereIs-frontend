# UI Patterns — WhereIs Frontend

Pattern มาตรฐานสำหรับ UI ที่ใช้ซ้ำทั่วแอป — ทุก feature ต้องนำไปใช้ให้สม่ำเสมอ
ดู component ตัวอย่างที่ [component-rules.md](component-rules.md) และ design token ที่ [theme.md](theme.md)

---

## 1. Loading State

ใช้เมื่อ: กำลังโหลดข้อมูลครั้งแรก (`isLoading: true`)

**กฎ**: ใช้ **Skeleton** แทน spinner เพื่อลด layout shift
- Spinner ใช้เฉพาะบนปุ่ม (ระหว่าง mutation) หรือ overlay ขนาดเล็ก

```
Component: <LoadingState />   — full-page loading (spinner centered)
Component: <Skeleton />       — placeholder แทน content ที่กำลังโหลด
```

### Pattern ตามหน้า
| หน้า | Loading Pattern |
|------|-----------------|
| List (Workspace, Member, Search, Container) | `<SkeletonCard />` × 3–5 รายการ |
| Detail (Item, Container) | `<SkeletonDetailHeader />` + section skeletons |
| Timeline / Activity | `<SkeletonTimelineItem />` × 3–5 รายการ |
| Reports / Notifications | summary cards + list skeletons |
| Form | แสดงข้อมูลเดิมทันที (edit form prefill จาก cache) |

---

## 2. Empty State

ใช้เมื่อ: โหลดสำเร็จแต่ไม่มีข้อมูล (`data.length === 0`)

```
Component: <EmptyState icon={…} title="…" description="…" action={…} />
```

### Pattern
- **icon**: ควรสื่อถึง domain (เช่น กล่อง สำหรับ Container)
- **title**: สั้น บอกว่าไม่มีอะไร ("ยังไม่มีสิ่งของ")
- **description**: แนะนำ action ถัดไป ("เพิ่มสิ่งของแรกของคุณ")
- **action**: ปุ่ม CTA — แสดงเฉพาะเมื่อ user มี permission สร้าง

### ตัวอย่าง Empty States
| หน้า | Title | Action |
|------|-------|--------|
| Item Search (ไม่เจอ) | "ไม่พบสิ่งของที่ค้นหา" | ล้าง filter |
| Item Search (ยังไม่มีของ) | "ยังไม่มีสิ่งของใน Workspace นี้" | + เพิ่มสิ่งของ |
| Container items | "ไม่มีของใน Container นี้" | + เพิ่มของ |
| Activity | "ยังไม่มีกิจกรรม" | — |
| Reports | "ยังไม่มีรายงาน" | — |
| Notifications | "ยังไม่มีการแจ้งเตือน" | — |

---

## 3. Error State

ใช้เมื่อ: query หรือ mutation ล้มเหลว

```
Component: <ErrorState message="…" onRetry={refetch} />
```

### Pattern ตาม HTTP Status
| Status | การแสดงผล | Component |
|--------|----------|-----------|
| 404 | หน้า "ไม่พบรายการนี้" + ปุ่มกลับ | `<NotFoundState />` |
| 403 | หน้า "ไม่มีสิทธิ์" + ปุ่มกลับ Dashboard | `<ForbiddenState />` |
| 5xx / Network | ErrorState + ปุ่ม retry | `<ErrorState onRetry={…} />` |
| 409 (conflict) | toast "สถานะถูกเปลี่ยนแล้ว" + refetch | toast only |

> ดู HTTP status ทั้งหมดที่ [api/api-contract.md](../api/api-contract.md)

### Error ในฟอร์ม
- ข้อผิดพลาดราย field แสดงใต้ field ทันที
- 409 (เช่น code ซ้ำ) → map error ลง field เฉพาะ
- Generic error → แสดงใน `<Alert variant="destructive" />`

---

## 4. Search

ดูรายละเอียดทั้งหมดที่ [modules/search.md](../modules/search.md)

### Pattern หลัก
- **Global Search** (Topbar): input → navigate พร้อม `?q=`
- **Search Page** (`/search`): URL params เป็น source of truth, ไม่เก็บ Zustand
- Debounce 300ms ก่อน query
- `keepPreviousData: true` เพื่อไม่ให้ content กระพริบระหว่าง type

### Filter Pattern
- Filter ผูกกับ URL param: `?status=stored&type=single`
- Desktop: filter bar แนวนอนบน list
- Mobile: ปุ่ม "Filter" → Drawer overlay

---

## 5. Table / List

### Desktop
- Table (`<Table />` shadcn/ui) สำหรับ structured data (Members, Containers)
- Column: ชื่อ, action column ขวาสุด
- ไม่มี infinite scroll ใน v1 (ใช้ pagination)

### Mobile
- Table → collapse เป็น Card list หรือ เพิ่ม horizontal scroll
- เลือกตาม density ของข้อมูล

---

## 6. Card

### ItemCard
```
┌─────────────────────────────┐
│ [รูป]  ชื่อสิ่งของ           │
│        StatusBadge          │
│        📍 ตำแหน่ง           │
│        👤 ผู้ถือ (ถ้ามี)      │
└─────────────────────────────┘
```
- **ต้องมีเสมอ**: รูป + ชื่อ + StatusBadge + ตำแหน่ง
- คลิกทั้ง card → Item Detail
- ถ้าเป็น Quantity Item ให้แสดง quantity / unit / batch / expiry แบบย่อในบรรทัดรอง

### WorkspaceCard
- ชื่อ workspace + role ของ user + จำนวน member
- คลิก → เข้า workspace (`/w/:wsId`)

---

## 7. Dialog

ใช้ shadcn/ui `Dialog` (Radix-based) — รองรับ accessibility (focus trap, ESC ปิด) เสมอ

### ประเภท Dialog
| ประเภท | ใช้กับ | ลักษณะ |
|--------|--------|--------|
| **Confirm** | Delete, Dispose (irreversible) | ข้อความเตือน + ปุ่ม confirm/cancel |
| **Form** | Add/Edit Container | ฟอร์มใน dialog (ถ้าไม่ต้องการหน้าเต็ม) |
| **Action** | Borrow, Return, Withdraw, Reserve, Repair, Move, MarkFound | dialog เฉพาะ action + form เล็ก |
| **Alert** | Error ที่ต้อง acknowledge | ข้อความ + ปุ่ม OK |

### กฎ Confirm Dialog
- **Dispose** (irreversible): ให้พิมพ์ชื่อ item หรือกด checkbox ยืนยัน — ห้ามแค่ปุ่ม "ยืนยัน"
- **Delete**: แสดงชื่อ item ที่จะลบใน dialog ด้วย
- **Borrow / Withdraw / Reserve / Repair**: ต้องแสดง current location, holder, และ container scope ก่อนยืนยัน

---

## 8. Drawer

ใช้ shadcn/ui `Sheet` component (Radix-based)

### ใช้กับ
| Use case | Side | Trigger |
|----------|------|---------|
| Sidebar (mobile) | left | hamburger button |
| Filter panel (mobile search) | right/bottom | Filter button |
| ContainerPicker steps (mobile) | bottom | ปุ่มเลือก container |
| Notifications | right | bell icon |

---

## 9. Pagination

ใช้ server-side pagination (backend ส่ง `meta.total` + `meta.page` + `meta.limit`)

```
Component: <Pagination page={…} totalPages={…} onPageChange={…} />
```

- วางด้านล่างของ list/table
- `keepPreviousData: true` — ไม่ให้ content หายขณะเปลี่ยนหน้า
- URL param `?page=` เพื่อ shareable และ browser back/forward ได้
- Default limit: 20 รายการ

---

## 10. Filter

### Desktop
```
┌─────────────────────────────────────────────────┐
│ [🔍 ค้นหา…] [Status ▾] [Container ▾] [x Clear All] │
└─────────────────────────────────────────────────┘
```

### Mobile
```
[🔍 ค้นหา…] [⚙ Filter (2)]
              ↓ tap
         ┌───────────────┐
         │ Filter Drawer  │
         │ Status: [ ] [ ]│
         │ Container: [Select] │
         │ [Clear] [Apply]│
         └───────────────┘
```

### กฎ
- ทุก filter value ผูกกับ URL query param
- "ล้าง filter" → ลบ params ออกจาก URL
- ไม่เก็บ filter state ใน Zustand
- แสดงจำนวน active filter บน mobile button badge

---

## 11. Status Badge

```
Component: <StatusBadge status="stored" />
```

| status | สี | label |
|--------|----|-------|
| `stored` | `bg-green-100 text-green-800` | เก็บอยู่ |
| `taken_out` / `borrowed` | `bg-amber-100 text-amber-800` | ถูกยืมหรือกำลังใช้งาน |
| `missing` | `bg-red-100 text-red-800` | หาย |
| `disposed` | `bg-gray-100 text-gray-600` | จำหน่ายแล้ว |
| `reserved` | `bg-blue-100 text-blue-800` | รอรับ / ถูกจอง |
| `repair` | `bg-purple-100 text-purple-800` | อยู่ระหว่างซ่อม |

- สีตาม [theme.md](theme.md) — ห้าม hardcode
- ขนาด: `sm` (inline) หรือ `md` (card/detail)
- ใช้ `cva` สำหรับ variant เพื่อ type-safe

---

## เอกสารที่เกี่ยวข้อง
- [component-rules.md](component-rules.md) — กฎ component + form
- [theme.md](theme.md) — design token + status colors
- [api/api-contract.md](../api/api-contract.md) — error format
- [modules/search.md](../modules/search.md) — search + filter ละเอียด
