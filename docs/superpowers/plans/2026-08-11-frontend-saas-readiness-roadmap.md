# Frontend SaaS Readiness Roadmap

## เป้าหมาย

ปรับ WhereIs frontend จากระบบที่ใช้งานฟีเจอร์หลักได้ ให้เป็นเว็บ SaaS ที่ผู้ใช้ใหม่เริ่มใช้งานได้ง่าย ใช้งานประจำวันได้จริง และมีมาตรฐานพร้อมเชื่อมกับ backend production

แผนนี้แบ่งเป็น **5 รอบ** โดยแต่ละรอบต้องผ่านเกณฑ์จบก่อนเริ่มรอบถัดไป

## หลักการของแผน

- เริ่มจากงานที่ผู้ใช้ต้องการทำ ไม่เริ่มจากโครงสร้างข้อมูลของระบบ
- หน้าหลักต้องพาผู้ใช้ไปสู่ 3 งาน: เพิ่มของเข้าคลัง, ค้นหาของ, เบิก/ยืม/คืน
- Frontend เป็นชั้นการใช้งานและการตรวจสอบเบื้องต้น ส่วน permission, tenant isolation และ validation สำคัญต้อง enforce ที่ backend
- ทุก workflow ที่บันทึกข้อมูลจริงต้องใช้ API client + React Query mutation ห้ามใช้ localStorage เป็น source of truth
- ทุก feature ต้องมี loading, empty, error และ success state
- ทุกการเปลี่ยน API ต้องตรวจ contract และเขียน prompt ให้ Claude แก้ backendก่อน หากจำเป็น

## สถานะก่อนเริ่มแผน

ทำเสร็จแล้วบางส่วน:

- ปรับ layout และ navigation ให้แยก auth/workspace กับ application shell
- เพิ่ม flow “เพิ่มของเข้าคลัง” แบบหลายรายการ
- เชื่อม receiving receipt API จริง
- เพิ่ม unit test สำหรับ receiving form 3 กรณี
- `npm run typecheck`, `npm run build` และ receiving backend tests ผ่าน

## รอบที่ 1 — Production UX Baseline

เป้าหมาย: ทุกหน้าตอบสนองผู้ใช้ได้ชัดเจน แม้โหลดช้า API ล้มเหลว หรือไม่มีข้อมูล

งานหลัก:

- ตรวจทุกหน้าให้มี Loading / Empty / Error / Success state
- แสดงข้อความ API error เป็นภาษาไทยและบอกวิธีแก้
- ป้องกันการกด submit ซ้ำและแสดงสถานะกำลังบันทึก
- เพิ่มหน้า 403 และกรณีไม่มีสิทธิ์เข้าถึง workspace
- ตรวจ session หมดอายุและ redirect ไป Login อย่างถูกต้อง
- ตรวจ responsive บน mobile และ tablet

เกณฑ์จบ: ผู้ใช้ไม่เห็นหน้าว่างหรือปุ่มค้างเมื่อ API ช้า/ผิดพลาด และทุกหน้าหลักใช้งานได้บนจอเล็ก

## รอบที่ 2 — First-time User Onboarding

เป้าหมาย: ผู้ใช้ใหม่รู้ว่าต้องเริ่มจากตรงไหน โดยไม่ต้องเข้าใจคำว่า Product, Stock, Asset หรือ Container ก่อน

งานหลัก:

- เพิ่ม onboarding หลังสร้าง workspace
- แนะนำให้สร้างสินค้าและจุดจัดเก็บตามลำดับ
- เพิ่มปุ่มสร้างสินค้าแบบเร็วจากหน้าเพิ่มของ
- เพิ่มปุ่มสร้างจุดจัดเก็บแบบเร็วจากหน้าเพิ่มของ
- ใช้คำอธิบายแบบงานจริง เช่น “ของใช้หมดไป” และ “ของใช้งานเป็นชิ้น”
- แสดงตัวอย่างข้อมูลในช่องกรอก
- แสดงสถานะ workspace ว่าพร้อมใช้งานแล้วหรือยัง

เกณฑ์จบ: ผู้ใช้ใหม่สามารถสร้าง workspace → สร้างสินค้า → สร้างจุดจัดเก็บ → เพิ่มของเข้าคลังได้โดยไม่ต้องเปิดเอกสารช่วยเหลือ

