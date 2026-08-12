# Prompt สำหรับ Claude: API Production Readiness

โปรเจกต์ WhereIs backend เป็น ASP.NET Core บน .NET 10 ให้ปรับปรุงเฉพาะ API ตามขอบเขตด้านล่าง ห้ามเปลี่ยน contract เดิมของ frontend โดยไม่จำเป็น และต้องรักษา tenant isolation กับ permission เดิมทั้งหมด

## เป้าหมาย

ทำให้ระบบแจ้งเตือนและ API พร้อมใช้งานบน production มากขึ้น โดยเน้น 2 เรื่อง:

1. รองรับ external scheduler สำหรับเรียก notification scan อัตโนมัติตามรอบเวลา
2. เพิ่ม health/readiness endpoints สำหรับ container, load balancer และ monitoring

## งานที่ต้องทำ

### 1. External notification scheduler

- ไม่ต้องมี `BackgroundService` หรือ embedded worker ใน API
- คง endpoint `POST /api/v1/notifications/scan` สำหรับ scheduler ภายนอก
- scheduler ต้องใช้ service identity หรือ internal service token แยกจาก user token
- endpoint ห้ามเปิดเป็น anonymous และต้องตรวจสิทธิ์ของ service identity
- คง dedupe key และ tenant isolation เดิม
- รองรับ retry, timeout และ cancellation ตามมาตรฐานของ hosting/scheduler
- บันทึกผลสำเร็จ/ล้มเหลวของการ scan โดยไม่ log token หรือ secret
- ระบุวิธีตั้งค่า scheduler และข้อจำกัดของการยิงซ้ำให้ชัดเจน
- ห้ามสร้าง notification ซ้ำ โดยต้องรักษา dedupe key เดิม
- ห้ามทำให้ request ของผู้ใช้รอ worker
- รองรับ cancellation token และ graceful shutdown
- log ตอนเริ่ม scan, scan สำเร็จ, scan ล้มเหลว และเวลาที่ใช้
- ถ้ามีหลาย instance ต้องป้องกันการ scan ซ้ำข้าม instance ด้วย distributed lock หรือระบุข้อจำกัดให้ชัดเจน หากยังไม่มี infrastructure สำหรับ lock

### 2. Health/readiness endpoints

- เพิ่ม `GET /health/live` สำหรับตรวจว่า process ยังทำงาน
- เพิ่ม `GET /health/ready` สำหรับตรวจ dependency สำคัญ เช่น database และ dependency ที่จำเป็นต่อการให้บริการ
- response ต้องเหมาะกับ Kubernetes/load balancer และใช้ HTTP status ที่ถูกต้อง
- ไม่เปิดเผย connection string, secret, token หรือข้อมูลภายใน
- ไม่บังคับ authentication สำหรับ health endpoints หากจำเป็นต่อ infrastructure
- readiness ต้อง fail เมื่อ database ใช้งานไม่ได้
- แยก liveness กับ readiness ให้ชัดเจน

### 3. Configuration และ security

- ห้ามใส่ secret หรือ production URL ลงใน source control
- ตรวจว่า scan worker ปิดได้ใน test และ local environment
- ตรวจ CORS ให้ production ใช้ allowlist จาก configuration เท่านั้น
- คง rate limit, security headers, authentication, authorization และ container access guard เดิม

## Tests ที่ต้องเพิ่มหรือปรับ

### Automated tests

- scheduler เรียก scan ด้วย service identity ได้
- anonymous หรือ user ที่ไม่มีสิทธิ์เรียก scan ไม่ผ่าน
- scan failure คืน status ที่เหมาะสมและ scheduler retry ได้
- liveness คืน HTTP 200 เมื่อ process ทำงาน
- readiness คืน HTTP 200 เมื่อ database พร้อม
- readiness คืน HTTP 503 เมื่อ database ใช้งานไม่ได้
- notification dedupe ยังทำงานเหมือนเดิม

### Verification commands

รันและรายงานผลคำสั่งต่อไปนี้:

```bash
dotnet build
dotnet test --no-restore
```

ถ้ามี test filter เฉพาะ feature ให้รันเพิ่มและรายงานจำนวน passed/failed/skipped

## Acceptance criteria

- API contract เดิมของ receiving, products, stock, assets และ notifications ไม่เปลี่ยนโดยไม่จำเป็น
- external scheduler เรียก notification scan ได้และไม่สร้างรายการซ้ำ
- health live/ready ใช้งานได้จริงจาก container/load balancer
- ไม่มี secret หลุดใน response หรือ log
- test ทั้งหมดผ่าน
- สรุปไฟล์ที่แก้, configuration ใหม่, migration ที่ต้องใช้ (ถ้ามี), ความเสี่ยง และวิธี deploy

ก่อนแก้โค้ดให้ตรวจโครงสร้าง host, DI, database health check และ deployment configuration ที่มีอยู่ก่อน ห้ามเดา infrastructure ใหม่ถ้ายังมี pattern เดิมใน repository
