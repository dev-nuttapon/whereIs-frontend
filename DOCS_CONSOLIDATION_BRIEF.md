# Docs Consolidation Brief — whereIs-frontend

> Handoff brief for consolidating this repo's markdown docs. Written by Claude Code after auditing all ~64 `.md` files in this repo and cross-checking against `src/api/`, `src/features/`, and the paired backend repo (`whereIs-backend`). Self-contained — no other conversation context needed. Delete this file once the consolidation below is done and merged into the repo's normal docs.

---

## 1. Confirmed product direction (do not re-litigate this)

The team confirmed: this is a **frontend-first POC**. `whereIs-frontend` is being built out to full function coverage first; `whereIs-backend` is adjusted to match afterward and is not chasing frontend parity yet.

**Practical consequence:** the domain model **actually implemented in this frontend's code** is the target direction, full stop:

```
Workspace
├── Category → Product (TrackingType: Asset | Stock)
│   ├── Asset (individual, serial-tracked)
│   └── StockEntry (quantity pool)
├── Site → Location (nested tree) → Container (nestable)
└── BorrowOrder → BorrowOrderLine → BorrowEvent
```

Evidence this is already the real implementation: `src/api/product.api.ts`, `asset.api.ts`, `category.api.ts`, `site.api.ts`, `location.api.ts`, `stock.api.ts`, `borrow-order.api.ts` and matching `src/features/{products,assets,categories,sites,locations,stock,borrow-orders}` all exist and are wired up. `.superpowers/sdd/task-1-brief.md` line 13 already states this explicitly: *"`Products` is the main inventory setup entry and `Items` is legacy redirect-only."*

**`Item` / `item.api.ts` / `features/items` are legacy, not canonical.** Do not "fix" docs by making Item the source of truth — it's the other way around. Where a doc currently describes a generic `Item` entity as canonical (see §3 below), that doc is the one that's wrong.

**Site and Location are real, confirmed concepts — not to be removed.** They were reintroduced for master data (`docs/superpowers/specs/2026-07-14-initial-reference-data-design.md`) after an earlier phase-1 doc said to avoid them. Any doc asserting "never reintroduce site/location" is describing an outdated rule that was already reversed in practice.

**Cross-repo note:** the backend currently *also* has a full standalone `Item`/`ItemEvent` implementation (added in a migration named `CanonicalItemApi`, later than the Product/Asset/Stock/BorrowOrder redesign) — coexisting with Product/Asset/Stock/BorrowOrder in its schema. Per the frontend-first direction above, that backend `Item` path is **not** what this frontend should build toward, even though it exists and works. The backend's own `SYSTEM_STATE.md` (just added) documents this and points backend work at catching up to the frontend's model instead. You don't need to touch the backend repo — just don't let frontend docs get confused into treating the backend's `/items` endpoints as the integration target.

---

## 2. What "consolidate" means here (pattern to follow)

Same pattern just applied to the backend repo, mirror it here:

1. Create **one new file**, `SYSTEM_STATE.md` at repo root, as the single source of truth for "what's actually implemented right now" — verified against `src/api/`, `src/features/`, and `.superpowers/sdd/task-*-report.md` (the most accurate status source found in the audit), not against the older `docs/architecture/*` or `docs/modules/*` files.
2. Every other doc that currently restates entity lists, route tables, or sprint/feature status should be trimmed to a short pointer to `SYSTEM_STATE.md` instead of duplicating the content. Keep each doc's *unique* value (rationale, UI patterns, ADR reasoning) — only remove the parts that duplicate or contradict current status/entities.
3. Update `CURRENT_TASK.md` and `docs/ai/reading-order.md` (or equivalents) to read `SYSTEM_STATE.md` early, same as the backend repo now does.

---

## 3. Specific issues found (from the full-repo audit — verify still current before fixing, code may have moved on)

