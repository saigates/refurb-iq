# RefurbIQ — SYSTEM STATE SNAPSHOT

> **Document type:** System extraction and normalisation — Senior Software Analyst / System Deconstruction Engineer output  
> **Extraction date:** 2026-06-05  
> **Extraction scope:** All source files read in full; zero design intent inferred; zero improvements suggested  
> **Strict rule:** Every section describes what EXISTS in the code. Where evidence is absent or ambiguous the label **UNVERIFIED OR INSUFFICIENT CONTEXT** is used.  
> **Source files read:**
> - `src/index.tsx` (5,695 lines — full read via sections + targeted greps)
> - `src/routes/api.ts` (875 lines — full read)
> - `src/lib/data-store.ts` (~1,085 lines — full read)
> - `src/lib/vat-engine.ts` (264 lines — full read)
> - `src/types/index.ts` (868 lines — full read)
> - `public/static/tracker.html` (partial read — structure captured)
> - `docs/STATUS.md` (full read)
> - `docs/COMPONENT_OVERVIEW.md` (full read)
> - `docs/WORKFLOW_GOODS_IN_INVENTORY_OPR.md` (full read)
> - `docs/SYSTEM_BLUEPRINT.md` (not read this session — 91,265 bytes; prior session content referenced via summary)
> - `package.json`, `wrangler.jsonc`, `vite.config.ts`, `tsconfig.json`, `ecosystem.config.cjs`, `.gitignore`, `dist/_routes.json`, `public/static/style.css`, `README.md`, `src/renderer.tsx`

---

## 1. REPOSITORY STRUCTURE MAP

```
/home/user/webapp/
│
├── package.json                     # Project manifest; name="webapp"; type="module"
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite build config (Cloudflare Pages plugin)
├── wrangler.jsonc                   # Cloudflare Workers/Pages config
├── ecosystem.config.cjs             # PM2 process manager config (CommonJS)
├── .gitignore                       # Node standard ignores + .env*, .dev.vars, .wrangler
├── README.md                        # Phase 1 documentation only (stale — see §10)
├── CLAUDE.md                        # Project constitution / AI session rules (not read this session)
│
├── src/
│   ├── index.tsx                    # SOLE application entry point — 5,695 lines
│   │                                # Contains: Hono app, routing, static serving,
│   │                                # AND entire SPA frontend inside getIndexHTML()
│   ├── renderer.tsx                 # jsxRenderer — NOT imported anywhere; unused
│   │
│   ├── routes/
│   │   └── api.ts                   # 875 lines; all 53 REST endpoints; PHASE_CHANGELOG array
│   │
│   ├── lib/
│   │   ├── data-store.ts            # ~1,085 lines; all in-memory data arrays and seed data
│   │   └── vat-engine.ts            # 264 lines; pure VAT/OPR/Fintech calculation functions
│   │
│   └── types/
│       └── index.ts                 # 868 lines; all TypeScript interfaces and type aliases
│
├── public/
│   └── static/
│       ├── style.css                # 1 CSS rule only: h1 { font-family: Arial... }
│       └── tracker.html             # ~33,339 bytes; standalone development tracker SPA
│                                    # Accessible at /tracker (redirect from src/index.tsx)
│
├── docs/
│   ├── STATUS.md                    # Phase/module status tracker; last updated 2026-04-28
│   ├── COMPONENT_OVERVIEW.md        # Senior consultant analysis; 12-component integration overview
│   ├── SYSTEM_BLUEPRINT.md          # 91,265 bytes; prior system blueprint (not fully re-read)
│   └── WORKFLOW_GOODS_IN_INVENTORY_OPR.md  # Goods-in → QC → OPR workflow documentation
│
├── dist/                            # Build output (git-ignored)
│   ├── _worker.js                   # 489.47 kB compiled edge worker
│   └── _routes.json                 # {"version":1,"include":["/*"],"exclude":["/static/*"]}
│
└── node_modules/                    # Git-ignored; all deps pre-installed
```

**Key structural observations (stated without interpretation):**
- `src/renderer.tsx` is present but not imported by `src/index.tsx` or `src/routes/api.ts`
- `public/static/style.css` contains only one rule; its `link` tag appears only in `renderer.tsx` (which is unused)
- `dist/` is git-ignored but exists on disk from last build
- No `migrations/` directory exists (referenced as planned in `docs/STATUS.md`)
- No `tests/` directory exists
- No `.github/` directory exists (CI/CD referenced as planned)
- No `.dev.vars` file exists (referenced in `.gitignore`)
- `CLAUDE.md` is referenced in multiple docs but was not read in this extraction session

---

## 2. MODULE INVENTORY

Derived from `docs/STATUS.md`, `src/index.tsx` navigation, and `src/routes/api.ts`.

### Phase 1 — Core Foundation (Status: ✅ Complete)

| Module | UI Render Function | Primary API Routes | Status |
|--------|-------------------|--------------------|--------|
| Dashboard | `renderDashboard` | `GET /api/dashboard`, `GET /api/dashboard/v2` | ✅ Complete |
| Inventory & Goods-In | `renderInventory` | `GET /api/devices`, `GET /api/devices/:id`, `POST /api/purchase-batches`, `POST /api/purchase-batches/:id/imei-import` | ✅ Complete |
| Quality Control | `renderQC` | `GET /api/qc`, `GET /api/qc/pending` | ✅ Complete (QC submit is STUB) |
| OPR Engine | `renderOPR` | `GET /api/opr-batches`, `GET /api/opr-batches/:id`, `POST /api/opr/calculate` | ✅ Complete (OPR create / reimport are STUBs) |
| Orders | `renderOrders` | `GET /api/orders`, `GET /api/orders/:id` | ✅ Complete |
| VAT Engine | `renderVAT` | `GET /api/vat-codes`, `POST /api/vat/evaluate`, `POST /api/vat/calculate`, `GET /api/vat-records`, `GET /api/vat-records/period/:periodId`, `GET /api/vat-periods`, `GET /api/vat-periods/:id` | ✅ Complete |
| Fintech Advances | `renderFintech` | `GET /api/fintech`, `POST /api/fintech/calculate` | ✅ Complete |
| Suppliers & Batches | `renderSuppliers` | `GET /api/suppliers`, `GET /api/suppliers/:id`, `POST /api/suppliers`, `PATCH /api/suppliers/:id`, `GET /api/purchase-batches`, `GET /api/purchase-batches/:id` | ✅ Complete |
| Support & Tickets | `renderSupport` | `GET /api/tickets`, `GET /api/tickets/:id` | ✅ Complete (AI draft generation is STUB) |
| Admin & Settings | `renderAdmin` | *(in-page only; no dedicated API routes)* | ✅ Complete |

### Phase 2 — Risk & Recovery (Status: ✅ Complete)

| Module | UI Render Function | Primary API Routes | Status |
|--------|-------------------|--------------------|--------|
| Courier & INR Investigations | `renderCourier` | `GET /api/investigations`, `GET /api/investigations/:id`, `GET /api/investigations/stats/summary` | ✅ Complete |
| Returns & RMA | `renderRMA` | `GET /api/rma`, `GET /api/rma/:id`, `GET /api/rma/stats/summary` | ✅ Complete (refund/replacement are STUBs) |
| Profitability & Unit P&L | `renderProfitability` | `GET /api/pnl/summary`, `GET /api/pnl/units`, `GET /api/pnl/units/:device_id` | ✅ Complete |
| Repairs & Refurbishment | `renderRepairs` | `GET /api/repairs`, `GET /api/repairs/:id`, `GET /api/repairs/stats/summary` | ✅ Complete |
| Dashboard v2.2 | `renderDashboard` (enhanced) | `GET /api/dashboard/v2` | ✅ Complete |

### Phase 3 — Operations Expansion (Status: ✅ Complete)

| Module | UI Render Function | Primary API Routes | Status |
|--------|-------------------|--------------------|--------|
| Supplier Analytics | `renderSupplierAnalytics` | `GET /api/supplier-analytics`, `GET /api/supplier-analytics/:id` | ✅ Complete |
| HMRC MTD VAT Returns | `renderMTD` | `GET /api/mtd-returns`, `GET /api/mtd-returns/:id`, `GET /api/mtd-returns/:id/validate`, `POST /api/mtd-returns/:id/submit` | ✅ Complete (HMRC submission is STUB — simulated in-memory) |
| Audit Log | `renderAuditLog` | `GET /api/audit-log`, `GET /api/audit-log/:id`, `GET /api/audit-log/stats/summary` | ✅ Complete |

### Phase 4 — Intelligence & SaaS (Status: ✅ Complete)

