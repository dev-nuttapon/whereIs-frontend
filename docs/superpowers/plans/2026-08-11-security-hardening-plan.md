# WhereIs Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ลดความเสี่ยงด้าน session theft, cross-workspace access, privilege escalation, token replay และ deployment misconfiguration โดยแบ่งงาน frontend, API prompts, infrastructure และ CI อย่างชัดเจน

**Architecture:** Frontend จะใช้ short-lived access token ใน memory และ refresh ผ่าน HttpOnly cookie หลัง backend รองรับ contract ใหม่; route guards ใช้เพื่อ UX เท่านั้น. Backend เป็น source of truth สำหรับ authorization, workspace isolation และ container scope. Edge/CI จะบังคับ security headers และ automated checks.

**Tech Stack:** React 19, TypeScript, Zustand, Axios, React Router, TanStack Query, Vite, npm lockfile, backend API ที่มี auth/workspace/permission endpoints

## Global Constraints

- ห้ามแก้ backend/API ใน repository นี้; API work ต้องส่งเป็น prompt ให้ทีม backend
- Backend ต้อง enforce authorization ทุก endpoint แม้ frontend จะซ่อน route/button
- ห้ามเก็บ refresh token ใน localStorage/sessionStorage
- ห้าม log password, access token, refresh token, invitation token หรือ authorization header
- ต้องรักษา `npm run typecheck` และ `npm run build` ให้ผ่าน
- ทุก migration ต้องมี rollback และ transitional behavior ที่ระบุชัดเจน

## File map

- Modify `src/stores/auth.store.ts`: in-memory auth state, migration/clear behavior
- Modify `src/api/client.ts`, `src/api/token.api.ts`: cookie refresh flow and single-flight retry
- Modify `src/routes/protected-route.tsx`, `src/App.tsx`: startup session state
- Modify `src/stores/workspace.store.ts`: clear stale workspace data on logout/session change
- Modify invitation hooks/pages: token cleanup and no persistent token cache
- Create frontend security tests under `tests/security/`
- Create deployment/security documentation under `docs/security/`
- Do not modify API implementation files; include backend prompts in this plan and handoff documents

## Task 1: Define and approve the API contract

**Files:**
- Create: `docs/security/api-security-contract.md`
- Modify: `docs/superpowers/specs/2026-08-11-security-hardening-design.md`

- [x] Document endpoints and expected behavior for `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/session`, invitations and workspace resources.
- [x] Define cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`, narrow `Path`, and production domain policy.
- [x] Define response semantics for `401`, `403`, `404`, validation errors and rate limiting.
- [x] Define refresh rotation, reuse detection, revocation and concurrent refresh behavior.
- [x] Define required authorization checks: user, workspace membership, permission, resource ownership and container scope.
- [ ] Review the contract with backend before implementing frontend migration.

### Backend prompt A — auth/session

```text
ตรวจสอบและปรับปรุง auth/session ของ WhereIs โดยห้ามเชื่อข้อมูล auth หรือ permission จาก frontend

ข้อกำหนด:
1. ให้ access token อายุสั้นและส่งผ่าน HTTPS เท่านั้น
2. ย้าย refresh token ไป HttpOnly, Secure, SameSite cookie พร้อม Path/Domain ที่แคบที่สุด
3. ทำ refresh-token rotation ทุกครั้งที่ refresh สำเร็จ และตรวจ reuse ของ token เก่า
4. รองรับ POST /auth/refresh แบบไม่ต้องรับ refreshToken จาก request body
5. เพิ่ม POST /auth/logout เพื่อ revoke refresh session ปัจจุบัน และรองรับ revoke ทุก session หากระบบมีความสามารถนี้
6. เพิ่ม GET /auth/session หรือคง GET /users/me ให้ frontend validate session ตอน startup
7. ตอบ 401 สำหรับ token หมดอายุ/ไม่ถูกต้อง โดยไม่เปิดเผยเหตุผลภายใน
8. ใส่ rate limit สำหรับ login, register, refresh, logout และเพิ่ม audit event โดยห้าม log credential/token
9. เขียน integration tests สำหรับ expired token, revoked token, refresh rotation, reuse detection และ concurrent refresh
10. ส่ง API contract, cookie attributes, response examples และ migration/rollback plan กลับมา
```

## Task 2: Migrate frontend session storage

**Files:**
- Modify: `src/stores/auth.store.ts`
- Modify: `src/api/token.api.ts`
- Modify: `src/api/client.ts`
- Test: `tests/security/auth-session.test.ts`

- [x] Add explicit `AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'`.
- [x] Remove access/refresh/id token persistence from Zustand storage; persist only non-sensitive user display data if required.
- [ ] Configure Axios refresh requests with `withCredentials: true` and never send refresh token in JSON body after API migration. (ยังรอ backend contract)
- [x] Keep a single-flight refresh promise and retry the original request once.
- [x] On refresh failure, call logout, clear workspace state and clear React Query cache.
- [ ] Add tests proving reload cannot restore a usable refresh token from localStorage.
- [ ] Run `npm run typecheck` and the focused security test.

