# Efficient Dropdown Data Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน dropdown ที่ปัจจุบันดึงข้อมูลครั้งละ 100/1000 รายการ ให้โหลดข้อมูลตามความต้องการด้วย server-side search และ pagination โดยไม่เพิ่ม cache

**Architecture:** เพิ่มพารามิเตอร์ `search`, `page` และ `pageSize` ใน API list endpoints ที่ใช้เป็นตัวเลือก จากนั้นสร้าง hook สำหรับ option lists ที่รับ keyword และเปิดใช้งาน query เฉพาะเมื่อ dropdown/dialog ต้องการข้อมูล หน้า UI ใช้ debounce และโหลดเพิ่มเมื่อเลื่อนถึงท้ายรายการ ส่วนหน้าตารางจะคง query flow เดิมแยกจาก dropdown เพื่อไม่ให้จำนวนข้อมูลในตารางลดลงโดยไม่ตั้งใจ

**Tech Stack:** React, TypeScript, TanStack Query, Axios, Vitest, React Testing Library

## Global Constraints

- ไม่เพิ่มหรือใช้ cache ใหม่เพื่อแก้ปัญหานี้
- ค่าเริ่มต้นของ dropdown ต้องไม่เกิน 20 รายการต่อ request
- ต้องรองรับ `search` แบบ case-insensitive และค้นหาจากชื่อ/รหัสที่ endpoint รองรับ
- การเปลี่ยน dropdown ต้องไม่กระทบ pagination ของตารางที่แก้ไว้ก่อนหน้า
- ต้องมี debounce 300–500 ms ก่อนเรียก API
- ต้องตรวจสอบด้วย unit tests, `npm run typecheck` และ `npm run build`

## File Map

- Modify `src/api/product.api.ts`, `src/api/asset.api.ts`, `src/api/stock.api.ts`, `src/api/location.api.ts`: รับ query parameters สำหรับ option lookup และคืน metadata pagination ที่จำเป็น
- Modify backend API contract/documentation ที่คู่กับ endpoint เหล่านี้: รองรับ `search`, `page`, `pageSize` และ `totalCount`
- Create `src/features/common/hooks/useRemoteOptions.ts`: hook กลางสำหรับ keyword, page, loading และการรวมรายการจากหน้าถัดไป
- Create `src/features/common/components/RemoteSelect.tsx`: select ที่ debounce การค้นหาและโหลดเพิ่มเมื่อ scroll
- Modify dropdown consumers in `src/features/borrow-orders/components/CreateBorrowOrderDialog.tsx`, `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`, `src/features/receiving/pages/ReceiveInventoryPage.tsx`, `src/features/assets/components/AssetFormDialog.tsx`, `src/features/items/components/ItemFormDialog.tsx`, and related form dialogs: เปลี่ยนจากการโหลด list เต็มเป็น remote options
- Create tests under `tests/unit/remote-options.test.tsx` and API request tests near existing API tests: ตรวจ debounce, query parameters, pagination และการเลือกค่า

### Task 1: Confirm API contracts before implementation

**Files:**
- Inspect/Modify backend endpoint contract for products, assets, stock, locations
- Inspect `src/types/api.types.ts` and existing paged result types

- [ ] **Step 1: Document endpoint behavior**

กำหนดรูปแบบเดียวกันสำหรับ list endpoints:

```ts
type ListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

type PagedOptionResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};
```

- [ ] **Step 2: Verify search fields**

กำหนด field ที่ค้นหาได้ก่อนเขียน UI:

- Products: `name`, `code`, `sku`
- Assets: `productName`, `serialNumber`, `barcode`
- Stock: `productName`, `lotCode`, `unitCode`
- Locations/Containers: `name`, `code`

- [ ] **Step 3: Add contract tests or API fixtures**

สร้าง test ที่ยืนยันว่า request ส่ง `search`, `page=1` และ `pageSize=20` และ response map เป็น `items/totalCount` ได้ถูกต้อง

### Task 2: Implement paged option APIs

**Files:**
- Modify `src/api/product.api.ts`
- Modify `src/api/asset.api.ts`
- Modify `src/api/stock.api.ts`
- Modify `src/api/location.api.ts`
- Modify related container API if container dropdown is included in the backend contract

- [ ] **Step 1: Write failing request tests**

ตรวจว่าเรียก API ด้วยรูปแบบนี้เมื่อค้นหา:

```ts
expect(client.get).toHaveBeenCalledWith('/workspaces/ws/products', {
  params: { search: 'note', page: 1, pageSize: 20 },
});
```

- [ ] **Step 2: Implement typed list functions**

ใช้ signature เดียวกัน เช่น:

```ts
listProducts(wsId: string, options?: ListOptions): Promise<PagedOptionResult<ProductOption>>
```

