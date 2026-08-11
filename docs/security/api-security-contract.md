# WhereIs API Security Contract

สถานะ: draft สำหรับ review ร่วมกับ backend

## Session

- `POST /auth/login` รับ credential ผ่าน HTTPS และ set refresh cookie
- `POST /auth/refresh` ใช้ refresh cookie ไม่รับ refresh token จาก request body ใน production flow ใหม่
- `POST /auth/logout` revoke refresh session ปัจจุบันและ clear cookie
- `GET /auth/session` หรือ `GET /users/me` ใช้ validate session ตอน startup
- Access token ต้องอายุสั้น; refresh token ต้อง rotate และตรวจ reuse

Refresh cookie ต้องเป็น `HttpOnly`, `Secure`, `SameSite=Lax` หรือเข้มงวดกว่า, มี `Path` แคบที่สุด และไม่ใช้ wildcard domain โดยไม่มีเหตุผลทาง deployment

## Authorization

ทุก endpoint ที่รับ workspace/resource identifier ต้องตรวจตามลำดับ:

1. token valid และ user active
2. user เป็นสมาชิกของ workspace ที่ระบุ
3. user มี permission ที่ต้องใช้
4. resource อยู่ใน workspace เดียวกัน
5. resource อยู่ใน container access scope ของ user
6. state transition ถูกต้องและไม่ถูก replay

Frontend permission เป็นเพียง UX layer และห้ามใช้เป็น authorization source

## Error semantics

- `401`: session/token ใช้ไม่ได้
- `403`: authenticated แต่ไม่มีสิทธิ์ และไม่ควรเปิดเผย policy ภายใน
- `404`: resource ไม่พบหรือ intentionally hidden เพื่อป้องกัน enumeration
- `409`: state conflict เช่น invitation ถูก accept/revoke ไปแล้ว
- `429`: rate limit พร้อม `Retry-After` ตามความเหมาะสม

Error response ห้ามมี stack trace, token, password, internal identifiers ที่ไม่จำเป็น หรือข้อมูลของ workspace อื่น

## Invitation

Invitation token ต้อง random เพียงพอ, อายุสั้น, one-time, revoke ได้ และ accept ต้อง atomic เพื่อป้องกัน concurrent replay

## Required verification

Backend ต้องส่งผลทดสอบสำหรับ expired/revoked session, refresh rotation/reuse, cross-workspace access, permission escalation, container scope bypass และ invitation replay ก่อน frontend production migration
