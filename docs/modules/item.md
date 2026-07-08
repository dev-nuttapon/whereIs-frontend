# Module: Item

> หัวใจของระบบ — จัดการ **Item** 2 แบบ: Individual Item และ Quantity Item
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [container.md](container.md) · [../permission-ui.md](../security/permission-ui.md)

## 1. Purpose
ให้ผู้ใช้เพิ่ม/แก้ของ และทำ action ตามประเภทของ item โดยทุก action ถูกบันทึกเป็น ItemEvent เพื่อให้ตอบได้ว่า "ของอยู่ไหน ใครถือ จำนวนเท่าไร อยู่ใน lot ไหน และเกิดอะไรขึ้นบ้าง"

## 2. User Stories
- ฉันต้องการเพิ่มของรายชิ้นและระบุว่าของอยู่ที่ไหน
- ฉันต้องการเพิ่มของแบบจำนวนและกำหนดจำนวนตั้งต้น
- ฉันต้องการดูรายละเอียดรายชิ้นและประวัติการทำรายการ
- ฉันต้องการยืม/คืน/เบิก/สำรอง/ถอน/ซ่อม/จำหน่ายของรายชิ้น
- ฉันต้องการเบิก/เติม/ตรวจนับ/ปรับยอดของแบบจำนวนเป็นหน่วย
- ฉันต้องการดู unit conversion, batch/lot, received date, expiry date, warranty, maintenance, และ custom schedule

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Item Detail | `/w/:wsId/items/:itemId` | ข้อมูล + action buttons + event history + metadata sections |
| Add Item | `/w/:wsId/items/new` หรือ dialog | ฟอร์มสร้าง item |
| Edit Item | `/w/:wsId/items/:itemId/edit` หรือ dialog | ฟอร์มแก้ไข |
| Activity Log (workspace) | `/w/:wsId/activity` | feed ItemEvent ทั้ง ws |

## 4. Components
- `ItemDetailHeader`, `ItemActions`, `ItemForm`
- Metadata sections: `ItemMetadataPanel`, `UnitConversionPanel`, `BatchLotPanel`, `SchedulePanel`, `WarrantyPanel`
- Action dialogs: `BorrowDialog`, `ReturnDialog`, `WithdrawDialog`, `ReserveDialog`, `RepairDialog`, `MoveItemDialog`, `MarkMissingDialog`, `MarkFoundDialog`, `DisposeDialog`, `ConsumeStockDialog`, `RestockStockDialog`, `StockCountDialog`, `AdjustmentDialog`
- `ItemEventTimeline`, `ActivityItem`, `StatusBadge`
- `ContainerPicker`

## 5. Forms

**Add/Edit Item Form**
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–120 ตัวอักษร |
| Type | `<Select>` | required ∈ {single, stock} |
| Code | `<Input>` | optional, ≤50 ตัว |
| Description | `<Textarea>` | optional, ≤1000 ตัวอักษร |
| Container | `ContainerPicker` | required |
| Quantity | `<Input type="number">` | required เมื่อเป็น stock |
| Unit | `<Input>` | required เมื่อเป็น quantity item |
| Base Unit | `<Input>` | required เมื่อเป็น quantity item |
| Unit Conversion | editor | optional, item-specific |
| Batch / Lot | `<Input>` | optional, recommended for quantity item |
| Received Date | `<Input type="date">` | optional |
| Expiry Date | `<Input type="date">` | optional |
| Warranty End Date | `<Input type="date">` | optional |
| Maintenance Next Due | `<Input type="date">` | optional |
| Custom Schedule | editor | optional |
| Reorder Point | `<Input type="number">` | optional/required ตาม policy |
| Submit | button | disable + spinner |

**Action Dialogs**
| Dialog | Fields | Validation |
|--------|--------|------------|
| `BorrowDialog` | Holder, Due Date (optional), Note | holder required |
| `ReturnDialog` | Note (optional) | — |
| `WithdrawDialog` | Holder / Destination / Note | required ตาม workflow |
| `ReserveDialog` | Holder / Reservation window / Note | required ตาม workflow |
| `RepairDialog` | Reason / ETA / Note | required ตาม workflow |
| `MoveItemDialog` | Target Container | required |
| `MarkMissingDialog` | Reason | optional/required ตาม policy |
| `MarkFoundDialog` | Container | required |
| `DisposeDialog` | Reason + Confirm | confirm required |
| `ConsumeStockDialog` | Quantity + Note | quantity required |
| `RestockStockDialog` | Quantity + Note | quantity required |
| `StockCountDialog` | Counted quantity + note | counted quantity required |
| `AdjustmentDialog` | Variance + reason + approval | reason required |

