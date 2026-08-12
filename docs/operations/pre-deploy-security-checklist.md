# WhereIs Pre-deploy Security Checklist

เอกสารนี้ใช้ตอน deploy เท่านั้น ไม่ควรใส่ secret จริงลงใน repository

## 1. Frontend configuration

- [ ] ตั้ง `VITE_API_BASE_URL` เป็น HTTPS URL ของ API จริง
- [ ] ตรวจว่าไม่มี access token, refresh token, client secret หรือ database URL ใน build artifact
- [ ] ตรวจ CORS ของ API ให้ allow เฉพาะ frontend domain จริง
- [ ] ตรวจว่า frontend ใช้ `withCredentials: true` สำหรับ refresh cookie
- [ ] ตรวจว่า frontend และ API อยู่บน HTTPS เดียวกันตามนโยบาย cookie/SameSite

ตัวอย่าง:

```bash
VITE_API_BASE_URL=https://api.example.com/api/v1
```

## 2. Health checks

ผูกกับ hosting/load balancer:

```text
GET /health/live   -> liveness
GET /health/ready  -> readiness
```

แนวทางเริ่มต้น:

- interval: 30–60 วินาที
- timeout: 5–10 วินาที
- `200`: ปกติ
- `503`: หยุดส่ง traffic หรือแจ้งเตือน
- health endpoint ไม่ควรต้องใช้ user login

ตรวจด้วย:

```bash
curl -fsS https://api.example.com/health/live
curl -fsS https://api.example.com/health/ready
```

## 3. External notification scheduler

ใช้ scheduler ภายนอกยิง endpoint ตามรอบ เช่น ทุก 60 นาที:

```text
POST https://api.example.com/api/v1/notifications/scan
Authorization: Bearer <service-token>
```

- [ ] ใช้ service identity/token แยกจากบัญชีผู้ใช้
- [ ] เก็บ token ใน secret manager ของ hosting
- [ ] timeout ไม่เกิน 30 วินาที
- [ ] retry เฉพาะ network error และ HTTP 5xx
- [ ] ไม่ retry ซ้ำถี่เมื่อได้ 401/403
- [ ] ตรวจผลตอบกลับทุกครั้ง
- [ ] ตั้ง alert หากไม่สำเร็จต่อเนื่อง 2 รอบ
- [ ] ห้ามเปิด embedded worker พร้อมกับ external scheduler

## 4. Monitoring และ alerts

ต้องมี alert อย่างน้อย:

- [ ] `/health/ready` เป็น 503
- [ ] API down หรือ HTTP 5xx สูงผิดปกติ
- [ ] database connection failure
- [ ] notification scheduler เรียกไม่สำเร็จ
- [ ] response time สูงผิดปกติ
- [ ] backup ล้มเหลวหรือพื้นที่ database ใกล้เต็ม

ห้ามส่งข้อมูลต่อไปนี้เข้า log/alert:

- access token หรือ refresh token
- cookie value
- password
- connection string
- ข้อมูลส่วนตัวเกินความจำเป็น

## 5. Verification ก่อนเปิด traffic

```bash
npm run test:unit
npm run typecheck
npm run build
npm run smoke
```

- [ ] ทดสอบ login และ refresh หลัง reload
- [ ] ทดสอบ logout แล้วเรียก protected route ไม่ได้
- [ ] ทดสอบ user ไม่มี permission ได้ 403 UI
- [ ] ทดสอบ workspace อื่นถูก backend ปฏิเสธ
- [ ] ทดสอบ scheduler ได้ผลสำเร็จหนึ่งครั้งและไม่สร้าง notification ซ้ำ
