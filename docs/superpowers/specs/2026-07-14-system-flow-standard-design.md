# WhereIs System Flow Standard Design

> เป้าหมายเอกสารนี้คือกำหนดมาตรฐานกลางของทั้งระบบใหม่ เพื่อให้ข้อมูลตั้งต้น, งานปฏิบัติการ, และประวัติการใช้งานไม่ปนกันอีก

## 1. Objective

WhereIs ต้องทำงานเป็นระบบบริหารทรัพย์สินและสต็อกแบบ lifecycle-driven, traceable, และ workspace-scoped.

ปัญหาปัจจุบันไม่ใช่แค่ UI ไม่สวยหรือ route หาย แต่คือ
- คำศัพท์หลักยังไม่เป็น canonical เดียว
- หน้าจอหลายหน้ารวม master data กับ transaction flow ไว้ด้วยกัน
- ลำดับ step การทำงานไม่ตายตัว ทำให้ผู้ใช้ทำรายการผิดลำดับ
- item, stock, container, borrow, return, master data ยังไม่ถูกวางเป็นระบบเดียวกัน

เอกสารนี้กำหนด standard ใหม่ระดับระบบก่อน แล้วค่อยเอาไปแตกเป็น implementation plan และการแก้โค้ดรายส่วน

## 2. Standards Basis

มาตรฐานที่เอามาใช้เป็นแนวคิด:
- ISO 55000 / 55001: asset management ต้องมอง lifecycle, value, และการควบคุมทรัพย์สินตลอดอายุใช้งาน
- GS1 identification principles: object แต่ละชนิดและแต่ละ instance ต้องระบุได้แบบ unique และ trace ย้อนหลังได้

สิ่งที่เราเอามาใช้:
- unique identification ของ object
- lifecycle และ event trail
- separation ระหว่าง reference/master data กับ transaction
- traceability ว่าใครทำอะไร เมื่อไร กับ object ไหน

## 3. Canonical Vocabulary

คำศัพท์ที่ระบบนี้จะใช้เป็นหลัก:

| Term | ความหมาย |
|------|----------|
| Workspace | ขอบเขตข้อมูลหลักของระบบ |
| Reference Data | ข้อมูลตั้งต้นที่ใช้ร่วมกันทั้ง workspace |
| Master Data | ข้อมูลกึ่งถาวรที่ใช้ขับงานจริง |
| Container | โหนดในโครงสร้างที่เก็บของ |
| Item | สิ่งที่ถูกติดตามในระบบ |
| Stock | Item แบบติดตามเป็นจำนวน |
| Transaction | การเปลี่ยนสถานะหรือการเคลื่อนไหว |
| Event / History | บันทึกสิ่งที่เกิดขึ้นแบบย้อนหลังได้ |
| Permission | สิทธิ์ว่า "ทำอะไรได้" |
| Access Scope | ขอบเขตว่า "ทำกับพื้นที่ไหนได้" |

มาตรฐานที่ต้องบังคับ:
- `Container` คือคำเดียวที่ใช้แทนโครงสร้างพื้นที่เก็บ
- `Item` คือคำหลักของของที่ติดตาม
- `Stock` เป็นรูปแบบการติดตาม ไม่ใช่หมวดระบบแยกขาด
- `Location` และ `Site` ไม่เป็น core vocabulary ใหม่ ถ้าจะคงไว้ต้องเป็น alias/legacy mapping เท่านั้น
- `Asset` ใช้ได้เฉพาะในเอกสารเก่าหรือ legacy adapter ไม่ใช่คำหลักของ product flow

## 4. Layer Model

ระบบต้องแบ่งเป็น 4 ชั้นชัดเจน

### 4.1 Reference Data
ข้อมูลอ้างอิงที่เปลี่ยนไม่บ่อย
- unit
- category
- status labels
- workflow policy
- permission labels
- notification templates

### 4.2 Master Data
ข้อมูลฐานที่ใช้ทำงานจริง
- workspace
- members
- roles / permissions
- container tree
- item/product catalog
- stock policy
- access scope

### 4.3 Operational Transactions
สิ่งที่ผู้ใช้ทำในชีวิตประจำวัน
- create item / create stock
- move container
- borrow / return / withdraw / reserve / repair / dispose
- stock consume / restock / count / adjust
- mark missing / mark found

### 4.4 Audit / Visibility
สิ่งที่ใช้ตอบคำถามย้อนหลัง
- item history
- workspace activity
- notifications
- reports

กฎสำคัญ:
- Reference/Master Data ไม่ควรถูกใช้แทน transaction
- Transaction ต้องสร้าง event เสมอ
- Audit screen ต้องอ่านจาก event/summary ไม่ใช่จาก form state

## 5. Standard Workflow Order

ทุก workspace ควรเดินตามลำดับนี้

### Phase A: Setup
1. Login
2. Select or create workspace
3. Set workspace context
4. Define reference/master data
5. Define container tree
6. Define roles and access scope

### Phase B: Operational Readiness
7. Create catalog/master entries
8. Create containers
9. Create items or stock
10. Verify visibility and permission

### Phase C: Daily Work
11. Search or browse
12. Open item or container detail
13. Execute transaction
14. Confirm success
15. Write event/history

### Phase D: Review
16. Inspect activity
17. Inspect reports
18. Inspect notifications

Rules:
- ผู้ใช้ต้องไม่เริ่ม transaction ก่อนข้อมูลตั้งต้นที่จำเป็นพร้อม
- หน้าจอ transaction ต้องบอก prerequisite ชัดเจน
- ถ้าข้อมูล master ไม่ครบ ให้พาไปหน้าตั้งค่า ไม่ให้ user ติด loop อยู่หน้าทำงาน

