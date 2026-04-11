// ============================================================
// RefurbIQ — Core TypeScript Types
// ============================================================

export type VatCode =
  | '20S_SALES'
  | '20S_PURCHASES'
  | '20RC_PURCHASES'
  | '0RCS_SALES'
  | '0MARGIN_PURCHASES'
  | '0MARGIN_SALES'
  | '0EXPORT_SALES'
  | 'NOVAT_PURCHASES';

export type VatScheme = 'STANDARD' | 'REVERSE_CHARGE' | 'MARGIN' | 'EXPORT' | 'OUT_OF_SCOPE';
export type VatScope = 'SALES' | 'PURCHASES';

export interface VatCodeDefinition {
  vat_code: VatCode;
  display_name: string;
  rate_percent: number;
  scope: VatScope;
  scheme: VatScheme;
  description: string;
  box_1_flag: boolean;
  box_2_flag: boolean;
  box_4_flag: boolean;
  box_6_flag: boolean;
  box_7_flag: boolean;
}

export type DeviceStatus =
  | 'EXPECTED'
  | 'RECEIVED'
  | 'INTAKE_QC_PENDING'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'PICKED'
  | 'SHIPPED'
  | 'WITH_CUSTOMER'
  | 'RMA_OPEN'
  | 'RETURNED_RECEIVED'
  | 'RETURN_QC_PENDING'
  | 'FAULT_CONFIRMED'
  | 'NO_FAULT_FOUND'
  | 'RESTOCKED'
  | 'SCRAPPED'
  | 'IN_OPR'
  | 'POST_REPAIR_QC'
  | 'LOCKED';

export type CustodyType = 'WAREHOUSE' | 'IN_TRANSIT' | 'WITH_CUSTOMER' | 'WITH_VENDOR' | 'CUSTOMS';

export interface Device {
  device_id: string;
  company_id: string;
  imei_primary: string;
  imei_secondary?: string;
  serial_number?: string;
  make: string;
  model: string;
  storage: string;
  colour: string;
  grade: string;
  network: string;
  supplier_id?: string;
  purchase_batch_id?: string;
  cost_price: number;
  landed_cost: number;
  purchase_vat_code: VatCode;
  current_status: DeviceStatus;
  current_custody_type: CustodyType;
  current_location_id?: string;
  opr_batch_id?: string;
  first_received_at: string;
  last_updated_at: string;
}

export interface PurchaseBatch {
  purchase_batch_id: string;
  company_id: string;
  supplier_id: string;
  external_invoice_ref: string;
  batch_code: string;
  batch_date: string;
  currency: string;
  total_purchase_value: number;
  vat_code: VatCode;
  vat_amount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'CLOSED';
  device_count?: number;
  supplier_name?: string;
}

export interface OPRBatch {
  opr_batch_id: string;
  company_id: string;
  batch_reference: string;
  opr_authorisation_number: string;
  repair_vendor_id: string;
  export_date: string;
  reimport_deadline: string;
  days_remaining: number;
  export_mrn?: string;
  awb_number_outbound?: string;
  awb_number_inbound?: string;
  processing_invoice_value: number;
  freight_cost_outbound: number;
  freight_cost_inbound: number;
  unit_count: number;
  uplift_per_unit: number;
  import_vat_on_uplift: number;
  reimport_date?: string;
  c88_document_ref?: string;
  status: 'DRAFT' | 'EXPORTED' | 'IN_REPAIR' | 'REIMPORTED' | 'DISCHARGED' | 'OVERDUE';
  vendor_name?: string;
}

export interface Order {
  order_id: string;
  company_id: string;
  marketplace_id: string;
  external_order_ref: string;
  customer_id?: string;
  customer_name?: string;
  order_date: string;
  delivery_country: string;
  is_export: boolean;
  total_sale_value: number;
  total_net_value: number;
  vat_code_applied: VatCode;
  vat_amount: number;
  vat_tax_point_date: string;
  order_status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  marketplace_name?: string;
  item_count?: number;
}

export interface VatRecord {
  vat_record_id: string;
  company_id: string;
  linked_entity_type: 'Order' | 'Purchase Batch' | 'OPR Batch' | 'Fintech Transaction';
  linked_entity_id: string;
  vat_code: VatCode;
  tax_point_date: string;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  margin_amount?: number;
  box_1_amount: number;
  box_2_amount: number;
  box_4_amount: number;
  box_6_amount: number;
  box_7_amount: number;
  vat_period_id?: string;
  override_applied: boolean;
  override_reason?: string;
  override_by?: string;
}

