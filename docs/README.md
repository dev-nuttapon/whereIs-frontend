# WhereIs Frontend — Documentation

เอกสาร frontend ของ **WhereIs** (Workspace-based item, storage, workflow, report, and notification system)
Stack: React · Vite · TypeScript · React Router · TanStack Query · React Hook Form · Zustand · Axios · Tailwind CSS · shadcn/ui

> 📖 **เริ่มที่นี่:** อ่านตามลำดับใน [reading-order.md](ai/reading-order.md)
> เอกสารชุดนี้ครอบคลุม **frontend** + **contract ที่ frontend สมมติจาก backend** (backend เป็นอีก service)

## Architecture
| เอกสาร | เนื้อหา |
|--------|---------|
| [project-overview.md](architecture/project-overview.md) | WhereIs คืออะไร, ขอบเขต repo, core features |
| [domain-model.md](architecture/domain-model.md) | **คำศัพท์มาตรฐาน** + entities + relationships + lifecycle + field types |
| [tech-stack.md](architecture/tech-stack.md) | เทคโนโลยี + เหตุผล |
| [folder-structure.md](architecture/folder-structure.md) | โครงสร้างโฟลเดอร์ + naming |
| [coding-style.md](architecture/coding-style.md) | มาตรฐานการเขียนโค้ด |
| [development-rules.md](architecture/development-rules.md) | ความรับผิดชอบของแต่ละ layer + กฎ ownership |

## UI
| เอกสาร | เนื้อหา |
|--------|---------|
| [ui-overview.md](ui/ui-overview.md) | design principles + UI states |
| [layout.md](ui/layout.md) | layout shell (Auth/App) + responsive |
| [theme.md](ui/theme.md) | design tokens, สี, typography, Tailwind/shadcn |
| [screen-flow.md](ui/screen-flow.md) | route map + navigation flow |
| [component-rules.md](ui/component-rules.md) | กติกา component + form + styling |
| [navigation.md](ui/navigation.md) | Sidebar, Topbar, Breadcrumb, menu hierarchy |
| [ui-patterns.md](ui/ui-patterns.md) | Loading, Empty, Error, Card, Dialog, Filter, Pagination และอื่นๆ |

## API
| เอกสาร | เนื้อหา |
|--------|---------|
| [api-contract.md](api/api-contract.md) | endpoint + request/response + error + DTO |

## Security
| เอกสาร | เนื้อหา |
|--------|---------|
| [permission-ui.md](security/permission-ui.md) | roles, primary role + extra permissions + container access scope, permission keys, role matrix |

## State
| เอกสาร | เนื้อหา |
|--------|---------|
| [state-management.md](state/state-management.md) | server vs client state + stores + cache rules |

## Modules (feature specs)
ดู [modules/](modules/) — แต่ละไฟล์ละเอียดพอให้ implement ได้:
[auth](modules/auth.md) · [workspace](modules/workspace.md) · [dashboard](modules/dashboard.md) · [container](modules/container.md) · [item](modules/item.md) · [member](modules/member.md) · [permission](modules/permission.md) · [search](modules/search.md) · [activity](modules/activity.md) · [reports](modules/reports.md) · [notifications](modules/notifications.md) · [settings](modules/settings.md)

## Architecture Decisions
ดู [decisions/](decisions/) — เหตุผลเบื้องหลังการตัดสินใจสถาปัตยกรรม:
[layout-design.md](decisions/layout-design.md) · [search-ui.md](decisions/search-ui.md) · [permission-ui.md](decisions/permission-ui.md) · [tech-stack.md](decisions/tech-stack.md)

## AI
| เอกสาร | เนื้อหา |
|--------|---------|
| [reading-order.md](ai/reading-order.md) | ลำดับการอ่านก่อนเริ่มงาน |
| [ai-prompt.md](ai/ai-prompt.md) | context block + prompt templates + ข้อห้าม |

## หมายเหตุ
- ส่วนที่เป็น `TBD` (เวอร์ชัน package) ให้เติมเมื่อ lock dependency จาก `package.json` แล้ว
- ห้ามแก้ architecture / folder / API contract โดยไม่อัปเดตเอกสารและขออนุมัติก่อน
