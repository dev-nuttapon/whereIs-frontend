# Module: Notifications

> ศูนย์แจ้งเตือนของ workspace — reminder, important dates, overdue, warranty, maintenance, reservation, และ workflow alerts
> อ้างอิง: [../permission-ui.md](../security/permission-ui.md) · [activity.md](activity.md) · [settings.md](settings.md)

## 1. Purpose
ให้ผู้ใช้รับรู้สิ่งที่ต้องทำต่อจาก item/workflow/date tracking ได้ทันที โดยต้องเคารพ permission และ container access scope

## 2. User Stories
- ฉันต้องการเห็น reminder ของ expiry, warranty, maintenance, overdue return, และ reservation waiting
- ฉันต้องการ mark notification ว่าอ่านแล้ว
- ฉันต้องการปิด/ปรับ notification preference ได้
- ฉันต้องการเห็นเฉพาะ notification ที่เกี่ยวกับ workspace ที่ฉันเข้าถึงได้

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Notifications | `/w/:wsId/notifications` | feed ของ notification + filters |
| Settings | `/w/:wsId/settings/notifications` | preference / reminder controls |

## 4. Components
- `NotificationFeed`
- `NotificationItem`
- `NotificationFilters`
- `MarkAllReadButton`
- `NotificationPreferencesCard`

## 5. Forms
- Filters: type / unread / date range / item category
- Preferences: toggle controls สำหรับ reminder surfaces

## 6. API Calls
ผ่าน `src/api/notification.api.ts`:
- `GET /workspaces/:wsId/notifications`
- `POST /workspaces/:wsId/notifications/:id/read`
- `POST /workspaces/:wsId/notifications/read-all`

> โครงสร้าง `Notification` ยังต้อง sync กับ backend contract

## 7. React Query Usage
- `useNotifications(wsId, params)` = `useQuery(['ws', wsId, 'notifications', params])`
- `useMarkNotificationRead()` mutation
- `useMarkAllNotificationsRead()` mutation

## 8. Zustand Usage
- อ่าน `workspaceStore.permissions`
- อ่าน `workspaceStore.containerAccessScope`
- อ่าน `uiStore` ถ้ามี preference ของ drawer placement / badge visibility

## 9. Validation
- filter / preference values ต้องตรงกับค่าที่ backend รองรับ

## 10. Navigation
```
Topbar bell → Notifications
Dashboard reminder card → Notifications
Settings → Notifications preferences
```

## 11. Permission Rules
- ดู notification: `notification.view`
- เปลี่ยน preference: `notification.manage`
- notification list ต้องถูกกรองตาม permission + scope

## 12. Loading State
- feed → skeleton list
- preference card → skeleton rows

## 13. Error State
- load/update fail → retry / toast
- 403 → route guard

## 14. Empty State
- ไม่มี notification → empty state ที่บอกว่าไม่มี reminder ที่ค้างอยู่

## 15. Responsive Design
- desktop: feed + side panel
- mobile: single column + action drawer

## 16. Future Improvements
- Digest / email summary
- push notification
- smart snooze

## 17. Definition of Done
- [ ] Notification feed page
- [ ] Read / mark all read actions
- [ ] Settings link / preference surface
- [ ] Permission + scope filtering
- [ ] Loading/Error/Empty states