| Module | UI Render Function | Primary API Routes | Status |
|--------|-------------------|--------------------|--------|
| IMEI / Barcode Scanner | `renderScanner` | `POST /api/scanner/lookup`, `POST /api/scanner/intake` | ✅ Complete |
| Marketplace Hub | `renderMarketplace` | `GET /api/marketplace`, `GET /api/marketplace/integrations`, `GET /api/marketplace/stats/summary`, `GET /api/marketplace/:id`, `POST /api/marketplace/:id/reconnect`, `POST /api/marketplace/:id/sync` | ✅ Complete (OAuth reconnect is STUB) |
| Tenant Management | `renderTenants` | `GET /api/tenants`, `GET /api/tenants/summary`, `GET /api/tenants/:id`, `PATCH /api/tenants/:id/status`, `GET /api/tenants/:id/usage` | ✅ Complete |
| Device Variants Catalogue | `renderDeviceVariantsInto` | `GET /api/device-variants`, `GET /api/device-variants/makes`, `GET /api/device-variants/models`, `POST /api/device-variants`, `POST /api/device-variants/import` | ✅ Complete |
| Bulk Override | `openBulkOverrideModal` | `POST /api/devices/batch-override` | ✅ Complete |
| Device Override Panel | `renderOverridePanel` | `PATCH /api/devices/:id/override`, `GET /api/devices/:id/overrides` | ✅ Complete |
| Notifications | *(topbar bell icon)* | `GET /api/notifications`, `GET /api/notifications/summary`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/mark-all-read` | ✅ Complete |
| Project Update Tracker | `GET /api/updates`, `GET /api/updates/summary`, `POST /api/updates` | *(Backend only; consumed by tracker.html)* | ✅ Complete |

### Phase 5 — Data Persistence (Status: 📋 Planned — NOT STARTED)
- Target: Cloudflare D1 (SQLite)
- All data currently in-memory; resets on worker restart

### Phase 6 — Production Hardening (Status: 📋 Planned — NOT STARTED)
- HMRC MTD live API, marketplace OAuth, real AI drafts, CSV reconciliation, rate limiting, auth, deployment, custom domain

---

## 3. FEATURE INVENTORY (RAW)

Features listed exactly as implemented. No interpretation of business purpose.

### 3.1 Implemented Features (Real Logic Exists)

**Goods-In / Inventory**
- Create purchase batch via modal form (`POST /api/purchase-batches`)
- IMEI CSV import with file parse, validation, and duplicate detection (`POST /api/purchase-batches/:id/imei-import`)
- Device registry with status filter, grade filter, make filter (`GET /api/devices`)
- Device detail modal with QC history and override history (`GET /api/devices/:id`)
- Supplier dropdown auto-fetched on every modal open (`GET /api/suppliers?active=true`)
- VAT code auto-populated from supplier's `default_vat_code` on supplier change
- IMEI/model search (live, case-insensitive, client-side)
- Global duplicate IMEI prevention (checked across all devices on import)
- Grade or colour override (single device) with mandatory reason code and audit entry (`PATCH /api/devices/:id/override`)
- Bulk grade/colour override across multiple selected devices (`POST /api/devices/batch-override`)
- Override history display per device (`GET /api/devices/:id/overrides`)

**Quality Control**
- QC queue (devices in `INTAKE_QC_PENDING`, `RETURN_QC_PENDING`, `POST_REPAIR_QC`) (`GET /api/qc/pending`)
- QC history table (`GET /api/qc`)
- Locked device panel (display only)
- Intake QC form: 8 functional tests, grade assignment, lock check, cosmetic notes (UI only — no backend submit endpoint)

**OPR Engine**
- OPR batch list and status display (`GET /api/opr-batches`)
- 180-day countdown timer visual (progress bar with colour thresholds: green >30d, amber 14-30d, red ≤14d)
- OPR uplift calculator — computes `upliftPerUnit` and `importVatOnUplift` (`POST /api/opr/calculate`)
- OPR document vault display (UI only — no file storage backend)
- 180-day timeline panel for all batches

**Orders**
- Order list with status and marketplace filters (`GET /api/orders`)
- Order detail with linked VAT record and fintech advance (`GET /api/orders/:id`)

**VAT Engine**
- 8 VAT code definitions with full box-mapping metadata (`GET /api/vat-codes`)
- DRC threshold evaluation: non-GB delivery forces `0EXPORT_SALES`; UK delivery with net ≥ £5,000 forces `0RCS_SALES` (`POST /api/vat/evaluate`)
- VAT calculation for all 8 codes (`POST /api/vat/calculate`)
- Margin scheme calculation: VAT = 1/6 of gross - cost
- Reverse charge atomicity: Box 1 and Box 4 written simultaneously for `20RC_PURCHASES`
- VAT records table (`GET /api/vat-records`)
- VAT period aggregation: sums Box 1-7 from all linked records (`GET /api/vat-records/period/:periodId`)
- VAT period list and detail (`GET /api/vat-periods`, `GET /api/vat-periods/:id`)
- HMRC 9-box return preview
- DRC legal text generation: mandatory footer text for `0RCS_SALES`

**Fintech Advances**
- Advance list (`GET /api/fintech`)
- Advance calculator: 80% of gross, 1.95% fee, net advance = advance − fee (`POST /api/fintech/calculate`)

**Suppliers & Batches**
- Supplier list with active filter (`GET /api/suppliers`)
- Supplier detail (`GET /api/suppliers/:id`)
- Supplier creation with duplicate code check and audit entry (`POST /api/suppliers`)
- Supplier update with audit entry (`PATCH /api/suppliers/:id`)
- Purchase batch list and detail (`GET /api/purchase-batches`, `GET /api/purchase-batches/:id`)

**Support & Tickets**
- Ticket list with status and priority filters (`GET /api/tickets`)
- Ticket detail with AI draft display field (pre-populated seed data only) (`GET /api/tickets/:id`)

**Courier & INR Investigations**
- Investigation list with status and event_type filters (`GET /api/investigations`)
- Investigation detail with evidence items and timeline (`GET /api/investigations/:id`)
- Summary stats: open count, total claimed, total recovered, recovery rate (`GET /api/investigations/stats/summary`)

**Returns & RMA**
- RMA list with status filter (`GET /api/rma`)
- RMA detail with IMEI match flag and timeline (`GET /api/rma/:id`)
- RMA summary stats: open, mismatches, total refunded, pending QC (`GET /api/rma/stats/summary`)
- IMEI mismatch flag display and frozen-state UI

**Profitability & Unit P&L**
- Unit P&L list with status filter (`GET /api/pnl/units`)
- Profitability summary: totals, averages, by-marketplace, by-make breakdowns (`GET /api/pnl/summary`)
- Per-device P&L detail (`GET /api/pnl/units/:device_id`)

**Repairs & Refurbishment**
- Repair job list with status, outcome, device_id filters (`GET /api/repairs`)
- Repair stats summary (`GET /api/repairs/stats/summary`)
- Repair job detail with parts and timeline (`GET /api/repairs/:id`)

**Supplier Analytics**
- Full supplier metrics (QC pass rate, defect count, OPR risk, margin contribution, risk score/label) (`GET /api/supplier-analytics`)
- Per-supplier detail (`GET /api/supplier-analytics/:id`)

**HMRC MTD VAT Returns**
- MTD return list and detail (`GET /api/mtd-returns`, `GET /api/mtd-returns/:id`)
- MTD return validation: Box arithmetic checks, period-open checks, warning generation (`GET /api/mtd-returns/:id/validate`)
- MTD submission simulation: sets status to ACCEPTED, generates fake HMRC receipt ID (`POST /api/mtd-returns/:id/submit`)

**Audit Log**
- Filterable audit log: by module, severity, actor, with limit (`GET /api/audit-log`)
- Audit entry detail (`GET /api/audit-log/:id`)
- Audit stats: by-severity count, by-module count, 5 most recent entries (`GET /api/audit-log/stats/summary`)

**IMEI / Barcode Scanner**
- IMEI/barcode lookup: checks existing devices, then purchase batches, then IMEI prefix inference (`POST /api/scanner/lookup`)
- Scan-to-intake: creates device record from scanner form (`POST /api/scanner/intake`)

**Marketplace Hub**
- Integration list and stats (`GET /api/marketplace`, `GET /api/marketplace/stats/summary`)
- Integration detail with sync log and error list (`GET /api/marketplace/:id`)
- Reconnect simulation: sets status CONNECTED, marks all errors resolved (`POST /api/marketplace/:id/reconnect`)
- Sync simulation: creates new sync log entry (`POST /api/marketplace/:id/sync`)

**Tenant Management**
- Tenant list and detail (`GET /api/tenants`, `GET /api/tenants/:id`)
- Tenant SaaS summary: MRR, ARR, plan breakdown (`GET /api/tenants/summary`)
- Tenant status update: ACTIVE/SUSPENDED (`PATCH /api/tenants/:id/status`)
- Tenant usage detail (`GET /api/tenants/:id/usage`)

**Device Variants / SKU Catalogue**
- Variant list with make/model filter (`GET /api/device-variants`)
- Makes list, models list (`GET /api/device-variants/makes`, `GET /api/device-variants/models`)
- Variant creation with duplicate check and SKU auto-generation (`POST /api/device-variants`)
- Bulk variant CSV import (`POST /api/device-variants/import`)
- SKU code generation: `{makeShort}-{modelShort}-{storageShort}-{colourShort}-{grade}`

**Notifications**
- Notification list with unread filter (`GET /api/notifications`)
- Notification summary: total, unread, critical, warning counts (`GET /api/notifications/summary`)
- Mark single notification read (`PATCH /api/notifications/:id/read`)
- Mark all notifications read (`POST /api/notifications/mark-all-read`)

**Project Update Tracker**
- Hardcoded `PHASE_CHANGELOG` array (13 entries) + `manualUpdates[]` runtime array
- Update list with type/phase filter and pagination (`GET /api/updates`)
- Update summary stats (`GET /api/updates/summary`)
- Manual update creation (`POST /api/updates`)
- `public/static/tracker.html` — standalone SPA that reads from above endpoints

**Dashboard**
- KPI stat cards: total devices, available, in OPR, pending QC, open orders, open tickets, OPR expiring, VAT liability, revenue MTD, avg margin
- Charts: device status doughnut, marketplace P&L bar, VAT position bar
- Recent orders panel
- OPR 180-day tracker panel
- Risk & Compliance summary panel (IMEI mismatches hardcoded to 1, locked devices hardcoded to 1)
- P&L waterfall summary panel
- Enhanced dashboard v2 API aggregates base stats + repair stats + P&L summary + notifications summary + marketplace summary (`GET /api/dashboard/v2`)

**UI Chrome**
- Collapsible sidebar (`toggleSidebar()`) with state persisted to `localStorage.sidebarCollapsed`
- Dark/light theme toggle (`toggleTheme()`, `applyTheme()`) with state persisted to `localStorage.theme`
- Notification bell in topbar with unread count badge
- Page loading spinner (100ms delay on `navigateTo()`)
- Modal system: `openModal(title, body)`, `closeModal()`

### 3.2 Stub Features (UI present; no real backend logic)

| Feature | Location | What fires instead |
|---------|----------|--------------------|
| QC form submission | `openQCForm()` → Submit | `alert('QC submitted...')` |
| Lock Cleared event | QC locked-device tab | `alert('Manager approval required...')` |
| BER discharge | QC locked-device tab | `alert('BER discharge confirmed...')` |
| Mark Reimported (OPR) | OPR batch card | `alert('Mark reimported — C88 reference required')` |
| Create OPR Batch | OPR → New Batch modal | `alert('OPR batch created...')` |
| OPR document upload/download | `viewOPRDocs()` | `alert(...)` |
| CSV import orders | Orders page | `alert('CSV order import...')` |
| Lock VAT Period | VAT page | `alert('Period locked...')` |
| Submit to HMRC (VAT page button) | VAT page | `alert('Submitted to HMRC...')` |
| Purchase batch creation (Suppliers page) | Suppliers page modal | `alert('Purchase batch created...')` |
| Message sent | Support ticket view | `alert('Message sent...')` |
| Edit draft | Support ticket view | `alert('Edit draft...')` |
| AI draft generation | Support ticket view | `alert('Generating AI draft...')` |
| Ticket created | Support → New Ticket | `alert('Ticket created...')` |
| Evidence upload | Courier investigation | `alert('Evidence uploaded...')` |
| Submit to carrier | Courier investigation | `alert('Submitted to carrier...')` |
| Post recovery to P&L | Courier investigation | `alert('Recovery posted...')` |
| Escalate | Courier investigation | `alert('Escalated...')` |
| Mark as loss | Courier investigation | `alert('Marked as loss...')` |
| Investigation opened | Courier investigation | `alert('Investigation opened...')` |
| Manager escalation | RMA | `alert('Manager escalation...')` |
| Police report | RMA | `alert('Police report...')` |
| Return QC | RMA | `alert('Return QC started...')` |
| Refund approved | RMA | `alert('Refund approved...')` |
| Partial refund | RMA | `alert('Partial refund...')` |
| Replacement dispatched | RMA | `alert('Replacement dispatched...')` |
| Scrap device | RMA | `alert('Device scrapped...')` |
| Quote approve | Repairs | `alert('Quote approved...')` |
| Quote reject | Repairs | `alert('Quote rejected...')` |
| Parts received | Repairs | `alert('Parts received...')` |
| Mark complete + queue QC | Repairs | `alert('Repair marked complete...')` |
| Run post-repair QC | Repairs | `alert('Post-repair QC...')` |
| Add note | Repairs | `alert('Note added...')` |
| HMRC MTD submit (UI button) | MTD page | `alert('Submitted to HMRC...')` (separate from simulated API endpoint) |
| Marketplace OAuth reconnect (UI button) | Marketplace | `alert('Reconnecting...')` (separate from `/reconnect` API) |

---

## 4. CODE COMPONENT INDEX

### 4.1 Entry Point — `src/index.tsx`

| Component | Line (approx.) | Type | Description |
|-----------|---------------|------|-------------|
| `app` | 1 | Hono instance | Root Hono app |
| `app.use('/static/*', serveStatic)` | ~10 | Middleware | Serves `public/static/` directory |
| `app.route('/api', api)` | ~12 | Route mount | Mounts all API routes from `api.ts` |
| `app.get('/tracker', redirect)` | ~14 | Route | Redirects `/tracker` → `/static/tracker.html` |
| `app.get('*', getIndexHTML)` | ~16 | Catch-all | Returns full SPA HTML for all other routes |
| `getIndexHTML()` | ~28 | Function | Returns ~5,600-line template literal (full SPA) |

### 4.2 Utility Functions — inside `getIndexHTML()` template

| Function | Line (approx.) | Signature | Purpose |
|----------|---------------|-----------|---------|
| `fmt(n)` | ~399 | `(number) → string` | Formats number as `£N,NNN.NN` |
| `fmtNum(n)` | ~400 | `(number) → string` | Formats number with commas, no currency |
| `fmtDate(d)` | ~401 | `(string) → string` | Formats ISO date string to locale |
| `statusBadge(s)` | ~404 | `(string) → string` | Returns HTML badge for device status |
| `vatCodeBadge(c)` | ~420 | `(string) → string` | Returns HTML badge for VAT code |
| `priorityBadge(p)` | ~430 | `(string) → string` | Returns HTML badge for ticket priority |
| `gradeBadge(g)` | ~440 | `(string) → string` | Returns HTML badge for device grade |
| `card(title, content)` | ~460 | `(string, string) → string` | Wraps content in standard card shell |
| `table(headers, rows)` | ~470 | `(array, array) → string` | Renders HTML table |
| `statCard(label, value, icon, color)` | ~490 | `(string, string, string, string) → string` | KPI stat card HTML |

### 4.3 Navigation — inside `getIndexHTML()` template

| Function | Line (approx.) | Description |
|----------|---------------|-------------|
| `navigateTo(page)` | ~529 | Maps 20 page keys to render functions; shows 100ms loading spinner; sets page title and subtitle; calls render function |

**Page key → render function map:**

| Page Key | Render Function |
|----------|----------------|
| `dashboard` | `renderDashboard` |
| `inventory` | `renderInventory` |
| `qc` | `renderQC` |
| `opr` | `renderOPR` |
| `orders` | `renderOrders` |
| `vat` | `renderVAT` |
| `fintech` | `renderFintech` |
| `suppliers` | `renderSuppliers` |
| `support` | `renderSupport` |
| `admin` | `renderAdmin` |
| `courier` | `renderCourier` |
| `rma` | `renderRMA` |
| `profitability` | `renderProfitability` |
| `repairs` | `renderRepairs` |
| `supplier-analytics` | `renderSupplierAnalytics` |
| `mtd` | `renderMTD` |
| `audit` | `renderAuditLog` |
| `scanner` | `renderScanner` |
| `marketplace` | `renderMarketplace` |
| `tenants` | `renderTenants` |

### 4.4 Modal System

| Function | Line (approx.) | Description |
|----------|---------------|-------------|
| `openModal(title, body)` | ~601 | Sets `#modal-title` and `#modal-body` innerHTML; removes `hidden` from `#modal-overlay` |
| `closeModal()` | ~609 | Adds `hidden` to `#modal-overlay` |

