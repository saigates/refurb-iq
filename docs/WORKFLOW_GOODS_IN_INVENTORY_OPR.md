# RefurbIQ — Goods-In, Inventory Management & OPR Workflow

> Derived directly from the live codebase (`src/index.tsx`, `src/routes/api.ts`,
> `src/lib/data-store.ts`). Every step maps to a real UI function or API endpoint.
> Stubs are clearly marked ⚠️ STUB.
>
> Last updated: **2026-04-30**

---

## Overview — The Three Stages

```
SUPPLIER INVOICE
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 1 — GOODS-IN                                 │
│  Create Purchase Batch → Import IMEI CSV            │
│  Devices born as INTAKE_QC_PENDING                  │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 2 — QUALITY CONTROL                          │
│  Intake QC form → Grade + Lock Check                │
│  PASS → AVAILABLE   |   LOCKED → blocked            │
└─────────────────────────────────────────────────────┘
      │
      ├──────────────────────────────────────────────┐
      │ (device stays in UK for sale)                │ (device exported for repair)
      ▼                                              ▼
┌─────────────────┐                    ┌─────────────────────────────────────────┐
│  INVENTORY      │                    │  STAGE 3 — OPR                          │
│  AVAILABLE      │                    │  New OPR Batch → Export → 180-day timer │
│  → Order/Ship   │                    │  Repair → Reimport → C88 → VAT Box 4   │
└─────────────────┘                    └─────────────────────────────────────────┘
```

---

## Stage 1 — Goods-In

### 1.1 Pre-requisites

Before any batch can be created, the supplier must exist in the system.

| Check | Where | API |
|-------|-------|-----|
| Supplier is active (`is_active = true`) | Suppliers & Batches page | `GET /api/suppliers?active=true` |
| Supplier has a `default_vat_code` set | Supplier record | Used to auto-populate batch VAT code |

> **Rule:** The Import Batch modal fetches `GET /api/suppliers?active=true` on **every** open.
> Never hardcode supplier options. Inactive suppliers are invisible in the dropdown.

---

### 1.2 Open the Import Modal

**Navigation:** Inventory → **Import Batch / IMEI CSV** button (top-right)

**Function:** `showImportModal()` (async — fetches suppliers before rendering)

The modal presents:

1. **Goods-In info banner** — 4-step reminder shown at the top of every import
2. **Supplier dropdown** — active suppliers only, format: `CODE — Full Name`
3. **Invoice Reference** — the supplier's external invoice number (e.g. `TS-INV-5500`)
4. **Batch Date** — defaults to today
5. **VAT Code** — auto-populates from `supplier.default_vat_code` on supplier change

#### VAT Code auto-populate rule
```
onImportSupplierChange()
  → reads data-vatcode attribute from selected <option>
  → sets #import-vat-code select value
```

The four valid purchase VAT codes:

| Code | Meaning |
|------|---------|
| `20RC_PURCHASES` | Domestic reverse charge — atomic Box 1 + Box 4 entry, net VAT = £0 |
| `20S_PURCHASES` | Standard 20% input VAT — reclaimable in Box 4 |
| `0MARGIN_PURCHASES` | Margin scheme purchase — no VAT element, sale taxed on profit margin only |
| `NOVAT_PURCHASES` | Outside scope — no VAT impact whatsoever |

---

### 1.3 Prepare the IMEI CSV

Download the template from the modal: **Download Template** link (generates a blob URL).

Required columns (case-insensitive, extra columns ignored):

| Column | Required | Notes |
|--------|----------|-------|
| `IMEI` | ✅ Yes | 14–16 digits; duplicates within file flagged as errors |
| `Make` | ✅ Yes | e.g. Apple, Samsung, Google |
| `Model` | ✅ Yes | e.g. iPhone 14 Pro |
| `Storage` | No | e.g. 128GB |
| `Colour` | No | Also accepts `Color` spelling |
| `Network` | No | e.g. UNLOCKED, EE, O2 |
| `Grade` | No | A/B/C/D — defaults to UNGRADED if blank |

**Validation rules applied by `parseImportCsvFile()`:**
- IMEI must match regex `^[0-9]{14,16}$`
- Make and Model must not be blank
- Duplicate IMEIs within the same file are flagged
- Rows with errors are highlighted red in the preview; valid rows are green

---

### 1.4 Upload and Preview

**File selection:** drag-and-drop onto the drop zone, or click to browse.

