# Architecture — WhereIs Frontend

เอกสารสถาปัตยกรรมพื้นฐาน: domain model, tech stack, โครงสร้างโฟลเดอร์ และมาตรฐานการเขียนโค้ด

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| [project-overview.md](project-overview.md) | WhereIs คืออะไร, ขอบเขต repo, core features, high-level architecture |
| [domain-model.md](domain-model.md) | **คำศัพท์มาตรฐาน** + entity definitions + relationships + Item lifecycle + TypeScript field types |
| [tech-stack.md](tech-stack.md) | เทคโนโลยีทั้งหมดที่ใช้ + เหตุผล + version |
| [folder-structure.md](folder-structure.md) | โครงสร้างโฟลเดอร์ `src/` ทั้งหมด + naming convention |
| [coding-style.md](coding-style.md) | มาตรฐานการเขียน TypeScript/React + กฎที่ห้ามทำ |
| [development-rules.md](development-rules.md) | ความรับผิดชอบของแต่ละ layer + ownership rules + state responsibilities |

---

## ลำดับการอ่าน

1. `project-overview.md` — เข้าใจว่าแอปทำอะไร
2. `domain-model.md` — จำคำศัพท์ให้แม่น (Workspace, Site, Location, Container, Item, ItemEvent)
3. `tech-stack.md` — รู้จักเครื่องมือที่ใช้
4. `folder-structure.md` — รู้ว่าโค้ดแต่ละชนิดอยู่ที่ไหน
5. `coding-style.md` — รู้มาตรฐานก่อนเขียนโค้ด
6. `development-rules.md` — รู้ว่าโค้ดใหม่ควรอยู่ที่ไหน

> อ่าน `domain-model.md` ก่อนเสมอ — คำศัพท์ในเอกสารทุกไฟล์อ้างอิงจากที่นี่

---

## Maintenance Guidelines

- **domain-model.md** คือ source of truth ของ entity types — ถ้า backend เปลี่ยน schema ให้อัปเดตที่นี่ก่อน แล้วค่อยแก้โค้ด
- **folder-structure.md** ต้องตรงกับโครงสร้างจริงเสมอ — เพิ่ม/ลบไฟล์ใหม่ให้อัปเดตพร้อมกัน
- ห้ามแก้ไขสถาปัตยกรรม (folder structure, tech stack หลัก) โดยไม่มี ADR ใน [decisions/](../decisions/)
- `development-rules.md` เป็น living document — เมื่อทีมตกลง convention ใหม่ให้อัปเดตที่นี่
