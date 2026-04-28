# RefurbIQ — Project Status

> **Update rule:** edit this file every time a phase ticks over, a module
> graduates from stub → real, or a non-negotiable control changes state.  
> Last updated: **2026-04-28**

---

## Build-Phase Overview

| Phase | Name | Timeline | Status |
|-------|------|----------|--------|
| **Phase 1** | Core Foundation | Months 1–3 | ✅ **Complete** |
| **Phase 2** | Risk & Recovery | Months 4–5 | ✅ **Complete** |
| **Phase 3** | Operations Expansion | Months 6–7 | ✅ **Complete** |
| **Phase 4** | Intelligence & SaaS | Months 8–9 | ✅ **Complete** |
| **Phase 5** | Data Persistence (D1) | TBD | 📋 Planned |
| **Phase 6** | Production Hardening | TBD | 📋 Planned |

---

## Phase 1 — Core Foundation ✅

*Commit: `66aa508` → `921d9e7`*

| Module | UI Page | API Routes | Status | Notes |
|--------|---------|------------|--------|-------|
| Dashboard | `renderDashboard` (v2.2) | `/api/dashboard`, `/api/dashboard/v2` | ✅ | KPI stats, OPR timer, charts, alerts |
| Inventory & Goods-In | `renderInventory` | `/api/devices`, `/api/devices/:id`, `/api/devices/:id/overrides`, `/api/purchase-batches`, `/api/purchase-batches/:id/imei-import` | ✅ | Device registry, IMEI search, status filter, batch CSV import |
| Quality Control | `renderQC` | `/api/qc`, `/api/qc/pending` | ✅ | Intake QC form, lock-check enforcement, locked-device panel |
| OPR Engine | `renderOPR` | `/api/opr-batches`, `/api/opr-batches/:id`, `/api/opr/calculate` | ✅ | 180-day countdown, uplift calculator, document vault, batch mgmt |
| Orders | `renderOrders` | `/api/orders`, `/api/orders/:id` | ✅ | Marketplace order mgmt, VAT display, DRC rules info |
| VAT Engine | `renderVAT` | `/api/vat-codes`, `/api/vat/evaluate`, `/api/vat/calculate`, `/api/vat-records`, `/api/vat-records/period/:periodId`, `/api/vat-periods`, `/api/vat-periods/:id` | ✅ | Full HMRC 9-box return, VAT calculator, DRC evaluator, records table |
| Fintech Advances | `renderFintech` | `/api/fintech`, `/api/fintech/calculate` | ✅ | Advance calculator, reconciliation, VAT tax-point enforcement |
| Suppliers & Batches | `renderSuppliers` | `/api/suppliers`, `/api/suppliers/:id`, `/api/purchase-batches` | ✅ | Purchase batch mgmt, supplier registry, dynamic dropdowns |
| Support & Tickets | `renderSupport` | `/api/tickets`, `/api/tickets/:id` | ✅ | Ticket mgmt, AI draft display, RMA linking |
| Admin & Settings | `renderAdmin` | *(in-page only)* | ✅ | Company config, data retention policy, system controls, roadmap |

---

## Phase 2 — Risk & Recovery ✅

*Commits: `69c9022`, `330d3cd`*

| Module | UI Page | API Routes | Status | Notes |
|--------|---------|------------|--------|-------|
| Courier & INR Investigations | `renderCourier` | `/api/investigations`, `/api/investigations/:id`, `/api/investigations/stats/summary` | ✅ | INR workflow, courier events, escalation tracking |
| Returns & RMA | `renderRMA` | `/api/rma`, `/api/rma/:id`, `/api/rma/stats/summary` | ✅ | Return QC, IMEI matching, refund/replacement tracking |
| Profitability & Unit P&L | `renderProfitability` | `/api/pnl/summary`, `/api/pnl/units`, `/api/pnl/units/:device_id` | ✅ | Per-unit P&L, make-level chart, margin analysis |
| Repairs & Refurbishment | `renderRepairs` | `/api/repairs`, `/api/repairs/:id`, `/api/repairs/stats/summary` | ✅ | Repair job cards, outcome tracking, cost capture |
| Dashboard v2.2 | `renderDashboard` | *(enhanced)* | ✅ | Added repair stats, INR summary to existing dashboard |

---

## Phase 3 — Operations Expansion ✅

*Commit: `51b5022`*

| Module | UI Page | API Routes | Status | Notes |
|--------|---------|------------|--------|-------|
| Supplier Analytics | `renderSupplierAnalytics` | `/api/supplier-analytics`, `/api/supplier-analytics/:id` | ✅ | Per-supplier quality scoring, batch performance chart |
| HMRC MTD VAT Returns | `renderMTD` | `/api/mtd-returns`, `/api/mtd-returns/:id`, `/api/mtd-returns/:id/validate`, `/api/mtd-returns/:id/submit` | ✅ | Period selection, 9-box preview, stub HMRC submission |
| Audit Log | `renderAuditLog` | `/api/audit-log`, `/api/audit-log/:id`, `/api/audit-log/stats/summary` | ✅ | Filterable audit trail, override records, user attribution |

---

## Phase 4 — Intelligence & SaaS ✅

*Commits: `c464178`, `ca4b895`, `c520f18`*