After upload:
- Stats chips show `N valid / N errors`
- Scrollable preview table appears with per-row status
- Invalid rows are shown but **will not be imported** — only valid rows are sent

---

### 1.5 Submit — Create Batch & Import

**Button:** `submitImportBatch()`

**API calls made in sequence:**

```
POST /api/purchase-batches
  body: { supplier_id, external_invoice_ref, batch_date, currency, total_purchase_value, vat_code }
  → creates Purchase Batch record (status: DRAFT)
  → returns purchase_batch_id (e.g. PB2026-005)

POST /api/purchase-batches/:id/imei-import
  body: { rows: [ { imei, make, model, storage, colour, network, grade }, ... ] }
  → for each valid row:
      - checks for duplicate IMEI across ALL existing devices (global block)
      - creates Device record with current_status = INTAKE_QC_PENDING
      - links device to purchase_batch_id and supplier_id
  → updates batch.device_count and batch.status = RECEIVED
  → returns { created, duplicates, errors[] }
```

**Device born with these defaults:**

| Field | Value |
|-------|-------|
| `current_status` | `INTAKE_QC_PENDING` |
| `current_custody_type` | `WAREHOUSE` |
| `location` | `Goods-In Bay` |
| `vat_code` | Inherited from batch |
| `cost_price` | `0` (set during QC or manual edit) |

> **Non-negotiable control #4:** Duplicate IMEI is a global block — the same IMEI
> cannot exist twice across any tenant. Duplicates are reported in the import results
> and skipped silently (not a hard error that blocks the whole batch).

---

### 1.6 Goods-In Result

After successful submission, a results summary appears:
- `N devices created` → queued for Intake QC
- `N duplicates skipped`
- `N errors` (with detail)

The Purchase Batch is now visible in **Suppliers & Batches → Batches** with status `RECEIVED`.

---

## Stage 2 — Quality Control

### 2.1 QC Queue

**Navigation:** Quality Control → **Pending QC** tab

**API:** `GET /api/qc/pending` — returns all devices with `current_status = INTAKE_QC_PENDING`

Each device card shows: Make/Model, IMEI, Colour/Network, and current status badge.

---

### 2.2 Begin Intake QC

**Button:** `Begin QC` → `openQCForm(deviceId, imei, name)`

The QC form captures:

| Field | Required | Notes |
|-------|----------|-------|
| IMEI Confirmed | — | Displayed read-only for visual verification |
| Grade Assigned | ✅ | A (Near Mint) / B (Good) / C (Fair) / D (Poor) |
| Lock Check Result | ✅ | CLEAR or LOCKED — **cannot be skipped** |
| Functional Tests | ✅ | 8 tests, each PASS / FAIL / N/A |
| Cosmetic Notes | No | Free text |

**8 Functional Tests:**

| Test | Outcomes |
|------|----------|
| Screen & Display | PASS / FAIL / N/A |
| Battery Health | PASS / FAIL / N/A |
| Front Camera | PASS / FAIL / N/A |
| Rear Camera | PASS / FAIL / N/A |
| Cellular / SIM | PASS / FAIL / N/A |
| WiFi & BT | PASS / FAIL / N/A |
| Touch / Face ID | PASS / FAIL / N/A |
| Charging Port | PASS / FAIL / N/A |

---

### 2.3 Lock Check — Non-Negotiable Control #2

> **This is the single most important gate in the entire goods-in flow.**

| Result | Outcome |
|--------|---------|
| `CLEAR` | QC can proceed to PASS or FAIL based on tests |
| `LOCKED` | Device status becomes `LOCKED` automatically. **All sale, reservation, OPR, and listing paths are blocked.** |

**Locked device resolution** (on Locked Devices tab):
- **Raise Lock Cleared Event (Manager role required)** ⚠️ STUB — fires `alert()`, no API endpoint yet
- **Discharge as BER** ⚠️ STUB — fires `alert()`, no API endpoint yet

---

### 2.4 QC Outcomes

| Outcome | Condition | Device Status After |
|---------|-----------|---------------------|
| `PASS` | Lock = CLEAR, no failing tests | `AVAILABLE` |
| `FAIL` | Lock = CLEAR, one or more FAIL tests | `INTAKE_QC_PENDING` (re-queue) or `SCRAPPED` |
| `LOCKED_BLOCKED` | Lock = LOCKED | `LOCKED` |

