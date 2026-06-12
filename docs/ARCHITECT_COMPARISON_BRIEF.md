# RefurbIQ — Architect Comparison Brief

> **Purpose:** External architect input for shared-backend evaluation against a sibling ERP system.  
> **Scope:** This system only. Sibling system is not referenced or speculated about.  
> **Data source:** Direct read of all source files as of 2026-06-12.  
> **Rule:** Features that are coded but not yet wired to a real backend service are marked **[STUB]**. Features planned but not yet written are marked **[PLANNED]**.

---

## 0. Identity

| Field | Value |
|-------|-------|
| **System name** | RefurbIQ |
| **One-line purpose** | Operations ERP for refurbished-smartphone traders: tracks every device from purchase through QC, OPR, sale, VAT, returns, and repairs. |
| **Primary business line** | Refurbished-phone trading and B2C/B2B ecommerce via online marketplaces (Amazon, Back Market, eBay, Shopify). |
| **Current build stage** | **MVP — functional prototype.** All 20 UI modules and 67 REST endpoints are built and running locally. Zero production deployment. No persistent database (in-memory only). No authentication. |

---

## 1. Business Context

### 1.1 Primary Users and Roles

| Role | Responsibilities in this system |
|------|---------------------------------|
| **Admin / Owner** | Full access: suppliers, VAT periods, OPR batches, tenant management, audit log, system settings |
| **Finance** | VAT records, MTD returns, fintech advances, P&L review |
| **Warehouse / Goods-In** | Purchase batch intake, IMEI CSV import, QC form, scanner, OPR batch tracking |
| **Support Agent** | Support ticket management, RMA authorisation, courier investigation logging |
| **Manager** | Override approvals (currently stub), escalation handling |
| **Read-Only** | Dashboard and reporting views |

> Role definitions exist in the `TenantUser.role` type (`ADMIN | MANAGER | WAREHOUSE | FINANCE | SUPPORT | READ_ONLY`). Role-based access control is **[PLANNED]** — no enforcement exists at the API layer today.

### 1.2 Scale (Current Seed Data and Projections)

| Metric | Current (seed / demo) | Projected [PLANNED] |
|--------|-----------------------|---------------------|
| SKUs in device variant catalogue | 15 (VAR-001 to VAR-015) | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Active devices tracked | 8 seed records | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Orders / day | 5 seed records total | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Active tenants (SaaS) | 5 seed records (TNT-001 to TNT-005) | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Active users | 0 (no auth; single shared session) | UNVERIFIED OR INSUFFICIENT CONTEXT |
| Suppliers | 4 seed records (3 active, 1 inactive) | UNVERIFIED OR INSUFFICIENT CONTEXT |

### 1.3 Core Workflows This System Is Responsible For

1. **Goods-In / Procurement** — Supplier registration → Purchase batch creation → IMEI CSV import → device record creation.
2. **Quality Control** — Intake QC form (8 functional tests, grade assignment, lock check) → device status transitions.
3. **Outward Processing Relief (OPR)** — Batch export to overseas repair vendor → 180-day countdown → uplift and import VAT calculation → reimport and discharge. UK HMRC compliance workflow.
4. **VAT Engine** — Evaluate correct VAT code per transaction (8 codes, DRC threshold, export override) → generate HMRC 9-box VAT records → aggregate into VAT periods.
5. **Order Management** — Receive marketplace orders → link VAT record → track fulfilment status → link to fintech advance.
6. **Fintech Advances** — Calculate advance (80% of gross), fee (1.95%), and net received per order → track reconciliation status.
7. **HMRC Making Tax Digital (MTD)** — Compile 9-box VAT return from period records → validate arithmetic → submit to HMRC **[STUB — simulated]**.
8. **Returns / RMA** — Authorise return → IMEI matching against sold device → return QC → refund/replacement resolution **[partial STUB]**.
9. **Courier / INR Investigations** — Log lost/damaged shipment events → track carrier claim → post recovery to P&L **[partial STUB]**.
10. **Repairs & Refurbishment** — Log repair job (internal or vendor) → track parts, cost, and outcome → trigger post-repair QC → record grade change → feed P&L.
11. **Unit P&L** — Per-device profitability: gross sale − VAT − purchase cost − OPR uplift − marketplace fee − fintech fee − shipping − repair cost + recovery.
12. **Supplier Analytics** — Per-supplier quality scores, defect rates, OPR risk, margin contribution.
13. **Marketplace Hub** — Track connection status and sync logs for Amazon, Back Market, eBay, Shopify. OAuth reconnect and order sync **[STUB]**.
14. **Tenant Management (SaaS)** — Multi-tenant onboarding, plan management, usage monitoring, suspend/reactivate.
15. **Audit Trail** — Mandatory, structured log of all override and mutation events across all modules.
16. **In-App Notifications** — System-generated alerts for OPR expiry, VAT deadlines, marketplace errors, RMA escalations.

---

## 2. Module Inventory

