# Prompt สำหรับ Claude: Receiving Tenant and Container Security

ทำงานใน backend `/Users/nuttapon/Github-dev/whereIs-backend` เท่านั้น ห้ามแก้ frontend

ตรวจและแก้ security ของ receiving receipt endpoint:

`POST /api/v1/workspaces/{wsId}/inventory/receipts`

## เป้าหมาย

ป้องกันไม่ให้ผู้ใช้ส่ง `locationId` หรือ `containerId` ที่อยู่นอก workspace หรืออยู่นอก container access scope ของผู้ใช้ แล้วทำให้ stock/asset ถูกบันทึกผิดขอบเขต

## งานที่ต้องทำ

1. ตรวจ `locationId` ว่าอยู่ใน workspace เดียวกับ `wsId`
2. ตรวจ `containerId` ว่าอยู่ใน workspace เดียวกับ `wsId`
3. ตรวจ parent/descendant ของ container ตาม `containerAccessScope` และ `includeDescendants`
4. ถ้าส่งทั้ง `locationId` และ `containerId` ให้ตรวจว่า container อยู่ภายใต้ location ที่สอดคล้องกันตาม domain model
5. ใช้ error status/code ที่ frontend แยกแสดงได้ เช่น 403 สำหรับไม่มีสิทธิ์ และ 404/400 สำหรับ resource ไม่ถูกต้อง
6. ตรวจให้ validation เกิดก่อน persistence และยังคง transaction all-or-nothing
7. เพิ่ม integration tests สำหรับ cross-workspace location/container, container scope ที่ไม่มีสิทธิ์, descendant ที่อนุญาต และ batch rollback
8. อัปเดต API contract/documentation ถ้า response หรือ error shape เปลี่ยน

ก่อนแก้ให้สรุป model และไฟล์ที่เกี่ยวข้อง จากนั้นรัน formatter, build และ tests ที่เกี่ยวข้อง สรุปผลลัพธ์และข้อจำกัดท้ายงาน
