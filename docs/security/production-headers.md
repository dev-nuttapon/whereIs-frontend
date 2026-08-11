# Production Security Headers

ตั้งค่าที่ reverse proxy/hosting layer ของ production ไม่ใช่เฉพาะ Vite dev server

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' https: data:; connect-src 'self' https://API_ORIGIN
```

เริ่ม CSP ด้วย `Content-Security-Policy-Report-Only` แล้วตรวจ violation ที่เกิดจากระบบจริงก่อนเปลี่ยนเป็น enforce ห้ามใช้ `*` กับ `connect-src`, `script-src` หรือ `frame-ancestors` ใน production