### Files describing a fictional generic `Item` model as canonical (need rewriting to Product/Asset/Category/Site/Location/Stock/BorrowOrder)
- `docs/architecture/domain-model.md` — declared canonical vocabulary source but has zero overlap with real entities.
- `docs/api/api-contract.md` lines ~87–108 — `/workspaces/:wsId/items` + action routes (`/borrow`, `/return`, `/withdraw`, etc.) that don't exist on the backend's Product/Asset/Stock/BorrowOrder controllers.
- `docs/architecture/frontend-backend-integration.md` — cites `ItemsController.cs`, `Item.cs`, `ItemEvent.cs` as *the* backend files; incomplete without mentioning Products/Assets/Stock/BorrowOrders controllers.
- `docs/modules/item.md`, `docs/modules/search.md`, `docs/modules/activity.md`, `docs/modules/dashboard.md`, `docs/modules/container.md` — all keyed off `Item`/`ItemEvent`/`item.api.ts`.
- `docs/ai/ai-prompt.md` line ~10 — canonical AI context block itself is Item-only.
- `PROJECT_CONTEXT.md` §API Rules, `docs/architecture/folder-structure.md` §api/ — missing `product/asset/category/site/location/stock/borrow-order` API files that actually exist.
- `docs/state/state-management.md` — `queryKeys` example missing the real query key groups.
- **Correct reference already in the repo:** `docs/superpowers/plans/2026-07-13-items-location-subcontainers.md` line 7 — already says to treat "items" as the backend `assets` domain. Use this file's framing as the model for the rewrite.

### Site/Location self-contradiction
- `docs/architecture/requirement-summary.md` line 44 ("lookup tables for site, location...") directly contradicts its own line 118 ("Never reintroduce site or location as core concepts"). Per §1 above, resolve this by **removing the "never reintroduce" rule** — site/location are confirmed real.
- `docs/superpowers/specs/2026-07-06-phase-1-redesign-spec.md` is explicitly marked historical (line 3) — leave it as a historical record, but make sure nothing else treats it as current.

### Stale status
- `CURRENT_TASK.md` claims Sprint 0 / everything "Not Started" — contradicted by `README.md`, `docs/superpowers/plans/2026-07-14-inventory-flow-handoff.md`, and `.superpowers/sdd/task-1..4-report.md`, which describe substantial completed work (auth, master data, settings, stock, borrow orders, member invitations). This is the highest-priority fix — it's the first file anyone reads.
- The `docs/superpowers/plans/2026-07-14-system-flow-standard.md` migration plan (Task 8) already planned to rewrite `README.md`, `docs/README.md`, `docs/architecture/project-overview.md`, `docs/ai/reading-order.md` — check whether any of that landed; if not, this consolidation supersedes it.

### Near-duplicate content (fold into one, reference from the other)
- `docs/architecture/tech-stack.md` vs `docs/decisions/tech-stack.md` — keep decisions/ as the ADR (why), have architecture/ link to it instead of repeating.
- `docs/security/permission-ui.md` vs `docs/decisions/permission-ui.md` — same pattern.
- Status-badge color table duplicated **three times** verbatim: `docs/ui/theme.md`, `docs/ui/ui-patterns.md`, `docs/ui/ui-overview.md`. `theme.md` itself says "defined once, never duplicate elsewhere" — ironic. Keep it only in `theme.md`.
- `docs/decisions/search-ui.md` vs `docs/modules/search.md` vs `docs/ui/ui-patterns.md` §4 — same restated-ADR pattern.
- `docs/decisions/layout-design.md` vs `docs/ui/layout.md` — same pattern.
- `docs/ai/reading-order.md` vs `docs/ai/ai-prompt.md` — overlapping "what to read for X" tables.
- 8 per-folder `README.md` index files duplicate the top-level `docs/README.md` map — low priority, just flag if slimming further.

### Minor
- `docs/ui/navigation.md` / `docs/ui/screen-flow.md` reference a `/w/:wsId/structure` route with no corresponding module spec or endpoint anywhere.

---

## 4. Suggested order of work

1. Write `SYSTEM_STATE.md` (verify against `src/api/`, `src/features/`, `.superpowers/sdd/task-4-report.md` for the latest real status).
2. Fix `CURRENT_TASK.md` (highest-traffic file, most wrong).
3. Rewrite `docs/architecture/domain-model.md` and `docs/api/api-contract.md` to the real model — this cascades correctness into most of the files listed in §3.
4. Fix the site/location self-contradiction in `requirement-summary.md`.
5. Point `docs/architecture/frontend-backend-integration.md`, `PROJECT_CONTEXT.md`, `docs/ai/ai-prompt.md`, `docs/ai/reading-order.md`, `docs/README.md` at `SYSTEM_STATE.md`.
6. De-duplicate the ADR-vs-reference pairs and the triplicated status-badge table, if time allows — lower priority than 1–5.

Do not touch the paired backend repo (`whereIs-backend`) — its docs were already consolidated separately (see its `SYSTEM_STATE.md`).