> **Non-negotiable control #1:** No device enters `AVAILABLE` without a completed
> QC record. The system enforces this at the status machine level — there is no
> manual status override that bypasses QC.

> ⚠️ **STUB note:** The QC Submit button currently fires `alert('QC submitted. Device
> status updated.')` and calls `closeModal()`. There is no `POST /api/qc` endpoint yet.
> QC submission is UI-only in the current build.

---

### 2.5 QC History

**Navigation:** Quality Control → **QC History** tab

Displays all completed QC records with: IMEI, Type (INTAKE/RETURN), Grade, Lock result,
Outcome, Performed By, Date.

**API:** `GET /api/qc` — returns all QC records sorted by date.

---

### 2.6 Grade and Colour Overrides (Post-QC)

If a device needs its grade or colour corrected after QC, a **manager-level override** is available from the device detail modal.

**Navigation:** Inventory → View (any device) → Override button (pencil icon)

**Function:** `showDeviceOverridePanel(deviceId, field, currentValue, purchaseVatCode)`

Override requires:
- **Field:** `grade` or `colour`
- **New value**
- **Reason code** — from a defined list (e.g. `QC_ERROR`, `CUSTOMER_RETURN`, `OTHER`)
- **Notes** — required (min 20 chars) when reason is `OTHER`

**API:** `PATCH /api/devices/:id/override`

Every override creates an audit log entry automatically with: field changed, old value,
new value, reason code, notes, actor, timestamp.

**Bulk override** (multiple devices at once): Inventory → select devices → Bulk Override
**API:** `POST /api/devices/batch-override`

---

## Inventory Management

### Device Status State Machine

```
INTAKE_QC_PENDING
    │
    ├─ [Lock = LOCKED] ──────────────────────────────► LOCKED
    │                                                     │
    ├─ [QC PASS, Lock CLEAR] ──────────────────────► AVAILABLE
    │                                                     │
    │                                    ┌────────────────┤
    │                                    │                │
    │                             [OPR Export]     [Order Placed]
    │                                    │                │
    │                                    ▼                ▼
    │                                  IN_OPR          SHIPPED
    │                                    │                │
    │                           [Reimported]       [Delivered]
    │                                    │                │
    │                                    ▼                ▼
    │                                AVAILABLE    WITH_CUSTOMER
    │                                                     │
    │                                             [Return raised]
    │                                                     │
    └──────────────────────────── RETURN_QC_PENDING ◄─────┘
```

### Inventory Table Columns

| Column | Source Field | Notes |
|--------|-------------|-------|
| IMEI | `imei_primary` | Clickable code badge |
| Make / Model | `make`, `model` | Bold white |
| Spec | `storage`, `colour` | Grey subtext |
| Grade | `grade` | Colour-coded badge (A=green, B=blue, C=amber, D=red) |
| Status | `current_status` | Status badge with full label |
| Cost | `cost_price` | Purchase cost ex-VAT |
| Landed | `landed_cost` | Amber if > cost (includes freight/OPR uplift) |
| VAT Code | `purchase_vat_code` | Compact badge |

### Inventory Filters

| Filter | Field | Notes |
|--------|-------|-------|
| IMEI / Model search | `imei_primary`, `make`, `model` | Live, case-insensitive |
| Status | `current_status` | Dropdown: 8 statuses |
| Grade | `grade` | Dropdown: A / B / C / D |

**API with filters:** `GET /api/devices?status=AVAILABLE&grade=A&make=Apple`

### Device Detail Modal

Click **View** on any device to see:
- Status badge
- Grade (with Override button)
- Cost price and landed cost
- Colour and storage (with Colour Override button)
- Network
- Purchase Batch link
- VAT Code
- Attribute Override History (amber panel, shows all past overrides)
- QC History (all QC records with functional test results)

---

## Stage 3 — OPR (Outward Processing Relief)

### What OPR Is

HMRC Outward Processing Relief allows devices to be temporarily exported to an EU repair
vendor and reimported without paying full import duty, provided they are reimported within
**180 days** of export. The tax impact is:

- **Import VAT is charged only on the uplift** (repair cost + freight), not on the
  full device value
- The uplift import VAT is reclaimable in **Box 4** of the VAT return
- HMRC Authorisation number `GB369979995000` must appear on all export documentation
- Documents must be retained for **4 years minimum, non-deletable**

---