### 4.5 Page Render Functions

| Function | Line (approx.) | Description |
|----------|---------------|-------------|
| `renderDashboard` | 617 | Fetches `/api/dashboard/v2`, `/api/investigations/stats/summary`, `/api/pnl/summary`; renders KPI row, charts, OPR tracker, risk panel, P&L waterfall |
| `renderInventory` | 950 | Fetches `/api/devices`, `/api/device-variants`; renders device table with filters; opens import modal, device detail modal, override panel |
| `renderQC` | 1500 | Fetches `/api/qc/pending`, `/api/qc`; renders QC queue, QC history, locked device panel |
| `renderOPR` | 1666 | Fetches `/api/opr-batches`; renders batch cards with countdown timers, uplift calculator, document vault, 180-day timeline |
| `renderOrders` | 1863 | Fetches `/api/orders`; renders order table with marketplace and status filters |
| `renderVAT` | 2015 | Fetches `/api/vat-codes`, `/api/vat-records`, `/api/vat-periods`; renders VAT calculator, DRC evaluator, records table, periods panel |
| `renderFintech` | 2271 | Fetches `/api/fintech`; renders advance list and fintech calculator |
| `renderSuppliers` | 2348 | Fetches `/api/suppliers`, `/api/purchase-batches`; renders supplier table, batch table, new supplier form |
| `renderSupport` | 2916 | Fetches `/api/tickets`; renders ticket list with filters; opens ticket detail modal |
| `renderAdmin` | 3048 | Static HTML only; renders company settings, data retention policy, system controls, roadmap |
| `renderDeviceVariantsInto` | 3123 | Fetches `/api/device-variants`; renders SKU catalogue table with filters; opens add-variant modal; CSV import |
| `renderOverridePanel` | 3422 | Renders single-device attribute override form; calls `PATCH /api/devices/:id/override` |
| `renderCourier` | 3515 | Fetches `/api/investigations`; renders investigation cards with evidence and timeline |
| `renderRMA` | 3762 | Fetches `/api/rma`; renders RMA cards with IMEI match status and timeline |
| `renderProfitability` | 3960 | Fetches `/api/pnl/units`, `/api/pnl/summary`; renders unit P&L table and make-level bar chart |
| `renderRepairs` | 4176 | Fetches `/api/repairs`, `/api/repairs/stats/summary`; renders repair job cards with stat summary |
| `renderSupplierAnalytics` | 4450 | Fetches `/api/supplier-analytics`; renders per-supplier metric cards with risk scores and charts |
| `renderMTD` | 4672 | Fetches `/api/mtd-returns`; renders MTD return cards with 9-box preview and validate/submit controls |
| `renderAuditLog` | 4837 | Fetches `/api/audit-log`; renders filterable audit trail table |
| `renderScanner` | 4943 | Renders IMEI/barcode input; calls `/api/scanner/lookup`; renders result with create-intake form |
| `renderMarketplace` | 5219 | Fetches `/api/marketplace`; renders integration status cards, sync log, error list |
| `renderTenants` | 5408 | Fetches `/api/tenants`; renders tenant cards with usage meters and status controls |
| `openBulkOverrideModal` | 2750 | Opens modal for bulk attribute override across selected devices; calls `/api/devices/batch-override` |

### 4.6 Dashboard Sub-Render Functions

| Function | Description |
|----------|-------------|
| `renderDeviceChart()` | Chart.js doughnut: device status distribution (hardcoded data [2,2,1,2,1]) |
| `renderMktChart(byMarketplace)` | Chart.js bar: P&L by marketplace |
| `renderVatChart()` | Chart.js bar: VAT position for open period |
| `renderRecentOrders()` | Renders recent orders list in dashboard panel |
| `renderOPRTracker()` | Renders OPR 180-day tracker in dashboard panel |

### 4.7 UI Chrome Functions

| Function | Line (approx.) | Description |
|----------|---------------|-------------|
| `toggleSidebar()` | ~5617 | Collapses/expands sidebar; writes `sidebarCollapsed` to localStorage |
| `applyTheme(light)` | ~5630 | Adds/removes `light-mode` class on `<body>` |
| `toggleTheme()` | ~5645 | Reads localStorage `theme`, inverts, calls `applyTheme()` |
| `initUI()` | ~5660 | Called on `DOMContentLoaded`; applies stored theme; applies stored sidebar state; fetches notification summary for badge |

**Bootstrap:** `document.addEventListener('DOMContentLoaded', initUI)` at line ~5686. Does NOT call `navigateTo()` — page loads blank until user clicks a sidebar link.

### 4.8 VAT Engine Functions — `src/lib/vat-engine.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `evaluateDRCThreshold` | `(netValue, deliveryCountry, originalCode) → {code, overrideApplied, reason}` | Export override (non-GB) takes absolute precedence; then DRC £5,000 threshold check |
| `calculateVat` | `(vatCode, grossAmount, costPrice?) → {netAmount, vatAmount, marginAmount, box1-7}` | Full VAT calculation for all 8 codes; switch statement; rounds to 2dp |
| `aggregateVatPeriod` | `(records[]) → {box1-7, box3, box5}` | Sums box amounts across all VAT records for a period; computes Box 3 and Box 5 |
| `calculateOPRUplift` | `({processingInvoiceValue, freightOutbound, freightInbound, unitCount}) → {upliftPerUnit, importVatOnUplift, totalUplift}` | Total uplift = invoice + both freights; import VAT = total × 20% |
| `calculateFintechAdvance` | `(grossSaleValue) → {advanceAmount, fintechFee, netAdvanceReceived}` | Advance = gross × 80%; fee = advance × 1.95%; net = advance − fee |
| `calculateUnitPnL` | `({grossSale, vatOnSale, purchaseCost, oprUplift, marketplaceFee, fintechFee, shippingCost, repairCost, recoveryAmount}) → {revenue, totalCosts, netProfit, marginPercent}` | revenue = grossSale − vatOnSale; costs = sum of all cost params; netProfit = revenue − costs + recovery |

### 4.9 Data Store Functions — `src/lib/data-store.ts`

| Function | Description |
|----------|-------------|
| `getDashboardStats()` | Computes live stats from in-memory arrays: counts, open orders, tickets, VAT liability, revenue MTD. `avg_margin_percent` hardcoded to 22.4 |
| `getProfitabilitySummary()` | Aggregates sold unit P&L records into totals, by-marketplace, by-make; best/worst device by margin |
| `getRepairStats()` | Counts repair jobs by status and outcome; sums costs; `recovery_value` = completed repairs × 3× actual cost |
| `getSupplierAnalytics()` | Returns hardcoded `SupplierMetric[]` array (4 suppliers); computes summary from those metrics |
| `getTenantSaaSSummary()` | Aggregates tenant list: counts by status, MRR, ARR, avg devices |
| `getNotificationSummary()` | Counts unread notifications by severity |
| `generateSkuCode(make, model, storage, colour, grade)` | Generates `{makeShort}-{modelShort}-{storShort}-{colShort}-{grade}` using lookup maps and string truncation |

### 4.10 API Route Controllers — `src/routes/api.ts`

| Group | Functions / Logic Pattern |
|-------|--------------------------|
| Dashboard | Delegates to `getDashboardStats()` and `getRepairStats()` + `getProfitabilitySummary()` |
| VAT evaluation | Calls `evaluateDRCThreshold()` then `calculateVat()`; appends DRC legal text if applicable |
| Purchase batch creation | Generates sequential batch ID (`PB{year}-{seqNum}`); derives VAT rate from code; pushes to array |
| IMEI import | Loops rows; checks global duplicate; generates random 6-digit `DEV` ID; pushes to devices array |
| Supplier CRUD | Duplicate code check; pushes audit log entry on create/update |
| Device override (single) | Validates field is `grade` or `colour`; requires notes ≥20 chars when reason is `OTHER`; mutates device; pushes audit entry |
| Device batch override | Loops device_ids; same validation; mutates each; pushes audit entry per device |
| MTD validation | Arithmetic: `abs(box1 + box2 - box3) > 0.01` error; `abs(box3 - box4 - box5) > 0.01` error |
| MTD submit | Checks already-ACCEPTED; re-runs validation; mutates `r.status`, `r.submitted_at`, `r.hmrc_receipt_id` (random hex) |
| Marketplace reconnect | Sets status CONNECTED; sets `credentials_valid=true`; marks all errors resolved; hardcodes expiry `2027-04-11` |
| Marketplace sync | Creates new `SyncLogEntry`; unshifts to sync_log; updates last_sync timestamps |
| Notification mark-read | Sets `n.read=true`, `n.read_at=now` |
| Scanner lookup | Checks devices, purchase batches, IMEI prefix map (4 hardcoded prefixes); returns `action` recommendation |
| Scanner intake | Validates 8 required fields; duplicate IMEI check; creates device with generated ID `DEV{length+1}-NEW` |
| Update tracker | Merges `PHASE_CHANGELOG` (static, 13 entries) + `manualUpdates[]` (runtime); supports type/phase filter + pagination |

---

## 5. DATA MODEL INDEX

All entities as defined in `src/types/index.ts` and instantiated in `src/lib/data-store.ts`.

### 5.1 Core Device Lifecycle

**`Device`** (`devices[]` — 8 seed records)
```
device_id: string           (e.g. DEV001)
company_id: string          (hardcoded 'REFURBIQ_DEMO')
imei_primary: string
imei_secondary?: string
serial_number?: string
make: string
model: string
storage: string
colour: string
grade: string               (A / B / C / D / UNGRADED)
network: string
supplier_id?: string
purchase_batch_id?: string
cost_price: number
landed_cost: number
purchase_vat_code: VatCode
current_status: DeviceStatus
current_custody_type: CustodyType
current_location_id?: string
opr_batch_id?: string
first_received_at: string   (ISO date)
last_updated_at: string     (ISO date)
```

**DeviceStatus enum (18 values):**
`EXPECTED | RECEIVED | INTAKE_QC_PENDING | AVAILABLE | RESERVED | PICKED | SHIPPED | WITH_CUSTOMER | RMA_OPEN | RETURNED_RECEIVED | RETURN_QC_PENDING | FAULT_CONFIRMED | NO_FAULT_FOUND | RESTOCKED | SCRAPPED | IN_OPR | POST_REPAIR_QC | LOCKED`

**CustodyType enum (5 values):**
`WAREHOUSE | IN_TRANSIT | WITH_CUSTOMER | WITH_VENDOR | CUSTOMS`

---

**`PurchaseBatch`** (`purchaseBatches[]` — 4 seed records)
```
purchase_batch_id: string   (e.g. PB2026-001)
company_id: string
supplier_id: string
external_invoice_ref: string
batch_code: string          (same as purchase_batch_id)
batch_date: string
currency: string
total_purchase_value: number
vat_code: VatCode
vat_amount: number
status: 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'CLOSED'
device_count?: number
supplier_name?: string
```

---

**`OPRBatch`** (`oprBatches[]` — 3 seed records)
```
opr_batch_id: string        (e.g. OPR2026-001)
company_id: string
batch_reference: string
opr_authorisation_number: string  (GB369979995000 in all seed data)
repair_vendor_id: string
export_date: string
reimport_deadline: string
days_remaining: number
export_mrn?: string
awb_number_outbound?: string
awb_number_inbound?: string
processing_invoice_value: number
freight_cost_outbound: number
freight_cost_inbound: number
unit_count: number
uplift_per_unit: number
import_vat_on_uplift: number
reimport_date?: string
c88_document_ref?: string
status: 'DRAFT' | 'EXPORTED' | 'IN_REPAIR' | 'REIMPORTED' | 'DISCHARGED' | 'OVERDUE'
vendor_name?: string
```

