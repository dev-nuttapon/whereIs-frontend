# Theme — WhereIs Frontend

Design tokens, สี, typography, spacing และการ theme ของ shadcn/ui
แหล่งความจริงเดียวของ visual style — component ทุกตัวอ้างอิงที่นี่ (ดู [component-rules.md](component-rules.md))

## 1. หลักการ
- ใช้ **Tailwind CSS** + **CSS variables** เป็น design token
- shadcn/ui อ่านสีจาก CSS variables (รูปแบบ HSL) → เปลี่ยน brand/ธีมที่เดียว มีผลทั้งระบบ
- **ห้าม hardcode** สี/ขนาดเป็น hex/px ในแต่ละ component — ใช้ token/utility เท่านั้น
- รองรับ **light + dark mode** (toggle ผ่าน `uiStore.theme` → ใส่ class `dark` ที่ `<html>`)

## 2. Color tokens (semantic)
> ค่าจริง (HSL) กำหนดใน `src/styles/globals.css`; ค่าด้านล่างเป็น role ไม่ใช่สีตายตัว

| Token (CSS var / Tailwind) | ใช้กับ |
|----------------------------|--------|
| `--background` / `bg-background` | พื้นหลังหลัก |
| `--foreground` / `text-foreground` | ตัวอักษรหลัก |
| `--primary` / `bg-primary` | ปุ่มหลัก, link, active |
| `--primary-foreground` | ตัวอักษรบน primary |
| `--secondary` / `--muted` | พื้นหลังรอง, ตัวอักษรจาง |
| `--border` / `border-border` | เส้นขอบ |
| `--card` / `bg-card` | พื้นหลัง card |
| `--destructive` | delete / dispose / error |
| `--ring` | focus ring |

> เพิ่ม brand color ผ่าน `--primary` ค่าเดียว ไม่กระจายสีแบรนด์ในหลายที่

## 3. Status colors (Item)
สีของ `StatusBadge` ต้องคงที่ทั้งระบบ:

| Status | สี (role) | Tailwind ตัวอย่าง |
|--------|-----------|-------------------|
| `stored` | success / เขียว | `bg-green-100 text-green-800` |
| `taken_out` / `borrowed` | warning / เหลือง-ส้ม | `bg-amber-100 text-amber-800` |
| `missing` | danger / แดง | `bg-red-100 text-red-800` |
| `disposed` | neutral / เทา | `bg-gray-100 text-gray-600` |
| `reserved` | info / ฟ้า | `bg-blue-100 text-blue-800` |
| `repair` | secondary / ม่วง | `bg-purple-100 text-purple-800` |

> map นี้นิยามครั้งเดียวใน `StatusBadge` (เช่นผ่าน `cva`) ห้ามเขียนสี status ซ้ำที่อื่น

## 4. Typography
| ระดับ | ขนาด (Tailwind) | ใช้กับ |
|-------|------------------|--------|
| Heading 1 | `text-2xl font-semibold` | ชื่อหน้า |
| Heading 2 | `text-xl font-semibold` | section |
| Body | `text-sm`/`text-base` | เนื้อหา |
| Caption | `text-xs text-muted-foreground` | meta, timestamp |

- Font family: **Inter** (Latin) + **Noto Sans Thai** (ภาษาไทย) — กำหนดใน `tailwind.config.fontFamily.sans: ['Inter', 'Noto Sans Thai', 'sans-serif']` พร้อม preload จาก Google Fonts

## 5. Spacing & radius
- ใช้ scale ของ Tailwind (`p-2`, `gap-4`, …) ตั้งบนหน่วย 4px
- มุมโค้งผ่าน `--radius` (เช่น `0.5rem`) → ใช้ `rounded-md`/`rounded-lg`
- ระยะห่าง section มาตรฐาน: `space-y-6` ภายในหน้า, `gap-4` ใน grid ของ card

## 6. Breakpoints (responsive)
| ชื่อ | ค่า | ใช้ |
|------|-----|-----|
| `sm` | 640px | mobile→tablet |
| `md` | 768px | tablet |
| `lg` | 1024px | desktop (sidebar pin) |
| `xl` | 1280px | จอกว้าง |

แนวทาง responsive ของ shell ดู [layout.md](layout.md#4-responsive-behavior)

## 7. Dark mode
- กลยุทธ์ Tailwind `darkMode: 'class'`
- toggle เก็บใน `uiStore.theme` (`'light' | 'dark'`) + persist (ดู [state-management.md](../state/state-management.md))
- ทุก token มีคู่ค่า light/dark ใน `globals.css`

## 8. shadcn/ui theming
- ตั้งค่า theme ตอน init shadcn (`components.json`) ให้ตรงกับ tokens ข้างบน
- ปรับ variant ของ Button/Badge ฯลฯ ผ่าน `cva` ใน `src/components/ui/`
- เพิ่ม component ใหม่ด้วย shadcn CLI แล้วปรับ style ให้ตรง token

## 9. Definition of Done (theme)
- [ ] `globals.css` มี token ครบทั้ง light + dark
- [ ] `tailwind.config` map token + breakpoints + font
- [ ] `StatusBadge` ใช้ status color map เดียว
- [ ] dark mode toggle ทำงาน + persist
- [ ] ไม่มีสี hardcode นอก token ใน component
