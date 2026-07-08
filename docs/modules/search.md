# Module: Search

> **ฟีเจอร์หลักของ WhereIs** — ค้นหา item ได้เร็วที่สุด เข้าถึงได้ทุกหน้า
> อ้างอิง: [../project-overview.md](../architecture/project-overview.md) · [item.md](item.md) · [../domain-model.md](../architecture/domain-model.md)

## 1. Purpose
ให้ผู้ใช้หาของได้ทันทีจากคำค้น พร้อม filter ตาม `type` / `status` / `container` และเห็นผลลัพธ์ที่บอก "อยู่ไหน/สถานะ/ใครถือ" ครบในตา เป็นเส้นทางหลักในการเข้าถึง item

## 2. User Stories
- ในฐานะผู้ใช้ ฉันต้องการ **พิมพ์คำค้นแล้วเห็นผลทันที** (debounced)
- ฉันต้องการ **กรองตามประเภท / สถานะ / container**
- ฉันต้องการให้ผลลัพธ์บอก **รูป, ชื่อ, สถานะ, ตำแหน่งปัจจุบัน, ผู้ถือ**
- ฉันต้องการคลิกผลลัพธ์เพื่อไป **Item Detail**
- ฉันต้องการให้ search bar อยู่ **ทุกหน้า** (topbar) และหน้าแรก
- ฉันต้องการให้ search เคารพ permission และ container access scope
- ฉันต้องการค้นหาจาก item location, current holder, stock quantity, expiry, warranty, maintenance, overdue return, reservation waiting, missing, repair, และ disposal

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Search | `/w/:wsId/search?q=&type=&status=&containerId=&page=` | ช่องค้นหา + filters + ผลลัพธ์ |
| Global SearchBar | topbar (ทุกหน้า) + dashboard | submit/enter → ไปหน้า Search |
URL query เป็น **source of truth** ของ keyword+filter (แชร์ลิงก์/refresh ได้)

## 4. Components
- `SearchBar` (มี debounce ข้างใน), `SearchFilters`, `FilterChip`
- `ResultList`, `ItemCard`, `StatusBadge`, `ContainerBreadcrumb`
- `SearchResultMeta` (location, holder, quantity, expiry, warranty, maintenance)
- `Pagination` หรือ infinite loader
- UI primitives: `Input`, `Select`, `Badge`, `Button`

## 5. Forms

Search ใช้ URL query params เป็น state — ไม่มีฟอร์ม submit แบบ traditional

**Search Controls** (อัปเดต URL param แล้ว refetch ทันที ไม่ submit form)
| Element | Type | URL Param | หมายเหตุ |
|---------|------|-----------|----------|
| Keyword input | `<Input>` (debounced 300ms) | `?q=` | autofocus เมื่อเข้าหน้า Search |
| Type filter | `<Select>` | `?type=` | Individual / Quantity (wire: single / stock) |
| Status filter | `<Select>` | `?status=` | stored / borrowed (wire: taken_out) / missing / disposed |
| Container filter | `<Select>` | `?containerId=` | dropdown รายการ container |
| Access scope summary | readonly | — | แสดงว่าผลลัพธ์ถูกกรองตามสิทธิ์แล้ว |
| Clear filters | button | ลบ params | แสดงเมื่อมี filter active |

- ทุก control อัปเดต URL param โดยตรง (ผ่าน `useSearchParams`)
- Mobile: keyword ในหน้า + ปุ่ม "Filters" → Drawer สำหรับ type/status/container

## 6. API Calls
ผ่าน `src/api/item.api.ts` (search ใช้ list endpoint เดียวกับ item):
- `GET /workspaces/:wsId/items?q=&type=&status=&containerId=&page=&limit=&sort=` → `{ data: Item[], meta: { page, limit, total } }`
- backend ต้องกรองผลลัพธ์ตาม permission + container access scope
- (future) `?holderId=`, `?barcode=`, `?qr=`

