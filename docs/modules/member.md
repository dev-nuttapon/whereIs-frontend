# Module: Member

> จัดการ **สมาชิกใน workspace**: ดูรายการ, เชิญ, เปลี่ยน primary role, จัดการ extra permissions, กำหนด container access scope, ลบ, และเข้าหน้า permission override
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [permission.md](permission.md) · [../permission-ui.md](../security/permission-ui.md)

## 1. Purpose
ให้ owner/admin ควบคุมว่าใครเข้าถึง workspace ได้ และมี role อะไร เป็นจุดเริ่มของระบบสิทธิ์รายบุคคล

## 2. User Stories
- ในฐานะ owner/admin ฉันต้องการเห็นรายชื่อสมาชิกและ role
- ฉันต้องการเชิญสมาชิกด้วย email + role
- ฉันต้องการเปลี่ยน primary role ของสมาชิก
- ในฐานะ owner ฉันต้องการลบสมาชิกออกจาก workspace
- ฉันต้องการเปิดหน้า permission override ของสมาชิกแต่ละคน
- ฉันต้องการเห็นคำเชิญ pending / accepted / rejected / expired
- ฉันต้องการกำหนด container access scope ให้ member

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Members | `/w/:wsId/members` | ตารางสมาชิก + ปุ่ม Invite + invitation states |
| Invite Member | dialog | email + primary role |
| Member Detail / Permission | `/w/:wsId/members/:memberId` | primary role + extra permissions + container access scope + permission override |

## 4. Components
- `MemberTable`, `MemberRow`, `InviteMemberDialog`, `RoleSelect`, `ConfirmDialog`, `InvitationList`
- `RoleBadge`, `Avatar`
- UI primitives: `Table`, `Dialog`, `Select`, `Button`, `Input`

## 5. Forms

**Invite Member Form**
| Field | Type | Validation |
|-------|------|------------|
| Email | `<Input type="email">` | required, รูปแบบ email |
| Primary Role | `<Select>` | required ∈ {owner, admin, member, viewer} ตาม policy ของ workspace |
| Submit | button | disable + spinner ขณะ `isSubmitting` |

**Inline Role Change**
- `<Select>` เปลี่ยนค่า → confirm dialog → mutation
- แก้ role ตัวเองหรือ owner คนสุดท้ายต้องถูกกันด้วย UI และ backend

## 6. API Calls
ผ่าน `src/api/member.api.ts`:
- `GET /workspaces/:wsId/members` → `Member[]`
- `GET /workspaces/:wsId/members/:id` → `Member`
- `POST /workspaces/:wsId/members/invite` `{ email, primaryRole }` → `Member`
- `PUT /workspaces/:wsId/members/:id/role` `{ primaryRole }` → `Member`
- `DELETE /workspaces/:wsId/members/:id`

## 7. React Query Usage
- `useMembers(wsId)` = `useQuery(['ws', wsId, 'members'])`
- `useMember(wsId, id)` = `useQuery(['ws', wsId, 'member', id])`
- `useInviteMember/useUpdateMemberRole/useRemoveMember` → invalidate members + member detail
- ถ้าแก้ role หรือ scope ของตัวเอง → invalidate workspace/permissions ด้วย

## 8. Zustand Usage
- ไม่เก็บ member ใน Zustand
- ใช้ `authStore.user` เพื่อรู้ว่า row ไหนคือ "ตัวเอง"

## 9. Form Validation
- Invite: `email` required + รูปแบบ email
- `primaryRole` ต้องเป็นค่าที่ workspace อนุญาต
- container access scope ต้องถูก validate ตาม container ที่มีอยู่จริง

## 10. Navigation Flow
```
Members → Invite / edit role / remove
Members → click member → Member Detail → Permission tab
Members → invitation list → accept / reject / revoke / resend
```

## 11. Permission Rules
- ดูสมาชิก: `member.view`
- เชิญ: `member.invite`
- เปลี่ยน primary role: `member.update_role`
- ลบสมาชิก: `member.remove`
- override permission: `permission.override`
- แก้ container access scope: `container.access.manage`
- owner ต้องเป็นคนสุดท้ายที่ถูกลดสิทธิ์/ลบไม่ได้

## 12. Loading State
- table → skeleton rows
- mutation → ปุ่ม/row spinner + disable

## 13. Empty State
- มีแต่ตัวเอง → แสดง row ตัวเอง + ชวน Invite
- ไม่มีสิทธิ์ดู → route guard กันออก

## 14. Error State
- โหลดล้มเหลว → `ErrorState` + retry
- เชิญ email ที่เป็นสมาชิกอยู่แล้ว → 409 → error ใต้ field
- ลบ/ลดสิทธิ์ owner คนสุดท้าย → toast อธิบาย

## 15. Responsive Behavior
- desktop: table
- mobile: card list (ชื่อ+role+actions)

## 16. Future Improvements
- Pending invitation list + resend/revoke
- เชิญหลายคนพร้อมกัน, ลิงก์เชิญ
- last active และ activity ของสมาชิก

## 17. Definition of Done
- [ ] Members table + Invite dialog + Role change + Remove
- [ ] Invitation states + accept/reject/resend/revoke
- [ ] `member.api.ts` ครบ
- [ ] Query + invalidation (รวม permissions ตัวเองเมื่อ role เปลี่ยน)
- [ ] Validation invite + 409 email ซ้ำ
- [ ] Permission guard + กฎ owner/ตัวเอง + container access scope
- [ ] Loading/Empty/Error
- [ ] Responsive table/card
