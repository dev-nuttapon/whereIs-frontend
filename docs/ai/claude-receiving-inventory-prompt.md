# Prompt สำหรับ Claude: Receiving Inventory API

ทำงานใน backend ที่ `/Users/nuttapon/Github-dev/whereIs-backend` เท่านั้น ห้ามแก้ frontend

ปรับ backend ให้รองรับ workflow “เพิ่มของเข้าคลัง” จากการซื้อ 1 ครั้งที่มีหลายรายการ โดยแต่ละรายการอาจมีจำนวนไม่เท่ากัน อยู่คนละจุดจัดเก็บ และมีหรือไม่มีวันหมดอายุ ตัวอย่างเช่น สบู่ ยาสีฟัน โยเกิร์ต อาหารแช่แข็ง ไมโครเวฟ และเตารีด

## สิ่งที่ต้องรองรับ

- สร้าง receipt/batch หนึ่งรายการพร้อม lines หลายรายการใน transaction เดียว
- แยกของใช้สิ้นเปลืองเป็น stock และของใช้งานรายชิ้นเป็น asset
- ระบุ productId, quantity, unitCode, locationId/containerId, lotCode, expiryDate และ alertLeadDays
- รองรับ lowStockThreshold สำหรับ stock
- รองรับสินค้าชนิดเดียวกันหลาย lot หรือหลายวันหมดอายุโดยไม่รวมผิดกัน
- ถ้าเป็น asset และ quantity มากกว่า 1 ให้สร้าง asset แยกตาม domain model หรือคืน validation error ที่ชัดเจน
- ถ้ารายการใดไม่ผ่าน validation ให้ rollback ทั้ง batch
- enforce workspace scope, permission และ container access ตามมาตรฐานเดิม
- สร้าง audit/event และ notification ตาม pattern ที่มีอยู่ โดยไม่สร้างซ้ำ

## API ที่เสนอ

เพิ่ม endpoint ตาม convention ปัจจุบัน เช่น:

`POST /api/v1/workspaces/{workspaceId}/inventory/receipts`

Request ควรมี `reference`, `receivedAt`, `notes` และ `lines[]` โดยแต่ละ line มี `productId`, `trackingType`, `quantity`, `unitCode`, `locationId`, `containerId`, `lotCode`, `expiryDate`, `alertLeadDays`, `lowStockThreshold` ปรับ shape ให้ตรงกับ model จริงได้ แต่ต้องรักษาความหมายเดิม

## ขั้นตอนการทำงาน

1. อ่าน domain, controller, application handler, migration, API contract และ test ที่มีอยู่ก่อน
2. สรุป design และไฟล์ที่จะเปลี่ยน
3. Implement เฉพาะ backend โดยไม่ทำลาย endpoint เดิม
4. เพิ่ม DTO, validation, transaction, persistence, audit และ notification ตาม architecture เดิม
5. อัปเดต API contract/documentation ที่เกี่ยวข้อง
6. เพิ่ม tests สำหรับ: batch หลายรายการต่างจุดจัดเก็บ, stock/asset, rollback เมื่อผิด, หลาย lot/expiry, workspace/permission isolation และ quantity/date validation
7. รัน formatter, build และ tests
8. สรุป endpoint จริง, request/response จริง, migration, test result และข้อจำกัด

ห้ามใช้ localStorage หรือ frontend state เป็นแหล่งบันทึกข้อมูลจริง และห้ามเพิ่ม abstraction ที่ไม่จำเป็น