โดย `pageSize` default เป็น `20` เฉพาะ function สำหรับ dropdown ไม่เปลี่ยน default ของ function ที่ใช้กับตาราง

- [ ] **Step 3: Run API tests**

รัน test เฉพาะชุด API และยืนยันว่า request ไม่มี `pageSize=100` หรือ `1000` สำหรับ option flow

### Task 3: Build reusable remote dropdown

**Files:**
- Create `src/features/common/hooks/useRemoteOptions.ts`
- Create `src/features/common/components/RemoteSelect.tsx`
- Test `tests/unit/remote-options.test.tsx`

- [ ] **Step 1: Write failing component tests**

ครอบคลุมพฤติกรรม:

- ยังไม่เปิด dropdown ไม่เรียก API
- เปิด dropdown เรียกหน้าแรกด้วย `pageSize=20`
- พิมพ์ค้นหาแล้วรอ debounce ก่อนเรียก API
- เลื่อนถึงท้ายรายการแล้วเรียกหน้าถัดไป
- รายการที่เลือกแล้วต้องยังแสดง label ได้
- loading/error/empty state ต้องแสดงได้

- [ ] **Step 2: Implement hook**

กำหนด interface:

```ts
useRemoteOptions({
  enabled,
  search,
  fetchPage,
  pageSize: 20,
});
```

hook ต้อง reset เป็น page 1 เมื่อ keyword เปลี่ยน และรวมรายการจากหน้าถัดไปเฉพาะใน interaction ปัจจุบัน โดยไม่สร้าง cache layer ใหม่

- [ ] **Step 3: Implement select UI**

ใช้ `RemoteSelect` เป็น wrapper ของ select component ที่มีอยู่ รองรับ `value`, `onChange`, `options`, `onSearch` และ scroll event

- [ ] **Step 4: Run component tests**

ยืนยันว่าไม่มี request ระหว่างพิมพ์ทุก keystroke และไม่มี duplicate request จากการ scroll event ซ้ำ

### Task 4: Migrate high-volume dropdowns

**Files:**
- Modify `src/features/borrow-orders/components/CreateBorrowOrderDialog.tsx`
- Modify `src/features/borrow-orders/pages/BorrowOrdersPage.tsx`
- Modify `src/features/receiving/pages/ReceiveInventoryPage.tsx`
- Modify `src/features/assets/components/AssetFormDialog.tsx`
- Modify `src/features/items/components/ItemFormDialog.tsx`
- Modify any remaining dialog that currently calls `useAssets(..., { pageSize: 1000 })` or `useStockEntries(..., { pageSize: 1000 })` only for option lists

- [ ] **Step 1: Replace full-list option queries**

แยก option query ออกจาก query สำหรับข้อมูลหน้าจอ และเปลี่ยน dropdown เป็น `RemoteSelect`

- [ ] **Step 2: Preserve dependent dropdown behavior**

เมื่อเลือก site/product/container ให้ reset keyword และ page ของ dropdown ลูก พร้อมส่ง filter ที่เหมาะสมไป API แทนการ filter array 100/1000 รายการใน browser

- [ ] **Step 3: Preserve edit/create selected values**

ถ้ามีค่าเดิม ให้เรียก endpoint detail หรือ option-by-id เพื่อแสดง selected label โดยไม่ต้องโหลด list ทั้งหมด

- [ ] **Step 4: Remove only obsolete full-list option requests**

ลบ request `pageSize=1000` เฉพาะจุดที่ใช้สร้าง dropdown ห้ามลบ request ที่ใช้คำนวณรายละเอียดหรือ business logic

### Task 5: Verify regressions and endpoint usage

**Files:**
- No production file changes expected unless verification finds a regression

- [ ] **Step 1: Search remaining hardcoded option sizes**

ตรวจด้วย `grep`/`rg` ว่า `pageSize: 1000` เหลือเฉพาะ use case ที่ไม่ใช่ dropdown และ `pageSize: 100` ใน option flow ถูกแทนที่แล้ว

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
npm run typecheck
npm run build
```

- [ ] **Step 3: Manual acceptance checks**

ตรวจอย่างน้อย Products, Assets, Stock, Locations และ Borrow Order dropdowns: เปิด dropdown, ค้นหา, เลื่อนโหลดเพิ่ม, เลือกค่า, เปลี่ยนค่าต้นทาง และเปิด dialog ซ้ำ

- [ ] **Step 4: Review API volume**

ยืนยันว่าเปิดหน้าโดยไม่เปิด dialog ไม่ยิง request สำหรับ option ที่ไม่จำเป็น และแต่ละ interaction ขอข้อมูลครั้งละไม่เกิน 20 รายการ