### Backend prompt B — compatibility migration

```text
ออกแบบ migration สำหรับ frontend ที่เลิกส่ง refreshToken ใน body:
1. รองรับ cookie-based refresh ตาม contract ใหม่
2. หากต้องรองรับ client รุ่นเก่า ให้จำกัดช่วงเวลาและทำ feature flag/temporary endpoint อย่างชัดเจน
3. ห้ามเขียน refresh token ลง response body ใน production flow ใหม่
4. กำหนดวิธี revoke token แบบเก่าและวันสิ้นสุด compatibility
5. เพิ่ม tests ป้องกันการใช้ token เก่า replay หลัง rotation
```

## Task 3: Add startup session validation and safe logout

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/routes/protected-route.tsx`
- Modify: `src/hooks/useAuth.ts`
- Modify: `src/stores/workspace.store.ts`
- Test: `tests/security/auth-bootstrap.test.ts`

- [ ] Validate token expiry before protected routing.
- [x] Call the session/current-user endpoint once during bootstrap when a session hint exists.
- [ ] Prevent protected pages from rendering during `loading`.
- [x] Clear auth, workspace and query state together on logout or invalid session.
- [ ] Prevent stale permissions from a previous user/workspace from being used during the bootstrap window.
- [ ] Test expired, valid, invalid and logout transitions.

## Task 4: Harden invitation and file URL handling

**Files:**
- Modify: `src/features/members/pages/InvitationAcceptPage.tsx`
- Modify: `src/features/members/hooks/useMembers.ts`
- Modify: `src/lib/queryKeys.ts`
- Modify relevant image-rendering components under `src/features/`
- Test: `tests/security/invitation-security.test.ts`

- [ ] Read invitation token only from the route, never persist it in localStorage.
- [ ] Remove the token from browser history after successful load/accept where routing allows.
- [ ] Ensure query/cache keys do not retain invitation token longer than necessary.
- [ ] Reject unsafe image schemes and document the backend allowlist for image hosts/types.
- [ ] Add `referrerPolicy="no-referrer"` for sensitive invitation/file views where appropriate.
- [ ] Test token replay UI behavior, malformed token encoding and unsafe URL rejection.

### Backend prompt C — invitations/files

```text
ตรวจสอบ invitations และ file/image security ของ WhereIs:
1. invitation token ต้อง random เพียงพอ, อายุสั้น, one-time และ revoke ได้
2. GET invitation ต้องไม่เปิดเผยข้อมูลเกินจำเป็นก่อน authentication/authorization
3. accept invitation ต้องตรวจผู้รับ, workspace, expiry, status และป้องกัน replay/race condition
4. ตอบ 404 หรือข้อความทั่วไปเมื่อไม่ต้องการเปิดเผยว่า token มีอยู่จริง
5. จำกัด upload MIME, extension, ขนาด, จำนวนไฟล์ และตรวจ content จริง ไม่เชื่อแค่ filename
6. ป้องกัน SVG/script และกำหนด allowlist ของ object-storage host
7. ใช้ signed URL อายุสั้นสำหรับ private files และไม่ log URL ที่มี secret
8. เพิ่ม tests สำหรับ token replay, concurrent accept, cross-user accept, path traversal และ unsafe file
```

## Task 5: Enforce security headers and deployment controls

**Files:**
- Create: `docs/security/production-headers.md`
- Modify only if this repository owns deployment config: `vite.config.ts` or hosting config

- [ ] Configure production HTTPS redirect and HSTS only after HTTPS is guaranteed.
- [ ] Add `Content-Security-Policy` in Report-Only mode, collect violations, then enforce.
- [ ] Add `X-Content-Type-Options: nosniff`, strict `Referrer-Policy`, `Permissions-Policy`, and frame protection via CSP `frame-ancestors`.
- [ ] Define allowed API, image, font and analytics origins explicitly; do not use `*` for sensitive sources.
- [ ] Verify headers against the deployed origin, not only Vite dev server.

### Infrastructure prompt

```text
ปรับ production edge/hosting ของ WhereIs ให้มี security baseline:
1. บังคับ HTTPS และเพิ่ม HSTS เมื่อทุก subdomain พร้อม HTTPS
2. เพิ่ม CSP แบบ Report-Only ก่อน โดยกำหนด default-src 'self' และ allowlist API/image/font ที่จำเป็นจริง
3. เพิ่ม X-Content-Type-Options: nosniff
4. เพิ่ม Referrer-Policy: strict-origin-when-cross-origin หรือเข้มงวดกว่า
5. เพิ่ม Permissions-Policy โดยปิดความสามารถที่ไม่ใช้ เช่น camera, microphone, geolocation
6. ป้องกัน framing ด้วย CSP frame-ancestors 'none' หรือ allowlist ที่จำเป็น
7. ปิด directory listing และ source-map exposure ใน production ตาม policy
8. ส่งผลตรวจ header จาก deployed URL และ rollback steps
```

## Task 6: Add CI supply-chain and secret controls

**Files:**
- Create: `.github/workflows/security.yml`
- Create: `docs/security/ci-security.md`
- Modify: `package.json` only to add reproducible security scripts

- [ ] Run lockfile-based dependency audit on every pull request.
- [ ] Add secret scanning for source, history and generated artifacts.
- [ ] Run `npm run typecheck`, `npm run build` and security tests in CI.
- [ ] Fail on high/critical dependency findings unless an approved temporary exception exists.
- [ ] Upload SARIF/results without exposing secrets.
- [ ] Pin third-party action versions and use least-privilege workflow permissions.
- [ ] Verify audit execution in an environment with registry access; local audit previously failed because npm registry DNS was unavailable.

## Task 7: Add authorization and abuse test matrix

**Files:**
- Create: `tests/security/README.md`
- Create or extend API-side test suite outside this repository

- [ ] Test every workspace-scoped GET/POST/PUT/PATCH/DELETE with a different user's workspace ID.
- [ ] Test member roles against every permission in `docs/security/permission-ui.md`.
- [ ] Test container scope filtering for search, reports, dashboard, activity and item detail.
- [ ] Test hidden-resource behavior does not leak existence through error differences.
- [ ] Test rate-limit responses and audit events for login, invitation and permission changes.
- [ ] Record test evidence and map each result to a risk/owner.

### Backend prompt D — authorization test matrix

```text
สร้าง authorization integration test matrix สำหรับ WhereIs:
1. ทุก endpoint ที่รับ wsId/resourceId ต้องทดสอบ cross-workspace access
2. ทดสอบ viewer/member/admin/owner กับ permission ทุก key ใน canonical permission list
3. ทดสอบ member ที่มี permission override เพิ่มและลดสิทธิ์
4. ทดสอบ container access scope กับ search, dashboard, report, activity และ detail APIs
5. ทดสอบ IDOR โดยแก้ resourceId เป็นของผู้ใช้อื่น และต้องไม่อ่าน/แก้/ลบได้
6. ทดสอบ race condition ของ invitation accept และ stock adjustment
7. ตรวจว่า error status/body ไม่ทำให้ attacker enumerate workspace/member/resource
8. เพิ่ม audit assertion สำหรับ role, permission, invitation และ destructive actions
```

## Acceptance criteria

- ไม่มี refresh token ใน localStorage/sessionStorage หรือ request body ของ production flow ใหม่
- Reload, expiry, revoke และ logout ไม่สามารถคง session ที่ใช้การได้
- ทุก workspace/resource API มี backend authorization test ผ่าน
- Invitation token replay และ cross-user accept ถูกปฏิเสธ
- Production response มี headers ตาม baseline และ CSP ผ่าน enforcement rollout
- CI ตรวจ dependency/secrets และหยุด build เมื่อพบ high/critical issue ตาม policy
- `npm run typecheck`, `npm run build` และ security test suite ผ่าน
- ทุก API change มี contract, migration และ rollback evidence

## Suggested delivery order

1. Task 1: API contract
2. Task 2-3: auth/session migration
3. Task 7: authorization test matrix (เริ่มทำคู่ขนานกับ Task 2)
4. Task 4: invitations/files
5. Task 5: headers/deployment
6. Task 6: CI and supply-chain controls