| Module | Status | Owns Which Data | Brief Responsibility |
|--------|--------|-----------------|----------------------|
| **Dashboard** | Built | Aggregated KPIs only (no owned entities) | Cross-module KPI summary: device counts, VAT liability, revenue MTD, OPR expiry, P&L waterfall, charts |
| **Inventory / Goods-In** | Built | `Device`, `PurchaseBatch`, `DeviceAttributeOverride` | Receive stock, import IMEIs, track device status through lifecycle, override grade/colour with audit |
| **Quality Control** | Built (QC submit [STUB]) | `QCRecord` | Intake/return/post-repair QC forms, grade assignment, lock check enforcement, locked device panel |
| **OPR Engine** | Built (create/reimport/docs [STUB]) | `OPRBatch` | Overseas repair export authorisation, 180-day compliance countdown, uplift and import VAT calculation, document vault |
| **Procurement / Suppliers** | Built | `Supplier`, `PurchaseBatch` | Supplier registry, purchase batch management, default VAT code per supplier, analytics linkage |
| **VAT Engine** | Built | `VatRecord`, `VatPeriod` | 8-code VAT evaluation (DRC, export, margin, reverse charge), 9-box return aggregation, period locking |
| **Fintech Advances** | Built (CSV reconciliation [PLANNED]) | `FintechAdvance` | Advance calculator (80%/1.95%), advance tracking, tax-point enforcement (always sale date) |
| **Order Management** | Built (CSV import [STUB]) | `Order` | Marketplace order receipt, VAT and fintech linkage, fulfilment status tracking |
| **Returns / RMA** | Built (refund/replacement/police report [STUB]) | `RMARecord` | Return authorisation, IMEI matching, return QC routing, refund/replacement resolution |
| **Courier / INR Investigations** | Built (evidence upload/carrier submit/recovery posting [STUB]) | `CourierInvestigation` | Lost/damaged shipment claim management, carrier escalation, recovery tracking |
| **Repairs & Refurbishment** | Built (quote approve/complete/QC queue [STUB]) | `RepairJob` | Internal and vendor repair tracking, cost capture, grade outcome, post-repair QC trigger |
| **Unit P&L / Profitability** | Built | `UnitPnL` | Per-device net profit calculation, make/marketplace breakdown, margin analysis |
| **Supplier Analytics** | Built (data hardcoded [not live]) | `SupplierMetric` (computed) | Per-supplier quality score, defect rate, OPR risk, margin contribution, risk label |
| **HMRC MTD VAT Returns** | Built (HMRC live API [STUB]) | `MTDVatReturn` | 9-box return compilation from VAT period, arithmetic validation, submission to HMRC |
| **Audit Log** | Built | `AuditEntry` | Structured, mandatory audit trail for all overrides and mutations; filterable by module/severity/actor |
| **IMEI / Barcode Scanner** | Built (4 hardcoded IMEI prefixes) | Reads `Device`, `PurchaseBatch` | Scan-to-lookup, scan-to-intake workflow, QC pre-fill |
| **Marketplace Hub** | Built (OAuth reconnect/real sync [STUB]) | `MarketplaceIntegration` | Multi-marketplace connection status, sync log, VAT code automation flags |
| **Device Variants / SKU Catalogue** | Built | `DeviceVariant` | Make/model/storage/colour/grade master catalogue, SKU code generation, CSV import |
| **Tenant Management** | Built | `Tenant`, `TenantUser`, `TenantUsage` | SaaS tenant lifecycle, plan tiers, usage metering, suspend/reactivate |
| **Notifications** | Built (trigger events [STUB — seed data only]) | `Notification` | In-app notification feed, unread badges, mark-read |
| **Support / CRM** | Built (AI draft/ticket creation [STUB]) | `SupportTicket` | Customer support ticket management, AI draft display, RMA and order linkage |
| **Admin / Settings** | Built (in-page only; no API) | None (display only) | Company config display, data retention policy display, system controls display, roadmap display |
| **Auth / Users** | **[PLANNED]** | `TenantUser` (type exists; not enforced) | Login, session management, role-based access control, multi-tenant scoping |
| **Database / Persistence** | **[PLANNED]** | All entities | Cloudflare D1 (SQLite) to replace in-memory arrays |
| **File Storage** | **[PLANNED]** | OPR documents, RMA photos, invoice PDFs | Cloudflare R2 for OPR 4-year retention, RMA evidence, document vault |
| **Email Notifications** | **[PLANNED]** | — | MTD deadline alerts, OPR expiry alerts, INR escalations via Resend |
| **CI/CD** | **[PLANNED]** | — | GitHub Actions → Cloudflare Pages deploy |

---

## 3. Per-Module Detail

### 3.1 Inventory / Goods-In

**Key entities:**

`Device`: `device_id` · `company_id` · `imei_primary` · `imei_secondary?` · `serial_number?` · `make` · `model` · `storage` · `colour` · `grade` (A/B/C/D/UNGRADED) · `network` · `supplier_id?` · `purchase_batch_id?` · `cost_price` · `landed_cost` · `purchase_vat_code` · `current_status` (18-value enum) · `current_custody_type` (5-value enum) · `opr_batch_id?` · `first_received_at` · `last_updated_at`

`PurchaseBatch`: `purchase_batch_id` · `company_id` · `supplier_id` · `external_invoice_ref` · `batch_code` · `batch_date` · `currency` · `total_purchase_value` · `vat_code` · `vat_amount` · `status` (DRAFT/CONFIRMED/RECEIVED/CLOSED) · `device_count?`

`DeviceAttributeOverride`: `override_id` · `device_id` · `imei_primary` · `field_changed` (grade or colour only) · `previous_value` · `new_value` · `reason_code` (6-value enum) · `notes?` (≥20 chars required when reason = OTHER) · `changed_by` · `changed_by_name` · `changed_at`

**Business rules unique to this system:**
- IMEI must be globally unique across all devices and all companies — duplicate blocked at import.
- IMEI format validated against regex `^[0-9]{14,16}$` on CSV import.
- Only `grade` and `colour` fields may be overridden post-intake; all other device attributes are immutable.
- Override requires a mandatory `OverrideReasonCode`; reason `OTHER` requires `notes` field ≥ 20 characters.
- Every override writes a structured `AuditEntry` (module=INVENTORY, severity=WARNING).
- Batch ID format: `PB{year}-{seqNum}` (e.g. PB2026-001), sequential within the company.
- Device IDs generated as `DEV{padded-index}` on IMEI import.
- Device status 18-value lifecycle enum tracks the full device journey (EXPECTED → RECEIVED → INTAKE_QC_PENDING → AVAILABLE → ... → SCRAPPED).

**Dependencies:** Reads `Supplier.default_vat_code` to pre-populate purchase batch VAT code. Feeds `QCRecord` (device enters QC queue after import). `device_id` is the primary foreign key referenced by QC, OPR, Orders, Repairs, RMA, UnitPnL, and Scanner.

**Self-contained?** Partially. Core creation is self-contained; all downstream modules depend on this module's `device_id`.

---

### 3.2 Quality Control

**Key entities:**

`QCRecord`: `qc_id` · `company_id` · `device_id` · `imei` · `qc_type` (INTAKE/RETURN/POST_REPAIR) · `performed_by` · `grade_assigned` · `lock_check_result` (CLEAR/LOCKED/NOT_CHECKED) · `cosmetic_notes?` · `functional_tests[]` (array of {test_name, result: PASS/FAIL/N/A, notes?}) · `outcome` (PASS/FAIL/LOCKED_BLOCKED) · `notes?`

