# Module: Auth

> Authentication ฝั่ง frontend: login, register, จัดการ session/token, logout, current user
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [../permission-ui.md](../security/permission-ui.md) · [../api-contract.md](../api/api-contract.md) · [../state-management.md](../state/state-management.md)

## 1. Purpose
ให้ผู้ใช้เข้าสู่ระบบและคงสถานะ login ไว้ พร้อมเก็บ token/user สำหรับใช้ทั้งแอป และจัดการ token หมดอายุ เป็น gateway ก่อนเข้าถึงทุกหน้าที่ต้อง auth

## 2. User Stories
- ในฐานะผู้ใช้ใหม่ ฉันต้องการ **register** ด้วย email/password เพื่อสร้างบัญชี
- ในฐานะผู้ใช้ ฉันต้องการ **login** เพื่อเข้าใช้งาน
- ในฐานะผู้ใช้ ฉันต้องการให้ระบบ **จำ session** ไว้เมื่อรีเฟรชหน้า
- ในฐานะผู้ใช้ ฉันต้องการ **logout** เพื่อออกจากระบบอย่างปลอดภัย
- ในฐานะผู้ใช้ ฉันต้องการเห็น **error ที่เข้าใจง่าย** เมื่อ email/password ผิด

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Login | `/login` | ฟอร์ม email + password + ปุ่ม login + ลิงก์ไป register |
| Register | `/register` | ฟอร์ม name + email + password + confirm + ลิงก์ไป login |
ทั้งสองหน้าใช้ **AuthLayout** (ดู [../layout.md](../ui/layout.md))

## 4. Components
- `LoginForm`, `RegisterForm` (feature components)
- ใช้ UI primitives: `Input`, `Button`, `Label`, `Alert` (shadcn/ui)
- `FormField` wrapper (error message ใต้ field)

## 5. Forms

**Login Form** — `LoginForm`
| Field | Type | Validation |
|-------|------|------------|
| Email | `<Input type="email">` | required, รูปแบบ email |
| Password | `<Input type="password">` | required |
| Submit | button | full-width, disable + spinner ขณะ `isSubmitting` |

**Register Form** — `RegisterForm`
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 ตัวอักษร |
| Email | `<Input type="email">` | required, รูปแบบ email |
| Password | `<Input type="password">` | required, ขั้นต่ำ 8 ตัว |
| Confirm Password | `<Input type="password">` | required, ต้องตรงกับ password |
| Submit | button | full-width, disable + spinner ขณะ `isSubmitting` |

Error display:
- field error → แสดงใต้ field ผ่าน `FormField` wrapper
- credential error (401) → `<Alert variant="destructive">` บนสุดของ form (ไม่บอกว่า email หรือ password ผิด — ใช้ข้อความรวม)

## 6. API Calls
ผ่าน `src/api/auth.api.ts` (ดู [../api-contract.md](../api/api-contract.md#auth)):
- `POST /auth/login` → `{ token, user }`
- `POST /auth/register` → `{ token, user }`
- `POST /auth/logout`
- `GET /auth/me` → `User` (ใช้ฟื้น session)

## 7. React Query Usage
- **Mutations:** `useLogin()`, `useRegister()`, `useLogout()`
- **Query:** `useCurrentUser()` = `useQuery(['auth','me'])` เปิดเมื่อมี token; ใช้ตอน bootstrap แอปเพื่อยืนยัน token ยัง valid
- `onSuccess` ของ login/register → เก็บ token+user ลง `authStore` แล้ว navigate
- `onSuccess` ของ logout → ล้าง store + query cache (`queryClient.clear()`)

## 8. Zustand Usage
`authStore` (ดู [../state-management.md](../state/state-management.md)):
```
accessToken: string | null
user: User | null
isAuthenticated: boolean   // derived จาก token
setAuth(token, user) / logout()
```
- token persist (localStorage) ผ่าน `persist` middleware
- axios interceptor อ่าน token จาก store เพื่อแนบ header
- **ห้าม** เก็บข้อมูล server อื่นใน authStore (เก็บแค่ identity)

## 9. Form Validation
ใช้ React Hook Form + Zod:
- `email`: required, รูปแบบ email
- `password`: required, ขั้นต่ำ 8 ตัว
- (register) `name`: required, 2–80 ตัว
- (register) `confirmPassword`: ต้องตรงกับ password
- validate ฝั่ง client ให้ตรงกับ backend; backend 400 → map ลง field error

## 10. Navigation Flow
```
เปิดแอป → bootstrap: มี token?
   ├─ ไม่มี → /login
   └─ มี → GET /auth/me
            ├─ ok → /workspaces (หรือ workspace ล่าสุด)
            └─ 401 → ล้าง token → /login

Login สำเร็จ → /workspaces
Register สำเร็จ → /workspaces (auto login)
Logout → /login (เคลียร์ทุกอย่าง)
```

## 11. Permission Rules
- หน้า `/login`, `/register` เป็น **public** — ถ้า login แล้วเข้า → redirect ออกไป `/workspaces`
- ไม่ใช้ permission key (ยังไม่เข้า workspace)

## 12. Loading State
- ปุ่ม submit แสดง spinner + disable ตอน `isSubmitting`
- ตอน bootstrap (`/auth/me`) แสดง full-screen splash/loader ก่อนตัดสินใจ route

## 13. Empty State
- ไม่มี (เป็นฟอร์ม) — แต่ field ว่างต้องมี placeholder ชัดเจน

## 14. Error State
- **401 invalid credentials** → alert รวม "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (ไม่บอกว่าผิดช่องไหน)
- **400 validation** → error ใต้ field
- **network/5xx** → alert "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง" + ปุ่ม retry
- ไม่โชว์ raw error จาก backend (ดู [../api-contract.md](../api/api-contract.md))

## 15. Responsive Behavior
- Card กึ่งกลาง `max-w-sm`; mobile เต็มกว้าง padding `p-4`
- field/ปุ่ม full width บน mobile

## 16. Future Improvements
- Refresh token / silent re-auth
- OAuth (Google) login
- Forgot/reset password
- Remember me, 2FA
- Rate-limit feedback

## 17. Definition of Done
- [ ] Login/Register page + AuthLayout
- [ ] `auth.api.ts` ครบ 4 endpoint
- [ ] `useLogin/useRegister/useLogout/useCurrentUser`
- [ ] `authStore` + persist token + interceptor แนบ token
- [ ] Bootstrap flow (ฟื้น session / 401 → logout)
- [ ] Validation (Zod) + แสดง error ราย field และ error รวม
- [ ] Loading/Error states
- [ ] Public route redirect เมื่อ login แล้ว
- [ ] Responsive