---

**`QCRecord`** (`qcRecords[]` — 2 seed records)
```
qc_id: string
company_id: string
device_id: string
imei: string
qc_type: 'INTAKE' | 'RETURN' | 'POST_REPAIR'
performed_by: string
performed_at: string
grade_assigned: string
lock_check_result: 'CLEAR' | 'LOCKED' | 'NOT_CHECKED'
cosmetic_notes?: string
functional_tests: FunctionalTest[]   (array of {test_name, result, notes?})
outcome: 'PASS' | 'FAIL' | 'LOCKED_BLOCKED'
notes?: string
```

**`FunctionalTest`:**
```
test_name: string
result: 'PASS' | 'FAIL' | 'N/A'
notes?: string
```

---

**`DeviceAttributeOverride`** (`deviceAttributeOverrides[]` — 1 seed record)
```
override_id: string
company_id: string
device_id: string
imei_primary: string
field_changed: 'grade' | 'colour'
previous_value: string
new_value: string
reason_code: OverrideReasonCode
notes?: string
changed_by: string
changed_by_name: string
changed_at: string
```

**OverrideReasonCode enum:**
`GRADE_DISCREPANCY_QC | POST_REPAIR_UPGRADE | POST_REPAIR_DOWNGRADE | COLOUR_MISMATCH | CUSTOMER_RETURN_CONDITION | OTHER`

---

**`DeviceVariant`** (`deviceVariants[]` — 15 seed records)
```
variant_id: string          (e.g. VAR-001)
company_id: string
make: string
model: string
storage: string
colour: string
grade: string
sku_code: string            (auto-generated e.g. APL-IP14P-256-BLK-A)
is_active: boolean
created_at: string
created_by: string
```

### 5.2 Commercial / Financial

**`Order`** (`orders[]` — 5 seed records)
```
order_id: string            (e.g. ORD-BM-44221)
company_id: string
marketplace_id: string
external_order_ref: string
customer_id?: string
customer_name?: string
order_date: string
delivery_country: string    (ISO 2-letter)
is_export: boolean
total_sale_value: number
total_net_value: number
vat_code_applied: VatCode
vat_amount: number
vat_tax_point_date: string  (always = order_date)
order_status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
marketplace_name?: string
item_count?: number
```

---

**`VatRecord`** (`vatRecords[]` — 6 seed records)
```
vat_record_id: string
company_id: string
linked_entity_type: 'Order' | 'Purchase Batch' | 'OPR Batch' | 'Fintech Transaction'
linked_entity_id: string
vat_code: VatCode
tax_point_date: string
gross_amount: number
net_amount: number
vat_amount: number
margin_amount?: number
box_1_amount: number
box_2_amount: number
box_4_amount: number
box_6_amount: number
box_7_amount: number
vat_period_id?: string
override_applied: boolean
override_reason?: string
override_by?: string
```

---

**`VatPeriod`** (`vatPeriods[]` — 2 seed records: VP2026-Q1 LOCKED, VP2026-Q2 OPEN)
```
vat_period_id: string
company_id: string
period_start: string
period_end: string
status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'CLOSED' | 'AMENDED'
box_1 through box_9: number
submitted_at?: string
submitted_by?: string
```

---

**`FintechAdvance`** (`fintechAdvances[]` — 2 seed records)
```
advance_id: string
company_id: string
order_id: string
marketplace: string
gross_sale_value: number
advance_amount: number      (gross × 80%)
fintech_fee: number         (advance × 1.95%)
net_advance_received: number
advance_date: string
settlement_date?: string
status: 'PENDING' | 'ADVANCED' | 'SETTLED' | 'RECONCILED'
vat_record_id: null         (typed as null — always null in seed data)
```

---

**`MTDVatReturn`** (`mtdVatReturns[]` — 2 seed records: MTD-2026-Q1 ACCEPTED, MTD-2026-Q2 DRAFT)
```
return_id: string
company_id: string
vat_period_id: string
period_start/end: string
period_key: string          (e.g. 26AA)
status: MTDSubmissionStatus
box_1 through box_9: number
prepared_by/at, reviewed_by/at, approved_by/at, submitted_at: string?
hmrc_receipt_id/correlation_id/processing_date: string?
validation_errors: string[]
validation_warnings: string[]
finalised: boolean
payment_due_date/amount/reference: string?/number?
```

**MTDSubmissionStatus enum:**
`DRAFT | REVIEW_PENDING | MANAGER_APPROVED | SUBMITTED | ACCEPTED | REJECTED | AMENDED`

### 5.3 Supplier Chain

**`Supplier`** (`suppliers[]` — 4 seed records)
```
supplier_id: string         (e.g. SUP001)
company_id: string
supplier_code: string       (e.g. TECH-01)
name: string
vat_number?: string
country: string             (ISO 2-letter)
contact_email?: string
default_vat_code: VatCode
total_purchases?: number
is_active: boolean
created_at/updated_at: string?
updated_by?: string
```

Seed suppliers: TechSource Ltd (GB, active), Mobile Wholesale EU (DE, active), PhoneFlip Direct (GB, active), Horizon Devices (US, inactive)

---

**`SupplierMetric`** (computed by `getSupplierAnalytics()` — 4 records, hardcoded)
```
supplier_id, name, country, vat_number, is_active
total_purchases, batch_count, device_count, avg_cost_per_device
qc_pass_rate (%), defect_count, return_count, locked_device_count
repair_triggered_count, repair_cost_total
opr_batch_count, opr_device_count, opr_risk_value
units_sold, gross_revenue, net_profit, avg_margin_percent
best_device, worst_device
risk_score (0-100), risk_label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
```

### 5.4 Customer Risk

**`SupportTicket`** (`supportTickets[]` — 3 seed records)
```
ticket_id: string
company_id: string
order_id?: string
device_id?: string
customer_name/email: string
marketplace: string
subject: string
status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'RESOLVED' | 'ESCALATED'
priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
category: 'GENERAL' | 'RETURN' | 'INR' | 'FAULT' | 'REFUND' | 'CARRIER'
created_at/updated_at: string
assigned_to?: string
rma_id?: string
ai_draft?: string
```

---

**`CourierInvestigation`** (`courierInvestigations[]` — 3 seed records)
```
investigation_id: string
company_id: string
order_id/ticket_id/device_id/imei: string?
event_type: CourierEventType
courier/tracking_number: string
dispatch_date/expected_delivery_date: string
last_tracking_event/date: string
customer_name/email/marketplace: string
sale_value/claimed_amount/recovery_amount: number
status: CourierStatus
carrier_reference?: string
opened_at/resolved_at: string?
assigned_to?: string
notes?: string
evidence_items: EvidenceItem[]
timeline: InvestigationEvent[]
```

**CourierEventType:** `INR | DAMAGED | LOST_IN_TRANSIT | WRONG_ITEM | LATE_DELIVERY`
**CourierStatus (11 values):** `OPEN | SUBMITTED_TO_CARRIER | UNDER_INVESTIGATION | EVIDENCE_REQUIRED | CLAIM_SUBMITTED | CLAIM_APPROVED | CLAIM_REJECTED | ESCALATED | RESOLVED_LOSS | RESOLVED_FOUND | CLOSED`

---

**`RMARecord`** (`rmaRecords[]` — 3 seed records)
```
rma_id: string
company_id: string
order_id/ticket_id/device_id: string?
imei_sold/imei_returned: string
imei_match: boolean | null
customer_name/email/marketplace: string
return_reason/return_category: string
sale_value/refund_amount: number
status: RMAStatus
resolution: RMAResolution
authorised_by/at/received_at/qc_id: string?
return_label_tracking/marketplace_case_ref: string?
opened_at/closed_at: string?
notes?: string
timeline: RMAEvent[]
```

**RMAStatus (12 values):** `REQUESTED | AUTHORISED | IN_TRANSIT_BACK | RECEIVED | RETURN_QC_PENDING | QC_PASS_NO_FAULT | QC_FAIL_FAULT_CONFIRMED | IMEI_MISMATCH | REFUND_APPROVED | REPLACEMENT_DISPATCHED | CLOSED_NO_ACTION | CLOSED`
**RMAResolution:** `FULL_REFUND | PARTIAL_REFUND | REPLACEMENT | RETURN_TO_CUSTOMER | SCRAPPED | RESTOCKED | PENDING`

### 5.5 P&L and Repairs

**`UnitPnL`** (`unitPnLRecords[]` — 7 seed records)
```
device_id/imei/make/model/storage/grade: string
order_id/marketplace/sale_date: string?
gross_sale/vat_on_sale/net_revenue: number
purchase_cost/opr_uplift/marketplace_fee/fintech_fee/shipping_cost/repair_cost: number
total_costs: number
recovery_amount: number
net_profit/margin_percent: number
status: 'SOLD' | 'IN_STOCK' | 'IN_OPR' | 'SCRAPPED'
```

---

**`RepairJob`** (`repairJobs[]` — 4 seed records)
```
repair_id: string           (e.g. REP-2026-001)
company_id: string
device_id/imei/make/model/storage: string
grade_before/grade_after?: string
repair_type: RepairType
repair_description: string
trigger: 'INTAKE_QC_FAIL' | 'RETURN_QC_FAIL' | 'CUSTOMER_COMPLAINT' | 'COSMETIC_UPGRADE' | 'MANUAL'
source_rma_id/source_qc_id?: string
vendor_id/vendor_name?: string
is_internal: boolean
quote_amount/actual_cost/parts_cost/labour_cost?: number
status: RepairStatus
outcome: RepairOutcome
created_at/started_at/completed_at?: string
post_repair_qc_id?: string
notes?: string
technician?: string
parts_used?: RepairPart[]
timeline: RepairEvent[]
```

**RepairType (11 values):** `SCREEN_REPLACEMENT | BATTERY_REPLACEMENT | CHARGING_PORT | CAMERA_REPAIR | BOARD_LEVEL | HOUSING_REPLACEMENT | WATER_DAMAGE | SOFTWARE_UNLOCK | DATA_WIPE | FULL_REFURBISHMENT | OTHER`
**RepairStatus (9 values):** `QUOTE_PENDING | QUOTE_APPROVED | QUOTE_REJECTED | IN_PROGRESS | AWAITING_PARTS | COMPLETED | FAILED | SCRAPPED | RETURNED_UNREPAIRED`
**RepairOutcome:** `PENDING | RESTORED_SAME_GRADE | UPGRADED_GRADE | DOWNGRADED_GRADE | ECONOMICALLY_UNVIABLE | SCRAPPED`

### 5.6 System / Audit / Notifications

**`AuditEntry`** (`auditLog[]` — 18 seed records)
```
audit_id: string
company_id: string
timestamp: string           (ISO datetime)
module: AuditModule
severity: AuditSeverity
actor/actor_role: string
action: string
entity_type/entity_id: string
before_state/after_state?: Record<string, unknown>
ip_address/session_id?: string
system_generated: boolean
notes?: string
```

**AuditModule (13 values):** `INVENTORY | QC | OPR | ORDERS | VAT | FINTECH | SUPPLIERS | SUPPORT | COURIER | RMA | REPAIRS | SYSTEM | AUTH`
**AuditSeverity:** `INFO | WARNING | CRITICAL | SECURITY`

---

**`Notification`** (`notifications[]` — 8 seed records)
```
notif_id: string
company_id: string
severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS'
category: NotifCategory
title/message: string
created_at: string
read: boolean
read_at?: string
action_url/action_label?: string
entity_type/entity_id?: string
auto_dismissed: boolean
expires_at?: string
```

**NotifCategory:** `OPR | VAT | RMA | COURIER | INVENTORY | REPAIR | MARKETPLACE | SYSTEM | SECURITY | FINANCE`

### 5.7 SaaS / Marketplace