export interface VatPeriod {
  vat_period_id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'CLOSED' | 'AMENDED';
  box_1: number;
  box_2: number;
  box_3: number;
  box_4: number;
  box_5: number;
  box_6: number;
  box_7: number;
  box_8: number;
  box_9: number;
  submitted_at?: string;
  submitted_by?: string;
}

export interface FintechAdvance {
  advance_id: string;
  company_id: string;
  order_id: string;
  marketplace: string;
  gross_sale_value: number;
  advance_amount: number;
  fintech_fee: number;
  net_advance_received: number;
  advance_date: string;
  settlement_date?: string;
  status: 'PENDING' | 'ADVANCED' | 'SETTLED' | 'RECONCILED';
  vat_record_id: null;
}

export interface Supplier {
  supplier_id: string;
  company_id: string;
  name: string;
  vat_number?: string;
  country: string;
  contact_email?: string;
  default_vat_code: VatCode;
  total_purchases?: number;
  is_active: boolean;
}

export interface QCRecord {
  qc_id: string;
  company_id: string;
  device_id: string;
  imei: string;
  qc_type: 'INTAKE' | 'RETURN' | 'POST_REPAIR';
  performed_by: string;
  performed_at: string;
  grade_assigned: string;
  lock_check_result: 'CLEAR' | 'LOCKED' | 'NOT_CHECKED';
  cosmetic_notes?: string;
  functional_tests: FunctionalTest[];
  outcome: 'PASS' | 'FAIL' | 'LOCKED_BLOCKED';
  notes?: string;
}

export interface FunctionalTest {
  test_name: string;
  result: 'PASS' | 'FAIL' | 'N/A';
  notes?: string;
}

export interface SupportTicket {
  ticket_id: string;
  company_id: string;
  order_id?: string;
  device_id?: string;
  customer_name: string;
  customer_email: string;
  marketplace: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  category: 'GENERAL' | 'RETURN' | 'INR' | 'FAULT' | 'REFUND' | 'CARRIER';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  rma_id?: string;
  ai_draft?: string;
}

export interface DashboardStats {
  total_devices: number;
  available_devices: number;
  in_opr: number;
  pending_qc: number;
  open_orders: number;
  open_tickets: number;
  opr_expiring_soon: number;
  vat_liability: number;
  total_revenue_mtd: number;
  avg_margin_percent: number;
}

// ── Courier & INR ─────────────────────────────────────────────────────────────

export type CourierStatus =
  | 'OPEN'
  | 'SUBMITTED_TO_CARRIER'
  | 'UNDER_INVESTIGATION'
  | 'EVIDENCE_REQUIRED'
  | 'CLAIM_SUBMITTED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'ESCALATED'
  | 'RESOLVED_LOSS'
  | 'RESOLVED_FOUND'
  | 'CLOSED';

export type CourierEventType =
  | 'INR'           // Item Not Received
  | 'DAMAGED'       // Delivered Damaged
  | 'LOST_IN_TRANSIT'
  | 'WRONG_ITEM'
  | 'LATE_DELIVERY';

export interface CourierInvestigation {
  investigation_id: string;
  company_id: string;
  order_id: string;
  ticket_id?: string;
  device_id?: string;
  imei?: string;
  event_type: CourierEventType;
  courier: string;
  tracking_number: string;
  dispatch_date: string;
  expected_delivery_date: string;
  last_tracking_event: string;
  last_tracking_date: string;
  customer_name: string;
  customer_email: string;
  marketplace: string;
  sale_value: number;
  claimed_amount: number;
  recovery_amount: number;
  status: CourierStatus;
  carrier_reference?: string;
  opened_at: string;
  resolved_at?: string;
  assigned_to?: string;
  notes?: string;
  evidence_items: EvidenceItem[];
  timeline: InvestigationEvent[];
}

export interface EvidenceItem {
  evidence_id: string;
  type: 'PROOF_OF_DISPATCH' | 'TRACKING_SCREENSHOT' | 'CARRIER_RESPONSE' | 'CUSTOMER_STATEMENT' | 'PHOTO' | 'OTHER';
  filename: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface InvestigationEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes?: string;
}

// ── RMA / Returns ─────────────────────────────────────────────────────────────

