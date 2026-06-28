# Module: Settings

> ตั้งค่า **workspace** และ **user profile** ของผู้ใช้ที่ล็อกอินอยู่
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [permission.md](permission.md) · [../state-management.md](../state/state-management.md)

## 1. Purpose
ให้ owner ปรับแต่ง workspace (ชื่อ, คำอธิบาย, timezone) และให้ผู้ใช้ทุกคนจัดการ profile ส่วนตัว (ชื่อ, avatar) และ preference (ธีม) ภายใน workspace

## 2. User Stories
- ในฐานะ owner ฉันต้องการ **เปลี่ยนชื่อ / คำอธิบาย** ของ workspace
- ในฐานะ owner ฉันต้องการ **ลบ workspace** (Danger Zone)
- ในฐานะ owner ฉันต้องการ **โอน ownership** ให้สมาชิกอื่น
- ในฐานะผู้ใช้ทุกคน ฉันต้องการ **เปลี่ยนชื่อ / รูป profile** ของตัวเอง
- ฉันต้องการ **สลับธีม** light / dark

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Settings | `/w/:wsId/settings` | hub รวมทุก settings section |
| Workspace Settings | `/w/:wsId/settings` (default tab) | ชื่อ, คำอธิบาย, timezone |
| Profile Settings | `/w/:wsId/settings/profile` | ชื่อ, avatar ของ user ปัจจุบัน |
| Appearance | `/w/:wsId/settings/appearance` | theme toggle, language (future) |
| Danger Zone | `/w/:wsId/settings/danger` | ลบ workspace, transfer ownership |

## 4. Components
- `SettingsLayout` (sidebar tabs ด้านซ้าย + content ด้านขวา)
- `WorkspaceSettingsForm`, `ProfileSettingsForm`, `AppearanceSettings`
- `DangerZone`, `DeleteWorkspaceDialog`, `TransferOwnershipDialog`
- `AvatarUpload` (รูป profile — future: file upload; ตอนนี้ initials fallback)
- `ThemeToggle` (light / dark / system)
- UI primitives: `Tabs`, `Button`, `Input`, `Textarea`, `Select`, `Switch`, `Dialog`

## 5. Forms

**Workspace Settings Form** — `WorkspaceSettingsForm`
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 ตัวอักษร |
| Description | `<Textarea>` | optional, ≤500 ตัวอักษร |
| Timezone | `<Select>` | required, ค่า IANA timezone (เช่น `Asia/Bangkok`) |
| Submit | button | "บันทึก", disable + spinner ขณะ `isSubmitting` |

**Profile Settings Form** — `ProfileSettingsForm`
| Field | Type | Validation |
|-------|------|------------|
| Display Name | `<Input>` | required 2–80 ตัวอักษร |
| Avatar | `AvatarUpload` | optional (future: image file ≤2MB) |
| Submit | button | "บันทึก Profile", disable + spinner ขณะ `isSubmitting` |

**Danger Zone Forms**
| Dialog | Fields | Validation |
|--------|--------|------------|
| `DeleteWorkspaceDialog` | พิมพ์ชื่อ workspace ยืนยัน | ต้องตรงกับชื่อจริงทุกตัวอักษร |
| `TransferOwnershipDialog` | เลือก member คนใหม่ (`<Select>`) | required, ต้องไม่ใช่ตัวเอง |

- Workspace Settings เข้าถึงได้เฉพาะ owner (`workspace.update` permission)
- Danger Zone เข้าถึงได้เฉพาะ owner — ลบ/โอน workspace เป็น irreversible

## 6. API Calls
ผ่าน `src/api/workspace.api.ts` และ `src/api/user.api.ts`:
- `PUT /workspaces/:wsId` `{ name, description, timezone }` → `Workspace`
- `DELETE /workspaces/:wsId`
- `POST /workspaces/:wsId/transfer` `{ newOwnerId }` → `Workspace`
- `PUT /users/me` `{ name }` → `User` (profile — endpoint ที่ backend อาจต่างกัน)
- (future) `PUT /users/me/avatar` (multipart/form-data)

## 7. React Query Usage
- `useWorkspace(wsId)` — แหล่ง data สำหรับ prefill form
- `useUpdateWorkspace()` mutation → invalidate `['workspace', wsId]` + `workspaceStore`
- `useDeleteWorkspace()` mutation → navigate ไป `/` (workspace list) หลัง success
- `useTransferOwnership()` mutation → invalidate workspace + member list
- `useUpdateProfile()` mutation → invalidate `authStore.user`

## 8. Zustand Usage
- `workspaceStore.workspace` — ใช้ prefill form ชื่อ workspace
- `authStore.user` — ใช้ prefill form profile
- `uiStore.theme` — ค่า theme toggle; persist ใน localStorage
- หลัง update workspace → sync `workspaceStore.workspace.name` (ผ่าน invalidate)

## 9. Form Validation
- Workspace name: Zod `string().min(2).max(80).trim()`
- Description: Zod `string().max(500).optional()`
- Timezone: Zod `enum([...IANA_TIMEZONES])`
- Delete confirm: Zod `string().refine(v => v === workspaceName, "ชื่อไม่ตรง")`
- Profile name: Zod `string().min(2).max(80).trim()`

## 10. Navigation Flow
```
Sidebar "Settings" → /w/:wsId/settings (Workspace tab)
Tab Sidebar → Profile → /settings/profile
Tab Sidebar → Appearance → /settings/appearance
Tab Sidebar → Danger → /settings/danger
Delete workspace → confirm → DELETE → navigate /  (workspace select)
Transfer ownership → confirm → POST → reload workspace data
```

## 11. Permission Rules
- เข้าหน้า Settings: ผู้ใช้ทุกคนที่อยู่ใน workspace (เห็น Profile + Appearance)
- แก้ Workspace Settings: `workspace.update` (owner เท่านั้นตามค่าเริ่มต้น)
- ลบ / โอน workspace: owner เท่านั้น — UI ซ่อน Danger Zone tab สำหรับ non-owner
- แก้ Profile: ผู้ใช้แก้ข้อมูลตัวเองได้เสมอ

## 12. Loading State
- prefill form → skeleton ของ input fields
- mutation → ปุ่ม spinner + disable form
- Delete dialog confirm → ปุ่ม spinner ขณะลบ

## 13. Error State
- โหลด workspace ล้มเหลว → `ErrorState` + retry
- update ล้มเหลว → toast error + คง form ไว้ (ไม่ reset)
- Delete: ลบไม่ได้ (เหลือ item อยู่?) → toast อธิบาย

## 14. Empty State
- ไม่มี empty state ในหน้านี้ — form prefill จาก workspace/user เสมอ

## 15. Responsive Behavior
- desktop: sidebar tabs ด้านซ้าย + form ด้านขวา
- mobile: tabs เปลี่ยนเป็น `<Select>` หรือ stacked accordion
- form ขยาย full-width บน mobile

## 16. Future Improvements
- Timezone-aware display สำหรับ activity timestamps
- Avatar upload (image file)
- Notification preferences (email digest, push)
- Language / locale setting
- Workspace logo upload
- API keys / integrations

## 17. Definition of Done
- [ ] Workspace Settings form + validation + update
- [ ] Profile Settings form + update
- [ ] Theme toggle (light/dark) + persist
- [ ] Danger Zone: Delete workspace + confirm dialog
- [ ] Danger Zone: Transfer ownership + confirm dialog
- [ ] Permission guard (owner-only sections)
- [ ] Responsive layout (sidebar tabs → select on mobile)
- [ ] Loading/Error states