**`Tenant`** (`tenants[]` — 5 seed records: TNT-001 through TNT-005)
```
tenant_id: string
company_name/company_number/vat_number: string
contact_email/phone?: string
address_line1/city/postcode/country: string
plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'TRIAL'
status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'TRIAL' | 'ONBOARDING'
subdomain: string
created_at/trial_ends_at/subscription_start/subscription_renewal: string?
monthly_fee: number
currency/billing_email: string
stripe_customer_id?: string
users: TenantUser[]
usage: TenantUsage
features: Record<string, boolean>
hmrc_vrn?: string
hmrc_mtd_authorised/xero_connected/quickbooks_connected: boolean
notes?: string
```

**TenantUser roles:** `ADMIN | MANAGER | WAREHOUSE | FINANCE | SUPPORT | READ_ONLY`

---

**`MarketplaceIntegration`** (`marketplaceIntegrations[]` — 4 seed records)
```
integration_id: string
company_id: string
marketplace_name/marketplace_code: string
logo_color: string          (hex)
status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'RATE_LIMITED' | 'PENDING_AUTH'
connected_at/last_sync_at: string?
last_sync_status: SyncStatus
last_sync_orders/last_sync_errors: number
total_orders_synced/pending_orders: number
api_quota_used/api_quota_limit: number
seller_id/store_name/region?: string
credentials_valid: boolean
credentials_expiry?: string
auto_vat_code/auto_drc_check/auto_export_detect: boolean
fee_percent/sync_interval_mins: number
webhook_url?: string
recent_errors: IntegrationError[]
sync_log: SyncLogEntry[]
```

Seed integrations: Amazon (CONNECTED), Back Market (CONNECTED), eBay (ERROR — token expired), Shopify (PENDING_AUTH)

### 5.8 VAT Code System

**`VatCode` type alias (8 values):**
`20S_SALES | 20S_PURCHASES | 20RC_PURCHASES | 0RCS_SALES | 0MARGIN_PURCHASES | 0MARGIN_SALES | 0EXPORT_SALES | NOVAT_PURCHASES`

**`VatCodeDefinition`** (8 records in `VAT_CODE_DEFINITIONS` map):
```
vat_code: VatCode
display_name: string
rate_percent: number
scope: 'SALES' | 'PURCHASES'
scheme: 'STANDARD' | 'REVERSE_CHARGE' | 'MARGIN' | 'EXPORT' | 'OUT_OF_SCOPE'
description: string
box_1_flag/box_2_flag/box_4_flag/box_6_flag/box_7_flag: boolean
```

### 5.9 Constants

| Constant | Value | Location |
|----------|-------|----------|
| `COMPANY_ID` | `'REFURBIQ_DEMO'` | `data-store.ts` line 18 |
| `DRC_THRESHOLD` | `5000` | `vat-engine.ts` line 82 |
| `DRC_LEGAL_TEXT` | Full HMRC reverse-charge footer text | `vat-engine.ts` line 83-84 |
| Fintech advance rate | `0.80` (80%) | `calculateFintechAdvance()` |
| Fintech fee rate | `0.0195` (1.95%) | `calculateFintechAdvance()` |
| Margin scheme VAT rate | `1/6` (~16.67%) | `calculateVat()` case `0MARGIN_SALES` |
| OPR import VAT rate | `0.20` (20%) | `calculateOPRUplift()` |
| OPR max days | `180` | Referenced in UI; not stored as named constant |

---

## 6. API & SERVICE INDEX

Base path: `/api` (mounted in `src/index.tsx`)
CORS: enabled on all routes via `api.use('*', cors())`

### Complete Endpoint Table

| Method | Path | Handler File | Description | Query Params |
|--------|------|-------------|-------------|--------------|
| GET | `/api/dashboard` | api.ts:31 | Basic dashboard stats | — |
| GET | `/api/dashboard/v2` | api.ts:447 | Enhanced: + repair stats, P&L, notifications, marketplace | — |
| GET | `/api/vat-codes` | api.ts:34 | All 8 VAT code definitions | — |
| POST | `/api/vat/evaluate` | api.ts:37 | Evaluate DRC threshold + calculate VAT | — |
| POST | `/api/vat/calculate` | api.ts:45 | Calculate VAT for given code + amount | — |
| POST | `/api/opr/calculate` | api.ts:51 | Calculate OPR uplift and import VAT | — |
| POST | `/api/fintech/calculate` | api.ts:62 | Calculate fintech advance | — |
| GET | `/api/suppliers` | api.ts:68 | List suppliers | `?active=true` |
| GET | `/api/suppliers/:id` | api.ts:73 | Supplier detail | — |
| POST | `/api/suppliers` | api.ts:522 | Create supplier | — |
| PATCH | `/api/suppliers/:id` | api.ts:541 | Update supplier | — |
| GET | `/api/purchase-batches` | api.ts:79 | List all purchase batches | — |
| GET | `/api/purchase-batches/:id` | api.ts:80 | Purchase batch detail | — |
| POST | `/api/purchase-batches` | api.ts:85 | Create purchase batch | — |
| POST | `/api/purchase-batches/:id/imei-import` | api.ts:112 | Import IMEI CSV rows → devices | — |
| GET | `/api/devices` | api.ts:154 | List devices | `?status=`, `?grade=`, `?make=` |
| GET | `/api/devices/:id` | api.ts:162 | Device + QC records | — |
| GET | `/api/devices/:id/overrides` | api.ts:619 | Override history for device | — |
| PATCH | `/api/devices/:id/override` | api.ts:625 | Grade or colour override (single) | — |
| POST | `/api/devices/batch-override` | api.ts:652 | Bulk attribute override | — |
| GET | `/api/opr-batches` | api.ts:170 | List OPR batches | — |
| GET | `/api/opr-batches/:id` | api.ts:171 | OPR batch detail | — |
| GET | `/api/orders` | api.ts:177 | List orders | `?status=`, `?marketplace=` |
| GET | `/api/orders/:id` | api.ts:184 | Order + VAT record + fintech advance | — |
| GET | `/api/vat-records` | api.ts:193 | List all VAT records | — |
| GET | `/api/vat-records/period/:periodId` | api.ts:194 | VAT records for period + aggregate | — |
| GET | `/api/vat-periods` | api.ts:201 | List VAT periods | — |
| GET | `/api/vat-periods/:id` | api.ts:202 | VAT period detail | — |
| GET | `/api/fintech` | api.ts:208 | List fintech advances | — |
| GET | `/api/qc` | api.ts:211 | List QC records | — |
| GET | `/api/qc/pending` | api.ts:212 | Devices awaiting QC | — |
| GET | `/api/tickets` | api.ts:218 | List tickets | `?status=`, `?priority=` |
| GET | `/api/tickets/:id` | api.ts:225 | Ticket detail | — |
| GET | `/api/investigations` | api.ts:231 | List courier investigations | `?status=`, `?event_type=` |
| GET | `/api/investigations/:id` | api.ts:238 | Investigation detail | — |
| GET | `/api/investigations/stats/summary` | api.ts:242 | Investigation stats | — |
| GET | `/api/rma` | api.ts:251 | List RMA records | `?status=` |
| GET | `/api/rma/:id` | api.ts:257 | RMA detail | — |
| GET | `/api/rma/stats/summary` | api.ts:261 | RMA stats | — |
| GET | `/api/pnl/units` | api.ts:270 | List unit P&L records | `?status=` |
| GET | `/api/pnl/summary` | api.ts:276 | Profitability summary | — |
| GET | `/api/pnl/units/:device_id` | api.ts:277 | Per-device P&L | — |
| GET | `/api/repairs` | api.ts:283 | List repair jobs | `?status=`, `?outcome=`, `?device_id=` |
| GET | `/api/repairs/stats/summary` | api.ts:291 | Repair stats | — |
| GET | `/api/repairs/:id` | api.ts:292 | Repair job detail | — |
| GET | `/api/supplier-analytics` | api.ts:298 | Full supplier analytics | — |
| GET | `/api/supplier-analytics/:id` | api.ts:299 | Per-supplier metric | — |
| GET | `/api/audit-log` | api.ts:306 | Filterable audit log | `?module=`, `?severity=`, `?actor=`, `?limit=` |
| GET | `/api/audit-log/:id` | api.ts:317 | Audit entry detail | — |
| GET | `/api/audit-log/stats/summary` | api.ts:321 | Audit stats | — |
| GET | `/api/mtd-returns` | api.ts:335 | List MTD returns | — |
| GET | `/api/mtd-returns/:id` | api.ts:336 | MTD return detail | — |
| GET | `/api/mtd-returns/:id/validate` | api.ts:340 | Validate MTD return | — |
| POST | `/api/mtd-returns/:id/submit` | api.ts:352 | Submit MTD return (simulated) | — |
| GET | `/api/tenants` | api.ts:368 | List tenants | — |
| GET | `/api/tenants/summary` | api.ts:369 | Tenant SaaS summary | — |
| GET | `/api/tenants/:id` | api.ts:370 | Tenant detail | — |
| PATCH | `/api/tenants/:id/status` | api.ts:374 | Update tenant status | — |
| GET | `/api/tenants/:id/usage` | api.ts:381 | Tenant usage detail | — |
| GET | `/api/marketplace` | api.ts:387 | List marketplace integrations | — |
| GET | `/api/marketplace/integrations` | api.ts:388 | List marketplace integrations (duplicate path) | — |
| GET | `/api/marketplace/stats/summary` | api.ts:389 | Marketplace stats | — |
| GET | `/api/marketplace/:id` | api.ts:398 | Integration detail | — |
| POST | `/api/marketplace/:id/reconnect` | api.ts:402 | Reconnect integration (simulated) | — |
| POST | `/api/marketplace/:id/sync` | api.ts:414 | Trigger sync (simulated) | — |
| GET | `/api/notifications` | api.ts:427 | List notifications | `?unread_only=true` |
| GET | `/api/notifications/summary` | api.ts:433 | Notification summary | — |
| PATCH | `/api/notifications/:id/read` | api.ts:434 | Mark notification read | — |
| POST | `/api/notifications/mark-all-read` | api.ts:441 | Mark all notifications read | — |
| POST | `/api/scanner/lookup` | api.ts:460 | IMEI/barcode lookup | — |
| POST | `/api/scanner/intake` | api.ts:491 | Create device from scan | — |
| GET | `/api/device-variants` | api.ts:562 | List device variants | `?make=`, `?model=` |
| GET | `/api/device-variants/makes` | api.ts:570 | Unique makes list | — |
| GET | `/api/device-variants/models` | api.ts:575 | Unique models list | `?make=` |
| POST | `/api/device-variants` | api.ts:583 | Create device variant | — |
| POST | `/api/device-variants/import` | api.ts:597 | Bulk import device variants | — |
| GET | `/api/updates` | api.ts:834 | List project updates (changelog) | `?type=`, `?phase=`, `?limit=`, `?offset=` |
| GET | `/api/updates/summary` | api.ts:847 | Update tracker summary | — |
| POST | `/api/updates` | api.ts:860 | Create manual update entry | — |

**Total endpoints: 67** (counting `/api/marketplace` and `/api/marketplace/integrations` as separate)

### External Services Called at Runtime
- **None.** All data is served from in-memory arrays. No outbound HTTP calls exist in `api.ts` or `vat-engine.ts`.

### Frontend HTTP Client
- **Axios 1.6.0** (CDN: `cdn.jsdelivr.net`) — used in all page render functions via `axios.get()` and `axios.post()`
- All calls target relative paths (`/api/...`) — no absolute URLs in frontend

### Non-API Routes (src/index.tsx)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/static/*` | Serves `public/static/` via Hono `serveStatic` |
| GET | `/tracker` | Redirects to `/static/tracker.html` |
| GET | `*` | Returns `getIndexHTML()` — entire SPA |

---

## 7. UI INVENTORY

### 7.1 SPA Architecture

- **Type:** Single-page application (SPA)
- **Delivery mechanism:** Entire ~5,600-line HTML/CSS/JS string returned from `app.get('*')` via `getIndexHTML()` in `src/index.tsx`
- **Template literal rules:** backticks escaped as `` \` ``; `${expr}` escaped as `\${expr}` in static HTML strings; dynamic expressions use unescaped `${expr}`
- **Framework:** None. Vanilla JavaScript with `window._*` global state variables
- **Styling:** Tailwind CSS via CDN; CSS custom properties for theming; inline styles where needed
- **No client-side router:** page transitions via `navigateTo(page)` which clears and re-renders `#content`

### 7.2 CDN-Loaded Frontend Libraries

