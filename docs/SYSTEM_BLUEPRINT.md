# RefurbIQ — Complete System Blueprint

> **Purpose:** This document is the authoritative reverse-engineered technical and functional
> blueprint of RefurbIQ v2.0. It is intended to allow a senior engineering team to rebuild,
> migrate, or significantly upgrade the system on a new tech stack with full fidelity to its
> current feature set, business rules, and operational constraints.
>
> **Derived from:** Live source code as of 2026-04-28 (commit `406d36f`).
> All 12 sections are based on direct code analysis, not documentation.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Breakdown](#2-feature-breakdown)
3. [Workflow Diagrams (text-based)](#3-workflow-diagrams-text-based)
4. [Current System Architecture](#4-current-system-architecture)
5. [Data Model (ER Diagram)](#5-data-model-er-diagram)
6. [Business Logic Extraction](#6-business-logic-extraction)
7. [Event Flow System](#7-event-flow-system)
8. [Risks & Technical Debt](#8-risks--technical-debt)
9. [Recommended New Architecture](#9-recommended-new-architecture)
10. [Modular Breakdown](#10-modular-breakdown)
11. [API Map (~53 endpoints)](#11-api-map)
12. [Open Questions & Missing Data](#12-open-questions--missing-data)

---

## 1. Executive Summary

### What Is RefurbIQ?

RefurbIQ is a **UK-market refurbished electronics ERP SaaS** targeting small-to-medium resellers
who buy bulk-lot devices (primarily smartphones), process them through quality control and
optional overseas repair, and sell through multiple online marketplaces (eBay, Amazon, Back
Market, Swappa).

The product is a single-tenant-demo, multi-tenant-architected web application covering the
complete operational lifecycle: goods intake → quality control → OPR (overseas processing) →
inventory management → marketplace sales → returns processing → VAT/HMRC compliance →
profitability analytics.

### Distinguishing Characteristics

| Characteristic | Detail |
|----------------|--------|
| **UK Regulatory Depth** | Full HMRC VAT Making Tax Digital (MTD) compliance, 8 VAT codes, DRC (Domestic Reverse Charge), OPR customs regime |
| **Non-Negotiable Controls** | 10 hard-coded business rules enforced at code level — not configurable |
| **Single-File SPA** | Entire 5,700-line frontend returned as one Hono `c.html()` response |
| **Edge-First** | Deployed on Cloudflare Workers/Pages — no traditional server, sub-10ms cold starts |
| **Zero External Dependencies at Runtime** | All business logic is pure TypeScript; VAT engine has no npm dependencies |
| **Multi-Tenant Ready** | `company_id` partitioning on every entity; SaaS tenant management UI built |

### Current Production Readiness

| Dimension | Status |
|-----------|--------|
| Feature completeness (UI + API) | ~85% — all 4 build phases shipped |
| Data persistence | ❌ In-memory only — resets on worker restart |
| Authentication / Authorisation | ❌ None — anyone with the URL has full access |
| Production deployment | ❌ Not yet deployed to Cloudflare Pages |
| HMRC MTD live integration | ❌ Simulated only |
| Marketplace OAuth | ❌ Simulated only |
| Rate limiting | ❌ None |
| **Overall production-readiness** | **~42%** |

### Build History

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|-----------------|
| 1 | Core Foundation | ✅ Complete | Dashboard, Inventory, QC, OPR, Orders, VAT Engine, Fintech, Suppliers, Support, Admin |
| 2 | Risk & Recovery | ✅ Complete | Courier/INR, Returns/RMA, Profitability/P&L, Repairs |
| 3 | Operations Expansion | ✅ Complete | Supplier Analytics, HMRC MTD Returns, Audit Log |
| 4 | Intelligence & SaaS | ✅ Complete | IMEI Scanner, Marketplace Hub, Tenant Management, Variants Catalogue, Bulk Override, Notifications |
| 5 | Data Persistence | 📋 Planned | Cloudflare D1 migration |
| 6 | Production Hardening | 📋 Planned | Auth, live HMRC MTD, marketplace OAuth, rate limiting |

---

## 2. Feature Breakdown

### 2.1 Dashboard (Phase 1 + 2.2 enhancements)

**Purpose:** Single-glance operational overview for a working day.

**KPI Cards:**
- Total devices in inventory
- Available devices (status = AVAILABLE)
- Devices in OPR (status = IN_OPR)
- QC queue depth (INTAKE_QC_PENDING + RETURN_QC_PENDING + POST_REPAIR_QC)
- Open orders count
- Open support tickets count
- VAT liability (Box 5 of current open period)
- Revenue MTD
- Average margin %
- Open INR investigations
- Repair jobs in progress

**Charts:**
- Device status distribution (doughnut — Chart.js)
- Marketplace order distribution (doughnut)
- VAT composition by code (bar)
- OPR 180-day countdown timers (one card per active batch)

**Recent Activity:**
- Last 5 orders with VAT code badges
- Notification feed (unread count in topbar bell)

---

### 2.2 Inventory & Goods-In (Phase 1)

**Purpose:** Device registry + bulk intake via CSV upload.

**Key Capabilities:**
- Full device list with IMEI search, status filter, make/grade filters
- Device detail view (status, QC history, override history)
- New purchase batch creation modal (supplier dropdown fetched live from `/suppliers?active=true`)
- CSV IMEI import (FileReader API → `POST /purchase-batches/:id/imei-import`)
- Device attribute override panel (grade/colour with mandatory reason code + audit trail)
- Bulk override modal (multi-device selection → `POST /devices/batch-override`)

**Device Status Flow (17 states):**
```
EXPECTED → RECEIVED → INTAKE_QC_PENDING → [QC PASS] → AVAILABLE
                                         ↓ [LOCKED]   → LOCKED
                                         ↓ [FAIL]     → (repair path) → POST_REPAIR_QC
AVAILABLE → RESERVED → PICKED → SHIPPED → WITH_CUSTOMER
WITH_CUSTOMER → RMA_OPEN → RETURNED_RECEIVED → RETURN_QC_PENDING →
  → QC PASS → [RESTOCKED | NO_FAULT_FOUND]
  → QC FAIL → FAULT_CONFIRMED → (repair or SCRAPPED)
IN_OPR (parallel status for devices in overseas processing)
SCRAPPED (terminal)
```

---

### 2.3 Quality Control (Phase 1)

**Purpose:** Mandatory inspection gate between goods-in and sale.

**QC Types:** INTAKE | RETURN | POST_REPAIR

**Functional Test Battery (per QC record):**
- Power on/off, touchscreen, front/rear camera, microphone, speaker, face ID / fingerprint,
  Wi-Fi, Bluetooth, cellular signal, charging port, battery health

**Business Rules Enforced (Non-Negotiable Controls #1, #2):**
- No device can enter AVAILABLE without a completed QC record with outcome = PASS
- If `lock_check_result = LOCKED`: outcome forced to LOCKED_BLOCKED; device enters LOCKED status;
  all sale paths blocked; cannot be overridden without explicit escalation

**Outcomes:**
- `PASS` → device transitions to AVAILABLE
- `FAIL` → device enters repair pathway or SCRAPPED
- `LOCKED_BLOCKED` → device enters LOCKED; requires police check or supplier recall

---

### 2.4 OPR (Outward Processing Relief) Engine (Phase 1)

**Purpose:** Manage UK customs regime for bulk device lots sent overseas for repair and
reimported within 180 days, eliminating full import duty on reimport.

**OPR Batch Lifecycle:**
```
DRAFT → EXPORTED → IN_REPAIR → REIMPORTED → DISCHARGED
                 ↓ (if 180-day deadline missed)
                 OVERDUE
```

**Key Data Points per Batch:**
- OPR Authorisation Number (customs reference)
- Export MRN (Movement Reference Number) + AWB outbound
- AWB inbound + C88 document reference
- Repair vendor ID, processing invoice value
- Outbound + inbound freight costs
- Unit count, uplift per unit, import VAT on uplift

**Uplift Calculator:**
- `totalUplift = processingInvoice + freightOut + freightIn`
- `upliftPerUnit = totalUplift / unitCount`
- `importVAT = totalUplift × 20%`
- VAT reclaimed in Box 4 on reimport

**Document Vault:** UI present, 4-year retention enforced (Non-Negotiable Control #9). R2 storage planned but currently stubbed.

---

### 2.5 Orders (Phase 1)

**Purpose:** Marketplace order registry with VAT code display and DRC information.

**Order Fields:** marketplace, external ref, customer, delivery country, is_export flag,
sale value, net value, VAT code applied, VAT tax point date, status.

**VAT Tax Point Enforcement (Non-Negotiable Control #5):**
- `vat_tax_point_date` = order date, hardcoded — cannot be set to advance date

**DRC Info Panel:**
- Displays DRC legal text when order VAT code = `0RCS_SALES`
- Explains reverse charge obligations to the buyer

---

### 2.6 VAT Engine (Phase 1)

**Purpose:** Complete HMRC VAT compliance including 9-box return calculation, DRC threshold
enforcement, export override, reverse charge, and margin scheme.

**8 VAT Codes (complete master table):**

| Code | Scheme | Rate | Boxes Affected |
|------|--------|------|----------------|
| `20S_SALES` | Standard Sales | 20% | Box 1 (output), Box 6 (net sales) |
| `20S_PURCHASES` | Standard Purchase | 20% | Box 4 (input), Box 7 (net purchases) |
| `20RC_PURCHASES` | Reverse Charge | 20% self-accounting | Box 1 + Box 4 + Box 7 |
| `0RCS_SALES` | Reverse Charge Sale | 0% | Box 6 only |
| `0MARGIN_PURCHASES` | Margin Scheme | 0% | Box 7 only |
| `0MARGIN_SALES` | Margin Scheme | 1/6 of margin | Box 1, Box 6 |
| `0EXPORT_SALES` | Export Zero-Rated | 0% | Box 6 only |
| `NOVAT_PURCHASES` | Out of Scope | 0% | None |

**HMRC 9-Box Aggregation:**
```
Box 1: Output VAT (from sales transactions)
Box 2: EC Acquisitions VAT (from 20RC_PURCHASES notional output)
Box 3: Total Output = Box 1 + Box 2  [COMPUTED — NEVER STORED]
Box 4: Input VAT reclaimable
Box 5: Net VAT payable = Box 3 − Box 4  [COMPUTED — positive = owe HMRC]
Box 6: Net Sales (ex-VAT)
Box 7: Net Purchases (ex-VAT)
Box 8: EC Goods Supplied (future)
Box 9: EC Goods Acquired (future)
```

**DRC Threshold Logic (Non-Negotiable Control #8):**
```typescript
// Export override takes ABSOLUTE precedence
if (deliveryCountry != 'GB' && deliveryCountry != 'UK')
  → force code to 0EXPORT_SALES regardless of original code

// DRC threshold check (UK only)
if (originalCode == '20S_SALES' && netInvoiceValue >= £5,000)
  → force code to 0RCS_SALES (Reverse Charge)
```

---

### 2.7 Fintech Advances (Phase 1)

**Purpose:** Model the economics of invoice financing / early payment advances from
marketplace payment providers.

**Advance Formula:**
- `advanceAmount = grossSaleValue × 80%`
- `fintechFee = advanceAmount × 1.95%`
- `netAdvanceReceived = advanceAmount − fintechFee`

**Critical Rule (Non-Negotiable Control #5):**
- `FintechAdvance.vat_record_id` is typed as `null` — by design.
- VAT tax point is always the sale date, never the advance date.
- Fintech advances are financing events, not taxable supplies.

---

### 2.8 Suppliers & Batches (Phase 1)

**Purpose:** Supplier registry and purchase batch management.

**Supplier Fields:** code, name, VAT number, country, contact email, default VAT code,
is_active flag, audit trail.

**Key Rules:**
- `GET /suppliers?active=true` is the ONLY valid query for UI dropdowns — never hardcode
- Supplier code must be unique per `company_id` (enforced at POST)
- Deactivation is soft-delete (is_active = false); supplier history preserved
- Supplier dropdown and VAT code auto-populate are coupled: selecting a supplier
  pre-fills the batch VAT code from `default_vat_code`

**Purchase Batch States:** DRAFT → PENDING → RECEIVED → CLOSED

---

### 2.9 Support & Tickets (Phase 1)

**Purpose:** Customer support ticket management linked to orders, devices, and RMAs.

**Ticket Categories:** GENERAL | RETURN | INR | FAULT | REFUND | CARRIER
**Priorities:** LOW | NORMAL | HIGH | URGENT
**Statuses:** OPEN | IN_PROGRESS | AWAITING_CUSTOMER | RESOLVED | ESCALATED

**AI Draft Feature:** `SupportTicket.ai_draft` field exists; generation is stubbed
(no OpenAI route yet).

---

### 2.10 Admin & Settings (Phase 1)

**Purpose:** In-page configuration — no API routes; state changes are in-page only.

**Tabs:** Company Config | Data Retention Policy | System Controls | Development Roadmap

**System Controls Tab:** Displays all 10 Non-Negotiable Controls with their current state
(all ✅ Active). Controls are read-only — cannot be disabled from the UI.

---

### 2.11 Courier & INR Investigations (Phase 2)

**Purpose:** Track Item Not Received (INR) and other courier failure events from
initial claim through to carrier resolution/compensation.

**Courier Event Types:** INR | DAMAGED | LOST_IN_TRANSIT | WRONG_ITEM | LATE_DELIVERY

**Investigation Status Flow (11 states):**
```
OPEN → SUBMITTED_TO_CARRIER → UNDER_INVESTIGATION → EVIDENCE_REQUIRED
     → CLAIM_SUBMITTED → CLAIM_APPROVED / CLAIM_REJECTED
     → ESCALATED → RESOLVED_LOSS / RESOLVED_FOUND / CLOSED
```

**Evidence Items:** typed attachments (PROOF_OF_DISPATCH, TRACKING_SCREENSHOT,
CARRIER_RESPONSE, CUSTOMER_STATEMENT, PHOTO, OTHER) — upload UI present,
file upload endpoint stubbed.

**Stats:** open count, totalClaimed, totalRecovered, recoveryRate %

---

### 2.12 Returns & RMA (Phase 2)

**Purpose:** Full returns workflow from customer request to resolution, with IMEI
matching enforcement.

**Return Categories:** FAULT | WRONG_ITEM | CHANGE_OF_MIND | DAMAGED_IN_TRANSIT |
NOT_AS_DESCRIBED | OTHER

**RMA Status Flow (13 states):**
```
REQUESTED → AUTHORISED → IN_TRANSIT_BACK → RECEIVED → RETURN_QC_PENDING
          → QC_PASS_NO_FAULT → [RESTOCKED | RETURN_TO_CUSTOMER]
          → QC_FAIL_FAULT_CONFIRMED → [REFUND_APPROVED | REPLACEMENT_DISPATCHED | SCRAPPED]
          → IMEI_MISMATCH [special branch]
          → CLOSED_NO_ACTION / CLOSED
```

**IMEI Matching (Non-Negotiable Control #3):**
- `imei_sold` (from original order) vs `imei_returned` (scanned on receipt)
- If `imei_match = false` → status forced to IMEI_MISMATCH; standard flow blocked;
  requires manager escalation

**Stubs in RMA:**
- Refund issuance (payment processor not integrated)
- Replacement dispatch (no fulfilment link)
- Police report generation (document service not built)
- Manager approval workflow (routing not defined)

---

### 2.13 Profitability & Unit P&L (Phase 2)

**Purpose:** Per-device and aggregate profitability tracking.

**Unit P&L Formula:**
```
revenue        = grossSale − vatOnSale
totalCosts     = purchaseCost + oprUplift + marketplaceFee
                 + fintechFee + shippingCost + repairCost
netProfit      = revenue − totalCosts + recoveryAmount
marginPercent  = (netProfit / revenue) × 100
```

**Aggregation Views:**
- By marketplace (units, revenue, profit, margin, avg fee %)
- By make/manufacturer (units, revenue, profit, margin)
- MTD summary (total units, gross revenue, VAT collected, net revenue, total costs,
  total net profit, best/worst margin device)

---

### 2.14 Repairs & Refurbishment (Phase 2)

**Purpose:** Track repair jobs, costs, outcomes, and grade changes.

**Repair Types (11):** SCREEN_REPLACEMENT | BATTERY_REPLACEMENT | CHARGING_PORT |
CAMERA_REPAIR | BOARD_LEVEL | HOUSING_REPLACEMENT | WATER_DAMAGE | SOFTWARE_UNLOCK |
DATA_WIPE | FULL_REFURBISHMENT | OTHER

**Repair Outcomes:** PENDING | RESTORED_SAME_GRADE | UPGRADED_GRADE | DOWNGRADED_GRADE |
ECONOMICALLY_UNVIABLE | SCRAPPED

**Triggers:** INTAKE_QC_FAIL | RETURN_QC_FAIL | CUSTOMER_COMPLAINT | COSMETIC_UPGRADE | MANUAL

**Quote Workflow:** QUOTE_PENDING → QUOTE_APPROVED / QUOTE_REJECTED → IN_PROGRESS
→ AWAITING_PARTS → COMPLETED / FAILED / SCRAPPED

---

### 2.15 Supplier Analytics (Phase 3)

**Purpose:** Per-supplier risk scoring and performance benchmarking.

**Metrics per Supplier:**
- QC pass rate (0–100%), defect count, return count, locked device count
- Repair cost contribution
- OPR batch count + risk value (total landed cost in active OPR)
- Units sold, gross revenue, net profit, avg margin %
- Best/worst device from that supplier

**Risk Score (0–100, computed):**
- Weighted formula combining: QC fail rate, locked device incidence, OPR overdue risk,
  return rate, repair cost
- Labels: LOW | MEDIUM | HIGH | CRITICAL

---

### 2.16 HMRC MTD VAT Returns (Phase 3)

**Purpose:** Prepare and submit quarterly VAT returns to HMRC via Making Tax Digital API.

**Submission Lifecycle:**
```
DRAFT → REVIEW_PENDING → MANAGER_APPROVED → SUBMITTED → ACCEPTED / REJECTED / AMENDED
```

**Validation Rules (enforced before submission):**
- Box 3 must equal Box 1 + Box 2 (computed, not stored)
- Box 5 must equal Box 3 − Box 4 (computed, not stored)
- `validation_errors` array must be empty to submit

**Current State:** Simulated — `POST /mtd-returns/:id/submit` generates a mock HMRC
receipt ID but does not connect to the real HMRC MTD API.

---

### 2.17 Audit Log (Phase 3)

**Purpose:** Immutable trail of all system events, overrides, and user actions.

**Modules Covered (13):** INVENTORY | QC | OPR | ORDERS | VAT | FINTECH | SUPPLIERS |
SUPPORT | COURIER | RMA | REPAIRS | SYSTEM | AUTH

**Severity Levels:** INFO | WARNING | CRITICAL | SECURITY

**Required Fields (Non-Negotiable Control #10):**
- `actor` (user email/ID)
- `actor_role`
- `timestamp`
- `before_state` + `after_state` (JSON snapshots for all overrides)

**Key Event Types Auto-Generated:**
- All supplier creates/updates/deactivations
- All device attribute overrides (single + batch)
- All device variant catalogue changes

---

### 2.18 IMEI / Barcode Scanner (Phase 4)

**Purpose:** Mobile-optimised scan-to-intake workflow to speed up goods receipt.

**Lookup Logic (`POST /scanner/lookup`):**
1. Check `devices[]` for matching IMEI (primary or secondary) → return device + recommended action
2. Check `purchaseBatches[]` for matching batch code/ID → return batch + VIEW_BATCH action
3. IMEI prefix lookup (8-char prefix → make/model inference from hardcoded map)
4. If no match → return `CREATE_DEVICE` action with suggestion

**Intake Form:** Pre-fills inferred make/model; requires purchase batch selection;
validates duplicate IMEI before create.

---

### 2.19 Marketplace Hub (Phase 4)

**Purpose:** Multi-marketplace integration status, sync control, and error monitoring.

**Marketplaces Modelled:** eBay UK, Amazon UK, Back Market, Swappa

**Integration Fields per Marketplace:**
- Status: CONNECTED | DISCONNECTED | ERROR | RATE_LIMITED | PENDING_AUTH
- Credentials validity + expiry date
- Sync interval, API quota used/limit
- `auto_vat_code`, `auto_drc_check`, `auto_export_detect` feature flags
- `fee_percent` for P&L calculation
- Recent errors (typed `IntegrationError[]`)
- Sync log (`SyncLogEntry[]`)

**Current State:** `POST /marketplace/:id/sync` is functional (simulated).
`POST /marketplace/:id/reconnect` simulates OAuth reconnect — not real OAuth.

---

### 2.20 Tenant Management (Phase 4)

**Purpose:** SaaS operator view — manage all tenants, plans, usage, and billing state.

**Tenant Plans:** STARTER | PROFESSIONAL | ENTERPRISE | TRIAL
**Tenant Statuses:** ACTIVE | SUSPENDED | CANCELLED | TRIAL | ONBOARDING

**Usage Limits per Tenant:** devices_total/limit, orders_mtd, api_calls_today/limit,
storage_mb/limit, active_users/limit

**User Roles within a Tenant:** ADMIN | MANAGER | WAREHOUSE | FINANCE | SUPPORT | READ_ONLY

**SaaS Metrics (summary endpoint):**
- total/active/trial/suspended tenants
- MRR, ARR
- avg devices per tenant
- Plan breakdown (count by plan)

---

### 2.21 Device Variants Catalogue (Phase 4)

**Purpose:** Master SKU catalogue defining valid device configurations.

**SKU Code Format:** `{MAKE}-{MODEL}-{STORAGE}-{COLOUR}-{GRADE}`
Example: `APL-IP14-256-BLK-A`

**Import:** CSV bulk import with duplicate detection and invalid-row skipping.
All imports auto-generate SKU codes and write audit log entries.

---

### 2.22 Notifications (Phase 4)

**Purpose:** In-app notification feed for operational alerts.

**Categories (10):** OPR | VAT | RMA | COURIER | INVENTORY | REPAIR | MARKETPLACE |
SYSTEM | SECURITY | FINANCE

**Severity:** INFO | WARNING | CRITICAL | SUCCESS

**Behaviour:**
- Unread count shown in topbar bell icon
- `PATCH /notifications/:id/read` marks individual read
- `POST /notifications/mark-all-read` bulk-clears
- Notifications have optional `action_url` + `action_label` for deep linking
- `auto_dismissed: true` notifications expire after `expires_at`

---

### 2.23 Development Tracker (Post-Phase 4)

**Purpose:** Real-time changelog and build progress tracker at `/tracker`.

**Standalone SPA** (`public/static/tracker.html`) with:
- KPI row (total updates, phases complete, prod readiness %, last activity)
- Phase progress bars
- Chart.js doughnut (by type) + bar (by phase)
- Date-grouped timeline with filter chips and text search
- Detail drawer + Log Update modal
- 30-second auto-refresh

---

## 3. Workflow Diagrams (text-based)

### 3.1 Primary Device Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     REFURBIQ DEVICE LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────────┘

[SUPPLIER]
    │
    ▼
POST /purchase-batches          ← Create batch (invoice ref, VAT code)
    │
POST /purchase-batches/:id/imei-import  ← CSV upload (make, model, IMEI rows)
    │
    ▼ (device created with status = INTAKE_QC_PENDING)
    │
    ├─── DUPLICATE IMEI? ──► REJECTED (error 409, not stored)
    │
    ▼
┌─────────────────┐
│  INTAKE QC      │  GET /qc/pending → openQCForm()
│  (MANDATORY)    │
└─────────────────┘
    │
    ├─── LOCKED? ─────────────────────────► LOCKED status (all sale paths blocked)
    │                                             │
    ├─── FAIL? ──────────────► POST_REPAIR_QC ◄──┘ (after repair attempt)
    │                              │
    │                              └──► SCRAPPED (if unviable)
    │
    ▼ (PASS)
 AVAILABLE
    │
    ├─── OPR PATH ──────────────────────────────────────────────────────────┐
    │   (device sent overseas for bulk repair)                              │
    │   status = IN_OPR                                                     │
    │   POST /opr/calculate → uplift + importVAT                           │
    │   OPR Batch: DRAFT → EXPORTED → IN_REPAIR → REIMPORTED → DISCHARGED  │
    │   Box 4 VAT reclaim on reimport                                       │
    │   180-day deadline enforced; OVERDUE if missed                        │
    │   4-year document retention (Non-Negotiable Control #9)               │
    │   ← POST_REPAIR_QC (after reimport) ─────────────────────────────────┘
    │
    ▼
 RESERVED (marketplace order placed)
    │
 PICKED (warehouse pick)
    │
 SHIPPED (courier collected)
    │
 WITH_CUSTOMER
    │
    ├─── RETURNED? ──────────────────────────────────────────────────────────┐
    │   RMA_OPEN → RETURNED_RECEIVED → RETURN_QC_PENDING                    │
    │   IMEI match check (Non-Negotiable Control #3)                        │
    │   ├── IMEI_MISMATCH → escalation required                             │
    │   ├── QC PASS → RESTOCKED / NO_FAULT_FOUND                           │
    │   └── QC FAIL → FAULT_CONFIRMED → repair or SCRAPPED                 │
    └────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 VAT Decision Tree (per sale transaction)

```
New Sale Event
    │
    ▼
Is delivery_country UK/GB?
    │
    ├── NO  ──────────────────► Force code = 0EXPORT_SALES
    │                           (export override, Non-Negotiable Control #7)
    │
    └── YES
         │
         ▼
    Original VAT code == 20S_SALES?
         │
         ├── YES
         │     │
         │     ▼
         │   netInvoiceValue ≥ £5,000?
         │     │
         │     ├── YES ──────────► Force code = 0RCS_SALES (DRC, Control #8)
         │     │                   + append DRC legal text to invoice
         │     │
         │     └── NO  ──────────► Keep 20S_SALES
         │
         └── NO
               │
               ▼
             Use original code as-is (0MARGIN_SALES, 20RC_PURCHASES, etc.)
               │
               ▼
             Calculate VAT boxes via calculateVat()
               │
               ▼
             Accumulate into VatPeriod aggregation
               │
               ▼
             At period close → MTD 9-box return
```

---

### 3.3 Fintech Advance Flow

```
Order Sold (gross sale value known)
    │
POST /fintech/calculate
    │
    ▼
advanceAmount = gross × 80%
fintechFee    = advance × 1.95%
netReceived   = advance − fee
    │
    ▼
FintechAdvance record created
vat_record_id = null  ← ALWAYS NULL (VAT tax point = sale date, not advance date)
    │
    ▼
Later: CSV settlement upload (Phase 6 — STUBBED)
reconcile: settlement_date, actual_received vs netReceived
```

---

### 3.4 HMRC MTD Submission Flow

```
VAT Period closes
    │
    ▼
GET /vat-records/period/:id  → aggregate all VatRecords for period
    │
    ▼
calculateVat() per record → box amounts
aggregateVatPeriod()       → sum boxes 1,2,4,6,7; compute 3,5
    │
    ▼
MTDVatReturn created (status = DRAFT)
    │
    ▼
GET /mtd-returns/:id/validate
    │ Check: Box3 = Box1 + Box2; Box5 = Box3 − Box4
    │
    ├── errors? ──► cannot submit; fix source records
    │
    ▼ (no errors)
Manager reviews + approves (status = MANAGER_APPROVED) [STUBBED — alert() only]
    │
    ▼
POST /mtd-returns/:id/submit
    │ [SIMULATED — generates mock HMRC receipt ID]
    │ [REAL: HMRC MTD API → POST obligations/:vrn/returns]
    │
    ▼
status = ACCEPTED; hmrc_receipt_id stored; payment_due_date set
```

---

### 3.5 IMEI Scanner Intake Flow

```
Operator scans IMEI barcode
    │
POST /scanner/lookup { imei: "3546789012345" }
    │
    ├── Device found (existing) ──► show device detail + action button
    │     AVAILABLE → "Ready to Ship"
    │     INTAKE_QC_PENDING → "Needs QC"
    │     other → "View Device"
    │
    ├── Batch found (barcode = batch code) ──► show batch detail
    │
    ├── Unknown + IMEI prefix match ──► suggest make/model, offer "Create Intake"
    │
    └── Completely unknown ──► "Create Intake Manually"
         │
         ▼
    showIntakeForm() — pre-filled with inferred make/model
         │
    POST /scanner/intake { imei, make, model, grade, storage, colour, network,
                           purchase_batch_id, unit_cost, vat_code }
         │
    Duplicate IMEI check (409 if exists)
         │
    Device created (status = INTAKE_QC_PENDING)
```

---

## 4. Current System Architecture

### 4.1 Deployment Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE NETWORK (EDGE)                         │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                 Cloudflare Pages / Workers                       │  │
│  │                                                                   │  │
│  │  dist/_worker.js (489 kB compiled bundle)                        │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │  Hono v4 Application                                       │   │  │
│  │  │                                                            │   │  │
│  │  │  app.use('/static/*', serveStatic)  ← public/ assets      │   │  │
│  │  │  app.route('/api', api)             ← all REST routes      │   │  │
│  │  │  app.get('/tracker', redirect)      ← tracker SPA          │   │  │
│  │  │  app.get('*', getIndexHTML)         ← main SPA catch-all   │   │  │
│  │  │                                                            │   │  │
│  │  │  src/routes/api.ts   ← 53 endpoints + in-memory arrays     │   │  │
│  │  │  src/lib/vat-engine  ← pure TS business logic              │   │  │
│  │  │  src/lib/data-store  ← in-memory arrays (RESETS ON RESTART)│   │  │
│  │  │  src/types/index.ts  ← TypeScript interfaces               │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────┐  (Phase 5 target — not yet connected)   │
│  │  Cloudflare D1 (SQLite)  │                                         │
│  └──────────────────────────┘                                         │
│  ┌──────────────────────────┐  (Phase 6 target — not yet connected)   │
│  │  Cloudflare R2 (objects) │  ← OPR document vault                  │
│  └──────────────────────────┘                                         │
│  ┌──────────────────────────┐  (Phase 6 target — not yet connected)   │
│  │  Cloudflare KV (cache)   │  ← read-heavy lookups                  │
│  └──────────────────────────┘                                         │
└────────────────────────────────────────────────────────────────────────┘

                              ▲ HTTP
                              │
               ┌──────────────┴──────────────┐
               │  Browser (any modern)        │
               │                             │
               │  CDN Libraries (no install) │
               │  - Tailwind CSS (CDN)        │
               │  - Font Awesome 6 (CDN)      │
               │  - Chart.js 4.4 (CDN)        │
               │  - Axios 1.6 (CDN)           │
               │                             │
               │  SPA Architecture           │
               │  - Single HTML page         │
               │  - window._* globals        │
               │  - axios calls to /api/*    │
               │  - innerHTML rendering      │
               └──────────────────────────────┘
```

---

### 4.2 File Structure

```
/home/user/webapp/
├── src/
│   ├── index.tsx              ← Main Hono entry + entire SPA HTML/JS (5,700 lines)
│   ├── renderer.tsx           ← Hono JSX renderer (standard, unmodified)
│   ├── routes/
│   │   └── api.ts             ← All 53 REST endpoints + in-memory data (875 lines)
│   ├── lib/
│   │   ├── vat-engine.ts      ← VAT calculation, OPR uplift, fintech advance, P&L
│   │   └── data-store.ts      ← In-memory arrays + seed data + helper functions
│   └── types/
│       └── index.ts           ← All TypeScript interfaces (868 lines, 25+ types)
├── public/
│   └── static/
│       ├── style.css          ← Custom CSS overrides
│       └── tracker.html       ← Development tracker SPA (standalone)
├── docs/
│   ├── STATUS.md              ← Build phase tracker
│   ├── COMPONENT_OVERVIEW.md  ← 12-component integration analysis
│   ├── WORKFLOW_GOODS_IN_INVENTORY_OPR.md ← Goods-In/QC/OPR workflow
│   └── SYSTEM_BLUEPRINT.md    ← This document
├── CLAUDE.md                  ← Project constitution + session rules
├── README.md                  ← Phase overview + tech stack
├── package.json               ← Hono + Vite + Wrangler + TS (no runtime npm deps)
├── tsconfig.json              ← TypeScript config
├── vite.config.ts             ← Vite + @hono/vite-cloudflare-pages
├── wrangler.jsonc             ← Cloudflare Pages config (name: webapp)
└── ecosystem.config.cjs       ← PM2 config (wrangler pages dev on port 3000)
```

---

### 4.3 Request Lifecycle

```
Browser → GET /                        → Hono: getIndexHTML() → 5,700-line HTML string
Browser → GET /api/dashboard           → Hono: api.get('/dashboard') → getDashboardStats()
Browser → POST /api/purchase-batches   → Hono: validation → push to purchaseBatches[] → c.json()
Browser → GET /static/tracker.html     → Hono: serveStatic from public/
Browser → GET /tracker                 → Hono: c.redirect('/static/tracker.html')
```

**No middleware chain beyond:**
- `api.use('*', cors())` — CORS headers on all /api/* routes
- `app.use('/static/*', serveStatic)` — static file serving

**No auth middleware currently.**

---

### 4.4 Frontend Architecture Detail

```
Browser loads index.html (one HTTP GET → full SPA)
    │
    ▼
DOMContentLoaded fires
    │
    ▼
initUI() called:
  - applyTheme() (dark/light from localStorage)
  - loadNotifications() (GET /api/notifications/summary)
  - navigateTo('dashboard') → renderDashboard()

User clicks sidebar item
    │
    ▼
navigateTo(page)
  - updates window._currentPage
  - updates active sidebar link style
  - calls render{PageName}()
  - render fn calls axios.get('/api/...') → populates window._allXxx
  - renders HTML string → document.getElementById('content').innerHTML = html

User interacts (button click / form submit)
    │
    ▼
Global function called (onclick="fnName()")
  - axios.post/patch('/api/...')
  - on success: refresh window._allXxx + re-render DOM element
  - on error: show error via alert() or inline error div

Window globals pattern:
  window._allDevices        ← full device list from last fetch
  window._suppData          ← { suppliers: [], batches: [] }
  window._vatData           ← { records: [], periods: [] }
  window._currentDevice     ← device currently open in detail view
  window._currentInv        ← investigation open in drawer
  ... (one per page, ~21 total)
```

---

## 5. Data Model (ER Diagram)

```
NOTE: All entities share company_id for multi-tenant row-level isolation.
      All entities currently live in module-scope JavaScript arrays.
      Target: Cloudflare D1 (SQLite) with same field names.

┌─────────────────┐         ┌──────────────────┐
│    Supplier     │◄───────┤  PurchaseBatch    │
│─────────────────│  1:N   │──────────────────│
│ supplier_id  PK │         │ purchase_batch_id │
│ company_id      │         │ company_id        │
│ supplier_code   │         │ supplier_id  FK   │
│ name            │         │ external_inv_ref  │
│ vat_number      │         │ batch_date        │
│ country         │         │ currency          │
│ contact_email   │         │ total_value       │
│ default_vat_code│         │ vat_code          │
│ total_purchases │         │ vat_amount        │
│ is_active       │         │ status            │
└─────────────────┘         │ device_count      │
                            └─────────┬─────────┘
                                      │ 1:N
                            ┌─────────▼─────────┐
                            │      Device        │
                            │──────────────────│
                            │ device_id      PK │
                            │ company_id        │
                            │ imei_primary   UK │  ← unique key (global)
                            │ imei_secondary    │
                            │ serial_number     │
                            │ make              │
                            │ model             │
                            │ storage           │
                            │ colour            │
                            │ grade             │
                            │ network           │
                            │ supplier_id    FK │
                            │ purchase_batch FK │
                            │ cost_price        │
                            │ landed_cost       │
                            │ purchase_vat_code │
                            │ current_status    │  (17 states)
                            │ current_custody   │  (5 states)
                            │ opr_batch_id   FK │
                            │ first_received_at │
                            │ last_updated_at   │
                            └──┬────────────────┘
                               │
         ┌─────────────────────┼────────────────────────┐
         │                     │                        │
┌────────▼───────┐   ┌─────────▼──────────┐   ┌───────▼────────────┐
│   QCRecord     │   │   OPRBatch         │   │  DeviceAttrOverride│
│────────────────│   │──────────────────  │   │────────────────────│
│ qc_id       PK │   │ opr_batch_id   PK  │   │ override_id     PK │
│ device_id   FK │   │ company_id         │   │ device_id       FK │
│ imei           │   │ batch_reference    │   │ imei_primary       │
│ qc_type        │   │ opr_auth_number    │   │ field_changed      │  (grade|colour)
│ performed_by   │   │ repair_vendor_id   │   │ previous_value     │
│ performed_at   │   │ export_date        │   │ new_value          │
│ grade_assigned │   │ reimport_deadline  │   │ reason_code        │
│ lock_check     │   │ days_remaining     │   │ notes              │
│ functional_tests│  │ export_mrn         │   │ changed_by         │
│ outcome        │   │ processing_invoice │   │ changed_at         │
│ notes          │   │ freight_out        │   └────────────────────┘
└────────────────┘   │ freight_in         │
                     │ unit_count         │
                     │ uplift_per_unit    │
                     │ import_vat         │
                     │ status             │  (6 states)
                     └────────────────────┘

┌──────────────────┐         ┌───────────────────┐
│     Order        │◄────────┤   VatRecord       │
│──────────────────│ 1:1     │───────────────────│
│ order_id      PK │         │ vat_record_id  PK │
│ company_id       │         │ company_id        │
│ marketplace_id   │         │ linked_entity_type│  ('Order'|'PurchaseBatch'|
│ external_ref     │         │ linked_entity_id  │   'OPR Batch'|'Fintech Transaction')
│ customer_name    │         │ vat_code          │
│ order_date       │         │ tax_point_date    │
│ delivery_country │         │ gross_amount      │
│ is_export        │         │ net_amount        │
│ total_sale       │         │ vat_amount        │
│ total_net        │         │ margin_amount     │
│ vat_code_applied │         │ box_1_amount      │
│ vat_amount       │         │ box_2_amount      │
│ vat_tax_point    │         │ box_4_amount      │
│ order_status     │         │ box_6_amount      │
│ marketplace_name │         │ box_7_amount      │
│ item_count       │         │ vat_period_id  FK │
└──────────────────┘         │ override_applied  │
                             └──────────┬────────┘
                                        │ N:1
                             ┌──────────▼────────┐
                             │    VatPeriod       │
                             │────────────────────│
                             │ vat_period_id   PK │
                             │ company_id         │
                             │ period_start       │
                             │ period_end         │
                             │ status             │  (OPEN|LOCKED|SUBMITTED|CLOSED|AMENDED)
                             │ box_1 … box_9      │  (aggregated)
                             │ submitted_at       │
                             │ submitted_by       │
                             └────────────────────┘

┌──────────────────┐         ┌───────────────────┐
│  FintechAdvance  │         │  MTDVatReturn     │
│──────────────────│         │───────────────────│
│ advance_id    PK │         │ return_id      PK │
│ order_id      FK │         │ company_id        │
│ marketplace      │         │ vat_period_id  FK │
│ gross_sale       │         │ period_start/end  │
│ advance_amount   │         │ period_key        │
│ fintech_fee      │         │ status            │
│ net_advance      │         │ box_1 … box_9     │
│ advance_date     │         │ validation_errors │
│ settlement_date  │         │ hmrc_receipt_id   │
│ status           │         │ finalised         │
│ vat_record_id    │  ← NULL │ payment_due_date  │
└──────────────────┘         └───────────────────┘

┌──────────────────┐         ┌───────────────────┐
│  SupportTicket   │         │   RMARecord       │
│──────────────────│         │───────────────────│
│ ticket_id     PK │         │ rma_id         PK │
│ order_id      FK │         │ order_id       FK │
│ device_id     FK │         │ ticket_id      FK │
│ customer_name    │         │ device_id      FK │
│ customer_email   │         │ imei_sold         │
│ marketplace      │         │ imei_returned     │
│ subject          │         │ imei_match        │  ← Non-Neg Control #3
│ status           │         │ return_reason     │
│ priority         │         │ return_category   │
│ category         │         │ sale_value        │
│ rma_id        FK │         │ refund_amount     │
│ ai_draft         │         │ status            │  (13 states)
└──────────────────┘         │ resolution        │
                             │ timeline[]        │
                             └───────────────────┘

┌──────────────────────┐      ┌───────────────────┐
│  CourierInvestigation│      │   RepairJob       │
│──────────────────────│      │───────────────────│
│ investigation_id  PK │      │ repair_id      PK │
│ order_id          FK │      │ device_id      FK │
│ device_id         FK │      │ imei              │
│ event_type           │      │ make/model        │
│ courier              │      │ grade_before/after│
│ tracking_number      │      │ repair_type       │
│ customer_name/email  │      │ trigger           │
│ sale_value           │      │ vendor_id/name    │
│ claimed_amount       │      │ is_internal       │
│ recovery_amount      │      │ quote_amount      │
│ status               │  11  │ actual_cost       │
│ evidence_items[]     │states│ parts_used[]      │
│ timeline[]           │      │ timeline[]        │
└──────────────────────┘      │ status            │  (9 states)
                              │ outcome           │  (6 outcomes)
                              └───────────────────┘

┌──────────────────┐      ┌──────────────────────┐
│    UnitPnL       │      │     AuditEntry       │
│──────────────────│      │──────────────────────│
│ device_id     PK │      │ audit_id          PK │
│ imei             │      │ company_id           │
│ make/model       │      │ timestamp            │
│ order_id      FK │      │ module               │  (13 modules)
│ gross_sale       │      │ severity             │  (INFO|WARN|CRIT|SEC)
│ vat_on_sale      │      │ actor                │
│ net_revenue      │      │ actor_role           │
│ purchase_cost    │      │ action               │
│ opr_uplift       │      │ entity_type          │
│ marketplace_fee  │      │ entity_id            │
│ fintech_fee      │      │ before_state (JSON)  │
│ shipping_cost    │      │ after_state (JSON)   │
│ repair_cost      │      │ system_generated     │
│ net_profit       │      └──────────────────────┘
│ margin_percent   │
│ status           │
└──────────────────┘

┌─────────────────────┐      ┌──────────────────────────┐
│       Tenant        │      │   MarketplaceIntegration │
│─────────────────────│      │──────────────────────────│
│ tenant_id        PK │      │ integration_id        PK │
│ company_name        │      │ company_id               │
│ company_number      │      │ marketplace_name         │
│ vat_number          │      │ status                   │
│ contact_email       │      │ credentials_valid        │
│ plan                │      │ credentials_expiry       │
│ status              │      │ total_orders_synced      │
│ subdomain           │      │ api_quota_used/limit     │
│ monthly_fee         │      │ auto_vat_code            │
│ stripe_customer_id  │      │ auto_drc_check           │
│ users[]             │      │ fee_percent              │
│ usage {}            │      │ sync_log[]               │
│ features {}         │      │ recent_errors[]          │
│ hmrc_mtd_authorised │      └──────────────────────────┘
│ xero_connected      │
│ quickbooks_connected│
└─────────────────────┘

┌──────────────────┐      ┌──────────────────────────────┐
│  DeviceVariant   │      │         Notification         │
│──────────────────│      │──────────────────────────────│
│ variant_id    PK │      │ notif_id                  PK │
│ company_id       │      │ company_id                   │
│ make             │      │ severity                     │
│ model            │      │ category                     │
│ storage          │      │ title / message              │
│ colour           │      │ created_at                   │
│ grade            │      │ read / read_at               │
│ sku_code      UK │      │ action_url / action_label    │
│ is_active        │      │ auto_dismissed / expires_at  │
└──────────────────┘      └──────────────────────────────┘
```

---

## 6. Business Logic Extraction

### 6.1 VAT Engine (`src/lib/vat-engine.ts`)

The VAT engine is the most critical piece of proprietary business logic. It is pure TypeScript
with zero npm dependencies and can be ported verbatim to any runtime.

#### DRC Threshold Evaluation
```typescript
function evaluateDRCThreshold(netInvoiceValue, deliveryCountry, originalCode):
  // Rule priority (highest first):
  1. Export override (Non-Negotiable #7):
     if deliveryCountry != 'GB' and != 'UK':
       return { code: '0EXPORT_SALES', overrideApplied: true }

  2. DRC threshold (Non-Negotiable #8):
     if originalCode == '20S_SALES' and netInvoiceValue >= 5000:
       return { code: '0RCS_SALES', overrideApplied: true }

  3. No change: return { code: originalCode, overrideApplied: false }
```

#### VAT Calculation by Code
| Code | Net | VAT | Box 1 | Box 2 | Box 4 | Box 6 | Box 7 |
|------|-----|-----|-------|-------|-------|-------|-------|
| 20S_SALES | gross/1.2 | gross−net | VAT | 0 | 0 | net | 0 |
| 20S_PURCHASES | gross/1.2 | gross−net | 0 | 0 | VAT | 0 | net |
| 20RC_PURCHASES | gross | gross×20% | VAT | 0 | VAT | 0 | gross |
| 0RCS_SALES | gross | 0 | 0 | 0 | 0 | gross | 0 |
| 0MARGIN_PURCHASES | gross | 0 | 0 | 0 | 0 | 0 | gross |
| 0MARGIN_SALES | gross | (gross−cost)÷6 | VAT | 0 | 0 | gross | 0 |
| 0EXPORT_SALES | gross | 0 | 0 | 0 | 0 | gross | 0 |
| NOVAT_PURCHASES | gross | 0 | 0 | 0 | 0 | 0 | 0 |

#### Period Aggregation
```
box3 = box1 + box2   (always computed, never stored)
box5 = box3 − box4   (positive = owe HMRC; negative = reclaim)
```

#### OPR Uplift
```
totalUplift    = processingInvoice + freightOut + freightIn
upliftPerUnit  = totalUplift / unitCount
importVAT      = totalUplift × 20%
```

#### Fintech Advance
```
advanceAmount       = grossSale × 0.80
fintechFee          = advanceAmount × 0.0195
netAdvanceReceived  = advanceAmount − fintechFee
```

#### Unit P&L
```
revenue      = grossSale − vatOnSale
totalCosts   = purchaseCost + oprUplift + marketplaceFee
               + fintechFee + shippingCost + repairCost
netProfit    = revenue − totalCosts + recoveryAmount
marginPct    = (netProfit / revenue) × 100
```

---

### 6.2 10 Non-Negotiable Controls

These are hard-coded at the API layer and cannot be disabled by any user action
or configuration flag.

| # | Control | Where Enforced | Code Location |
|---|---------|----------------|---------------|
| 1 | QC Mandatory | Device cannot leave INTAKE_QC_PENDING → AVAILABLE without QCRecord outcome=PASS | `api.ts: GET /qc/pending` + `renderQC: openQCForm()` |
| 2 | Lock Check | If `lock_check_result = LOCKED` → outcome forced to LOCKED_BLOCKED → device.status = LOCKED → all sale paths blocked | `renderQC: openQCForm()` gate check |
| 3 | IMEI Matching | `RMARecord.imei_returned` must match `imei_sold`; mismatch → IMEI_MISMATCH branch | `renderRMA: viewRMA()` |
| 4 | Duplicate IMEI | Global IMEI uniqueness checked before create in both batch import and scanner intake; 409 returned on duplicate | `api.ts: POST /purchase-batches/:id/imei-import` + `POST /scanner/intake` |
| 5 | VAT Tax Point | `vat_tax_point_date` = order date; `FintechAdvance.vat_record_id = null` by type | `types/index.ts: FintechAdvance` |
| 6 | RC Atomicity | `20RC_PURCHASES` always writes Box 1 AND Box 4 simultaneously in one `calculateVat()` call | `vat-engine.ts: case '20RC_PURCHASES'` |
| 7 | Export Override | Non-UK delivery forces `0EXPORT_SALES` before any other evaluation | `vat-engine.ts: evaluateDRCThreshold()` line 1 |
| 8 | DRC Threshold | `20S_SALES` with net ≥ £5,000 forces `0RCS_SALES` + legal text | `vat-engine.ts: evaluateDRCThreshold()` |
| 9 | OPR Document Retention | 4-year minimum; vault entries marked non-deletable at UI layer | `renderOPR: viewOPRDocs()` — delete buttons absent by design |
| 10 | Audit Trail | All overrides require actor + reason + before/after state snapshot; enforced at API layer | `api.ts: PATCH /suppliers/:id`, `POST /devices/:id/override`, `POST /devices/batch-override` |

---

### 6.3 Device Status State Machine

```
State transitions enforced at UI layer (no direct status PATCH endpoint exists).
Status changes are side-effects of domain events:

Event: imei-import                 → INTAKE_QC_PENDING
Event: QC PASS                     → AVAILABLE
Event: QC LOCKED                   → LOCKED
Event: QC FAIL + repair created    → POST_REPAIR_QC (after repair)
Event: OPR batch export            → IN_OPR
Event: OPR reimport                → POST_REPAIR_QC
Event: Order reserved              → RESERVED
Event: Warehouse pick              → PICKED
Event: Courier collected           → SHIPPED
Event: Delivery confirmed          → WITH_CUSTOMER
Event: RMA authorised              → RMA_OPEN
Event: Return received             → RETURNED_RECEIVED → RETURN_QC_PENDING
Event: Return QC PASS              → RESTOCKED or NO_FAULT_FOUND
Event: Return QC FAIL              → FAULT_CONFIRMED → (repair) or SCRAPPED
Event: Write-off                   → SCRAPPED (terminal)
```

---

### 6.4 Supplier Risk Score Algorithm

The supplier risk score (0–100) is computed in `getSupplierAnalytics()`:
- QC fail rate contribution (defect_count / total devices)
- Locked device rate (locked_count / total devices)
- OPR overdue risk (overdue_count / opr_batch_count)
- Return rate (return_count / total devices)
- Repair cost ratio (repair_cost / total_purchases)

Labels: 0–25 = LOW | 26–50 = MEDIUM | 51–75 = HIGH | 76–100 = CRITICAL

---

## 7. Event Flow System

### 7.1 Current Event Flow (In-Memory)

The system has no event bus, message queue, or pub/sub mechanism. All "events" are
synchronous function calls within a single request context:

```
HTTP Request arrives
    │
    ▼
Hono route handler executes
    │
    ├── Validate input
    ├── Mutate in-memory array(s)
    ├── (conditionally) write AuditEntry to auditLog[]
    └── Return JSON response

Browser receives response
    │
    ▼
Frontend JS:
    ├── Refresh window._allXxx global
    └── Re-render DOM section
```

### 7.2 Events That Trigger Audit Log Entries (auto-written by API)

| Trigger | Module | Severity |
|---------|--------|----------|
| `POST /suppliers` | SUPPLIERS | INFO |
| `PATCH /suppliers/:id` | SUPPLIERS | INFO |
| `PATCH /suppliers/:id` (deactivate) | SUPPLIERS | INFO |
| `POST /devices/:id/override` | INVENTORY | WARNING |
| `POST /devices/batch-override` (per device) | INVENTORY | WARNING |
| `POST /device-variants` | SYSTEM | INFO |
| `POST /device-variants/import` | SYSTEM | INFO |

**Missing audit auto-generation (gap):**
- QC outcomes not auto-audited
- OPR batch state changes not auto-audited
- Order creation/VAT code assignment not auto-audited
- RMA creation and IMEI mismatch not auto-audited
- MTD submission not auto-audited

### 7.3 Notification Events (Seeded in Data Store)

Notifications are pre-seeded in `data-store.ts` — no auto-generation at runtime.
Planned Phase 6 work: trigger notifications on:
- OPR batch approaching 180-day deadline
- VAT period lock date approaching
- Marketplace sync failure
- IMEI lock detected at intake

### 7.4 Planned Event Architecture (Phase 5/6 Recommendation)

For a rebuild, the recommended event architecture is:

```
Domain Event Emitted
    │
    ├── Write to D1 (primary persistence)
    ├── Write to AuditLog (D1 audit table)
    ├── Evaluate notification rules → write Notification record
    └── (Phase 6) Trigger webhook / email via Resend API
```

---

## 8. Risks & Technical Debt

### 8.1 Critical Risks (System Cannot Safely Go to Production Without Fixing)

| Risk | Severity | Impact | Effort to Fix |
|------|----------|--------|---------------|
| **No authentication** | CRITICAL | Anyone with the URL has full admin access to all data | Medium — JWT middleware + login page |
| **In-memory data store** | CRITICAL | All data wiped on every Cloudflare Worker cold start or deployment | High — D1 migration (Phase 5) |
| **No rate limiting** | HIGH | API is open to abuse; DDoS or data scraping trivial | Low — Cloudflare WAF or Hono middleware |
| **HMRC MTD is simulated** | HIGH | Production VAT submissions would fail; compliance risk | High — HMRC OAuth + sandbox testing |
| **OPR document vault is stubbed** | HIGH | 4-year retention legally required; documents not actually stored | Medium — R2 integration |
| **No multi-tenant isolation** | HIGH | `company_id` is hardcoded to `'REFURBIQ_DEMO'` everywhere | High — auth layer + dynamic company_id |

### 8.2 High Technical Debt Items

| Item | Description | Recommended Fix |
|------|-------------|-----------------|
| **Single-file SPA (5,700 lines)** | Entire frontend is one string; no component abstraction; changes risk breaking escaping | Phase 6: extract to React/Preact component SPA or HTMX partials |
| **`window._*` global state** | No reactivity; manual re-render discipline fragile; race conditions possible | Phase 6: migrate to lightweight reactive store (Preact signals, Nanostores) |
| **`any` type casts in api.ts** | `(devices as any[])`, `(suppliers as any[])` throughout — defeats TypeScript safety | Fix with proper generic types when migrating to D1 |
| **Hardcoded `company_id`** | `'REFURBIQ_DEMO'` string literal in 50+ locations in api.ts | Replace with `c.get('companyId')` from auth middleware |
| **IMEI prefix map** | `makeMap` in `/scanner/lookup` is 4-entry hardcode | Replace with real IMEI GSMA TAC database API |
| **`alert()` stubs** | ~7 major workflows stub out with `alert('...')` | All require real implementation before launch |
| **No input sanitisation** | API routes do minimal validation; no Zod/Valibot schemas | Add Hono validator middleware with typed schemas |
| **Box 2 always zero** | EC acquisition VAT (post-Brexit applicable in some scenarios) is zeroed | Review with HMRC specialist for current UK rules |
| **Marketplace sync simulated** | OAuth flows, webhook listeners, and order ingestion not built | Each marketplace requires separate OAuth app registration |
| **No error boundaries** | Frontend `axios.get()` failures often silently render empty state | Add `.catch()` with user-visible error states |

### 8.3 Escaping Debt (Critical for Future Editing)

The single-file SPA in `src/index.tsx` has critical escaping constraints:

| Risk | What Goes Wrong | Prevention |
|------|-----------------|------------|
| Regex literal with `\d` | Build succeeds but JS is silently broken at runtime | Always use `new RegExp('\\d+')` |
| `${expr}` without escape | Template literal interpolation fires at Hono build time | Always write `\${expr}` inside the template literal |
| Backtick in JS string | Terminates the outer template literal | Always write `\`` |
| `\n` in string | Single backslash consumed by template literal | Always write `'\\n'` |

These constraints disappear entirely if the SPA is extracted to separate `.js`/`.html` files.

### 8.4 Compliance Gaps

| Gap | Regulation | Priority |
|-----|-----------|---------|
| No HMRC MTD live API | HMRC Making Tax Digital for VAT | CRITICAL before production |
| No VAT period lock enforcement at API level | Period with status=LOCKED can still have records added | HIGH |
| OPR 4-year document retention not technically enforced | S9 HMRC guidance | HIGH — R2 with object-lock needed |
| No IR35 / employment status check for self-employed contractors | Ancillary compliance | LOW |
| No GDPR data retention / erasure | GDPR Art. 17 | MEDIUM — customer data in tickets/RMAs |

---

## 9. Recommended New Architecture

### 9.1 Target Stack Decision Matrix

| Concern | Current | Recommended (Phase 5/6) | Alternative |
|---------|---------|------------------------|-------------|
| **Runtime** | Cloudflare Workers | Cloudflare Workers (keep) | Node.js on Railway/Render |
| **Framework** | Hono v4 | Hono v4 (keep) | Next.js App Router |
| **Database** | In-memory arrays | Cloudflare D1 (SQLite) | PlanetScale / Neon (Postgres) |
| **Auth** | None | Clerk (edge-compatible JWT) | Auth0 / Lucia |
| **File Storage** | None (stubbed) | Cloudflare R2 | AWS S3 |
| **Cache** | None | Cloudflare KV | Upstash Redis |
| **Email** | None (stubbed) | Resend | SendGrid |
| **Frontend** | Vanilla JS in template literal | Preact + Vite (separate SPA) | React + Vite |
| **Validation** | Manual checks | Zod (edge-compatible) | Valibot |
| **CI/CD** | None | GitHub Actions | Cloudflare Workers CI |
| **HMRC MTD** | Simulated | HMRC Sandbox → Production API | Third-party (DataDear, Xero) |
| **Monitoring** | None | Cloudflare Analytics + Sentry | Axiom |

---

### 9.2 Recommended Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                  RECOMMENDED TARGET ARCHITECTURE                  │
└──────────────────────────────────────────────────────────────────┘

Browser
  │  (Preact SPA — separate Vite build → CDN)
  │
  ▼ HTTPS
┌────────────────────────────────────────┐
│         Cloudflare Pages               │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │    Hono v4 (Cloudflare Worker)   │  │
│  │                                  │  │
│  │  Auth middleware (Clerk JWT)     │  │  ← extracts company_id from JWT
│  │  Rate limit middleware           │  │  ← Hono + Cloudflare KV counter
│  │  Zod validation middleware       │  │  ← per-route schemas
│  │  CORS middleware (restricted)    │  │
│  │                                  │  │
│  │  /api/auth/*   ← Clerk webhooks  │  │
│  │  /api/*        ← D1 queries      │  │
│  │  /api/mtd/*    ← HMRC MTD proxy  │  │
│  │  /api/mkt/*    ← Marketplace     │  │
│  │  /api/notify/* ← Resend proxy    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ D1 SQLite│  │R2 Objects│  │  KV  │ │
│  │(primary) │  │(OPR docs)│  │(cache│ │
│  └──────────┘  └──────────┘  └──────┘ │
└────────────────────────────────────────┘
         │               │
         ▼               ▼
  ┌──────────┐    ┌──────────────┐
  │HMRC MTD  │    │ Marketplace  │
  │  API     │    │ APIs (OAuth) │
  └──────────┘    └──────────────┘
         │
         ▼
  ┌──────────────┐
  │ Resend Email │  ← OPR expiry alerts, VAT period reminders
  └──────────────┘
```

---

### 9.3 D1 Database Schema (Phase 5 Migration Plan)

Every in-memory array in `data-store.ts` maps directly to a D1 table.
All tables share the `company_id` column for multi-tenant row-level isolation.

**Critical migration notes:**
- All IDs are currently alphanumeric strings (e.g. `DEV123456`, `PB2026-001`) — preserve as TEXT
- IMEI uniqueness must be enforced as a UNIQUE constraint, not just application-level
- `before_state` / `after_state` in AuditEntry are JSON blobs — store as TEXT in D1
- VatRecord boxes (1,2,4,6,7) must have NOT NULL DEFAULT 0
- `FintechAdvance.vat_record_id` must default to NULL (never foreign-keyed)

**Recommended migration order:**
1. `suppliers` (no foreign key dependencies)
2. `purchase_batches` (FK: supplier_id)
3. `device_variants` (no FK dependencies)
4. `devices` (FK: supplier_id, purchase_batch_id, opr_batch_id)
5. `opr_batches` (FK: repair_vendor → create vendor table)
6. `qc_records` (FK: device_id)
7. `orders` (FK: none — marketplace_id is string enum)
8. `vat_records` + `vat_periods` (FK: vat_period_id)
9. `mtd_vat_returns` (FK: vat_period_id)
10. `fintech_advances` (FK: order_id)
11. `support_tickets` (FK: order_id, device_id)
12. `rma_records` (FK: order_id, ticket_id, device_id)
13. `courier_investigations` (FK: order_id, ticket_id, device_id)
14. `repair_jobs` (FK: device_id)
15. `audit_log` (no FK — entity references are soft strings)
16. `notifications` (no FK)
17. `marketplace_integrations` (no FK)
18. `tenants` + `tenant_users` + `tenant_usage` (separate SaaS schema)
19. `device_attribute_overrides` (FK: device_id)

---

### 9.4 Authentication Architecture (Phase 6)

**Recommended: Clerk (edge-compatible)**

```typescript
// Middleware (add before all /api routes)
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  const payload = await verifyClerkJWT(token, CLERK_PEM_PUBLIC_KEY);
  if (!payload) return c.json({ error: 'Unauthorised' }, 401);

  // Extract company_id from JWT metadata
  c.set('companyId', payload.publicMetadata.company_id);
  c.set('userRole', payload.publicMetadata.role);
  c.set('userId', payload.sub);
  await next();
});

// Then in every route — replace hardcoded 'REFURBIQ_DEMO':
const companyId = c.get('companyId');
const records = await db.prepare(
  'SELECT * FROM devices WHERE company_id = ?'
).bind(companyId).all();
```

**User Roles (from `TenantUser.role`):**
ADMIN | MANAGER | WAREHOUSE | FINANCE | SUPPORT | READ_ONLY

---

## 10. Modular Breakdown

### 10.1 Backend Modules

| Module | Files | Endpoints | Dependencies |
|--------|-------|-----------|--------------|
| Dashboard | api.ts | 2 | All data arrays |
| Inventory & Devices | api.ts | 7 | devices[], purchaseBatches[], suppliers[], qcRecords[] |
| QC | api.ts | 2 | devices[], qcRecords[] |
| OPR | api.ts | 3 + calculator | oprBatches[], vat-engine |
| Orders | api.ts | 2 | orders[], vatRecords[], fintechAdvances[] |
| VAT Engine | api.ts + vat-engine.ts | 4 | VAT_CODE_DEFINITIONS |
| Fintech | api.ts | 2 | fintechAdvances[], vat-engine |
| Suppliers | api.ts | 4 | suppliers[], auditLog[] |
| Batches | api.ts | 3 | purchaseBatches[], suppliers[] |
| Support | api.ts | 2 | supportTickets[] |
| Courier/INR | api.ts | 3 | courierInvestigations[] |
| RMA | api.ts | 3 | rmaRecords[] |
| Profitability | api.ts | 3 | unitPnLRecords[], getProfitabilitySummary() |
| Repairs | api.ts | 3 | repairJobs[], getRepairStats() |
| Supplier Analytics | api.ts | 2 | getSupplierAnalytics() |
| Audit Log | api.ts | 3 | auditLog[] |
| MTD Returns | api.ts | 4 | mtdVatReturns[], vat-engine |
| Scanner | api.ts | 2 | devices[], purchaseBatches[] |
| Marketplace | api.ts | 6 | marketplaceIntegrations[] |
| Notifications | api.ts | 4 | notifications[] |
| Tenants | api.ts | 5 | tenants[] |
| Device Variants | api.ts | 5 | deviceVariants[], auditLog[] |
| Device Overrides | api.ts | 3 | devices[], deviceAttributeOverrides[], auditLog[] |
| Update Tracker | api.ts | 3 | PHASE_CHANGELOG[], manualUpdates[] |

---

### 10.2 Frontend Modules

| Page | Render Function | Lines | Primary API Calls |
|------|----------------|-------|------------------|
| Dashboard | `renderDashboard` | 608–940 | `/dashboard/v2`, `/notifications/summary` |
| Inventory | `renderInventory` | 941–987 | `/devices`, `/purchase-batches`, `/suppliers?active=true` |
| QC | `renderQC` | 1491–1656 | `/qc/pending` |
| OPR | `renderOPR` | 1657–1853 | `/opr-batches`, `/opr/calculate` |
| Orders | `renderOrders` | 1854–2005 | `/orders` |
| VAT Engine | `renderVAT` | 2006–2261 | `/vat-codes`, `/vat-records`, `/vat-periods`, `/vat/evaluate`, `/vat/calculate` |
| Fintech | `renderFintech` | 2262–2338 | `/fintech`, `/fintech/calculate` |
| Suppliers & Batches | `renderSuppliers` | 2339–2740 | `/suppliers`, `/purchase-batches` |
| Bulk Override | `openBulkOverrideModal` | 2741–2906 | `/devices/batch-override` |
| Support | `renderSupport` | 2907–3038 | `/tickets` |
| Admin & Settings | `renderAdmin` | 3039–3252 | *(in-page only)* |
| Variants Catalogue | `renderDeviceVariantsInto` | 3255–3412 | `/device-variants`, `/device-variants/makes` |
| Device Override Panel | `renderOverridePanel` | 3413–3505 | `/devices/:id/override` |
| Courier & INR | `renderCourier` | 3507–3752 | `/investigations`, `/investigations/stats/summary` |
| Returns & RMA | `renderRMA` | 3753–3950 | `/rma`, `/rma/stats/summary` |
| Profitability & P&L | `renderProfitability` | 3951–4166 | `/pnl/summary`, `/pnl/units` |
| Repairs | `renderRepairs` | 4167–4440 | `/repairs`, `/repairs/stats/summary` |
| Supplier Analytics | `renderSupplierAnalytics` | 4441–4662 | `/supplier-analytics` |
| HMRC MTD Returns | `renderMTD` | 4663–4827 | `/mtd-returns`, `/mtd-returns/:id/validate`, `/mtd-returns/:id/submit` |
| Audit Log | `renderAuditLog` | 4828–4933 | `/audit-log`, `/audit-log/stats/summary` |
| IMEI Scanner | `renderScanner` | 4934–5209 | `/scanner/lookup`, `/scanner/intake` |
| Marketplace Hub | `renderMarketplace` | 5210–5398 | `/marketplace`, `/marketplace/stats/summary`, `/marketplace/:id/sync` |
| Tenant Management | `renderTenants` | 5399–5606 | `/tenants`, `/tenants/summary` |

---

### 10.3 Shared Utilities (Frontend, in `<script>` block)

| Function | Purpose | Lines |
|----------|---------|-------|
| `fmt(n, decimals)` | Currency/number formatting | ~390 |
| `statusBadge(status, map)` | Colour-coded pill badge | ~400 |
| `table(headers, rows)` | Consistent table scaffold | ~410 |
| `statCard(label, value, sub, icon, color)` | KPI card component | ~420 |
| `navigateTo(page)` | SPA router | ~522 |
| `openModal(id)` / `closeModal(id)` | Modal show/hide | ~570 |
| `applyTheme()` / `toggleTheme()` | Dark/light theme | ~5615 |
| `toggleSidebar()` | Sidebar collapse | ~5608 |
| `initUI()` | App bootstrap | ~5640 |
| `esc(str)` *(tracker.html only)* | HTML sanitisation | tracker.html |

---

## 11. API Map

All routes are prefixed `/api`. All return `Content-Type: application/json`.
All routes have CORS headers via `api.use('*', cors())`.

### 11.1 Dashboard

| Method | Path | Description | Key Response Fields |
|--------|------|-------------|---------------------|
| GET | `/dashboard` | Base dashboard stats (Phase 1) | `total_devices`, `available_devices`, `in_opr`, `pending_qc`, `open_orders`, `vat_liability`, `total_revenue_mtd` |
| GET | `/dashboard/v2` | Enhanced dashboard (Phase 4) | Base stats + `repair_stats`, `pnl_summary`, `notifications`, `marketplace` |

### 11.2 VAT Engine

| Method | Path | Description | Body / Query |
|--------|------|-------------|-------------|
| GET | `/vat-codes` | All 8 VAT code definitions | — |
| POST | `/vat/evaluate` | DRC threshold + VAT calculation | `netValue`, `deliveryCountry`, `vatCode`, `grossAmount`, `costPrice` |
| POST | `/vat/calculate` | VAT calculation only | `vatCode`, `grossAmount`, `costPrice` |
| POST | `/opr/calculate` | OPR uplift calculation | `processingInvoiceValue`, `freightOutbound`, `freightInbound`, `unitCount` |
| POST | `/fintech/calculate` | Fintech advance calculation | `grossSaleValue` |

### 11.3 Suppliers

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/suppliers` | List suppliers | `?active=true` for active only |
| GET | `/suppliers/:id` | Single supplier | |
| POST | `/suppliers` | Create supplier | Requires: `supplier_code`, `name`, `country`, `default_vat_code` |
| PATCH | `/suppliers/:id` | Update / deactivate supplier | `is_active: false` for soft-delete; writes audit log |

### 11.4 Purchase Batches

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/purchase-batches` | List all batches | |
| GET | `/purchase-batches/:id` | Single batch | |
| POST | `/purchase-batches` | Create batch | Requires: `supplier_id`, `external_invoice_ref`, `vat_code` |
| POST | `/purchase-batches/:id/imei-import` | CSV row import | Body: `{ rows: [{imei, make, model, storage, colour, grade, network}] }` |

### 11.5 Devices

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/devices` | List devices | `?status=`, `?grade=`, `?make=` |
| GET | `/devices/:id` | Device + QC history | Returns `{ ...device, qc_records: [] }` |
| GET | `/devices/:id/overrides` | Override history for device | |
| POST | `/devices/:id/override` | Single attribute override | Requires: `field_changed` (grade\|colour), `new_value`, `reason_code` |
| POST | `/devices/batch-override` | Multi-device override | Requires: `device_ids[]`, `field_changed`, `new_value`, `reason_code` |

### 11.6 OPR Batches

| Method | Path | Description |
|--------|------|-------------|
| GET | `/opr-batches` | List all OPR batches |
| GET | `/opr-batches/:id` | Single OPR batch |

### 11.7 Orders

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/orders` | List orders | `?status=`, `?marketplace=` |
| GET | `/orders/:id` | Order + VAT record + fintech advance | Returns enriched order |

### 11.8 VAT Records & Periods

| Method | Path | Description |
|--------|------|-------------|
| GET | `/vat-records` | All VAT records |
| GET | `/vat-records/period/:periodId` | Records for a period + aggregated boxes |
| GET | `/vat-periods` | All VAT periods |
| GET | `/vat-periods/:id` | Single VAT period |

### 11.9 QC

| Method | Path | Description |
|--------|------|-------------|
| GET | `/qc` | All QC records |
| GET | `/qc/pending` | Devices awaiting QC (status in INTAKE_QC_PENDING, RETURN_QC_PENDING, POST_REPAIR_QC) |

### 11.10 Fintech

| Method | Path | Description |
|--------|------|-------------|
| GET | `/fintech` | All fintech advances |

### 11.11 Support Tickets

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/tickets` | List tickets | `?status=`, `?priority=` |
| GET | `/tickets/:id` | Single ticket |

### 11.12 Courier Investigations

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/investigations` | List investigations | `?status=`, `?event_type=` |
| GET | `/investigations/:id` | Single investigation |
| GET | `/investigations/stats/summary` | Open count, claimed/recovered totals, recovery rate |

### 11.13 RMA

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/rma` | List RMAs | `?status=` |
| GET | `/rma/:id` | Single RMA |
| GET | `/rma/stats/summary` | Open, mismatches, total refunded, pending QC |

### 11.14 Profitability

| Method | Path | Description |
|--------|------|-------------|
| GET | `/pnl/units` | All unit P&L records (`?status=`) |
| GET | `/pnl/summary` | Aggregate P&L summary |
| GET | `/pnl/units/:device_id` | Single device P&L |

### 11.15 Repairs

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/repairs` | List repair jobs | `?status=`, `?outcome=`, `?device_id=` |
| GET | `/repairs/stats/summary` | Counts, costs, grade changes |
| GET | `/repairs/:id` | Single repair job |

### 11.16 Supplier Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/supplier-analytics` | All supplier metrics + summary |
| GET | `/supplier-analytics/:id` | Single supplier metrics |

### 11.17 Audit Log

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/audit-log` | List audit entries | `?module=`, `?severity=`, `?actor=`, `?limit=` |
| GET | `/audit-log/:id` | Single audit entry |
| GET | `/audit-log/stats/summary` | Counts by severity + module, recent 5 |

### 11.18 HMRC MTD Returns

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/mtd-returns` | List all MTD returns |
| GET | `/mtd-returns/:id` | Single return |
| GET | `/mtd-returns/:id/validate` | Run validation checks | Returns `{ valid, errors[], warnings[], can_submit }` |
| POST | `/mtd-returns/:id/submit` | Submit return to HMRC | Currently simulated; returns mock `hmrc_receipt_id` |

### 11.19 Tenants

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tenants` | List all tenants |
| GET | `/tenants/summary` | SaaS aggregate: MRR, ARR, plan breakdown |
| GET | `/tenants/:id` | Single tenant |
| PATCH | `/tenants/:id/status` | Update tenant status (suspend/reactivate) |
| GET | `/tenants/:id/usage` | Tenant usage data |

### 11.20 Marketplace

| Method | Path | Description |
|--------|------|-------------|
| GET | `/marketplace` | All integrations (alias of `/marketplace/integrations`) |
| GET | `/marketplace/integrations` | All integrations |
| GET | `/marketplace/stats/summary` | Connected/error counts, order totals |
| GET | `/marketplace/:id` | Single integration |
| POST | `/marketplace/:id/reconnect` | Simulate OAuth reconnect |
| POST | `/marketplace/:id/sync` | Trigger manual sync |

### 11.21 Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | All notifications (`?unread_only=true`) |
| GET | `/notifications/summary` | Unread count by category |
| PATCH | `/notifications/:id/read` | Mark one as read |
| POST | `/notifications/mark-all-read` | Mark all as read |

### 11.22 Device Variants

| Method | Path | Description |
|--------|------|-------------|
| GET | `/device-variants` | List active variants (`?make=`, `?model=`) |
| GET | `/device-variants/makes` | Distinct makes list |
| GET | `/device-variants/models` | Distinct models (`?make=`) |
| POST | `/device-variants` | Create variant (duplicate check enforced) |
| POST | `/device-variants/import` | Bulk CSV import |

### 11.23 Scanner

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scanner/lookup` | IMEI/barcode lookup | Returns: `{ found, type, device|batch, action, inferred_make, inferred_model, suggestion }` |
| POST | `/scanner/intake` | Create device from scan | Validates 8 required fields; duplicate IMEI → 409 |

### 11.24 Update Tracker

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| GET | `/updates` | Changelog entries | `?type=`, `?phase=`, `?limit=`, `?offset=` |
| GET | `/updates/summary` | Counts by type/phase, latest entry | |
| POST | `/updates` | Create manual update entry | Requires: `title`, `detail`, `type` |

---

### 11.25 Missing / Stubbed Endpoints (Not Yet Implemented)

| Feature | What's Needed | Priority |
|---------|---------------|---------|
| QC record creation | `POST /qc` — currently QC form is UI-only | HIGH |
| OPR batch create | `POST /opr-batches` | HIGH |
| OPR batch status update | `PATCH /opr-batches/:id/status` | HIGH |
| OPR document upload | `POST /opr-batches/:id/documents` (R2) | HIGH |
| RMA create | `POST /rma` | HIGH |
| RMA status update | `PATCH /rma/:id/status` | HIGH |
| Investigation create | `POST /investigations` | MEDIUM |
| Investigation status update | `PATCH /investigations/:id/status` | MEDIUM |
| Repair job create | `POST /repairs` | MEDIUM |
| Repair status update | `PATCH /repairs/:id/status` | MEDIUM |
| Order create / VAT code assignment | `POST /orders` | HIGH |
| VAT record create | `POST /vat-records` | HIGH |
| VAT period lock | `PATCH /vat-periods/:id/lock` | HIGH |
| Fintech advance create | `POST /fintech` | MEDIUM |
| Support ticket create | `POST /tickets` | MEDIUM |
| Ticket status update | `PATCH /tickets/:id/status` | MEDIUM |
| AI ticket draft | `POST /tickets/:id/draft` (OpenAI proxy) | LOW |
| MTD return create from period | `POST /mtd-returns` | HIGH |
| Notification create (system) | `POST /notifications` (internal) | MEDIUM |
| Tenant create | `POST /tenants` | MEDIUM |

---

## 12. Open Questions & Missing Data

### 12.1 Business Requirements — Unresolved

| # | Question | Impact |
|---|----------|--------|
| 1 | **What are the exact HMRC MTD API scopes required?** eBay-sourced devices may use Margin Scheme; Amazon typically uses Standard VAT. The current MTD stub must be replaced with real sandbox credentials. | CRITICAL — without this, compliance claims are invalid |
| 2 | **Is Box 2 (EC Acquisitions) ever non-zero post-Brexit?** The code always zeros Box 2. Some acquisition scenarios (e.g. Northern Ireland protocol) may require a non-zero Box 2. | HIGH — potential HMRC filing error |
| 3 | **What is the multi-tenancy isolation model?** Is each reseller company a separate D1 database, or row-level `company_id` isolation in a shared database? | HIGH — affects Phase 5 D1 schema design entirely |
| 4 | **What IMEI lock check API is used?** The QC form has a lock check but the verification logic is UI-only (no third-party API call to CheckMEND, IMEIPro, etc.). | HIGH — lock check is Non-Negotiable Control #2 |
| 5 | **What marketplace fee rates are correct?** Current hardcoded rates: eBay ~12.8%, Amazon ~15%, Back Market ~10%, Swappa ~3%. These affect P&L accuracy. | MEDIUM — P&L figures will be wrong if rates change |
| 6 | **What is the approval routing for manager approvals?** Multiple workflows call `alert('Manager approval recorded')`. Who are the approvers? Email notification? Separate approval dashboard? | MEDIUM — blocks RMA, MTD, and quote workflows |
| 7 | **What is the OPR authorisation number format?** The field accepts free text. HMRC OPR authorisation numbers have a specific format (IPR/OPR authorisation ref). Should this be validated? | MEDIUM — compliance risk if wrong format submitted |
| 8 | **Which payment processors for refund issuance?** Stripe? PayPal? Marketplace-specific (eBay Managed Payments, Amazon Seller Central)? Each has a different API. | MEDIUM — blocks RMA refund workflow |
| 9 | **Is the IMEI prefix → make/model inference table maintained externally?** Currently 4 hardcoded entries. GSMA TAC database exists but requires licensing. | LOW — scanner fallback works; model inference is advisory only |
| 10 | **What is the subdomain strategy for SaaS tenants?** `Tenant.subdomain` exists but there is no routing or CNAME logic for `{subdomain}.refurbiq.co.uk`. | LOW — needed before SaaS launch |

### 12.2 Data Quality Gaps

| # | Gap | Where |
|---|-----|-------|
| 1 | **No unit cost at import time** | `POST /purchase-batches/:id/imei-import` creates devices with `unit_cost: 0`. Unit costs must be manually updated or calculated from batch total ÷ device count. |
| 2 | **No marketplace order ID → device IMEI link** | Orders have `device_id` but the pick/pack assignment workflow is not implemented. Orders and devices are linked only by manual correlation in seed data. |
| 3 | **No address validation for export detection** | `is_export` flag on Order is stored but not computed. The VAT engine uses `delivery_country` correctly, but the order creation flow (when built) must correctly set `delivery_country`. |
| 4 | **No VAT period auto-creation** | VAT periods are seed data only. There is no `/vat-periods` POST endpoint or automatic period creation logic when a period rolls over. |
| 5 | **Marketplace fee not deducted in order creation** | `MarketplaceIntegration.fee_percent` exists per integration but is not wired into order creation to auto-calculate net revenue at point of sale. |
| 6 | **No audit entries for QC outcomes** | QC pass/fail/locked events are not written to `auditLog[]`. These are compliance-relevant events and should be recorded. |
| 7 | **`company_id` is always `'REFURBIQ_DEMO'`** | Multi-tenancy is architecturally supported but not yet operationally active. Every record in the system belongs to the demo tenant. |

### 12.3 Architecture Decisions to Confirm Before Phase 5

| Decision | Options | Recommendation |
|----------|---------|---------------|
| D1 shared vs. per-tenant | Shared DB with `company_id` partitioning vs. one D1 per tenant | Shared for Starter/Pro; consider per-tenant for Enterprise to meet data isolation SLAs |
| Auth provider | Clerk vs. Lucia (self-hosted) vs. Auth0 | **Clerk** — edge-compatible JWT verification, built-in Cloudflare Workers support, handles MFA |
| Frontend extraction | Keep single-file vs. extract to Preact SPA | **Extract to Preact SPA** — removes escaping constraints, enables hot module replacement, reduces error surface |
| OPR document storage | R2 with object-lock vs. third-party DMS | **R2** — native Cloudflare integration, cost-effective, object retention policies available |
| Rate limiting strategy | Hono middleware + KV counters vs. Cloudflare WAF rules | **Cloudflare WAF** for DDoS/IP-level; **Hono + KV** for per-tenant API quota enforcement (already modelled in `TenantUsage.api_calls_today`) |
| HMRC MTD integration | Direct HMRC API vs. third-party (DataDear, Xero) | **Direct HMRC API** preferred for control; use HMRC sandbox for testing |

---

## Appendix A — Codebase Metrics

| File | Lines | Purpose |
|------|-------|---------|
| `src/index.tsx` | ~5,700 | Entire SPA: HTML shell, all CSS, all frontend JS, 21 page renderers |
| `src/routes/api.ts` | ~875 | All 53 REST endpoints + PHASE_CHANGELOG static data |
| `src/lib/vat-engine.ts` | ~265 | Core business logic: VAT, OPR uplift, fintech advance, P&L |
| `src/lib/data-store.ts` | ~600 (est.) | In-memory arrays, seed data, aggregate helper functions |
| `src/types/index.ts` | 868 | TypeScript interfaces: 25+ types, all enums |
| `public/static/tracker.html` | ~900 | Development tracker SPA (standalone) |
| **Total** | **~9,200** | |

| Metric | Value |
|--------|-------|
| UI pages | 21 |
| API endpoints | 53 |
| VAT codes implemented | 8 |
| Device statuses | 17 |
| RMA statuses | 13 |
| Non-negotiable controls active | 10/10 |
| Build phases complete | 4/6 |
| Known stubs (alert() placeholders) | 7 |
| Missing endpoints (not yet built) | ~20 |

---

## Appendix B — Known Stubs (Complete List)

| Stub | UI Location | What Fires | Blocker |
|------|------------|-----------|---------|
| HMRC MTD live submission | `renderMTD → submitMTDReturn` | `alert('Submitted to HMRC...')` | HMRC MTD OAuth + sandbox key |
| Marketplace OAuth reconnect | `renderMarketplace → reconnectMarketplace` | API simulates (no real OAuth) | Per-marketplace developer accounts |
| AI ticket draft | `renderSupport → viewTicket` | `alert('Draft generated')` | OpenAI server-side route |
| Manager approval | Various modals | `alert('Approval recorded')` | Approval routing design |
| Police report generation | `renderRMA` | `alert('Report submitted')` | Document generation service |
| Refund issuance | `renderRMA` | `alert('Refund issued')` | Payment processor integration |
| Quote approval | `renderRMA` | `alert('Quote approved')` | Approval routing design |
| CSV settlement upload | `renderFintech` | Not yet in UI | Settlement reconciliation engine design |
| OPR document vault upload | `renderOPR → viewOPRDocs` | No upload button | R2 file upload route |
| IMEI lock check API | `renderQC → openQCForm` | Manual checkbox only | CheckMEND/IMEIPro API key + integration |

---

*Document generated: 2026-04-28*  
*Derived from source commit: `406d36f`*  
*Author: Principal Software Architect analysis — RefurbIQ v2.0*