| Module | UI Page | API Routes | Status | Notes |
|--------|---------|------------|--------|-------|
| IMEI / Barcode Scanner | `renderScanner` | `/api/scanner/lookup`, `/api/scanner/intake` | ✅ | Scan-to-intake workflow, manual fallback, QC pre-fill |
| Marketplace Hub | `renderMarketplace` | `/api/marketplace`, `/api/marketplace/:id`, `/api/marketplace/:id/sync`, `/api/marketplace/:id/reconnect`, `/api/marketplace/integrations`, `/api/marketplace/stats/summary` | ✅ | Multi-marketplace status, sync controls, reconnect flow |
| Tenant Management | `renderTenants` | `/api/tenants`, `/api/tenants/:id`, `/api/tenants/:id/status`, `/api/tenants/:id/usage`, `/api/tenants/summary` | ✅ | SaaS tenant list, suspend/reactivate, usage overview |
| Device Variants Catalogue | `renderDeviceVariantsInto` | `/api/device-variants`, `/api/device-variants/makes`, `/api/device-variants/models`, `/api/device-variants/import` | ✅ | SKU catalogue, CSV import, grade/colour management |
| Bulk Override | `openBulkOverrideModal` | `/api/devices/batch-override` | ✅ | Multi-device attribute override with audit trail |
| Device Override Panel | `renderOverridePanel` | `/api/devices/:id/override` | ✅ | Per-device attribute override with mandatory reason |
| Notifications | *(topbar)* | `/api/notifications`, `/api/notifications/:id/read`, `/api/notifications/mark-all-read`, `/api/notifications/summary` | ✅ | In-app notification feed, read/unread state |

---

## Phase 5 — Data Persistence *(Planned)*

> All data is currently **in-memory** — resets on worker restart.  
> Target: migrate to **Cloudflare D1** (SQLite).

| Task | Status |
|------|--------|
| Design D1 schema (migration files) | 📋 Planned |
| `wrangler d1 create refurbiq-production` | 📋 Planned |
| Port `src/routes/api.ts` in-memory arrays → D1 queries | 📋 Planned |
| Add `company_id` tenant-scoping to all D1 queries | 📋 Planned |
| Seed script for demo/dev data | 📋 Planned |
| Local `--local` D1 dev workflow | 📋 Planned |
| Production migration + deploy | 📋 Planned |

---

## Phase 6 — Production Hardening *(Planned)*

| Task | Status |
|------|--------|
| Replace HMRC MTD stub with live Making Tax Digital API | 📋 Planned |
| Replace marketplace sync stubs with real OAuth + webhook flows | 📋 Planned |
| Real AI communication drafts (OpenAI via server-side proxy) | 📋 Planned |
| CSV settlement upload + reconciliation engine (Fintech Phase 2) | 📋 Planned |
| Rate limiting + auth middleware (JWT / Clerk) | 📋 Planned |
| Cloudflare Pages deploy to production (`refurbiq.pages.dev`) | 📋 Planned |
| Custom domain + SSL | 📋 Planned |

---

## Non-Negotiable Controls

| # | Control | Status |
|---|---------|--------|
| 1 | Intake QC Mandatory — no device enters AVAILABLE without QC | ✅ Active |
| 2 | Lock Check Enforcement — any lock blocks all sale paths | ✅ Active |
| 3 | IMEI Matching Required — returns must match sold IMEI | ✅ Active |
| 4 | Duplicate IMEI Prevention — global block across tenants | ✅ Active |
| 5 | VAT Tax Point Rule — always sale date, never advance date | ✅ Active |
| 6 | Reverse Charge Atomicity — Box 1 and Box 4 created simultaneously | ✅ Active |
| 7 | Export VAT Override — non-UK addresses force `0EXPORT_SALES` | ✅ Active |
| 8 | DRC Threshold Enforcement — £5,000 rule at invoice generation | ✅ Active |
| 9 | OPR Document Retention — 4-year minimum, non-deletable | ✅ Active |
| 10 | Audit Trail Mandatory — all overrides require user, reason, timestamp | ✅ Active |

---

## Known Stubs (UI present, no real backend logic)

> Grep `src/index.tsx` for `alert(` to find all stub action buttons.

| Feature | Location | Blocker |
|---------|----------|---------|
| HMRC MTD live submission | `renderMTD` → `submitMTDReturn` | HMRC MTD OAuth + API keys |
| Marketplace OAuth reconnect | `renderMarketplace` → `reconnectMarketplace` | Per-marketplace OAuth flows |
| AI ticket draft generation | `renderSupport` → `viewTicket` | OpenAI API key (server-side route needed) |
| Manager approval workflow | Various modals | Approval routing logic not defined |
| Police report generation | `renderRMA` | Document generation service not built |
| Refund issuance | `renderRMA` | Payment processor integration not built |
| Quote approval | `renderRMA` | Approval routing logic not defined |

---

## Codebase Metrics

| File | Lines | Role |
|------|-------|------|
| `src/index.tsx` | ~5,695 | Full SPA HTML + all frontend JS (single template literal) |
| `src/routes/api.ts` | ~672 | All REST API endpoints + in-memory data |
| `src/lib/vat-engine.ts` | — | VAT calculation helpers |
| `src/lib/data-store.ts` | — | In-memory data arrays & seed data |
| `src/types/index.ts` | — | TypeScript interfaces |

**Total UI pages:** 20  
**Total API endpoint paths:** ~50  
**VAT codes implemented:** 8 (full master table)  
**Non-negotiable controls active:** 10/10

---

## Deployment

| Environment | URL | Status |
|-------------|-----|--------|
| Local dev (PM2 + wrangler) | `http://localhost:3000` | ✅ Running |
| Cloudflare Pages (production) | *not yet deployed* | 📋 Planned |

```bash
# Start local dev
npm run build && pm2 start ecosystem.config.cjs

# Deploy to Cloudflare Pages (when ready)
npm run build && npx wrangler pages deploy dist --project-name refurbiq
```

---

*Update this file whenever: a phase completes, a stub becomes real,
a control is added/changed, or a new planned phase is defined.*