export type RMAStatus =
  | 'REQUESTED'
  | 'AUTHORISED'
  | 'IN_TRANSIT_BACK'
  | 'RECEIVED'
  | 'RETURN_QC_PENDING'
  | 'QC_PASS_NO_FAULT'
  | 'QC_FAIL_FAULT_CONFIRMED'
  | 'IMEI_MISMATCH'
  | 'REFUND_APPROVED'
  | 'REPLACEMENT_DISPATCHED'
  | 'CLOSED_NO_ACTION'
  | 'CLOSED';

export type RMAResolution =
  | 'FULL_REFUND'
  | 'PARTIAL_REFUND'
  | 'REPLACEMENT'
  | 'RETURN_TO_CUSTOMER'
  | 'SCRAPPED'
  | 'RESTOCKED'
  | 'PENDING';

export interface RMARecord {
  rma_id: string;
  company_id: string;
  order_id: string;
  ticket_id?: string;
  device_id: string;
  imei_sold: string;
  imei_returned?: string;
  imei_match: boolean | null;
  customer_name: string;
  customer_email: string;
  marketplace: string;
  return_reason: string;
  return_category: 'FAULT' | 'WRONG_ITEM' | 'CHANGE_OF_MIND' | 'DAMAGED_IN_TRANSIT' | 'NOT_AS_DESCRIBED' | 'OTHER';
  sale_value: number;
  refund_amount: number;
  status: RMAStatus;
  resolution: RMAResolution;
  authorised_by?: string;
  authorised_at?: string;
  received_at?: string;
  qc_id?: string;
  return_label_tracking?: string;
  marketplace_case_ref?: string;
  opened_at: string;
  closed_at?: string;
  notes?: string;
  timeline: RMAEvent[];
}

export interface RMAEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  action: string;
  system_generated: boolean;
  notes?: string;
}

// ── Profitability / Unit P&L ──────────────────────────────────────────────────

export interface UnitPnL {
  device_id: string;
  imei: string;
  make: string;
  model: string;
  storage: string;
  grade: string;
  order_id?: string;
  marketplace?: string;
  sale_date?: string;
  // Revenue
  gross_sale: number;
  vat_on_sale: number;
  net_revenue: number;
  // Costs
  purchase_cost: number;
  opr_uplift: number;
  marketplace_fee: number;
  fintech_fee: number;
  shipping_cost: number;
  repair_cost: number;
  total_costs: number;
  // Recovery
  recovery_amount: number;
  // Result
  net_profit: number;
  margin_percent: number;
  status: 'SOLD' | 'IN_STOCK' | 'IN_OPR' | 'SCRAPPED';
}

export interface ProfitabilitySummary {
  period: string;
  total_units_sold: number;
  total_gross_revenue: number;
  total_vat_collected: number;
  total_net_revenue: number;
  total_costs: number;
  total_net_profit: number;
  avg_margin_percent: number;
  best_margin_device: string;
  worst_margin_device: string;
  by_marketplace: MarketplacePnL[];
  by_make: MakePnL[];
}

export interface MarketplacePnL {
  marketplace: string;
  units: number;
  revenue: number;
  profit: number;
  margin_percent: number;
  avg_fee_percent: number;
}

export interface MakePnL {
  make: string;
  units: number;
  revenue: number;
  profit: number;
  margin_percent: number;
}

// ── Repairs & Refurbishment ───────────────────────────────────────────────────

export type RepairStatus =
  | 'QUOTE_PENDING'
  | 'QUOTE_APPROVED'
  | 'QUOTE_REJECTED'
  | 'IN_PROGRESS'
  | 'AWAITING_PARTS'
  | 'COMPLETED'
  | 'FAILED'
  | 'SCRAPPED'
  | 'RETURNED_UNREPAIRED';

export type RepairType =
  | 'SCREEN_REPLACEMENT'
  | 'BATTERY_REPLACEMENT'
  | 'CHARGING_PORT'
  | 'CAMERA_REPAIR'
  | 'BOARD_LEVEL'
  | 'HOUSING_REPLACEMENT'
  | 'WATER_DAMAGE'
  | 'SOFTWARE_UNLOCK'
  | 'DATA_WIPE'
  | 'FULL_REFURBISHMENT'
  | 'OTHER';

export type RepairOutcome =
  | 'PENDING'
  | 'RESTORED_SAME_GRADE'
  | 'UPGRADED_GRADE'
  | 'DOWNGRADED_GRADE'
  | 'ECONOMICALLY_UNVIABLE'
  | 'SCRAPPED';

