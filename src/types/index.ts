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