## 7. React Query Usage
- `useSearchItems(wsId, params)` = `useQuery(['ws', wsId, 'items', 'list', params])`
  - `keepPreviousData: true` (กันกระพริบตอนเปลี่ยนหน้า/พิมพ์)
  - `enabled` เสมอ (q ว่าง = แสดงทั้งหมด)
- debounce keyword (~300ms) ก่อนใส่ใน query key/URL
- infinite scroll → `useInfiniteQuery` (ทางเลือก)

## 8. Zustand Usage
- **ไม่เก็บผลลัพธ์ใน Zustand** (server state)
- keyword/filter เก็บใน **URL query params** (ผ่าน React Router `useSearchParams`) ไม่ใช่ store — เพื่อแชร์/refresh ได้
- (ทางเลือก) เก็บ "recent searches" ใน `uiStore` (client state แท้)
- search result component ต้องพร้อมแสดงข้อมูล type-specific เช่น quantity item, expiry, warranty, maintenance

## 9. Form Validation
- ไม่มี validation เข้ม — keyword อิสระ; trim ช่องว่าง; type/status ต้องเป็นค่าที่อนุญาต; containerId ต้องมีจริง (มิฉะนั้น ignore)

## 10. Navigation Flow
```
Topbar/Dashboard SearchBar → enter → /w/:wsId/search?q=...
พิมพ์ในหน้า Search → debounce → อัปเดต ?q= → refetch
เลือก filter → อัปเดต query param → refetch
คลิก ItemCard → /w/:wsId/items/:id (Item Detail)
StatCard "Borrowed" (dashboard) → /search?status=taken_out
```

## 11. Permission Rules
- ใช้ search + เห็นผล: `item.view`
- viewer ใช้ได้ครบ (อ่านอย่างเดียว); ไม่มีปุ่ม action บน card สำหรับคนไม่มีสิทธิ์
- ดู [../permission-ui.md](../security/permission-ui.md)

## 12. Loading State
- ครั้งแรก → skeleton ของ ItemCard (~6–8 ใบ)
- ระหว่างพิมพ์/เปลี่ยนหน้า → ใช้ `keepPreviousData` + overlay/spinner บางๆ (ไม่ล้างผลเดิม)

## 13. Empty State
- ไม่มีผลตรงคำค้น → `EmptyState` "ไม่พบรายการ" + แนะนำลดเงื่อนไข/ล้าง filter
- ws ยังไม่มีของเลย → "ยังไม่มีของในระบบ" + ปุ่ม Add Item (ถ้ามีสิทธิ์)
- ผลลัพธ์ที่ไม่อยู่ใน container access scope ต้องไม่ถูกแสดง

## 14. Error State
- ค้นหาล้มเหลว → `ErrorState` + retry (คงคำค้นไว้)

## 15. Responsive Behavior
- SearchBar เด่นเต็มกว้างทุกขนาด
- Filters: desktop เรียงแนวนอน; mobile = ปุ่ม "Filters" เปิด drawer/sheet
- Result grid: desktop 3–4 → tablet 2 → mobile 1
- บน mobile topbar search ย่อเป็นไอคอน → แตะไปหน้า Search

## 16. Future Improvements
- ค้นด้วย **holderId / barcode / QR**
- Fuzzy search, highlight คำตรง, ค้นหาในชื่อ container
- saved filters, sort หลายแบบ, recent searches
- server-side full-text + ranking

## 17. Definition of Done
- [ ] หน้า Search + Global SearchBar (topbar + dashboard)
- [ ] keyword + filter (type/status/container) ผูกกับ **URL query params**
- [ ] debounce + `keepPreviousData` + pagination/infinite
- [ ] ItemCard แสดง รูป/ชื่อ/สถานะ/ตำแหน่ง/holder ครบ
- [ ] คลิก → Item Detail
- [ ] Loading(skeleton)/Empty/Error states
- [ ] Permission: `item.view`
- [ ] Responsive (filters drawer บน mobile)