| Library | Version | CDN URL |
|---------|---------|---------|
| Tailwind CSS | (CDN latest) | `https://cdn.tailwindcss.com` |
| Font Awesome | 6.4.0 | `cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css` |
| Chart.js | 4.4.0 | `cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js` |
| Axios | 1.6.0 | `cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js` |

### 7.3 Theming System

- **Dark mode:** default; `body` has no `light-mode` class
- **Light mode:** `body.light-mode` class toggled by `toggleTheme()`
- **CSS custom properties used:**
  - `--bg-body`, `--bg-sidebar`, `--bg-card`
  - `--text-primary`, `--text-secondary`
  - `--border-color`, `--border-light`
  - `--hover-bg`
- **Persistence:** `localStorage.theme` = `'light'` or `'dark'`

### 7.4 Global State Variables (`window._*`)

All 27 identified global state variables, set within page render functions:

| Variable | Set by | Data type | Purpose |
|----------|--------|-----------|---------|
| `_allDevices` | `renderInventory` | Array | Cached device list for filtering |
| `_allInvestigations` | `renderCourier` | Array | Cached investigation list |
| `_allOrders` | `renderOrders` | Array | Cached order list |
| `_allPnL` | `renderProfitability` | Array | Cached unit P&L list |
| `_allRMA` | `renderRMA` | Array | Cached RMA list |
| `_allRepairs` | `renderRepairs` | Array | Cached repair job list |
| `_allTickets` | `renderSupport` | Array | Cached ticket list |
| `_auditEntries` | `renderAuditLog` | Array | Cached audit log entries |
| `_bulkColours` | `renderInventory` | Array | Available colours for bulk override |
| `_bulkGrades` | `renderInventory` | Array | Available grades for bulk override |
| `_csvImportFilename` | `renderInventory` | String | Filename of uploaded IMEI CSV |
| `_csvImportRows` | `renderInventory` | Array | Parsed rows from IMEI CSV |
| `_importCsvRows` | `renderDeviceVariantsInto` | Array | Parsed rows from variants CSV |
| `_integrations` | `renderMarketplace` | Array | Cached marketplace integrations |
| `_mtdReturns` | `renderMTD` | Array | Cached MTD return list |
| `_pnlSummary` | `renderProfitability` | Object | Profitability summary object |
| `_qcPending` | `renderQC` | Array | Devices awaiting QC |
| `_qcRecs` | `renderQC` | Array | QC history records |
| `_suppData` | `renderSuppliers` | Object | `{suppliers[], batches[]}` |
| `_supplierMetrics` | `renderSupplierAnalytics` | Array | Supplier analytics metrics |
| `_tenants` | `renderTenants` | Array | Cached tenant list |
| `_variantMakes` | `renderDeviceVariantsInto` | Array | Available makes |
| `_variantsData` | `renderDeviceVariantsInto` | Array | All device variants |
| `_variantsSortField` | `renderDeviceVariantsInto` | String | Current sort field for variants table |
| `_vatCodes` | `renderVAT` | Array | VAT code definitions |
| `_vatCurrentPeriod` | `renderVAT` | Object | Current open VAT period |
| `_vatPeriods` | `renderVAT` | Array | All VAT periods |
| `_vatRecords` | `renderVAT` | Array | All VAT records |

### 7.5 Layout Structure

```
<body>
  <div id="app-wrapper">                   ← flex row
    <nav id="sidebar">                     ← collapsible; 5 nav sections
      <header>                             ← logo + company name + VAT
      <section class="nav-section">×5     ← Core Ops, Finance, Customer/Risk, Analytics, Compliance/System
    </nav>

    <div id="main-content">               ← flex column; takes remaining width
      <header id="topbar">               ← hamburger, page title/subtitle, notifications bell, theme toggle
      <div id="content">                 ← page render target; cleared on each navigateTo()
    </div>
  </div>

  <div id="modal-overlay">               ← fixed overlay; hidden by default
    <div id="modal-panel">
      <div id="modal-title">
      <div id="modal-body">
```

### 7.6 Sidebar Navigation Sections

| Section | Items |
|---------|-------|
| Core Operations | Dashboard, Inventory & Goods-In, Quality Control, OPR Engine, Orders |
| Finance & Compliance | VAT Engine, Fintech Advances, Suppliers & Batches, IMEI Scanner |
| Customer & Risk | Support & Tickets, Courier & INR, Returns & RMA |
| Analytics | Profitability & P&L, Repairs & Refurbishment, Supplier Analytics |
| Compliance & System | HMRC MTD Returns, Audit Log, Marketplace Hub, Tenant Management, Admin & Settings |

### 7.7 Sidebar Badge Values (Hardcoded in HTML)

| Badge element | Hardcoded value | Expected dynamic source |
|---------------|----------------|------------------------|
| Notification count (topbar) | `4` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Inventory badge | `8` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| QC badge | `2` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Support badge | `3` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Repairs badge | `4` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| OPR badge | `!` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| RMA badge | `!` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Tenants badge | `5` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| MTD badge | `1` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Courier badge | `2` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Marketplace badge (`id="mkt-badge"`) | `!` | UNVERIFIED OR INSUFFICIENT CONTEXT |

### 7.8 Hardcoded UI Strings

| Location | Value |
|----------|-------|
| Sidebar tenant name | `"RefurbIQ Demo Ltd"` |
| Sidebar VAT number | `"GB369979995"` |
| Version label | `"v2.4.0 · Phase 4 Build"` |
| Dashboard IMEI mismatch count | `1` (hardcoded, not from API) |
| Dashboard locked device count | `1` (hardcoded, not from API) |
| Dashboard device chart data | `[2, 2, 1, 2, 1]` (hardcoded, not from API) |
| Profitability stat (prod-ready) | `42%` (hardcoded in tracker.html) |
| Phases complete (tracker.html) | `4 / 6` (hardcoded) |

### 7.9 Chart.js Usage

| Chart ID | Type | Data Source | Where Rendered |
|----------|------|-------------|----------------|
| `deviceChart` | doughnut | Hardcoded `[2,2,1,2,1]` | `renderDeviceChart()` in dashboard |
| `mktChart` | bar | `pnlSummary.by_marketplace` from `/api/pnl/summary` | `renderMktChart()` in dashboard |
| `vatChart` | bar | Hardcoded box values from Q2 period | `renderVatChart()` in dashboard |
| *(supplier charts)* | UNVERIFIED OR INSUFFICIENT CONTEXT | `renderSupplierAnalytics` | UNVERIFIED OR INSUFFICIENT CONTEXT |
| *(P&L make chart)* | UNVERIFIED OR INSUFFICIENT CONTEXT | `renderProfitability` | UNVERIFIED OR INSUFFICIENT CONTEXT |

### 7.10 Development Tracker SPA (`public/static/tracker.html`)

- **Access:** via `/tracker` → redirects to `/static/tracker.html`
- **Type:** Standalone HTML file; not part of the main SPA; has its own CDN imports
- **CDN libraries:** Tailwind CSS, Font Awesome 6.4.0, Chart.js 4.4.0, Axios 1.6.0 (same versions as main SPA)
- **Theme:** Dark-only (class `dark` on `<html>`)
- **Data source:** Reads from `/api/updates`, `/api/updates/summary`
- **Features:**
  - KPI stat cards: total updates, phases complete (hardcoded `4/6`), prod-ready (hardcoded `42%`), last activity
  - Build phase progress bars (hardcoded completion percentages)
  - Update timeline with filter chips (by type: feature, fix, docs, init, plan; by phase)
  - Log Update modal that POSTs to `/api/updates`
  - Auto-refresh toggle (30-second interval)
  - Manual refresh button
  - Live indicator with pulse animation
  - Entry slide-in animation

---

## 8. WORKFLOW INVENTORY

Workflows derived from `docs/WORKFLOW_GOODS_IN_INVENTORY_OPR.md`, `src/routes/api.ts`, and `src/index.tsx`.

### 8.1 Goods-In Workflow

```
Pre-check: GET /api/suppliers?active=true → supplier must exist and be active

Step 1 — Open Import Modal
  showImportModal() [async]
  → fetches suppliers on every open
  → renders: supplier dropdown, invoice ref, batch date, VAT code (auto-populated)

Step 2 — Prepare IMEI CSV
  parseImportCsvFile() [called on file input change]
  → FileReader API reads file
  → validates: IMEI regex ^[0-9]{14,16}$, make/model not blank, intra-file duplicates
  → displays preview table: green (valid) / red (invalid rows)

Step 3 — Submit
  submitImportBatch()
  → POST /api/purchase-batches → creates batch (status: DRAFT) → returns batch_id
  → POST /api/purchase-batches/:id/imei-import → for each valid row:
       - checks global duplicate IMEI across all devices
       - creates Device: current_status=INTAKE_QC_PENDING, custody=WAREHOUSE
       - links to batch and supplier
     → updates batch.device_count, batch.status=RECEIVED
  → displays results: N created / N duplicates / N errors

Step 4 — Devices born as INTAKE_QC_PENDING
```

**Missing backend step (STUB):** QC submission (`POST /api/qc` does not exist)

---

### 8.2 Quality Control Workflow

```
Step 1 — QC Queue
  renderQC() → GET /api/qc/pending
  → returns devices where current_status IN (INTAKE_QC_PENDING, RETURN_QC_PENDING, POST_REPAIR_QC)

Step 2 — Begin QC
  openQCForm(deviceId, imei, name)
  → renders form: grade (A/B/C/D), lock check (CLEAR/LOCKED), 8 functional tests, cosmetic notes

Step 3 — Lock Check (Non-Negotiable Control #2)
  if lock = LOCKED → device status → LOCKED; all sale paths blocked [STUB — no API call]
  if lock = CLEAR → proceed to functional tests

Step 4 — Submit QC [STUB — fires alert(), no POST /api/qc]
  Intended: creates QCRecord, transitions device status
    PASS → AVAILABLE
    FAIL → re-queue or SCRAPPED
    LOCKED_BLOCKED → LOCKED

Step 5 — Override (post-QC)
  showDeviceOverridePanel(deviceId, field, currentValue, purchaseVatCode)
  → requires: field (grade|colour), new value, reason_code, notes (≥20 chars if reason=OTHER)
  → PATCH /api/devices/:id/override → mutates device, creates audit entry
```

---

### 8.3 OPR Workflow

```
Pre-requisite: device in AVAILABLE status, OPR authorisation on file

Step 1 — Create OPR Batch [STUB]
  showNewOPRModal()
  → form: repair vendor, export date, processing invoice value, export MRN
  → fires alert(); no POST /api/opr-batches

Step 2 — 180-Day Timer
  renderOPR() → GET /api/opr-batches
  → displays countdown with colour thresholds (green >30d, amber 14-30d, red ≤14d)

Step 3 — Uplift Calculation [REAL]
  showOPRCalculator() → calcOPR()
  → POST /api/opr/calculate
  → returns upliftPerUnit, importVatOnUplift, totalUplift

Step 4 — Mark Reimported [STUB]
  → fires alert('Mark reimported — C88 reference required')
  → no PATCH /api/opr-batches/:id

Step 5 — Document Vault [STUB]
  viewOPRDocs(batchId)
  → UI only; no R2 storage; download/upload buttons fire alert()
```

---

### 8.4 VAT Evaluation Workflow

```
On order creation (or VAT calculator use):

Step 1 — POST /api/vat/evaluate
  body: { netValue, deliveryCountry, vatCode }

Step 2 — evaluateDRCThreshold()
  if deliveryCountry != GB/UK → override to 0EXPORT_SALES (absolute precedence)
  if vatCode = 20S_SALES AND netValue >= £5,000 → override to 0RCS_SALES
  else → keep original code

Step 3 — calculateVat()
  switch (vatCode):
    20S_SALES       → netAmount=gross/1.2; vatAmount=gross-net; box1=vat; box6=net
    20S_PURCHASES   → netAmount=gross/1.2; vatAmount=gross-net; box4=vat; box7=net
    20RC_PURCHASES  → netAmount=gross; vatAmount=gross×20%; box1=vat; box4=vat; box7=net  [atomic]
    0RCS_SALES      → netAmount=gross; vatAmount=0; box6=net
    0MARGIN_PURCHASES → netAmount=gross; vatAmount=0; box7=net
    0MARGIN_SALES   → margin=gross-cost; vatAmount=margin×(1/6); box1=vat; box6=gross
    0EXPORT_SALES   → netAmount=gross; vatAmount=0; box6=net
    NOVAT_PURCHASES → netAmount=gross; vatAmount=0; no box impact

Step 4 — Append DRC legal text if result code = 0RCS_SALES
```