export interface RepairJob {
  repair_id: string;
  company_id: string;
  device_id: string;
  imei: string;
  make: string;
  model: string;
  storage: string;
  grade_before: string;
  grade_after?: string;
  repair_type: RepairType;
  repair_description: string;
  trigger: 'INTAKE_QC_FAIL' | 'RETURN_QC_FAIL' | 'CUSTOMER_COMPLAINT' | 'COSMETIC_UPGRADE' | 'MANUAL';
  source_rma_id?: string;
  source_qc_id?: string;
  vendor_id?: string;
  vendor_name?: string;
  is_internal: boolean;
  quote_amount?: number;
  actual_cost?: number;
  parts_cost?: number;
  labour_cost?: number;
  status: RepairStatus;
  outcome: RepairOutcome;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  post_repair_qc_id?: string;
  notes?: string;
  technician?: string;
  parts_used?: RepairPart[];
  timeline: RepairEvent[];
}

export interface RepairPart {
  part_id: string;
  part_name: string;
  part_number?: string;
  supplier?: string;
  cost: number;
  quantity: number;
}

export interface RepairEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  action: string;
  system_generated: boolean;
  notes?: string;
}

export interface RepairStats {
  total_jobs: number;
  in_progress: number;
  awaiting_parts: number;
  completed: number;
  scrapped: number;
  total_repair_cost: number;
  avg_repair_cost: number;
  grade_upgrades: number;
  economically_unviable: number;
  recovery_value: number;
}

// ── Supplier Analytics ────────────────────────────────────────────────────────

export interface SupplierMetric {
  supplier_id: string;
  name: string;
  country: string;
  vat_number: string;
  is_active: boolean;
  total_purchases: number;
  batch_count: number;
  device_count: number;
  avg_cost_per_device: number;
  // Quality
  qc_pass_rate: number;          // 0–100 %
  defect_count: number;
  return_count: number;
  locked_device_count: number;
  repair_triggered_count: number;
  repair_cost_total: number;
  // OPR
  opr_batch_count: number;
  opr_device_count: number;
  opr_risk_value: number;        // total landed cost in active OPR
  // Margin contribution
  units_sold: number;
  gross_revenue: number;
  net_profit: number;
  avg_margin_percent: number;
  best_device: string;
  worst_device: string;
  // Risk score (computed 0–100)
  risk_score: number;
  risk_label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SupplierAnalyticsSummary {
  total_suppliers: number;
  active_suppliers: number;
  total_spend: number;
  total_devices_from_suppliers: number;
  avg_qc_pass_rate: number;
  highest_margin_supplier: string;
  highest_risk_supplier: string;
  metrics: SupplierMetric[];
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export type AuditModule =
  | 'INVENTORY'
  | 'QC'
  | 'OPR'
  | 'ORDERS'
  | 'VAT'
  | 'FINTECH'
  | 'SUPPLIERS'
  | 'SUPPORT'
  | 'COURIER'
  | 'RMA'
  | 'REPAIRS'
  | 'SYSTEM'
  | 'AUTH';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

export interface AuditEntry {
  audit_id: string;
  company_id: string;
  timestamp: string;
  module: AuditModule;
  severity: AuditSeverity;
  actor: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  ip_address?: string;
  session_id?: string;
  system_generated: boolean;
  notes?: string;
}

// ── HMRC MTD VAT ──────────────────────────────────────────────────────────────

export type MTDSubmissionStatus =
  | 'DRAFT'
  | 'REVIEW_PENDING'
  | 'MANAGER_APPROVED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'AMENDED';

export interface MTDVatReturn {
  return_id: string;
  company_id: string;
  vat_period_id: string;
  period_start: string;
  period_end: string;
  period_key: string;          // HMRC period key e.g. "24AA"
  status: MTDSubmissionStatus;
  // HMRC 9 boxes
  box_1: number;   // VAT due on sales
  box_2: number;   // VAT due on EC acquisitions
  box_3: number;   // Total VAT due (box1 + box2)
  box_4: number;   // VAT reclaimed
  box_5: number;   // Net VAT (box3 - box4, if +ve = payable)
  box_6: number;   // Total value of sales exc. VAT
  box_7: number;   // Total value of purchases exc. VAT
  box_8: number;   // Total value of EC supplies
  box_9: number;   // Total value of EC acquisitions
  // Audit trail
  prepared_by?: string;
  prepared_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  submitted_at?: string;
  hmrc_receipt_id?: string;
  hmrc_correlation_id?: string;
  hmrc_processing_date?: string;
  // Validation
  validation_errors: string[];
  validation_warnings: string[];
  // Finalisation
  finalised: boolean;
  payment_due_date?: string;
  payment_amount?: number;
  payment_reference?: string;
}