## รอบที่ 3 — Daily Operations

เป้าหมาย: ทำงานประจำวันจากจุดเดียวได้เร็ว

งานหลัก:

- ปรับ Dashboard เป็น “สิ่งที่ต้องทำวันนี้”
- เพิ่มรายการของใกล้หมดอายุ
- เพิ่มรายการ stock ต่ำกว่าจุดเตือน
- เพิ่มทางลัด เบิก / ยืม / คืน
- ทำรายการแจ้งเตือนให้กดไปทำงานต่อได้
- เพิ่มประวัติการรับของและรายละเอียด receipt
- เพิ่ม filter ค้นหาตามจุดจัดเก็บ ประเภท และสถานะ

เกณฑ์จบ: ผู้ใช้เปิด Dashboard แล้วรู้ทันทีว่าต้องทำอะไร และไปถึง action ที่ต้องการได้ภายใน 1–2 คลิก

## รอบที่ 4 — SaaS Security and Account UX

เป้าหมาย: หน้าจอสะท้อนสิทธิ์และขอบเขตข้อมูลอย่างถูกต้องสำหรับระบบหลาย workspace

งานหลัก:

- ซ่อน/แสดงเมนูและ action ตาม effective permission
- เพิ่มหน้า 403 และข้อความกรณีไม่มีสิทธิ์แบบเข้าใจง่าย
- แสดง workspace context ชัดเจนก่อนทำ action สำคัญ
- เพิ่ม confirmation สำหรับลบ ย้าย เบิก คืน และเปลี่ยนสิทธิ์
- ปรับ profile, workspace settings และ member management ให้ครบ
- เพิ่ม password reset / email verification UI หาก backend รองรับ
- ตรวจ keyboard navigation, focus state และ color contrast

เกณฑ์จบ: ผู้ใช้ไม่สามารถเข้าใจผิดว่ากำลังแก้ข้อมูล workspace ไหน และไม่มี action สำคัญที่แสดงเกินสิทธิ์

## รอบที่ 5 — Verification and Release Readiness

เป้าหมาย: มีหลักฐานว่าหน้าจอพร้อมเชื่อม production และไม่พังจากการเปลี่ยนแปลงในอนาคต

งานหลัก:

- เพิ่ม unit tests สำหรับ form, validation และ payload mapping
- เพิ่ม component tests สำหรับ dialog, error state และ permission state
- เพิ่ม E2E flow: Login → Workspace → สร้างสินค้า → จุดจัดเก็บ → เพิ่มของ → ค้นหา → ตรวจผล
- ทดสอบ session expired, API error, permission denied และ empty workspace
- ตรวจ environment variables, API base URL และ production build
- เพิ่ม error boundary และ telemetry hook หากระบบ monitoring พร้อม
- ทำ release checklist ก่อน deploy

เกณฑ์จบ: flow หลักผ่าน E2E และ build/test ทำงานได้ใน CI โดยไม่ต้องพึ่งข้อมูลจำลองใน browser

## งานที่ต้องรอ Backend หรือส่งให้ Claude

- ตรวจ tenant isolation ของ `locationId` และ `containerId`
- ตรวจ permission scope ระดับจุดจัดเก็บ
- ทำ scheduler/notification จริงสำหรับ expiry และ low stock
- เพิ่ม billing, plan และ quota หากเปิดเป็น SaaS แบบคิดค่าบริการ
- เพิ่ม API สำหรับ password reset/email verification หากยังไม่มี

เมื่อพบว่างานใดต้องแก้ backend ให้สร้าง prompt ที่ระบุ endpoint, validation, permission, transaction และ tests ก่อนแก้ frontend

## ลำดับการทำงานต่อ

1. รอบที่ 1: Production UX Baseline
2. รอบที่ 2: First-time User Onboarding
3. รอบที่ 3: Daily Operations
4. รอบที่ 4: SaaS Security and Account UX
5. รอบที่ 5: Verification and Release Readiness

หลังจบแต่ละรอบต้องรายงานไฟล์ที่แก้, test ที่รัน, ข้อจำกัดที่เหลือ และสิ่งที่ต้องรอ backend