---

### 8.5 Returns (RMA) Workflow

```
Step 1 — Return requested (customer via marketplace)
  System creates RMARecord (status: REQUESTED)

Step 2 — Authorise Return
  manager@refurbiq.co.uk authorises → status: AUTHORISED
  Return label issued (tracking number recorded)

Step 3 — Device Received
  ops@refurbiq.co.uk scans IMEI on receipt
  System compares imei_returned vs imei_sold
  
  if IMEI MATCH → status: RETURN_QC_PENDING
  if IMEI MISMATCH → status: IMEI_MISMATCH
                  → ALL resolution paths FROZEN
                  → audit entry: severity=CRITICAL
                  → notification: severity=CRITICAL [STUB — manager escalation fires alert()]

Step 4 — Return QC [STUB]
  fires alert(); no backend call

Step 5 — Resolution (all STUBs)
  Refund approved → alert()
  Partial refund → alert()
  Replacement dispatched → alert()
  Scrap device → alert()
```

---

### 8.6 Fintech Advance Workflow

```
calculateFintechAdvance(grossSaleValue):
  advanceAmount = grossSaleValue × 0.80
  fintechFee = advanceAmount × 0.0195
  netAdvanceReceived = advanceAmount - fintechFee

Tax point rule (Non-Negotiable Control #5):
  VAT tax point = sale date (order_date)
  NOT the advance date
  FintechAdvance.vat_record_id = null (advance is not a VAT event)
```

---

### 8.7 MTD VAT Return Workflow

```
Step 1 — Period ends → MTD return in DRAFT status

Step 2 — Validate
  GET /api/mtd-returns/:id/validate
  Checks:
  - abs(box1 + box2 - box3) > 0.01 → error
  - abs(box3 - box4 - box5) > 0.01 → error
  - period not yet closed → error (from validation_errors seed)
  - box4 = £0 → warning
  - box7 = £0 → warning
  - DRC orders exist → warning

Step 3 — Submit (simulated)
  POST /api/mtd-returns/:id/submit
  if already ACCEPTED → 400 error
  if validation errors → 422 error
  else:
    r.status = 'ACCEPTED'
    r.submitted_at = now
    r.hmrc_receipt_id = 'HMRC-' + random hex
    r.hmrc_processing_date = today
  → returns receipt_id and processing_date
  
Note: No real HMRC MTD API connection. This is simulation only.
```

---

### 8.8 IMEI Scanner Workflow

```
Step 1 — Input IMEI or barcode
  renderScanner() → POST /api/scanner/lookup

Step 2 — Lookup logic:
  Check devices array by imei_primary, imei_secondary, imei, imei_2
  → if found: return device + action (READY_TO_SHIP | NEEDS_QC | VIEW_DEVICE)
  
  Check purchaseBatches by purchase_batch_id or batch_code
  → if found: return batch + action VIEW_BATCH
  
  Check IMEI prefix (first 8 digits) against 4 hardcoded entries:
    '35467890' → Apple iPhone 14
    '35998800' → Samsung Galaxy S24
    '86440012' → Google Pixel 8
    '35123456' → Apple iPhone 15
  → return inferred make/model + action CREATE_DEVICE

Step 3 — If not found: show create-intake form
  POST /api/scanner/intake → creates device with status INTAKE_QC_PENDING
```

---

### 8.9 Supplier Analytics Workflow

```
renderSupplierAnalytics() → GET /api/supplier-analytics
  → returns getSupplierAnalytics() which returns hardcoded SupplierMetric[]
  (not computed from live devices/batches/repairs data)
  
Metric fields computed at hardcode time:
  qc_pass_rate, defect_count, return_count, risk_score, risk_label
  risk_label thresholds: UNVERIFIED OR INSUFFICIENT CONTEXT (not defined in code)
```

---

### 8.10 Marketplace Sync Workflow

```
renderMarketplace() → GET /api/marketplace
  → displays 4 integrations with status, sync log, errors

POST /api/marketplace/:id/sync (simulated):
  creates new SyncLogEntry with random count (0-4), 400-1000ms duration
  unshifts to m.sync_log
  updates last_sync_at, last_sync_status='SYNCED'

POST /api/marketplace/:id/reconnect (simulated):
  sets status='CONNECTED', credentials_valid=true
  hardcodes credentials_expiry='2027-04-11'
  marks all recent_errors as resolved
  
No real OAuth flows. No real API calls to external marketplaces.
```

---

## 9. DEPENDENCY GRAPH (TEXTUAL)

### 9.1 Runtime npm Dependencies

```
hono@^4.12.12
  └── Used in:
      src/index.tsx     → Hono (app), cors (via api.ts), serveStatic
      src/routes/api.ts → Hono (api sub-app), cors
```

### 9.2 Build/Dev npm Dependencies

```
@hono/vite-build@^1.2.0
  └── Used in: vite.config.ts → build plugin for Cloudflare Pages output

@hono/vite-dev-server@^0.18.2
  └── Used in: vite.config.ts → dev server plugin

vite@^6.3.5
  └── Build tool; configured in vite.config.ts; target=es2022; minify=false

wrangler@^4.4.0
  └── CLI: local dev (wrangler pages dev dist), deploy, d1/kv/r2 management
  └── Used in: ecosystem.config.cjs args; package.json scripts

typescript@(implicit — in wrangler/vite peer deps)
  └── tsconfig.json: ESNext, Bundler resolution, strict=true, jsx=react-jsx, jsxImportSource=hono/jsx
```

### 9.3 Frontend CDN Dependencies (Runtime, Browser-side)

```
https://cdn.tailwindcss.com
  └── Used in: getIndexHTML() <script> tag in index.tsx
  └── Used in: public/static/tracker.html

https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css
  └── Used in: getIndexHTML() <link> in index.tsx
  └── Used in: public/static/tracker.html

https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
  └── Used in: getIndexHTML() <script> in index.tsx
  └── Used in: public/static/tracker.html
  └── API: window.Chart — doughnut, bar chart types

https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js
  └── Used in: getIndexHTML() <script> in index.tsx
  └── Used in: public/static/tracker.html
  └── API: axios.get(), axios.post() — all /api/* calls
```

### 9.4 Internal Module Import Graph

```
src/index.tsx
  └── imports: hono (Hono)
  └── imports: hono/cloudflare-workers (serveStatic)
  └── imports: ./routes/api.js (api Hono sub-app)

src/routes/api.ts
  └── imports: hono (Hono)
  └── imports: hono/cors (cors)
  └── imports: ../lib/data-store.js
      (suppliers, purchaseBatches, devices, oprBatches, orders, vatRecords,
       vatPeriods, fintechAdvances, qcRecords, supportTickets, getDashboardStats,
       courierInvestigations, rmaRecords, unitPnLRecords, getProfitabilitySummary,
       repairJobs, getRepairStats, getSupplierAnalytics, auditLog, mtdVatReturns,
       tenants, getTenantSaaSSummary, marketplaceIntegrations, notifications,
       getNotificationSummary, deviceVariants, deviceAttributeOverrides, generateSkuCode)
  └── imports: ../lib/vat-engine.js
      (VAT_CODE_DEFINITIONS, evaluateDRCThreshold, calculateVat,
       calculateOPRUplift, calculateFintechAdvance, aggregateVatPeriod)

src/lib/data-store.ts
  └── imports: ../types/index.js (type imports only)
      (Device, PurchaseBatch, OPRBatch, Order, VatRecord, VatPeriod,
       FintechAdvance, Supplier, QCRecord, SupportTicket, DashboardStats,
       CourierInvestigation, RMARecord, UnitPnL, ProfitabilitySummary,
       RepairJob, RepairStats, SupplierMetric, SupplierAnalyticsSummary,
       AuditEntry, MTDVatReturn, Tenant, TenantSaaSSummary,
       MarketplaceIntegration, Notification)

src/lib/vat-engine.ts
  └── imports: ../types/index.js (type imports only)
      (VatCode, VatCodeDefinition, VatRecord)

src/types/index.ts
  └── No imports

src/renderer.tsx
  └── imports: hono/jsx-renderer (jsxRenderer)
  └── NOT imported by any other file — orphaned module
```

### 9.5 File Serving Chain

```
HTTP Request → Cloudflare Pages / Workers Edge
  → dist/_worker.js (compiled from src/index.tsx via Vite + @hono/vite-build)
      ↓
  /static/* → serveStatic({ root: './' }) → public/static/ directory
  /tracker  → c.redirect('/static/tracker.html')
  /api/*    → api Hono sub-app → src/routes/api.ts (compiled inline)
  *         → c.html(getIndexHTML()) → full SPA string
```

### 9.6 Build Pipeline

```
npm run build
  → vite build
      → vite.config.ts plugin: @hono/vite-build/cloudflare-pages
      → entry: src/index.tsx
      → target: es2022
      → minify: false
      → output: dist/
          dist/_worker.js (489.47 kB)
          dist/_routes.json ({"version":1,"include":["/*"],"exclude":["/static/*"]})

npm run dev (local machine only, not used in sandbox)
  → vite (dev server mode)

Local sandbox development:
  → npm run build (first time or after changes)
  → pm2 start ecosystem.config.cjs
      → npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

---

## 10. CONFIGURATION INDEX

### 10.1 `package.json`

| Key | Value |
|-----|-------|
| `name` | `"webapp"` |
| `version` | UNVERIFIED OR INSUFFICIENT CONTEXT (not recorded in extraction) |
| `type` | `"module"` |
| `scripts.dev` | `vite` |
| `scripts.build` | `vite build` |
| `scripts.preview` | `wrangler pages dev` |
| `scripts.deploy` | `npm run build && wrangler pages deploy dist` |
| `scripts.cf-typegen` | `wrangler types --env-interface CloudflareBindings` |
| `dependencies` | `hono: ^4.12.12` |
| `devDependencies.@hono/vite-build` | `^1.2.0` |
| `devDependencies.@hono/vite-dev-server` | `^0.18.2` |
| `devDependencies.vite` | `^6.3.5` |
| `devDependencies.wrangler` | `^4.4.0` |

**Note:** Package name `webapp` differs from project name `refurbiq` used in README, ecosystem.config.cjs, and docs.

---

### 10.2 `wrangler.jsonc`

| Key | Value |
|-----|-------|
| `$schema` | `node_modules/wrangler/config-schema.json` |
| `name` | `"webapp"` |
| `compatibility_date` | `"2026-04-11"` |
| `pages_build_output_dir` | `"./dist"` |
| `compatibility_flags` | `["nodejs_compat"]` |
| `vars` | *(commented out)* |
| `kv_namespaces` | *(commented out)* |
| `r2_buckets` | *(commented out)* |
| `d1_databases` | *(commented out)* |
| `ai` | *(commented out)* |

**All Cloudflare service bindings are commented out.** No D1, KV, R2, or AI Workers bindings are active.

---

### 10.3 `vite.config.ts`

| Key | Value |
|-----|-------|
| `plugins` | `[build(), devServer({ adapter: cloudflare, entry: 'src/index.tsx' })]` |
| `build.target` | `'es2022'` |
| `build.minify` | `false` |
| `build.outDir` | `'dist'` (Hono plugin default) |

---

### 10.4 `tsconfig.json`

| Key | Value |
|-----|-------|
| `target` | `ESNext` |
| `module` | `ESNext` |
| `moduleResolution` | `Bundler` |
| `strict` | `true` |
| `jsx` | `"react-jsx"` |
| `jsxImportSource` | `"hono/jsx"` |
| `types` | `["vite/client"]` |

---

### 10.5 `ecosystem.config.cjs` (PM2)

| Key | Value |
|-----|-------|
| `apps[0].name` | `'refurbiq'` |
| `apps[0].script` | `'npx'` |
| `apps[0].args` | `'wrangler pages dev dist --ip 0.0.0.0 --port 3000'` |
| `apps[0].env.NODE_ENV` | `'development'` |
| `apps[0].env.PORT` | `3000` |
| `apps[0].watch` | `false` |
| `apps[0].instances` | `1` |
| `apps[0].exec_mode` | `'fork'` |

---

### 10.6 `dist/_routes.json`

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/static/*"]
}
```

All routes included except `/static/*` which is served directly by Cloudflare Pages as static assets.

---

### 10.7 localStorage Keys (Client-side Persistence)

