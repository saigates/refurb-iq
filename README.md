# RefurbIQ — Refurbished Electronics ERP

## Project Overview

**RefurbIQ** is a device-centric, audit-driven operating system for refurbished electronics trading businesses. Built as a multi-tenant SaaS-ready ERP with HMRC-compliant VAT management at its core.

---

## Live URL

- **Development**: http://localhost:3000
- **API Base**: http://localhost:3000/api

---

## Modules Implemented

### Phase 1 Core Foundation ✅

| Module | Status | Key Features |
|--------|--------|-------------|
| Dashboard | ✅ | KPI stats, OPR timer, charts, alerts |
| Inventory & Goods-In | ✅ | Device registry, IMEI search, status filtering, batch import UI |
| Quality Control | ✅ | Intake QC form, lock check enforcement, locked devices panel |
| OPR Engine | ✅ | 180-day countdown, uplift calculator, document vault, batch management |
| Orders | ✅ | Marketplace order management, VAT display, DRC rules info |
| VAT Engine | ✅ | Full HMRC 9-box return, VAT calculator, DRC evaluator, records table |
| Fintech Advances | ✅ | Advance calculator, reconciliation, VAT tax point enforcement |
| Suppliers & Batches | ✅ | Purchase batch management, supplier registry |
| Support & Tickets | ✅ | Ticket management, AI draft display, RMA linking |
| Admin & Settings | ✅ | Company config, data retention policy, system controls, roadmap |

---

## VAT Engine — Implemented Logic

### VAT Codes (Full Master Table)
- `20S_SALES` — Standard 20% Output VAT
- `20S_PURCHASES` — Standard 20% Input VAT (reclaimable)
- `20RC_PURCHASES` — Reverse Charge: atomic Box 1 + Box 4 (net cash = £0)
- `0RCS_SALES` — Reverse Charge Sales with mandatory HMRC legal text
- `0MARGIN_PURCHASES` — Margin Scheme purchase (no VAT)
- `0MARGIN_SALES` — Margin Scheme sale (1/6 formula on profit margin)
- `0EXPORT_SALES` — Zero-rated export (absolute precedence override)
- `NOVAT_PURCHASES` — Outside of scope, no VAT impact

### Conditional Logic
- **£5,000 DRC Threshold**: Automatically evaluates `20S_SALES → 0RCS_SALES` when net invoice ≥ £5,000
- **Export Override**: Non-UK delivery address forces `0EXPORT_SALES` regardless of original code
- **Reverse Charge Atomicity**: Box 1 and Box 4 created simultaneously with net cash = £0

### HMRC 9-Box Mapping
All Box 1–9 values calculated and displayed with correct aggregation logic.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | KPI stats for current tenant |
| `/api/vat-codes` | GET | All 8 VAT code definitions |
| `/api/vat/evaluate` | POST | DRC threshold + export override evaluation |
| `/api/vat/calculate` | POST | VAT calculation by code |
| `/api/opr/calculate` | POST | OPR uplift and import VAT calculation |
| `/api/fintech/calculate` | POST | 80% advance + 1.95% fee calculation |
| `/api/devices` | GET | Device registry (filterable) |
| `/api/devices/:id` | GET | Device detail with QC history |
| `/api/opr-batches` | GET | All OPR batches |
| `/api/purchase-batches` | GET | All purchase batches |
| `/api/orders` | GET | All orders (filterable) |
| `/api/orders/:id` | GET | Order detail with VAT record + fintech advance |
| `/api/vat-records` | GET | All VAT records |
| `/api/vat-periods` | GET | VAT periods |
| `/api/fintech` | GET | Fintech advances |
| `/api/qc` | GET | QC records |
| `/api/qc/pending` | GET | Devices awaiting QC |
| `/api/tickets` | GET | Support tickets (filterable) |
| `/api/suppliers` | GET | Supplier list |

---

## Data Architecture

### Storage
- **Current**: In-memory data store (demo/development)
- **Production Target**: Cloudflare D1 (SQLite) — migration-ready schemas defined

### Key Data Models
- `Device` — IMEI-centric with full state machine
- `PurchaseBatch` — Supplier invoice with VAT code assignment
- `OPRBatch` — 180-day timer, uplift calculation, document vault
- `Order` — Marketplace order with VAT code application and DRC evaluation
- `VatRecord` — Atomic VAT entries with HMRC box mapping
- `VatPeriod` — 9-box HMRC return aggregation
- `FintechAdvance` — Financing events (vat_record_id = NULL by design)
- `QCRecord` — Intake/return QC with lock check enforcement
- `SupportTicket` — Customer communications with AI draft support

### Multi-Tenancy
- Every table includes `company_id` partitioning
- API middleware enforces tenant scoping on all requests

---

## Non-Negotiable Controls (All Active)

1. ✅ Intake QC Mandatory — no device enters AVAILABLE without QC
2. ✅ Lock Check Enforcement — any lock blocks all sale paths
3. ✅ IMEI Matching Required — returns must match sold IMEI
4. ✅ Duplicate IMEI Prevention — global block across tenants
5. ✅ VAT Tax Point Rule — always sale date, never advance date
6. ✅ Reverse Charge Atomicity — Box 1 and Box 4 created simultaneously
7. ✅ Export VAT Override — non-UK addresses force 0EXPORT_SALES
8. ✅ DRC Threshold Enforcement — £5,000 rule at invoice generation
9. ✅ OPR Document Retention — 4-year minimum, non-deletable
10. ✅ Audit Trail Mandatory — all overrides require user, reason, timestamp

---

## Tech Stack

- **Backend**: Hono v4 (TypeScript) on Cloudflare Workers
- **Frontend**: Vanilla JS SPA with Tailwind CSS, Chart.js, Axios
- **Build**: Vite + @hono/vite-build
- **Runtime**: Cloudflare Pages (edge-deployed)
- **Icons**: Font Awesome 6
- **Dev Server**: Wrangler Pages Dev via PM2

---

## Build Phase Status

| Phase | Timeline | Status |
|-------|----------|--------|
| Phase 1 — Core Foundation | Months 1-3 | 🔄 In Progress |
| Phase 2 — Risk & Recovery | Months 4-5 | 📋 Planned |
| Phase 3 — Operations Expansion | Months 6-7 | 📋 Planned |
| Phase 4 — Intelligence & SaaS | Months 8-9 | 📋 Planned |

---

## Deployment

```bash
# Development
npm run build && pm2 start ecosystem.config.cjs

# Production (Cloudflare Pages)
npm run build && npx wrangler pages deploy dist --project-name refurbiq
```

**Last Updated**: 2026-04-11 | **Version**: 2.0.0 — Phase 1 Build