**Business rules unique to this system:**
- No device may transition to `AVAILABLE` status without a completed QC record (Non-Negotiable Control #1). This rule is modelled in the type system and documented; enforcement is UI-layer only today.
- Any `lock_check_result = LOCKED` blocks all sale paths; device enters `LOCKED` status (Non-Negotiable Control #2).
- Three QC types exist because a device can be QC'd at intake, on return from customer, and after repair — each produces a separate record.
- QC form implements 8 functional tests (named in the form UI but not stored as a fixed enum — they are `test_name: string` in `FunctionalTest`).
- QC form submit is **[STUB]** — no `POST /api/qc` endpoint exists; the form fires `alert()`.
- Lock Cleared and BER Discharge actions are **[STUB]**.

**Dependencies:** Reads `Device` for pre-fill. Writes to `Device.current_status`. Referenced by `RepairJob.source_qc_id` and `RMARecord.qc_id`.

---

### 3.3 OPR Engine (Outward Processing Relief)

**Key entities:**

`OPRBatch`: `opr_batch_id` · `company_id` · `opr_authorisation_number` · `repair_vendor_id` · `export_date` · `reimport_deadline` · `days_remaining` · `export_mrn?` · `awb_number_outbound?` · `awb_number_inbound?` · `processing_invoice_value` · `freight_cost_outbound` · `freight_cost_inbound` · `unit_count` · `uplift_per_unit` · `import_vat_on_uplift` · `reimport_date?` · `c88_document_ref?` · `status` (DRAFT/EXPORTED/IN_REPAIR/REIMPORTED/DISCHARGED/OVERDUE) · `vendor_name?`

**Business rules unique to this system:**
- OPR is a UK HMRC customs procedure. Devices exported for repair must be reimported within 180 days or the OPR authorisation lapses. This deadline is tracked and displayed with colour thresholds: green (>30 days), amber (14–30 days), red (≤14 days).
- OPR uplift formula: `totalUplift = processingInvoiceValue + freightOutbound + freightInbound`. `upliftPerUnit = totalUplift / unitCount`. `importVatOnUplift = totalUplift × 20%`.
- OPR documents must be retained for 4 years minimum and are non-deletable (Non-Negotiable Control #9). Document vault is **[STUB]** — no actual file storage exists.
- Batch creation is **[STUB]**. Mark-Reimported transition is **[STUB]** (requires C88 customs document reference).

**Dependencies:** Reads `Device` (devices linked by `opr_batch_id`). Produces `VatRecord` for import VAT on uplift. Feeds `UnitPnL.opr_uplift`.

---

### 3.4 VAT Engine

**Key entities:**

`VatRecord`: `vat_record_id` · `company_id` · `linked_entity_type` (Order/Purchase Batch/OPR Batch/Fintech Transaction) · `linked_entity_id` · `vat_code` · `tax_point_date` · `gross_amount` · `net_amount` · `vat_amount` · `margin_amount?` · `box_1_amount` through `box_7_amount` · `vat_period_id?` · `override_applied` · `override_reason?` · `override_by?`

`VatPeriod`: `vat_period_id` · `company_id` · `period_start/end` · `status` (OPEN/LOCKED/SUBMITTED/CLOSED/AMENDED) · `box_1` through `box_9` · `submitted_at?` · `submitted_by?`

**VAT codes (8 values):**

| Code | Scheme | Rate | Scope |
|------|--------|------|-------|
| `20S_SALES` | Standard | 20% | Sales |
| `20S_PURCHASES` | Standard | 20% | Purchases |
| `20RC_PURCHASES` | Reverse Charge | 20% | Purchases |
| `0RCS_SALES` | Reverse Charge | 0% | Sales |
| `0MARGIN_PURCHASES` | Margin | 0% | Purchases |
| `0MARGIN_SALES` | Margin | 1/6 of gross−cost | Sales |
| `0EXPORT_SALES` | Export | 0% | Sales |
| `NOVAT_PURCHASES` | Out of Scope | 0% | Purchases |

**Business rules unique to this system:**
- Export override: non-GB delivery country forces `0EXPORT_SALES` — takes **absolute precedence** over all other rules including DRC.
- DRC threshold: UK delivery + net invoice ≥ £5,000 forces `0RCS_SALES` (Domestic Reverse Charge for mobile phones / HMRC Notice 735). Constant `DRC_THRESHOLD = 5000`.
- `0RCS_SALES` requires a mandatory `DRC_LEGAL_TEXT` footer on the invoice (full HMRC-specified text string stored as a constant).
- Reverse charge atomicity: `20RC_PURCHASES` must write Box 1 and Box 4 simultaneously in a single operation (Non-Negotiable Control #6).
- Margin scheme VAT: `vatAmount = (grossAmount − costPrice) / 6`. Requires `costPrice` as a parameter.
- Tax point is always the sale date — never the fintech advance date (Non-Negotiable Control #5).
- VAT period locking is displayed in UI but **[STUB]** — no `PATCH /api/vat-periods/:id/lock` endpoint exists.
- `box_3 = box_1 + box_2`; `box_5 = box_3 − box_4` — computed by `aggregateVatPeriod()`.
- MTD arithmetic validation: `abs(box1 + box2 − box3) > 0.01` → error; `abs(box3 − box4 − box5) > 0.01` → error.

**Dependencies:** All transactional modules (Orders, Purchase Batches, OPR Batches, Fintech) produce `VatRecord` rows. `VatPeriod` aggregates them. `MTDVatReturn` is compiled from a `VatPeriod`.

---

### 3.5 Order Management

**Key entities:**

`Order`: `order_id` · `company_id` · `marketplace_id` · `external_order_ref` · `customer_id?` · `customer_name?` · `order_date` · `delivery_country` (ISO 2-letter) · `is_export` · `total_sale_value` · `total_net_value` · `vat_code_applied` · `vat_amount` · `vat_tax_point_date` (= order_date always) · `order_status` (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/RETURNED) · `marketplace_name?` · `item_count?`

**Business rules unique to this system:**
- Orders are received from marketplaces (not created directly by users today — no order-creation form exists).
- `delivery_country` drives VAT code evaluation via the export override rule.
- `vat_tax_point_date` is always equal to `order_date` — the fintech advance date is explicitly excluded.
- CSV order import is **[STUB]**.
- No customer entity/table exists — `customer_name` and `customer_id` are free-text fields on the order.

**Dependencies:** References `VatRecord` (linked by `vat_record_id` on order detail). References `FintechAdvance` (linked by `order_id`). Referenced by `SupportTicket`, `CourierInvestigation`, `RMARecord`, `UnitPnL`.

---

### 3.6 Procurement / Suppliers

**Key entities:**

`Supplier`: `supplier_id` · `company_id` · `supplier_code` (e.g. TECH-01 — primary human identifier) · `name` · `vat_number?` · `country` (ISO 2-letter) · `contact_email?` · `default_vat_code` · `total_purchases?` · `is_active`

**Business rules unique to this system:**
- `supplier_code` must be unique within the company — duplicate check on creation.
- `default_vat_code` is auto-applied to new purchase batches when a supplier is selected.
- Inactive suppliers (`is_active = false`) are excluded from dropdown filters (`?active=true`).
- All supplier creates and updates write an `AuditEntry`.

**Dependencies:** `Supplier.default_vat_code` feeds `PurchaseBatch`. `supplier_id` is referenced by `Device` and `SupplierMetric`.

---

### 3.7 Fintech Advances

**Key entities:**

`FintechAdvance`: `advance_id` · `company_id` · `order_id` · `marketplace` · `gross_sale_value` · `advance_amount` (gross × 80%) · `fintech_fee` (advance × 1.95%) · `net_advance_received` (advance − fee) · `advance_date` · `settlement_date?` · `status` (PENDING/ADVANCED/SETTLED/RECONCILED) · `vat_record_id` (typed as `null` — always null)

**Business rules unique to this system:**
- Advance rate: exactly 80% of gross sale value. Fee rate: exactly 1.95% of the advance amount. These are hardcoded constants in `calculateFintechAdvance()`.
- Tax point enforcement: the fintech advance date is never the VAT tax point. The sale date is always used (Non-Negotiable Control #5).
- `vat_record_id` is typed as `null` (literal type in `FintechAdvance` interface) — no VAT record is linked to the advance itself.
- CSV settlement reconciliation is **[PLANNED]**.

**Dependencies:** Linked to `Order` via `order_id`. `FintechAdvance` is a linked entity type in `VatRecord.linked_entity_type`. Feeds `UnitPnL.fintech_fee`.

---

### 3.8 Returns / RMA

**Key entities:**

`RMARecord`: `rma_id` · `company_id` · `order_id?` · `ticket_id?` · `device_id?` · `imei_sold` · `imei_returned` · `imei_match` (boolean or null) · `customer_name/email/marketplace` · `return_reason/return_category` · `sale_value` · `refund_amount` · `status` (12-value enum) · `resolution` (7-value enum) · `timeline` (RMAEvent[])

**Business rules unique to this system:**
- `imei_sold` must match `imei_returned` — IMEI mismatch freezes the RMA in `IMEI_MISMATCH` status (Non-Negotiable Control #3). No refund or replacement can proceed until resolved.
- Return QC is of type `RETURN` — produces a new `QCRecord` linked to the RMA.
- Resolution options: FULL_REFUND | PARTIAL_REFUND | REPLACEMENT | RETURN_TO_CUSTOMER | SCRAPPED | RESTOCKED | PENDING.
- Refund issuance, replacement dispatch, police report generation, and return QC start are all **[STUB]**.

**Dependencies:** Linked to `Order` (order_id), `SupportTicket` (ticket_id), `Device` (device_id). Triggers `RepairJob` when fault confirmed post QC. References `QCRecord` (qc_id).

---

### 3.9 Courier / INR Investigations

**Key entities:**

`CourierInvestigation`: `investigation_id` · `company_id` · `order_id` · `event_type` (INR/DAMAGED/LOST_IN_TRANSIT/WRONG_ITEM/LATE_DELIVERY) · `courier` · `tracking_number` · `sale_value` · `claimed_amount` · `recovery_amount` · `status` (11-value enum) · `evidence_items` (EvidenceItem[]) · `timeline` (InvestigationEvent[])

**Business rules unique to this system:**
- Evidence upload, carrier submission, recovery posting to P&L, escalation, and loss marking are all **[STUB]**.
- Recovery amount feeds `UnitPnL.recovery_amount`.

**Dependencies:** Linked to `Order` (order_id), `SupportTicket` (ticket_id), `Device` (device_id). Recovery feeds `UnitPnL`.

---

### 3.10 Repairs & Refurbishment

**Key entities:**

`RepairJob`: `repair_id` · `company_id` · `device_id/imei/make/model/storage` · `grade_before/grade_after?` · `repair_type` (11-value enum) · `trigger` (5 values) · `source_rma_id?/source_qc_id?` · `vendor_id?/vendor_name?` · `is_internal` · `quote_amount?/actual_cost?/parts_cost?/labour_cost?` · `status` (9-value enum) · `outcome` (6-value enum) · `parts_used?` (RepairPart[]) · `timeline` (RepairEvent[])

**Business rules unique to this system:**
- Triggered by: intake QC fail, return QC fail, customer complaint, cosmetic upgrade, or manual.
- Outcome can upgrade or downgrade grade — this feeds back to `Device.grade`.
- Completed repair triggers post-repair QC (`POST_REPAIR_QC` QC type).
- `recovery_value` in `getRepairStats()` is computed as `completed repairs × actual_cost × 3` (hardcoded multiplier — not derived from real data).
- Quote approve/reject, parts received, mark complete, and post-repair QC queue are all **[STUB]**.

**Dependencies:** Linked to `Device` (device_id), `RMARecord` (source_rma_id), `QCRecord` (source_qc_id, post_repair_qc_id). Cost feeds `UnitPnL.repair_cost`.

---

### 3.11 Unit P&L / Profitability

**Key entities:**

`UnitPnL`: `device_id` · `imei` · `make/model/storage/grade` · `order_id?/marketplace?/sale_date?` · `gross_sale` · `vat_on_sale` · `net_revenue` · `purchase_cost` · `opr_uplift` · `marketplace_fee` · `fintech_fee` · `shipping_cost` · `repair_cost` · `total_costs` · `recovery_amount` · `net_profit` · `margin_percent` · `status` (SOLD/IN_STOCK/IN_OPR/SCRAPPED)

**Business rules unique to this system:**
- Formula: `revenue = gross_sale − vat_on_sale`; `total_costs = sum of all cost fields`; `net_profit = revenue − total_costs + recovery_amount`.
- Marketplace fee and fintech fee are cost inputs — not calculated within this module (sourced from `MarketplaceIntegration.fee_percent` and `calculateFintechAdvance()` respectively).
- `avg_margin_percent` on the dashboard is hardcoded to `22.4` — not computed from live `UnitPnL` records.

**Dependencies:** Aggregates data from Device, Order, OPRBatch, FintechAdvance, RepairJob, CourierInvestigation. Self-contained for reads (`/api/pnl/*`).

---

### 3.12 Supplier Analytics

**Key entities:**

`SupplierMetric` (computed, not a persisted entity): per-supplier aggregation of quality (QC pass rate, defect count, locked devices), financial (total purchases, revenue, net profit, margin), and risk (OPR risk value, risk score 0–100, risk label LOW/MEDIUM/HIGH/CRITICAL).

**Business rules unique to this system:**
- The `getSupplierAnalytics()` function returns a hardcoded `SupplierMetric[]` array — values are not computed from live `Device`, `QCRecord`, or `UnitPnL` data. This is explicitly identified as non-live.
- Risk label derived from risk score: 0–24 = LOW, 25–49 = MEDIUM, 50–74 = HIGH, 75–100 = CRITICAL.

**Dependencies:** Reads `Supplier` for base fields. Metric values should derive from Device, QCRecord, OPRBatch, UnitPnL — but currently do not.

---

### 3.13 HMRC MTD VAT Returns

**Key entities:**

`MTDVatReturn`: `return_id` · `company_id` · `vat_period_id` · `period_start/end` · `period_key` · `status` (7-value: DRAFT/REVIEW_PENDING/MANAGER_APPROVED/SUBMITTED/ACCEPTED/REJECTED/AMENDED) · `box_1` through `box_9` · `prepared/reviewed/approved/submitted` timestamps · `hmrc_receipt_id?` · `hmrc_correlation_id?` · `validation_errors[]` · `validation_warnings[]` · `finalised` · `payment_due_date?/amount?/reference?`

**Business rules unique to this system:**
- Compilation: box values copied from the linked `VatPeriod`.
- Validation: two arithmetic checks enforced server-side — `box3 ≠ box1 + box2` → error; `box5 ≠ box3 − box4` → error.
- Approval workflow (DRAFT → REVIEW_PENDING → MANAGER_APPROVED) is modelled in the status enum but the transitions are **[STUB]**.
- Submission endpoint (`POST /api/mtd-returns/:id/submit`) exists and mutates status to ACCEPTED, but generates a random fake `hmrc_receipt_id` — not a real HMRC API call.
- HMRC MTD OAuth and live API connection are **[PLANNED]**.

**Dependencies:** Compiled from `VatPeriod` (one MTD return per period). References `company_id` (which maps to HMRC VRN in the `Tenant.hmrc_vrn` field).

---

### 3.14 Audit Log

**Key entities:**

`AuditEntry`: `audit_id` · `company_id` · `timestamp` · `module` (13-value enum: INVENTORY/QC/OPR/ORDERS/VAT/FINTECH/SUPPLIERS/SUPPORT/COURIER/RMA/REPAIRS/SYSTEM/AUTH) · `severity` (INFO/WARNING/CRITICAL/SECURITY) · `actor` · `actor_role` · `action` · `entity_type/entity_id` · `before_state?/after_state?` · `ip_address?/session_id?` · `system_generated` · `notes?`

**Business rules unique to this system:**
- All overrides (device grade/colour, bulk override) are mandatory audit events (Non-Negotiable Control #10).
- All supplier creates and updates are mandatory audit events.
- `actor` field is hardcoded to `'admin@refurbiq.co.uk'` on every mutation in `api.ts` — real user attribution requires auth **[PLANNED]**.
- Audit log is append-only in current design (no delete endpoint).

**Dependencies:** Written to by all mutation-capable modules. Self-contained for reads.

---

### 3.15 IMEI / Barcode Scanner

**Key entities:** No owned entity — reads `Device` and `PurchaseBatch`, creates `Device` on intake.

**Business rules unique to this system:**
- Lookup order: (1) check existing devices by IMEI → (2) check purchase batches → (3) infer device from IMEI prefix (4 hardcoded prefixes: `35467890` → Apple iPhone 14, `35998800` → Samsung Galaxy S24, `86440012` → Google Pixel 8, `35123456` → Apple iPhone 15).
- Lookup response includes an `action` recommendation: `EXISTING_DEVICE` / `IN_BATCH` / `INFERRED` / `UNKNOWN`.
- Scanner intake creates a device with ID format `DEV{length+1}-NEW`.
- 8 fields required for intake: `imei_primary`, `make`, `model`, `storage`, `colour`, `grade`, `network`, `purchase_batch_id`.

**Dependencies:** Reads Device, PurchaseBatch. Writes Device (intake).

---

### 3.16 Marketplace Hub

**Key entities:**

`MarketplaceIntegration`: `integration_id` · `company_id` · `marketplace_name/code` · `status` (CONNECTED/DISCONNECTED/ERROR/RATE_LIMITED/PENDING_AUTH) · `last_sync_at` · `last_sync_status` · `last_sync_orders/errors` · `total_orders_synced` · `api_quota_used/limit` · `seller_id?/store_name?/region?` · `credentials_valid` · `credentials_expiry?` · `auto_vat_code/auto_drc_check/auto_export_detect` (boolean flags) · `fee_percent` · `sync_interval_mins` · `recent_errors` (IntegrationError[]) · `sync_log` (SyncLogEntry[])

**Business rules unique to this system:**
- `fee_percent` per marketplace feeds `UnitPnL.marketplace_fee`.
- `auto_vat_code`, `auto_drc_check`, `auto_export_detect` flags are modelled but not enforced (no auto-evaluation on order sync today).
- OAuth reconnect sets `credentials_expiry` to hardcoded `'2027-04-11'` — **[STUB]**.
- Real OAuth flows and order sync are **[PLANNED]**.
- Seed integrations: Amazon (CONNECTED), Back Market (CONNECTED), eBay (ERROR), Shopify (PENDING_AUTH).

**Dependencies:** `fee_percent` referenced by `UnitPnL`. `Order.marketplace_id` references this entity.

---

### 3.17 Tenant Management

**Key entities:**

`Tenant`: `tenant_id` · `company_name/number/vat_number` · `contact_email/phone?` · `address` fields · `plan` (STARTER/PROFESSIONAL/ENTERPRISE/TRIAL) · `status` (ACTIVE/SUSPENDED/CANCELLED/TRIAL/ONBOARDING) · `subdomain` · `monthly_fee` · `stripe_customer_id?` · `users` (TenantUser[]) · `usage` (TenantUsage: device_count, order_count, user_count, storage_mb, api_calls_mtd) · `features` (Record<string, boolean>) · `hmrc_vrn?` · `hmrc_mtd_authorised` · `xero_connected` · `quickbooks_connected`

**Business rules unique to this system:**
- SaaS billing is tracked per tenant (MRR, ARR computed from `monthly_fee`).
- `hmrc_vrn` per tenant is the field that should drive HMRC MTD submissions — not yet used by the MTD module.
- Stripe integration is modelled (`stripe_customer_id`) but not implemented.
- Plan tiers: STARTER / PROFESSIONAL / ENTERPRISE / TRIAL.
- Tenant status transitions (ACTIVE ↔ SUSPENDED) are implemented via `PATCH /api/tenants/:id/status`.

**Dependencies:** `Tenant.hmrc_vrn` should link to `MTDVatReturn` (not currently wired). `TenantUser.role` is the RBAC definition (not enforced).

---

### 3.18 Support / CRM

**Key entities:**

`SupportTicket`: `ticket_id` · `company_id` · `order_id?/device_id?` · `customer_name/email` · `marketplace` · `subject` · `status` (5 values) · `priority` (LOW/NORMAL/HIGH/URGENT) · `category` (GENERAL/RETURN/INR/FAULT/REFUND/CARRIER) · `assigned_to?` · `rma_id?` · `ai_draft?`

**Business rules unique to this system:**
- No customer entity exists — `customer_name` and `customer_email` are free-text on the ticket.
- AI draft (`ai_draft`) is a pre-populated string field in seed data; live generation via OpenAI is **[STUB]**.
- Message send, ticket creation, and draft editing are **[STUB]**.

**Dependencies:** Linked to `Order` (order_id), `Device` (device_id), `RMARecord` (rma_id).

---

### 3.19 Auth / Users [PLANNED]

No auth exists today. The `TenantUser` type defines roles (`ADMIN | MANAGER | WAREHOUSE | FINANCE | SUPPORT | READ_ONLY`) but is only used within the `Tenant` object — no login, no session, no JWT. All API routes are publicly accessible. All mutations hardcode `actor = 'admin@refurbiq.co.uk'`. Planned implementation: Hono JWT middleware on all `/api/*` routes, with `company_id` embedded in the token payload.

---

## 4. Technical Stack

| Layer | Technology + Version |
|-------|---------------------|
| **Language** | TypeScript 5.x (strict mode; `ESNext` target; `jsx: react-jsx`) |
| **Backend framework** | Hono v4.12.12 |
| **Frontend framework** | None — vanilla JavaScript inside a single TypeScript template literal (`getIndexHTML()` in `src/index.tsx`). No reactive framework, no bundled JS components. |
| **Frontend UI libraries (CDN)** | Tailwind CSS (CDN), Font Awesome 6.4.0 (CDN), Chart.js 4.4.0 (CDN), Axios 1.6.0 (CDN) |
| **Database** | **None — in-memory only.** All data in module-scope arrays in `src/lib/data-store.ts`. Resets on worker restart. Planned: Cloudflare D1 (SQLite). |
| **Cache / Queue** | None. Planned: Cloudflare KV for read-heavy catalogues (VAT codes, device variants, suppliers). |
| **API style** | REST — JSON request/response. CORS enabled globally on all `/api/*` routes. |
| **Auth mechanism** | None. Planned: Hono JWT middleware (`hono/jwt`) with `company_id` in token payload. |
| **File storage** | None. Planned: Cloudflare R2 for OPR documents, RMA photos, invoice PDFs. |
| **Build tool** | Vite 5.x + `@hono/vite-build/cloudflare-pages`. Output: `dist/_worker.js` (489.47 kB unminified). `minify: false`. |
| **Runtime / Hosting** | Cloudflare Workers (edge runtime). Configured via `wrangler.jsonc`. **Not yet deployed** — local dev only. |
| **Local dev process manager** | PM2 (`ecosystem.config.cjs`). App name: `refurbiq`. Runs `wrangler pages dev dist --ip 0.0.0.0 --port 3000`. |
| **Version control** | Git (`main` branch). Remote: `https://github.com/saigates/refurb-iq.git`. |
| **CI/CD** | None. Planned: GitHub Actions → Cloudflare Pages deploy action. |
| **Monitoring / Logging** | Audit log module (in-app, in-memory). No external monitoring. Planned: Cloudflare Analytics + Logpush. |
| **Email** | None. Planned: Resend. |
| **Multi-tenancy** | `company_id` field present on all entities (hardcoded to `'REFURBIQ_DEMO'`). Tenant scoping to D1 queries is **[PLANNED]**. |

---

## 5. Data Model (Shared-Candidate Entities)

### 5.1 Customer

**No `Customer` entity or table exists in this system.**

Customer data appears only as denormalised free-text fields on other entities:
- `Order.customer_name`, `Order.customer_id?` (string, no FK target)
- `SupportTicket.customer_name`, `SupportTicket.customer_email`
- `CourierInvestigation.customer_name`, `CourierInvestigation.customer_email`
- `RMARecord.customer_name`, `RMARecord.customer_email`

**Identifier strategy:** None. No customer ID is consistently assigned or enforced. `Order.customer_id` exists as an optional string field but has no corresponding record to reference.

---

### 5.2 Product / SKU

**Table/collection name:** `deviceVariants[]` (in-memory array)  
**TypeScript interface:** `DeviceVariant`

| Field | Type | Notes |
|-------|------|-------|
| `variant_id` | string | Format: VAR-{NNN} (e.g. VAR-001) — sequential |
| `company_id` | string | Tenant scoping |
| `make` | string | e.g. Apple, Samsung, Google |
| `model` | string | e.g. iPhone 14 Pro, Galaxy S24 |
| `storage` | string | e.g. 128GB, 256GB |
| `colour` | string | e.g. Space Black, Cream |
| `grade` | string | A / B / C / D / UNGRADED |
| `sku_code` | string | Auto-generated: `{makeShort}-{modelShort}-{storShort}-{colShort}-{grade}` (e.g. APL-IP14P-256-BLK-A) |
| `is_active` | boolean | — |
| `created_at` | string | ISO date |
| `created_by` | string | — |

**Identifier strategy:** Sequential `VAR-{NNN}` string. Not UUID. Not IMEI. SKU code is a derived, human-readable string — not a system primary key.

**Note:** `DeviceVariant` is a catalogue / master reference entry. Individual physical devices are tracked in `Device` (separate entity). A `Device` record does not carry a `variant_id` foreign key — the make/model/storage/colour/grade fields are duplicated on `Device`.

---

### 5.3 Inventory Item

**Table/collection name:** `devices[]` (in-memory array)  
**TypeScript interface:** `Device`

| Field | Type | Notes |
|-------|------|-------|
| `device_id` | string | Format: DEV{NNN} — sequential (e.g. DEV001) |
| `company_id` | string | Tenant scoping |
| `imei_primary` | string | 14–16 digit string; globally unique across all tenants |
| `imei_secondary?` | string | Optional second IMEI (dual-SIM) |
| `serial_number?` | string | Optional |
| `make` | string | — |
| `model` | string | — |
| `storage` | string | — |
| `colour` | string | — |
| `grade` | string | A / B / C / D / UNGRADED |
| `network` | string | — |
| `supplier_id?` | string | FK → Supplier |
| `purchase_batch_id?` | string | FK → PurchaseBatch |
| `cost_price` | number | Purchase cost |
| `landed_cost` | number | Cost including OPR uplift |
| `purchase_vat_code` | VatCode | 8-value enum |
| `current_status` | DeviceStatus | 18-value enum |
| `current_custody_type` | CustodyType | 5-value enum |
| `current_location_id?` | string | Not yet used |
| `opr_batch_id?` | string | FK → OPRBatch |
| `first_received_at` | string | ISO date |
| `last_updated_at` | string | ISO date |

**Identifier strategy:** Sequential `DEV{NNN}` string (e.g. DEV001). Not UUID. IMEI is the real-world unique identifier and is enforced as globally unique. `device_id` is the internal system FK.

---

### 5.4 Order

**Table/collection name:** `orders[]` (in-memory array)  
**TypeScript interface:** `Order`

| Field | Type | Notes |
|-------|------|-------|
| `order_id` | string | Format: ORD-{marketplace}-{number} (e.g. ORD-BM-44221) |
| `company_id` | string | Tenant scoping |
| `marketplace_id` | string | References MarketplaceIntegration |
| `external_order_ref` | string | Marketplace's own order ID |
| `customer_id?` | string | Optional; no FK target exists |
| `customer_name?` | string | Denormalised |
| `order_date` | string | ISO date |
| `delivery_country` | string | ISO 2-letter; drives VAT code evaluation |
| `is_export` | boolean | Derived from delivery_country ≠ GB |
| `total_sale_value` | number | Gross |
| `total_net_value` | number | Net of VAT |
| `vat_code_applied` | VatCode | Evaluated at order time |
| `vat_amount` | number | — |
| `vat_tax_point_date` | string | Always = order_date |
| `order_status` | string | PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/RETURNED |
| `marketplace_name?` | string | Denormalised |
| `item_count?` | number | — |

**Identifier strategy:** Human-readable composite string (`ORD-{market}-{num}`). Not UUID. `external_order_ref` carries the marketplace's own identifier.

**Notable absence:** No `device_id` on `Order` — there is no line-item entity linking a specific device to an order. The order-to-device relationship is implied through `UnitPnL.order_id` and `UnitPnL.device_id`.

---

### 5.5 Supplier

**Table/collection name:** `suppliers[]` (in-memory array)  
**TypeScript interface:** `Supplier`

| Field | Type | Notes |
|-------|------|-------|
| `supplier_id` | string | Format: SUP{NNN} (e.g. SUP001) — sequential |
| `company_id` | string | Tenant scoping |
| `supplier_code` | string | Human-readable unique code (e.g. TECH-01) — must be unique |
| `name` | string | Full name |
| `vat_number?` | string | Supplier's VAT registration |
| `country` | string | ISO 2-letter |
| `contact_email?` | string | — |
| `default_vat_code` | VatCode | Auto-applied to purchase batches |
| `total_purchases?` | number | Denormalised running total |
| `is_active` | boolean | Inactive suppliers excluded from dropdowns |

**Identifier strategy:** Sequential `SUP{NNN}` string. `supplier_code` is the primary human identifier. Not UUID.

---

### 5.6 User

**No persistent `User` entity exists in this system.**

User roles are defined in the `TenantUser` type, embedded as an array within `Tenant`:

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | string | — |
| `email` | string | — |
| `name` | string | — |
| `role` | string | ADMIN / MANAGER / WAREHOUSE / FINANCE / SUPPORT / READ_ONLY |
| `is_active` | boolean | — |
| `last_login?` | string | — |

`TenantUser` objects exist only in seed data (`Tenant.users[]`). No auth endpoint reads or validates them. No session or JWT is issued. **[PLANNED]**.

---

## 6. Integration Surface

### 6.1 External Services This System Talks To

| Service | Type | Status | Notes |
|---------|------|--------|-------|
| **HMRC Making Tax Digital API** | HMRC OAuth 2.0 REST API | **[STUB]** | `POST /api/mtd-returns/:id/submit` simulates submission with a random receipt ID. Real MTD OAuth and API call is planned (Phase 6). |
| **Amazon Selling Partner API (SP-API)** | OAuth 2.0 REST API | **[STUB]** | Marketplace integration exists as a data record. Real order sync and OAuth reconnect are stubs. |
| **Back Market API** | REST API | **[STUB]** | Same as above. |
| **eBay REST API** | OAuth 2.0 REST API | **[STUB]** | Status shows ERROR (token expired) in seed data. Reconnect is a stub. |
| **Shopify API** | OAuth 2.0 REST API | **[STUB]** | Status shows PENDING_AUTH in seed data. |
| **Stripe** | Payment processor REST API | **[PLANNED]** | `stripe_customer_id` exists on `Tenant` but no Stripe API calls are made. |
| **OpenAI API** | REST API | **[STUB]** | AI draft generation for support tickets triggers `alert()`. A server-side proxy route is required (planned Phase 6). |
| **Resend** | Email REST API | **[PLANNED]** | For MTD deadline and OPR expiry email alerts. Not yet integrated. |

### 6.2 APIs This System Exposes

This system exposes 67 REST endpoints under `/api/*`. All return JSON. CORS is enabled globally.

**Endpoints that could be consumed by another internal system:**

| Endpoint group | Consumption value for a sibling system |
|----------------|----------------------------------------|
| `GET /api/device-variants` + `/makes` + `/models` | Product catalogue — SKU master data |
| `GET /api/devices` + `/:id` | Inventory availability and device state |
| `GET /api/vat-codes` | VAT code master table |
| `POST /api/vat/evaluate` | VAT code evaluation (DRC + export logic) |
| `POST /api/vat/calculate` | VAT calculation engine |
| `GET /api/suppliers` + `/:id` | Supplier master data |
| `GET /api/orders` + `/:id` | Order read access |
| `GET /api/pnl/summary` + `/units` | Profitability data |
| `GET /api/audit-log` | Audit trail read |

**Access control:** None today. All endpoints are publicly accessible. Any sibling system consuming these APIs would need auth to be implemented first.

### 6.3 Current Data Exchange With Sibling System

None. No integration exists or is planned. Both systems are being built independently.

---

## 7. Constraints & Non-Functionals

### 7.1 Team

UNVERIFIED OR INSUFFICIENT CONTEXT — team size and structure are not documented in any source file.

### 7.2 Uptime / Consistency / Compliance Requirements

| Requirement | Current state |
|-------------|--------------|
| **Uptime** | Local dev only — no SLA. Target runtime (Cloudflare Workers) has 99.9%+ availability inherently. |
| **Data consistency** | None enforced. In-memory store has no transactions, no ACID guarantees. D1 (planned) would provide SQLite-level ACID. |
| **VAT / HMRC compliance** | 10 Non-Negotiable Controls are coded and documented (see Section 3.4 for VAT rules). OPR 4-year document retention is a hard constraint. MTD submission is currently simulated — not compliant for production use. |
| **IMEI data** | IMEI is treated as sensitive; globally unique enforcement is in place. No data-residency rules are documented. |
| **Data residency** | UNVERIFIED OR INSUFFICIENT CONTEXT — Cloudflare Workers/D1 default regions not pinned. |
| **GDPR** | UNVERIFIED OR INSUFFICIENT CONTEXT — customer PII (name, email) exists on tickets and orders; no data-subject deletion workflow exists. |

### 7.3 Deployment Cadence

Local only. No CI/CD. Manual `npm run build && pm2 restart refurbiq` for local changes. GitHub push does not trigger any automated deploy. Cloudflare Pages deployment is **[PLANNED]** (Phase 6).

### 7.4 Refactoring Appetite and Timeline Pressure

From `docs/STATUS.md` and `docs/COMPONENT_OVERVIEW.md`:
- Phase 5 (D1 database migration) and Phase 6 (production hardening) are planned but have no timeline dates ("TBD").
- The COMPONENT_OVERVIEW document estimates 3–5 days for D1 schema + endpoint porting, 1–4 days for auth, and 2–4 hours for first Cloudflare Pages deploy.
- The SPA architecture (single 5,700-line file) is described as "unconventional but disciplined" — the document notes it is navigable but does not indicate a refactor is planned.
- No stated deadline or launch date exists in any source file.

---

## 8. Shared-Module Self-Assessment

For each module that could plausibly exist in a sibling ecommerce/trading ERP, the following table rates the case for sharing vs. keeping separate.

**Rating guide:**
- **Data-sharing need:** would both systems need to read/write the same records?
- **Logic identical likelihood:** would the business rules be the same in both systems?
- **Coupling to this system's other modules:** how deeply does this module depend on other RefurbIQ modules?

| Module | Data-sharing need with sibling (None/Low/Med/High) | Likelihood logic is identical across both (Low/Med/High) | Coupling to this system's other modules (Low/Med/High) | Notes |
|--------|---------------------------------------------------|---------------------------------------------------------|-------------------------------------------------------|-------|
| **Auth / Users** | High | High | Low | User accounts and roles are infrastructure. The `TenantUser` role set (ADMIN/MANAGER/WAREHOUSE/FINANCE/SUPPORT/READ_ONLY) is domain-generic. Strong shared-backend candidate if both systems serve the same business users. |
| **Tenant Management** | High | Med | Low | If both systems serve the same SaaS tenants, tenant records, plan data, and billing should be shared. The `Tenant` entity here includes RefurbIQ-specific fields (`hmrc_mtd_authorised`, `hmrc_vrn`) that may not apply to the sibling. |
| **Device Variants / SKU Catalogue** | High | High | Low | A make/model/storage/colour/grade catalogue is domain-generic for any refurbished-phone system. No business logic is embedded — it is pure master data. Strong shared candidate. |
| **Supplier** | Med | High | Low | Supplier master data (name, code, country, VAT number) is generic. The `default_vat_code` field is RefurbIQ-specific (UK VAT). If both systems buy from the same suppliers, sharing the master table adds value. |
| **Order Management** | Med | Low | Med | Orders reference marketplace, VAT code, delivery country, and tax point date — all RefurbIQ-specific. Order structure is likely different across systems. Sharing order read access (not write) may be useful for cross-system reporting. |
| **Inventory / Goods-In** | Med | Med | High | IMEI tracking, device status lifecycle, and OPR linkage are deeply RefurbIQ-specific. Basic goods-receipt patterns may overlap, but the 18-status lifecycle and IMEI-centric model are specialist. Keep separate unless sibling also tracks IMEIs. |
| **Notifications** | Med | High | Low | In-app notification structure (severity, category, title, message, action_url) is generic. Both systems likely need notifications. Sharing the notification service (not the trigger logic) is reasonable. |
| **Audit Log** | Low | High | Low | Audit log schema (module, severity, actor, action, entity, before/after state) is generic. However, the `AuditModule` enum is RefurbIQ-specific. Sharing the audit infrastructure is feasible if both systems commit to a common schema. |
| **Reporting / Analytics (P&L)** | Low | Low | High | Unit P&L formula is deeply specific: OPR uplift, fintech fee, marketplace fee, repair cost, recovery amount. The sibling system's cost model is unlikely to be identical. Keep separate. |
| **VAT Engine** | Low | Med | Med | The 8-code UK VAT model, DRC threshold (£5,000), and HMRC 9-box mapping are UK-law-specific and refurbished-goods-specific. If the sibling operates in the same UK VAT regime and sells mobile phones, the logic is identical. Otherwise, keep separate. The calculation functions are pure (no DB access) — sharing as a library rather than a service is viable. |
| **Procurement / Purchase Batches** | Low | Low | High | Batch-to-device-to-IMEI linkage is specific to this system's intake flow. Unlikely to be reusable as-is. |
| **QC / Grading** | Low | Low | High | The 8-test QC form, lock check, grade assignment, and LOCKED device state are specific to refurbished-phone grading. Sibling is unlikely to have the same grading model. Keep separate. |
| **OPR Engine** | None | Low | High | UK HMRC Outward Processing Relief is a highly specialist customs procedure. Unlikely to exist in the sibling. Keep entirely separate. |
| **HMRC MTD VAT Returns** | None | Low | Med | UK-specific tax filing. Unlikely to exist in the sibling unless it is also UK-VAT registered. If it is, the 9-box compilation logic could be shared as a library (same logic, different data source). |
| **Fintech Advances** | None | Low | Med | The 80%/1.95% advance model is specific to a named fintech product. Unlikely to be identical in a sibling. Keep separate. |
| **Returns / RMA** | None | Low | Med | IMEI-matching enforcement and the 12-status RMA lifecycle are specific to this domain. General return patterns may partially overlap but the IMEI check is unique here. |
| **Courier / INR Investigations** | None | Low | Med | INR claim management against carriers is operational and specific to marketplace fulfilment. May partially overlap but carrier API integration details will differ. |
| **Repairs & Refurbishment** | None | Low | High | Repair job tracking, grade outcomes, OPR linkage, and post-repair QC are specific to the refurbishment workflow. Keep separate. |
| **Marketplace Hub** | None | Med | Med | If the sibling also integrates Amazon, Back Market, eBay, and Shopify, the connection/sync status model overlaps. However, the auto VAT code and DRC check flags are RefurbIQ-specific. Sharing connection-status infrastructure (not the VAT automation) is plausible. |
| **Support / CRM** | None | High | Low | Ticket structure (status, priority, category, customer, order linkage) is generic. If both systems handle customer support for the same customers, sharing CRM data is high-value. The AI draft stub is generic. |

---

*Document produced 2026-06-12. Based on direct read of all source files. No sibling system content was referenced or inferred.*