## 6. API Calls
ผ่าน `src/api/item.api.ts`:
- `GET /workspaces/:wsId/items/:id` → `Item`
- `POST /workspaces/:wsId/items` → `Item`
- `PUT /workspaces/:wsId/items/:id` → `Item`
- `DELETE /workspaces/:wsId/items/:id`
- `GET /workspaces/:wsId/items/:id/events` → `ItemEvent[]`
- Actions:
  - `POST .../items/:id/move`
  - `POST .../items/:id/borrow`
  - `POST .../items/:id/return`
  - `POST .../items/:id/withdraw`
  - `POST .../items/:id/reserve`
  - `POST .../items/:id/repair`
  - `POST .../items/:id/mark-missing`
  - `POST .../items/:id/mark-found`
  - `POST .../items/:id/dispose`
  - `POST .../items/:id/consume-stock`
  - `POST .../items/:id/restock-stock`
  - `POST .../items/:id/count-stock`
  - `POST .../items/:id/adjust-stock`

## 7. React Query Usage
- `useItem(wsId, id)` = `useQuery(['ws', wsId, 'item', id])`
- `useItemEvents(wsId, id)` = `useQuery(['ws', wsId, 'item', id, 'events'])`
- Mutations invalidate item detail, item events, container views, search, dashboard, activity, reports, and notifications where relevant

## 8. Zustand Usage
- ไม่เก็บ item ใน Zustand
- ใช้ `workspaceStore` และ `authStore` สำหรับ permission / default holder

## 9. Form Validation
- individual vs quantity ต้องบังคับเงื่อนไขต่างกัน
- quantity ต้องเป็นจำนวนเต็มบวก
- due date เป็น optional
- unit conversion ต้องผูกกับ item เดียว ห้ามใช้ conversion กลาง

## 10. Navigation Flow
```
Search/Container/Dashboard → click item → Item Detail
Add/Edit → submit → Item Detail
Action dialog → confirm → mutation → stay on page + refetch + toast
```

## 11. Permission Rules
| ปุ่ม/action | permission |
|-------------|-----------|
| ดู item/detail/events | `item.view` |
| Add | `item.create` |
| Edit | `item.update` |
| Delete | `item.delete` |
| Move | `item.move` |
| Borrow | `item.borrow` |
| Return | `item.return` |
| Withdraw | `item.withdraw` |
| Reserve | `item.reserve` |
| Mark Missing | `item.mark_missing` |
| Mark Found | `item.mark_found` |
| Repair | `item.repair` |
| Dispose | `item.dispose` |
| เบิก/เติมสต็อก | `stock.consume` / `stock.restock` |
| ตรวจนับ / ปรับยอด | `stock.count` / `stock.adjust` |

## State changes
UI ต้องแยก action ตามประเภท item:
- individual: move / borrow / return / withdraw / reserve / repair / missing / found / dispose
- quantity: consume / restock (receive) / count / adjust / dispose / view history

## 12. Loading State
- detail → skeleton header
- events → skeleton timeline

## 13. Empty State
- item ไม่มี event → timeline แสดง event created อย่างน้อย 1 รายการ

## 14. Error State
- detail 404 → not found
- action ล้มเหลว → toast + refetch

## 15. Responsive Behavior
- desktop: detail + actions แยกชัด
- mobile: action เป็นปุ่มเรียง/overflow menu

## 16. Future Improvements
- barcode/QR scan
- export report รายชิ้น
- bulk action สำหรับ stock

## 17. Definition of Done
- [ ] Item Detail ครบสำหรับ individual และ quantity
- [ ] Add/Edit/Delete item
- [ ] Action dialogs ครบ (borrow/return/withdraw/reserve/repair/count/adjust)
- [ ] ItemEvent timeline + Activity Log page
- [ ] Validation + error handling
- [ ] Permission guard + status-dependent actions
