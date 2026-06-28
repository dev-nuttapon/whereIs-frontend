# Coding Style — WhereIs Frontend

มาตรฐานการเขียนโค้ดเพื่อให้โค้ดอ่านง่ายและสอดคล้องกันทั้งทีม

## TypeScript
- เปิด `strict: true` — หลีกเลี่ยง `any` (ใช้ `unknown` + narrow แทนถ้าจำเป็น)
- ใช้ `interface` สำหรับ object shape, `type` สำหรับ union/utility
- export type ที่ใช้ร่วมไว้ใน `types.ts` ของ feature หรือ `src/types/`
- ห้าม `// @ts-ignore` โดยไม่มีคำอธิบาย

## การตั้งชื่อ
| สิ่งของ | รูปแบบ | ตัวอย่าง |
|---------|--------|----------|
| Component | PascalCase | `ItemCard` |
| ไฟล์ component | PascalCase.tsx | `ItemCard.tsx` |
| Hook | camelCase ขึ้นต้น `use` | `useItems` |
| ตัวแปร/ฟังก์ชัน | camelCase | `fetchItems` |
| ค่าคงที่ | UPPER_SNAKE_CASE | `MAX_RETRY` |
| Type/Interface | PascalCase | `ItemProps` |
| Boolean | ขึ้นต้น is/has/should | `isLoading`, `hasAccess` |
| Event handler | `handleXxx` / prop `onXxx` | `handleSubmit` |

## โครงสร้างไฟล์ component
ลำดับภายในไฟล์: imports → types → component → helper (ถ้าเล็ก) → export

## Imports
- ลำดับ: external libs → absolute (alias `@/`) → relative
- ตั้ง path alias `@/` ชี้ `src/` ใน `tsconfig` + `vite.config`
- ไม่ใช้ default export สำหรับ component (ใช้ named export เพื่อ refactor ง่าย) — ยกเว้นที่ tool บังคับ

## Format & Lint
- ใช้ **ESLint + Prettier** (config ในโปรเจกต์)
- ตั้ง format-on-save
- รัน `lint` และ `type-check` ก่อน commit
- indent 2 spaces, single quote, มี trailing comma, มี semicolon

## React
- function component + hooks เท่านั้น
- ใส่ dependency array ของ `useEffect`/`useMemo`/`useCallback` ให้ถูกต้อง
- หลีกเลี่ยง effect ที่ทำได้ด้วย derived value
- key ใน list ใช้ id ที่ stable ไม่ใช้ index

## Async / Error
- ใช้ `async/await` ไม่ใช้ `.then()` ซ้อน
- ไม่จัดการ error ด้วยการ swallow เงียบๆ — log หรือแสดงผลให้ผู้ใช้
- network error จัดการผ่าน Query/axios layer (ดู [api-contract.md](../api/api-contract.md))

## Comment
- คอมเมนต์อธิบาย **why** ไม่ใช่ **what**
- เขียนคอมเมนต์เท่าที่จำเป็น โค้ดควรสื่อความเองได้
- TODO ต้องระบุเจ้าของ/บริบท

## Git (แนวทาง)
- branch: `feature/xxx`, `fix/xxx`
- commit message สั้น ชัด เป็น present tense
- 1 PR = 1 เรื่อง

## เอกสารที่เกี่ยวข้อง
- [component-rules.md](../ui/component-rules.md) — กติกา component
- [folder-structure.md](folder-structure.md) — การวางไฟล์
- [state-management.md](../state/state-management.md) — การจัดการ state
