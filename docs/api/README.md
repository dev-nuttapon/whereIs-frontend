# API — WhereIs Frontend

สัญญา (contract) ระหว่าง frontend และ backend — frontend ยึดเอกสารนี้เป็นหลักในการสร้าง API client

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| [api-contract.md](api-contract.md) | endpoint ทั้งหมด, request/response format, HTTP status, DTO types, ตัวอย่างเต็ม |

---

## ลำดับการอ่าน

1. `api-contract.md` — อ่านครั้งเดียวจบก่อนเขียน API hooks ใดๆ

---

## ความสัมพันธ์กับเอกสารอื่น

- Entity field types → [architecture/domain-model.md](../architecture/domain-model.md)
- Permission ของแต่ละ endpoint → [security/permission-ui.md](../security/permission-ui.md)
- Query key + cache invalidation → [state/state-management.md](../state/state-management.md)
- API file structure → [architecture/folder-structure.md](../architecture/folder-structure.md) (`src/api/*.api.ts`)

---

## Maintenance Guidelines

- **api-contract.md** คือ source of truth ของ endpoint — ถ้า backend เปลี่ยน API ให้อัปเดตที่นี่ก่อนแก้โค้ด
- backend เป็น source of truth จริง — ถ้า contract ไม่ตรง backend ให้ประชุมและอัปเดตเอกสาร
- อย่านิยาม entity type ในไฟล์นี้ซ้ำ — ชี้ไป `domain-model.md` แทน
- เพิ่ม endpoint ใหม่ → อัปเดต api-contract.md + module doc ที่เกี่ยวข้อง + queryKeys.ts