### 3.1 Pre-requisites for an OPR Batch

| Requirement | Where |
|-------------|-------|
| Devices must be in `AVAILABLE` status | Inventory page |
| OPR Authorisation letter on file | Document vault |
| Repair vendor pre-approved | OPR vendor list |
| Export MRN obtained from HMRC (or freight forwarder) | Before export |

---

### 3.2 Create a New OPR Batch

**Navigation:** OPR Engine → **New OPR Batch** button

**Function:** `showNewOPRModal()`

Form fields:

| Field | Required | Notes |
|-------|----------|-------|
| Repair Vendor | ✅ | Selected from approved vendor list |
| Export Date | ✅ | Date devices physically leave the UK |
| Processing Invoice Value (£) | ✅ | The repair vendor's invoice amount |
| Export MRN | ✅ | HMRC Movement Reference Number from export declaration |

> ⚠️ **STUB:** Create OPR Batch button fires `alert('OPR batch created. 180-day timer started.')`
> — no `POST /api/opr-batches` endpoint exists yet.

On creation (when real):
- All selected devices transition to `IN_OPR` status
- 180-day countdown timer starts from `export_date`
- `reimport_deadline = export_date + 180 days`

---

### 3.3 OPR Uplift Calculator

**Navigation:** OPR Engine → **Uplift Calculator** button

**Function:** `showOPRCalculator()` / `calcOPR()`

**API:** `POST /api/opr/calculate`

Formula:

```
Total Uplift = Processing Invoice Value + Outbound Freight + Inbound Freight
Uplift Per Unit = Total Uplift ÷ Unit Count
Import VAT on Uplift = Total Uplift × 20%  (reclaimable in Box 4)
```

**Example:**

| Input | Value |
|-------|-------|
| Processing Invoice | £4,800 |
| Outbound Freight | £220 |
| Inbound Freight | £195 |
| Unit Count | 18 |

| Output | Value |
|--------|-------|
| Total Uplift | £5,215 |
| Uplift Per Unit | £289.72 |
| Import VAT (Box 4 reclaim) | £1,043 |

The calculator is non-destructive — it does not create any records. Use it to verify
figures before entering them on the batch.

---

### 3.4 Monitor the 180-Day Timer

**Navigation:** OPR Engine → OPR batch cards + 180-Day Timeline section

Each batch displays:

| Element | Meaning |
|---------|---------|
| Progress bar (green) | > 30 days remaining |
| Progress bar (amber) | 14–30 days remaining — **Warning** |
| Progress bar (red) | ≤ 14 days — **URGENT** |
| Red alert banner on card | ≤ 14 days: `URGENT: N days to reimport deadline!` |

Timeline shows export date and reimport deadline for every batch side-by-side.

---

### 3.5 OPR Batch Statuses

| Status | Meaning |
|--------|---------|
| `EXPORTED` | Devices have left the UK, repair not yet complete |
| `IN_REPAIR` | Confirmed with repair vendor, actively being processed |
| `REIMPORTED` | Devices returned to UK, C88 entry filed |
| `CLOSED` | OPR period complete, all documentation filed |

---

### 3.6 Reimport — Mark Reimported

**Button:** `Mark Reimported` (visible on batches with status `IN_REPAIR` or `EXPORTED`)

> ⚠️ **STUB:** Fires `alert('Mark reimported — C88 reference required')` — no
> `PATCH /api/opr-batches/:id` endpoint exists yet.

When real, this step:
1. Records the reimport date
2. Captures the C88 document reference
3. Transitions all linked devices from `IN_OPR` → `AVAILABLE`
4. Creates a VAT record: `20S_PURCHASES` against Box 4 for the import VAT on uplift
5. Updates the batch status to `REIMPORTED`

---

### 3.7 OPR Document Vault

**Navigation:** OPR batch card → **Docs** button

**Function:** `viewOPRDocs(batchId)`

Required documents per batch (HMRC-mandated, 4-year retention):

| Document | Status in demo |
|----------|---------------|
| Commercial Invoice (Export) | ✅ Present |
| HMRC OPR Authorisation Letter | ✅ Present |
| Export MRN Document | ✅ Present |
| Repair Vendor Invoice | ✅ Present |
| Airway Bill (Outbound) | ✅ Present |
| C88 Import Entry | ⚠️ Only present after reimport |