## 6. Screen Roles

แต่ละหน้าต้องมีบทบาทเดียวเป็นหลัก

| Screen Group | Role |
|--------------|------|
| Workspace selection | context setup |
| Master data pages | setup / configuration |
| Container pages | structure management |
| Item pages | operational transaction |
| Search page | discovery |
| Activity page | audit |
| Reports page | summary / decision support |
| Notifications page | reminder / follow-up |
| Settings page | preferences / workspace policy |

กติกาการออกแบบ:
- หน้า setup ห้ามบีบ transaction actions ไว้ในหน้าเดียวจนลำดับปน
- หน้า transaction ห้ามใช้เป็นที่ตั้งค่าระบบ
- หน้า discovery ต้องไม่บังคับผู้ใช้เข้า sub-flow ที่ไม่จำเป็น

## 7. Data Entry Standards

### 7.1 Master Data First
การเพิ่มข้อมูลต้องเริ่มจากข้อมูลที่เป็นฐานก่อน:
1. workspace context
2. container tree / access scope
3. catalog / unit / category / policy
4. item or stock record

ถ้า step ไหนยังไม่พร้อม:
- ระบบต้องบอก missing prerequisite
- ระบบต้องเสนอทางลัดไป step ที่ต้องทำก่อน
- ระบบต้องไม่แกล้งให้ผู้ใช้กรอกฟอร์มที่ต่อไม่ติด

### 7.2 Transaction Second
งานปฏิบัติการต้องเริ่มจาก object ที่มีอยู่จริง:
- select item/container/stock
- validate permission
- validate access scope
- confirm state transition
- record event

### 7.3 Audit Last
สิ่งที่ผู้ใช้จะดูย้อนหลังต้องมาจาก event และ summary
- ไม่ควร derive จากหน้าฟอร์มล่าสุด
- event ต้องมี actor, timestamp, object reference, and payload

## 8. Recommended Domain Alignment

เพื่อให้ flow สากลและไม่ปนกัน:

| Current in repo | Standard target |
|----------------|-----------------|
| `Asset` | legacy adapter only |
| `Item` | tracked object |
| `Product` | catalog master or item definition |
| `Container` | storage node |
| `Location` / `Site` | optional legacy bridge only |
| `BorrowOrder` | transaction type / workflow instance |
| `PermissionMatrix` | policy editor |
| `Activity` | audit feed |

หลักคิด:
- ถ้าเป็นสิ่งที่ user "ต้องเลือกใช้ตอนทำงาน" = operational object
- ถ้าเป็นสิ่งที่ user "ตั้งไว้ครั้งเดียวแล้วใช้ซ้ำ" = master data
- ถ้าเป็นสิ่งที่ user "ดูย้อนหลัง" = audit

## 9. Screen Navigation Standard

```
Login
  → Workspace Selection
    → Master Data Setup
      → Container Structure
        → Item / Stock Creation
          → Search / Browse
            → Transaction Dialog
              → Event / Activity / Report
```

Non-negotiable rules:
- Dashboard ต้องเป็นทางลัด ไม่ใช่ที่ตั้งค่า
- Search ต้องเป็นทางเข้าหลักของ daily work
- Item detail ต้องเป็นจุดรวมของ state, metadata, และ action
- Container detail ต้องเป็นจุดรวมของ structure และ contents

## 10. UI Partition Rules

### Master Data Pages
ควรมี:
- list
- create/edit
- validation
- dependency hints

ไม่ควรมี:
- transaction dialog ซ้อนเยอะ
- audit timeline ยาว ๆ

### Transaction Pages
ควรมี:
- current object
- available actions
- precondition summary
- confirm / execute
- result state

ไม่ควรมี:
- configuration ที่เปลี่ยนโครงระบบ

### Audit Pages
ควรมี:
- timeline / feed
- filters
- who / what / when / why
- export if needed

ไม่ควรมี:
- edit form หลัก

## 11. Migration Rules for Existing UI

เมื่อปรับระบบ ต้องเรียงลำดับการแก้ดังนี้
1. ปรับคำศัพท์ใน docs และ route map ให้เป็น canonical เดียว
2. แยกหน้าจอที่ปนกันระหว่าง setup กับ transaction
3. ใส่ search as primary entry
4. ใส่ audit/activity เป็น first-class screen
5. เพิ่ม report/notification เป็น output layer
6. จัด item/stock workflow ให้ใช้ lifecycle เดียวกัน

ถ้าพบหน้าจอที่ใช้ legacy term:
- เก็บไว้ได้ชั่วคราว
- ต้องมี mapping ชัดว่า legacy term map ไป canonical term ไหน
- ห้ามปล่อยให้คำหลายชุดเป็น primary พร้อมกัน

## 12. Definition of Done

มาตรฐานนี้ถือว่าใช้ได้เมื่อ:
- [ ] มี canonical vocabulary ชุดเดียวใน docs
- [ ] มี layer model แยก reference/master/transaction/audit
- [ ] ทุก flow มี prerequisite ชัดเจน
- [ ] ทุกหน้าได้ role เดียวเป็นหลัก
- [ ] search เป็น primary entry ของ daily work
- [ ] audit/history เป็น first-class output
- [ ] item/stock/container/borrow-return ใช้ lifecycle เดียวกัน
- [ ] legacy terms มี mapping และไม่เป็น primary vocabulary

## 13. References

- ISO 55000:2024, Asset management overview and principles: https://www.iso.org/standard/83053.html
- ISO 55001:2024, Asset management system requirements: https://www.iso.org/standard/83054.html
- GS1 ID keys overview: https://www.gs1.org/standards/id-keys
- GS1 unique identification principles: https://ref.gs1.org/architecture/findings/unique-gs1-identification/

