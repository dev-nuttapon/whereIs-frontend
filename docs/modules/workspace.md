# Module: Workspace

> เลือก / สร้าง / สลับ workspace — เป็นชั้นที่กำหนด **ขอบเขตข้อมูลทั้งหมด** ของแอป (workspace isolation)
> อ้างอิง: [../domain-model.md](../architecture/domain-model.md) · [../permission-ui.md](../security/permission-ui.md) · [../state-management.md](../state-management.md)

## 1. Purpose
ให้ผู้ใช้เลือก workspace ที่จะทำงานด้วย และเก็บ "workspace ปัจจุบัน" + permission ของผู้ใช้ใน workspace นั้น เพื่อให้ทุก feature ดึงข้อมูลภายใต้ workspace ที่ถูกต้อง

## 2. User Stories
- ในฐานะผู้ใช้ ฉันต้องการเห็น **รายการ workspace** ที่ฉันเป็นสมาชิก
- ฉันต้องการ **สร้าง workspace ใหม่** (กลายเป็น owner)
- ฉันต้องการ **สลับ workspace** ได้จาก topbar ทุกหน้า
- ฉันต้องการให้ระบบจำ **workspace ล่าสุด** ที่ใช้
- ฉันต้องการเห็น **คำเชิญเข้า workspace** ที่ยังรอการตอบรับ

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Workspace List | `/workspaces` | grid/list ของ workspace + ปุ่ม Create |
| Create Workspace | `/workspaces/new` หรือ dialog | ฟอร์มชื่อ workspace |
| Workspace Switcher | (component บน Topbar) | dropdown สลับ ws + recent workspace |
| Invitations | (component / notification entry) | pending invite, accept, reject |
- Workspace List ใช้ **WorkspaceSelectLayout** (ไม่มี sidebar); หลังเลือกเข้าใช้ **AppLayout** (ดู [../layout.md](../ui/layout.md))

## 4. Components
- `WorkspaceCard`, `WorkspaceList`, `CreateWorkspaceDialog`, `WorkspaceSwitcher` (topbar)
- `InvitationList`, `InvitationCard`, `WorkspaceSummary`
- UI primitives: `Card`, `Dialog`, `DropdownMenu`, `Button`, `Input`

## 5. Forms

**Create Workspace Form** — ภายใน `CreateWorkspaceDialog`
| Field | Type | Validation |
|-------|------|------------|
| Name | `<Input>` | required 2–80 ตัวอักษร, ห้ามว่างล้วน |
| Submit | button | disable + spinner ขณะ `isSubmitting` |

- form อยู่ใน Dialog — ปิด dialog และ navigate หลัง success
- error แสดงใต้ field หรือ toast ตามประเภท error

## 6. API Calls
ผ่าน `src/api/workspace.api.ts`:
- `GET /workspaces` → `Workspace[]`
- `POST /workspaces` → `Workspace`
- `GET /workspaces/:id` → `Workspace & { permissions, containerAccessScope }` (โหลด access model ตอนเข้า ws)

## 7. React Query Usage
- `useWorkspaces()` = `useQuery(['workspaces'])`
- `useWorkspace(wsId)` = `useQuery(['workspace', wsId])` — โหลดรายละเอียด + permissions ตอนเข้า ws
- `useCreateWorkspace()` mutation → invalidate `['workspaces']`, set เป็น ws ปัจจุบัน, navigate เข้า dashboard

## 8. Zustand Usage
`workspaceStore` (ดู [../state-management.md](../state-management.md)):
```
currentWorkspaceId: string | null
currentWorkspace: Workspace | null
permissions: string[]          // ของผู้ใช้ใน ws ปัจจุบัน
containerAccessScope: {
  containerIds: string[];
  includeDescendants: boolean;
} | null                           // scope ของผู้ใช้ใน ws ปัจจุบัน
setWorkspace(ws) / clear()
```
- `currentWorkspaceId` persist (จำ ws ล่าสุด)
- `permissions` ใช้โดย `usePermission()`/`can()` (ดู [../permission-ui.md](../security/permission-ui.md))
- `containerAccessScope` ใช้กรอง navigation/search/dashboard/reports/item visibility
- เมื่อสลับ ws → set store + `queryClient.invalidateQueries()` ข้อมูลที่ผูก ws เก่า (หรือใช้ wsId ใน query key ให้ refetch เอง)

## 9. Form Validation
Create workspace (Zod): `name` required, 2–80 ตัว, ไม่ว่างล้วน

## 10. Navigation Flow
```
Login → /workspaces
  ├─ มี ws ล่าสุด (persist) → auto เข้าหรือ highlight
  ├─ เลือก ws → set store → /w/:wsId (Dashboard)
  └─ Create → สร้าง → set store → Dashboard
Topbar Switcher → เลือก ws อื่น → set store → /w/:newId (Dashboard)
```

## 11. Permission Rules
- เห็น workspace ที่ตนเป็น member เท่านั้น (backend กรองให้)
- สร้าง workspace: ผู้ใช้ที่ login ทุกคนทำได้ (กลายเป็น owner)
- ลบ workspace: เฉพาะ `workspace.delete` (owner) — ทำในหน้า Settings
- เปลี่ยนชื่อ workspace: `workspace.update`
- คำเชิญ workspace ควรถูกมองเห็นได้เฉพาะ workspace ที่ผู้ใช้เกี่ยวข้อง

## 12. Loading State
- โหลดรายการ → skeleton ของ WorkspaceCard
- โหลดรายละเอียด ws ตอนเข้า → splash สั้นก่อนเข้า dashboard

## 13. Empty State
- ไม่มี workspace → `EmptyState` "ยังไม่มี workspace" + ปุ่ม Create เด่น

## 14. Error State
- โหลดรายการล้มเหลว → `ErrorState` + retry
- สร้างล้มเหลว → toast error, คงค่าในฟอร์ม

## 15. Responsive Behavior
- Grid: desktop 3–4 คอลัมน์, tablet 2, mobile 1
- Switcher บน mobile = dropdown เต็มกว้างใน drawer/topbar

## 16. Future Improvements
- เชิญ/รับเชิญเข้า workspace ผ่านลิงก์
- ลบ/ออกจาก workspace, transfer ownership
- รูป/ไอคอน workspace, การจัดเรียง/ค้นหา workspace
- workspace ล่าสุดหลายอันแบบ recent

## 17. Definition of Done
- [ ] Workspace List + Create (dialog/page)
- [ ] WorkspaceSwitcher บน Topbar (ทุกหน้า)
- [ ] Invitation entry / pending invite state
- [ ] `workspace.api.ts` + `useWorkspaces/useWorkspace/useCreateWorkspace`
- [ ] `workspaceStore` (current + permissions) + persist ws ล่าสุด
- [ ] สลับ ws แล้วข้อมูล refetch ถูก scope (wsId ใน query key)
- [ ] Loading/Empty/Error states
- [ ] Permission: ปุ่มลบ/แก้ตามสิทธิ์
- [ ] Responsive grid
