# Module: Member

> จัดการ **สมาชิก** ใน workspace: ดูรายการ, เชิญ, เปลี่ยน role, ลบ
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [permission.md](permission.md) · [../permission-ui.md](../security/permission-ui.md)

## 1. Purpose
ให้ admin/owner ควบคุมว่าใครเข้าถึง workspace ได้ และมี role อะไร เป็นจุดเริ่มของระบบสิทธิ์ (permission override ทำต่อใน [permission.md](permission.md))

## 2. User Stories
- ในฐานะ admin ฉันต้องการเห็น **รายชื่อสมาชิก** + role
- ฉันต้องการ **เชิญสมาชิก** ด้วย email + เลือก role
- ฉันต้องการ **เปลี่ยน role** ของสมาชิก
- ในฐานะ owner ฉันต้องการ **ลบสมาชิก** ออกจาก workspace

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Members | `/w/:wsId/members` | ตารางสมาชิก + ปุ่ม Invite |
| Invite Member | dialog | email + role |
| Member Detail / Permission | `/w/:wsId/members/:memberId` | role + permission override (ดู [permission.md](permission.md)) |

## 4. Components
- `MemberTable`, `MemberRow`, `InviteMemberDialog`, `RoleSelect`, `ConfirmDialog`
- `RoleBadge`, `Avatar`
- UI primitives: `Table`, `Dialog`, `Select`, `Button`, `Input`

## 5. Forms

**Invite Member Form** — ภายใน `InviteMemberDialog`
| Field | Type | Validation |
|-------|------|------------|
| Email | `<Input type="email">` | required, รูปแบบ email |
| Role | `<Select>` | required ∈ {admin, member, viewer} (เชิญเป็น owner ไม่ได้) |
| Submit | button | "ส่งคำเชิญ", disable + spinner ขณะ `isSubmitting` |

**Inline Role Change** — `RoleSelect` ใน `MemberRow`
- `<Select>` เปลี่ยนค่า → (optional) confirm dialog → `useUpdateMemberRole` mutation
- ล็อก: ห้ามลด role owner คนสุดท้าย หรือแก้ role ตัวเอง (UI ป้องกัน + backend ยืนยัน)

Error display:
- 409 email เป็นสมาชิกอยู่แล้ว → error ใต้ field `email`
- 422 ลด role owner คนสุดท้าย → toast อธิบาย

## 6. API Calls
ผ่าน `src/api/member.api.ts`:
- `GET /workspaces/:wsId/members` → `Member[]`
- `GET /workspaces/:wsId/members/:id` → `Member`
- `POST /workspaces/:wsId/members/invite` `{ email, role }` → `Member`
- `PUT /workspaces/:wsId/members/:id/role` `{ role }` → `Member`
- `DELETE /workspaces/:wsId/members/:id`

## 7. React Query Usage
- `useMembers(wsId)` = `useQuery(['ws', wsId, 'members'])`
- `useMember(wsId, id)` = `useQuery(['ws', wsId, 'member', id])`
- `useInviteMember/useUpdateMemberRole/useRemoveMember` → invalidate `['ws', wsId, 'members']` (+ detail)
- เปลี่ยน role ของ **ตัวเอง** → invalidate workspace/permissions ด้วย (อาจกระทบเมนูตัวเอง)

## 8. Zustand Usage
- ไม่เก็บ member ใน Zustand
- ใช้ `authStore.user` เพื่อรู้ว่า row ไหนคือ "ตัวเอง" (กันลบ/ลด role ตัวเองพลาด)

## 9. Form Validation
Invite (Zod): `email` required + รูปแบบ email; `role` required ∈ {admin, member, viewer} (เชิญเป็น owner ไม่ได้ตามค่าเริ่มต้น)

## 10. Navigation Flow
```
Sidebar "Members" → /w/:wsId/members
Invite → dialog → สำเร็จ → invalidate list + toast
คลิก member → Member Detail (override permission — permission.md)
เปลี่ยน role inline (RoleSelect) → confirm → mutation
Remove → ConfirmDialog → invalidate list
```

## 11. Permission Rules
- ดูสมาชิก: `member.view`
- เชิญ: `member.invite`
- เปลี่ยน role: `member.update_role`
- ลบสมาชิก: `member.remove`
- override permission: `permission.override` (owner) — ดู [permission.md](permission.md)
- **กฎเสริม:** เปลี่ยน/ลบ **owner** ทำได้เฉพาะ owner; ห้ามลด role/ลบ **ตัวเอง** จนไม่มี owner เหลือ (UI ป้องกัน + backend ยืนยัน)

## 12. Loading State
- table → skeleton rows
- mutation → ปุ่ม/row spinner + disable

## 13. Empty State
- มีแต่ตัวเอง → แสดง row ตัวเอง + ชวน Invite
- ไม่มีสิทธิ์ดู → ไม่ควรเข้าถึง route (guard เด้งออก)

## 14. Error State
- โหลดล้มเหลว → `ErrorState` + retry
- เชิญ email ที่เป็นสมาชิกอยู่แล้ว → 409 → error ใต้ field
- ลบ/ลดสิทธิ์ owner คนสุดท้าย → 422 → toast อธิบาย

## 15. Responsive Behavior
- desktop: table; mobile: card list (ชื่อ+role+actions)
- RoleSelect/Invite เป็น dialog เต็มกว้างบน mobile

## 16. Future Improvements
- Pending invitation list + resend/revoke
- เชิญหลายคนพร้อมกัน, ลิงก์เชิญ
- กิจกรรมของสมาชิก, last active
- กลุ่ม/ทีม

## 17. Definition of Done
- [ ] Members table + Invite dialog + Role change + Remove
- [ ] `member.api.ts` ครบ
- [ ] Query + invalidation (รวม permissions ตัวเองเมื่อ role เปลี่ยน)
- [ ] Validation invite + 409 email ซ้ำ
- [ ] Permission guard + กฎ owner/ตัวเอง
- [ ] Loading/Empty/Error
- [ ] Responsive table/card
