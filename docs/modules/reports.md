# Module: Reports

> รายงานของ workspace — สรุปภาพรวม, export, และหน้าจอที่ช่วยตัดสินใจจากข้อมูลที่เข้าถึงได้จริง
> อ้างอิง: [../permission-ui.md](../security/permission-ui.md) · [search.md](search.md) · [dashboard.md](dashboard.md)

## 1. Purpose
ให้ผู้ใช้ที่มีสิทธิ์ดูรายงานเห็นสรุปของ workspace, item, quantity, workflow, adjustment, และ reminder data โดยต้องถูกกรองตาม permission + container access scope

## 2. User Stories
- ในฐานะ admin ฉันต้องการดูสรุป workspace เพื่อเข้าใจภาพรวมเร็วขึ้น
- ฉันต้องการดูสถานะของ quantity item, overdue return, reservation waiting, repair queue, และ expiry risk
- ฉันต้องการ export รายงานไปใช้งานต่อ
- ฉันต้องการให้รายงานแสดงเฉพาะข้อมูลที่ฉันเข้าถึงได้

## 3. Screen Description
| หน้า | Route | คำอธิบาย |
|------|-------|----------|
| Reports | `/w/:wsId/reports` | summary cards + table/list + filters |
| Export | button / modal | export CSV/PDF/XLSX ตาม backend contract |

## 4. Components
- `ReportSummaryCard`
- `ReportFilters`
- `ReportTable`
- `ExportReportButton`
- `AccessScopeHint`

## 5. Forms

Reports ไม่ใช่ฟอร์มหลัก แต่มี filter controls:
- Date range
- Container
- Item type
- Workflow state
- Group by

## 6. API Calls
ผ่าน `src/api/report.api.ts`:
- `GET /workspaces/:wsId/reports`
- `GET /workspaces/:wsId/reports/export`

> รายละเอียดรูปแบบรายงานยังต้อง sync กับ backend contract

## 7. React Query Usage
- `useReports(wsId, params)` = `useQuery(['ws', wsId, 'reports', params])`
- `useExportReport(wsId, params)` = mutation / download flow
- invalidate reports when item actions, adjustments, or major inventory changes happen

## 8. Zustand Usage
- อ่าน `workspaceStore.permissions`
- อ่าน `workspaceStore.containerAccessScope`
- ไม่เก็บ report data ใน Zustand

## 9. Validation
- filter values ต้องตรงกับค่าที่ backend รองรับ
- export format ต้องเป็นตัวเลือกที่รองรับจริง

## 10. Navigation
```
Dashboard → Reports
Search → reports summary (future)
Reports → export
```

## 11. Permission Rules
- ดูรายงาน: `report.view`
- export: `report.export`
- report ต้องถูกกรองตาม container access scope

## 12. Loading State
- summary cards → skeleton cards
- table → skeleton rows

## 13. Error State
- load/export fail → retry / toast
- 403 → route guard

## 14. Empty State
- ไม่มีข้อมูล report → empty state ที่ชัดเจนพร้อมสาเหตุที่เป็นไปได้

## 15. Responsive Design
- desktop: cards + table
- mobile: cards stacked + table collapse เป็น card list

## 16. Future Improvements
- Saved report presets
- Scheduled export
- Charts / trends

## 17. Definition of Done
- [ ] Reports page
- [ ] Filters + export
- [ ] Permission + scope filtering
- [ ] Loading/Error/Empty states
- [ ] Route in screen-flow + navigation