| Key | Values | Set by |
|-----|--------|--------|
| `theme` | `'light'` / `'dark'` | `toggleTheme()` |
| `sidebarCollapsed` | `'true'` / `'false'` | `toggleSidebar()` |

---

### 10.8 Hardcoded Business Configuration Values

| Value | Location | Description |
|-------|----------|-------------|
| `'REFURBIQ_DEMO'` | `data-store.ts:18` | Tenant company_id for all seed data |
| `5000` | `vat-engine.ts:82` | DRC threshold in GBP |
| `0.80` | `vat-engine.ts:228` | Fintech advance rate (80%) |
| `0.0195` | `vat-engine.ts:229` | Fintech fee rate (1.95%) |
| `'GB369979995000'` | `data-store.ts` OPR seed | HMRC OPR authorisation number |
| `'GB369979995'` | `data-store.ts` / sidebar HTML | Company VAT registration number |
| `'admin@refurbiq.co.uk'` | Multiple API routes | Hardcoded actor for all mutations |
| `'ADMIN'` | Multiple API routes | Hardcoded actor_role for all mutations |
| `'2027-04-11'` | `api.ts:408` | Hardcoded reconnect credentials expiry |

---

### 10.9 `.gitignore` — Notable Entries

| Pattern | Effect |
|---------|--------|
| `dist/` | Build output not tracked |
| `node_modules/` | Dependencies not tracked |
| `.wrangler` | Local wrangler state not tracked |
| `.env`, `.env.production` | Env files not tracked |
| `.dev.vars` | Wrangler local secrets not tracked |
| `.vscode/*` | Editor config not tracked (with exceptions) |

---

### 10.10 10 Non-Negotiable Controls (from `docs/STATUS.md`)

| # | Control | Enforcement point |
|---|---------|-------------------|
| 1 | Intake QC Mandatory — no device enters AVAILABLE without QC | Device status machine |
| 2 | Lock Check Enforcement — any lock blocks all sale paths | QC form + device status = LOCKED |
| 3 | IMEI Matching Required — returns must match sold IMEI | RMA record `imei_match` flag; IMEI_MISMATCH status |
| 4 | Duplicate IMEI Prevention — global block | `POST /api/purchase-batches/:id/imei-import` and `POST /api/scanner/intake` check all devices |
| 5 | VAT Tax Point Rule — always sale date, never advance date | `FintechAdvance.vat_record_id = null`; `vat_tax_point_date = order_date` |
| 6 | Reverse Charge Atomicity — Box 1 and Box 4 created simultaneously | `calculateVat()` case `20RC_PURCHASES` sets both box1 and box4 |
| 7 | Export VAT Override — non-UK addresses force `0EXPORT_SALES` | `evaluateDRCThreshold()` — absolute precedence check |
| 8 | DRC Threshold Enforcement — £5,000 rule at invoice generation | `evaluateDRCThreshold()` — after export check |
| 9 | OPR Document Retention — 4-year minimum, non-deletable | UI: no delete button on documents; backend: STUB (no R2 storage) |
| 10 | Audit Trail Mandatory — all overrides require user, reason, timestamp | `auditLog.push()` in all CRUD mutations in `api.ts` |

---

## 11. POTENTIAL OVERLAP FLAGS

The following are factual observations of duplication, inconsistency, or collision detected in the code. No recommendations are included.

---

### FLAG-01 — Duplicate API path: `/api/marketplace` and `/api/marketplace/integrations`

**Location:** `api.ts` lines 387-388  
**Observation:** Both `GET /api/marketplace` and `GET /api/marketplace/integrations` are registered and return `c.json(marketplaceIntegrations)` — identical handler and identical response.  
**Impact:** Two paths serve identical data.

---

### FLAG-02 — `name` field inconsistency across config files

**Locations:**  
- `package.json`: `name = "webapp"`  
- `wrangler.jsonc`: `name = "webapp"`  
- `ecosystem.config.cjs`: PM2 app name `"refurbiq"`  
- `README.md`: refers to project as `refurbiq`  
- `docs/STATUS.md`, `docs/COMPONENT_OVERVIEW.md`: refer to project as `refurbiq`  
- Sidebar HTML in `src/index.tsx`: displays `"RefurbIQ Demo Ltd"`  

**Observation:** Three distinct names in active use: `webapp` (npm/wrangler), `refurbiq` (PM2/docs), `RefurbIQ Demo Ltd` (UI).

---

### FLAG-03 — `src/renderer.tsx` is present but never imported

**Location:** `src/renderer.tsx`  
**Observation:** File defines and exports `renderer` using `jsxRenderer` from `hono/jsx-renderer`. Neither `src/index.tsx` nor `src/routes/api.ts` import it. The `style.css` linked in `renderer.tsx` is the file in `public/static/style.css` which contains only 1 CSS rule.  
**Impact:** Dead code. The `jsxRenderer` pattern is unused; the app returns raw `c.html()` instead.

---

### FLAG-04 — `README.md` build status table is stale

**Location:** `README.md`  
**Observation:** README shows Phase 1 as "In Progress" and Phases 2-4 as "Planned". `docs/STATUS.md` (last updated 2026-04-28) shows all four phases as "✅ Complete".  
**Impact:** README is at minimum 3 phases behind actual state.

---

### FLAG-05 — Hardcoded `actor` and `actor_role` in all API mutations

**Location:** `api.ts` — every `auditLog.push()` call; `POST /api/suppliers` at line 537; `PATCH /api/suppliers/:id` at line 556; `PATCH /api/devices/:id/override` at line 648; `POST /api/devices/batch-override` at line 668; `POST /api/device-variants` at line 593; `POST /api/device-variants/import` at line 613  
**Observation:** All audit entries and new records hardcode `actor = 'admin@refurbiq.co.uk'` and `actor_role = 'ADMIN'` regardless of which user made the request. No authentication middleware exists to supply real actor identity.  
**Impact:** All mutations in the audit log attribute to a single hardcoded user.

---

### FLAG-06 — `getSupplierAnalytics()` returns hardcoded metrics, not live-computed

**Location:** `data-store.ts` lines 645-708  
**Observation:** `getSupplierAnalytics()` returns a hardcoded `metrics` array of `SupplierMetric[]`. Values like `qc_pass_rate`, `defect_count`, `repair_triggered_count`, `units_sold`, etc. are static numbers not derived from the live `qcRecords`, `repairJobs`, or `unitPnLRecords` arrays.  
**Impact:** Adding new QC records, repairs, or P&L data via API does not update supplier analytics.

---

### FLAG-07 — `getDashboardStats()` hardcodes `avg_margin_percent: 22.4`

**Location:** `data-store.ts` line 111  
**Observation:** The `avg_margin_percent` field in `DashboardStats` is hardcoded to `22.4` and is not computed from `unitPnLRecords`. `getProfitabilitySummary()` does compute a live average margin but it is not used here.  
**Impact:** Dashboard KPI shows a static figure regardless of actual P&L data.

---

### FLAG-08 — `renderDeviceChart()` uses hardcoded data `[2, 2, 1, 2, 1]`

**Location:** `src/index.tsx` ~line 828  
**Observation:** The device status doughnut chart on the dashboard renders static data `[2, 2, 1, 2, 1]` regardless of the live device count returned by `GET /api/dashboard/v2`.  
**Impact:** Chart does not reflect actual inventory state.

---

### FLAG-09 — Dashboard IMEI mismatch count and locked device count are hardcoded

**Location:** `src/index.tsx` Risk & Compliance panel in `renderDashboard` (~lines 744, 752)  
**Observation:** `"IMEI Mismatches"` displays hardcoded value `1`. `"Locked Devices"` displays hardcoded value `1`. Neither is derived from a live API call.  
**Impact:** These values do not update if additional mismatches or locked devices are added.

---

### FLAG-10 — Sidebar nav badges are all hardcoded in HTML

**Location:** `src/index.tsx` sidebar HTML  
**Observation:** Badge values for Inventory (8), QC (2), Support (3), Repairs (4), OPR (!), RMA (!), Tenants (5), MTD (1), Courier (2), Marketplace (!) are all static strings in the HTML. The notification topbar badge (4) is also hardcoded and does not update dynamically (though `initUI()` fetches notification summary, whether it actually updates the badge element is UNVERIFIED OR INSUFFICIENT CONTEXT).  
**Impact:** Badges do not reflect live system state for most sidebar items.

---

### FLAG-11 — `POST /api/purchase-batches` in Suppliers page modal fires `alert()` (STUB), but the same endpoint is the real implementation used by the Inventory Import modal

**Location:** `src/index.tsx` Suppliers page modal vs. Inventory page `submitImportBatch()`  
**Observation:** The "New Purchase Batch" button in `renderSuppliers` fires `alert('Purchase batch created...')`. The real `POST /api/purchase-batches` endpoint exists and is functional — it is successfully called by `submitImportBatch()` in `renderInventory`. Two UI entry points for the same action; one is real, one is a stub.  
**Impact:** The Suppliers page cannot independently create batches despite the endpoint existing.

---

### FLAG-12 — HMRC MTD submission exists in two forms with different behaviours

**Location:**  
- `POST /api/mtd-returns/:id/submit` (api.ts line 352) — simulated real endpoint; mutates data; returns receipt ID  
- MTD page "Submit to HMRC" button in `renderMTD` — fires `alert()`  

**Observation:** The API endpoint performs a simulation (mutates `r.status` to ACCEPTED, generates random receipt ID). The UI button fires an `alert()` stub instead of calling this endpoint. The two mechanisms are disconnected.  
**Impact:** The functional simulation endpoint is unreachable from the UI.

---

### FLAG-13 — `DeviceVariant.deviceAttributeOverrides` uses the same `company_id = 'REFURBIQ_DEMO'` hardcode as all other entities, but `COMPANY_ID` constant is module-scoped to `data-store.ts` only

**Location:** `data-store.ts` line 18; `api.ts` lines 98, 505, 530, 591, 609, 641, 666  
**Observation:** `api.ts` does not import the `COMPANY_ID` constant from `data-store.ts`. Instead it repeats the string literal `'REFURBIQ_DEMO'` inline in every route handler that creates records. Two separate maintenance points for the same value.

---

### FLAG-14 — `Device` interface in `types/index.ts` uses `cost_price` and `current_status`, but `api.ts` IMEI import route sets `unit_cost` and `status` on the created object

**Location:** `types/index.ts` (Device interface) vs. `api.ts` lines 130-144  
**Observation:** The `Device` type defines `cost_price: number` and `current_status: DeviceStatus`. The IMEI import route (`POST /api/purchase-batches/:id/imei-import`) creates device objects with `unit_cost: 0` and `status: 'INTAKE_QC_PENDING'` — using different field names. The object is pushed as `any` (TypeScript cast suppresses the error). The scanner intake route (`POST /api/scanner/intake`) also sets `status` instead of `current_status`.  
**Impact:** Device objects created via import/scanner have different field names than the typed interface and seed data.

---

### FLAG-15 — `VAT_CODE_DEFINITIONS` is exported from `vat-engine.ts` and also served via `GET /api/vat-codes`, but the frontend also receives it redundantly in individual order/device responses

**Location:** `api.ts` line 34 vs. various order/VAT record responses  
**Observation:** VAT code definitions are available as a dedicated endpoint. The `vat_code_applied` field on orders and `vat_code` on VAT records carry the code string but not the full definition. Frontend code that needs the definition label must separately fetch `/api/vat-codes` or use the `vatCodeBadge()` function which has the display names hardcoded in the template. Three separate representations of VAT code display names exist: in `VAT_CODE_DEFINITIONS`, in `vatCodeBadge()`, and in the UI badge CSS classes.

---

### FLAG-16 — `FintechAdvance.vat_record_id` is typed as `null` (literal type) but commented as intentional

**Location:** `types/index.ts` line 192  
**Observation:** `vat_record_id: null` is typed as the literal type `null`, not `string | null`. This means the field can only ever be `null`. Seed data confirms all instances are `null`. If a future implementation needs to link a fintech advance to a VAT record, the type definition would need to change.

---

### FLAG-17 — `docs/STATUS.md` line-count for `src/routes/api.ts` is stale

**Location:** `docs/STATUS.md` Codebase Metrics table  
**Observation:** STATUS.md reports `src/routes/api.ts` as `~672` lines. Actual file is 875 lines as read in this extraction.

---

*End of SYSTEM STATE SNAPSHOT — 2026-06-05*