> ⚠️ **STUB:** Download and Upload buttons are UI-only. No R2 / file storage backend
> exists yet. Documents are not actually stored. Phase 6 will implement Cloudflare R2
> for this vault — until then, **do not use the document vault for compliance purposes**.

---

### 3.8 OPR VAT Impact — HMRC Box Mapping

When a reimport is correctly recorded, the following VAT record is created atomically:

| Box | Amount | Explanation |
|-----|--------|-------------|
| Box 4 | Import VAT on uplift | Reclaimable input VAT on repair cost + freight |
| Box 7 | Net import value | Total uplift (net of VAT) |

This VAT record uses code `20S_PURCHASES` with `override_reason = 'OPR Import VAT on uplift'`.

The import VAT entry is visible in **VAT Engine → VAT Records** and is automatically
aggregated into the current open VAT period.

---

## Key Rules Summary

| # | Rule | Stage | Enforcement |
|---|------|-------|-------------|
| 1 | No device enters AVAILABLE without completed QC | Stage 2 | Status machine |
| 2 | Lock check cannot be skipped | Stage 2 | Mandatory field in QC form |
| 3 | Locked device blocks all sale paths | Stage 2 | Status = LOCKED blocks orders |
| 4 | Duplicate IMEI — global block across all tenants | Stage 1 | Import endpoint checks all devices |
| 5 | Grade/Colour override requires reason code + audit entry | Inventory | PATCH /devices/:id/override |
| 6 | OPR documents retained 4 years minimum, non-deletable | Stage 3 | UI enforcement (no delete button) |
| 7 | OPR reimport requires C88 document reference | Stage 3 | Required field on Mark Reimported |
| 8 | Import VAT on uplift always recorded to Box 4 | Stage 3 | VAT engine atomically on reimport |
| 9 | 180-day window is hard — HMRC penalty if missed | Stage 3 | Countdown timer + alerts |
| 10 | Audit trail mandatory on all overrides | Inventory | auditLog.push() on every mutation |

---

## API Reference — This Workflow

| Method | Endpoint | Stage | Purpose |
|--------|----------|-------|---------|
| `GET` | `/api/suppliers?active=true` | Pre-check | Active supplier list for dropdown |
| `POST` | `/api/purchase-batches` | Stage 1 | Create purchase batch |
| `POST` | `/api/purchase-batches/:id/imei-import` | Stage 1 | Import IMEI CSV rows → create devices |
| `GET` | `/api/purchase-batches` | Stage 1 | View all batches |
| `GET` | `/api/purchase-batches/:id` | Stage 1 | View single batch |
| `GET` | `/api/qc/pending` | Stage 2 | Devices awaiting intake QC |
| `GET` | `/api/qc` | Stage 2 | Full QC history |
| `GET` | `/api/devices` | Inventory | Full device list with filters |
| `GET` | `/api/devices/:id` | Inventory | Device detail + QC records |
| `GET` | `/api/devices/:id/overrides` | Inventory | Override history for device |
| `PATCH` | `/api/devices/:id/override` | Inventory | Grade or colour override (with audit) |
| `POST` | `/api/devices/batch-override` | Inventory | Bulk override multiple devices |
| `GET` | `/api/opr-batches` | Stage 3 | All OPR batches |
| `GET` | `/api/opr-batches/:id` | Stage 3 | OPR batch detail |
| `POST` | `/api/opr/calculate` | Stage 3 | Uplift + import VAT calculation |

---

## Stubs — Not Yet Implemented

| Action | Location | What's Missing |
|--------|----------|----------------|
| QC form submission | `openQCForm()` → Submit | `POST /api/qc` endpoint |
| QC updates device status | Backend | Status transition logic on QC submit |
| Lock Cleared event | Locked Devices tab | `POST /api/devices/:id/lock-cleared` endpoint + Manager auth |
| BER discharge | Locked Devices tab | `PATCH /api/devices/:id` → status SCRAPPED |
| Create OPR Batch | `showNewOPRModal()` | `POST /api/opr-batches` endpoint |
| Mark Reimported | OPR card | `PATCH /api/opr-batches/:id` + C88 capture + device status transition |
| OPR document upload/download | `viewOPRDocs()` | Cloudflare R2 storage (Phase 6) |
| Cost price entry on device | Device detail | `PATCH /api/devices/:id` for cost_price / landed_cost |

*These are the next items to implement in Phase 5/6. The UI for all of them is built —
only the API endpoints and backend logic are missing.*
