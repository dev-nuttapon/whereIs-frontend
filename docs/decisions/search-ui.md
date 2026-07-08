# ADR: Search UI Design

**สถานะ:** Accepted
**วันที่:** 2026-06-28
**เกี่ยวข้อง:** [modules/search.md](../modules/search.md) · [ui/navigation.md](../ui/navigation.md)

---

## Problem

**Core question ของ WhereIs คือ "ของชิ้นนี้อยู่ที่ไหน?"** — Search จึงเป็น primary feature ไม่ใช่ secondary

โจทย์:
1. Search ควรอยู่ที่ไหน? เข้าถึงได้แค่ไหน?
2. Filter state ควรเก็บที่ไหน? (Zustand? URL? local state?)
3. ผลลัพธ์ควรแสดงอย่างไรเพื่อตอบคำถามได้เร็ว?

---

## Decision

1. **Global SearchBar ใน Topbar เสมอ** — เข้าถึงได้จากทุกหน้าในแอป
2. **Search Page แยก** (`/w/:wsId/search`) — สำหรับ full search experience + filter
3. **URL query params เป็น source of truth** สำหรับ filter ทั้งหมด (`?q=&status=&containerId=&page=`)
4. **Search ต้องถูกกรองด้วย permission + container access scope** ก่อน render
5. **ItemCard ต้องแสดง**: รูป + ชื่อ + StatusBadge + ตำแหน่งใน container + ผู้ถือ — เพื่อตอบคำถามหลักโดยไม่ต้องเปิด detail

---

## Alternatives Considered

### A. Search ใน Sidebar เท่านั้น
เพิ่ม search input ที่ sidebar

**ปัญหา:** sidebar collapse บน mobile/tablet → search หายไป; sidebar ไม่เหมาะกับ primary action

### B. Dedicated Search button (ไม่มี input ใน Topbar)
ปุ่มกระดิ่ง/แว่นขยาย → เปิด modal

**ปัญหา:** เพิ่ม click จาก 1 เป็น 2; modal search ไม่ shareable URL ได้; keyword type แล้วกด Enter ไม่ smooth

### C. Filter state ใน Zustand
เก็บ filter ใน `searchStore`

**ปัญหา:**
- ไม่ shareable (ส่งลิงก์ไม่ได้)
- browser back/forward ไม่ sync
- refresh หน้า → filter หาย
- synchronize URL กับ store เพิ่ม complexity โดยไม่จำเป็น

### D. Filter state ใน local useState
เก็บ filter ใน component state

**ปัญหา:** เหมือน C แต่ยิ่งแย่กว่า เพราะ navigate ออกจากหน้า → reset filter

---

## Reason

- **Topbar SearchBar**: Search เป็น primary feature, ต้อง 1-click away จากทุกหน้า
- **URL params**: Filter state ที่ใช้ URL params = shareable, bookmarkable, ทำงานกับ browser history ได้ฟรี, refresh แล้วกลับมาหน้าเดิมได้
- **Access filtering**: ถ้าผู้ใช้ไม่มี container access scope ผลลัพธ์ต้องหายไปจาก search ไม่ใช่แค่ disable
- **ItemCard ครบถ้วน**: ผู้ใช้ควรตอบคำถาม "ของอยู่ไหน" ได้จาก card โดยไม่ต้องเปิด detail — ลด click

---

## Consequences

**บวก:**
- Search always 1-click away → core UX goal สำเร็จ
- URL shareable → ทีมส่ง filter link ให้กันได้
- Browser history ทำงานถูกต้อง
- Search state persist ผ่าน refresh
- Search results ไม่ leak ข้อมูลนอก scope

**ลบ:**
- URL query string ยาวขึ้นเมื่อมีหลาย filter
- ต้อง sync URL params กับ UI เสมอ (ใช้ `useSearchParams` hook)
- Global SearchBar ต้องอยู่ใน Topbar → Topbar มี responsibility มากขึ้น
