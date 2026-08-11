# WhereIs Security Hardening Design

## Goal

ยกระดับความปลอดภัยของ WhereIs ครบทั้ง frontend, backend/API, deployment และ CI โดยลดความเสี่ยงจาก token theft, cross-workspace access, privilege escalation, invitation replay, unsafe file URLs และ supply-chain issues

## Scope and boundaries

งานแบ่งเป็น 3 deliverables:

1. Frontend changes ใน repository นี้
2. API/backend prompts สำหรับให้ทีม backend นำไป implement โดยไม่แก้ API จาก repository นี้
3. Infrastructure/CI/security-test requirements ที่ต้องทำร่วมกัน

Frontend permission guards ยังคงเป็น UX layer เท่านั้น แหล่งความจริงของ authentication, authorization, workspace isolation และ file access ต้องอยู่ที่ backend

## Target architecture

- Refresh token ใช้ `HttpOnly`, `Secure`, `SameSite` cookie และหมุน token เมื่อ refresh สำเร็จ
- Frontend ถือ access token ใน memory เป็นหลัก; หาก backend ยังไม่รองรับ cookie flow ให้ใช้ transitional short-lived storage พร้อม migration flag และระบุเป็น technical debt
- Startup auth มีสถานะ `loading`, `authenticated`, `unauthenticated` และ validate session/expiry ก่อน render protected routes
- ทุก API mutation และทุก resource read ตรวจ user, workspace, resource ownership, permission และ container scope ฝั่ง backend
- Invitation token เป็น one-time, short-lived, non-replayable และไม่ถูกเก็บใน persistent query/cache
- Production edge กำหนด CSP, HSTS, frame policy, MIME sniffing, referrer และ permissions policies
- CI ตรวจ dependency vulnerabilities, secrets, typecheck, build และ security integration tests

## Data flow

1. Login ส่ง credential ผ่าน HTTPS ไป API
2. API คืน short-lived access token และ set refresh cookie
3. Frontend เก็บ access token ใน memory และเรียก `/auth/session` หรือ `/users/me` ตอน startup
4. เมื่อได้ 401 ให้ refresh ผ่าน cookie แบบ single-flight แล้ว retry request เดิมครั้งเดียว
5. Refresh failure ล้าง auth/workspace/query state และกลับ login
6. API ตรวจ authorization ทุกครั้ง โดยไม่เชื่อ permission หรือ workspace state จาก browser

## Error and abuse handling

- `401`: session invalid/expired; clear local state และ redirect login
- `403`: authenticated แต่ไม่มีสิทธิ์; แสดง forbidden state โดยไม่เปิดเผย policy ภายใน
- `404`: resource ไม่พบหรือ intentionally hidden เพื่อป้องกัน enumeration
- Login/register/refresh/invitation endpoints ต้อง rate-limit และ audit
- Error response ต้องใช้ข้อความทั่วไป ไม่คืน stack trace, token details หรือข้อมูลสมาชิกเกินจำเป็น

## Testing strategy

- Frontend unit tests: auth state transitions, expiry, single-flight refresh, storage migration, invitation URL cleanup
- API integration tests: IDOR/BOLA, cross-workspace, privilege escalation, revoked/expired token, invitation replay, scope bypass
- Deployment checks: HTTPS, headers, CSP report-only then enforce, cookie attributes
- CI checks: lockfile audit, secret scan, build/typecheck และ test evidence

## Non-goals

- ไม่ทำ authorization จริงใน frontend แทน backend
- ไม่เพิ่มระบบ WAF หรือ SIEM ใหม่ใน repository นี้
- ไม่เปลี่ยน domain model หรือ permission catalog โดยไม่มี API contract change
