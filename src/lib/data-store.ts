// ============================================================
// RefurbIQ — Demo Data Store (in-memory, tenant-scoped)
// ============================================================

import type {
  Device, PurchaseBatch, OPRBatch, Order, VatRecord,
  VatPeriod, FintechAdvance, Supplier, QCRecord, SupportTicket, DashboardStats,
  CourierInvestigation, RMARecord, UnitPnL, ProfitabilitySummary,
  RepairJob, RepairStats,
  SupplierMetric, SupplierAnalyticsSummary,
  AuditEntry,
  MTDVatReturn,
} from '../types/index.js';

const COMPANY_ID = 'REFURBIQ_DEMO';

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliers: Supplier[] = [
  { supplier_id: 'SUP001', company_id: COMPANY_ID, name: 'TechSource Ltd', vat_number: 'GB123456789', country: 'GB', contact_email: 'buy@techsource.co.uk', default_vat_code: '20RC_PURCHASES', total_purchases: 145200, is_active: true },
  { supplier_id: 'SUP002', company_id: COMPANY_ID, name: 'Mobile Wholesale EU', vat_number: 'DE987654321', country: 'DE', contact_email: 'sales@mweu.de', default_vat_code: '0MARGIN_PURCHASES', total_purchases: 87450, is_active: true },
  { supplier_id: 'SUP003', company_id: COMPANY_ID, name: 'PhoneFlip Direct', vat_number: 'GB555123456', country: 'GB', contact_email: 'trade@phoneflip.co.uk', default_vat_code: '20RC_PURCHASES', total_purchases: 62300, is_active: true },
  { supplier_id: 'SUP004', company_id: COMPANY_ID, name: 'Horizon Devices', vat_number: '', country: 'US', contact_email: 'b2b@horizondev.com', default_vat_code: '0EXPORT_SALES', total_purchases: 34100, is_active: false },
];

// ── Purchase Batches ──────────────────────────────────────────────────────────
export const purchaseBatches: PurchaseBatch[] = [
  { purchase_batch_id: 'PB2026-001', company_id: COMPANY_ID, supplier_id: 'SUP001', external_invoice_ref: 'TS-INV-4421', batch_code: 'PB2026-001', batch_date: '2026-03-01', currency: 'GBP', total_purchase_value: 15600, vat_code: '20RC_PURCHASES', vat_amount: 3120, status: 'RECEIVED', device_count: 52, supplier_name: 'TechSource Ltd' },
  { purchase_batch_id: 'PB2026-002', company_id: COMPANY_ID, supplier_id: 'SUP002', external_invoice_ref: 'MWEU-2024-881', batch_code: 'PB2026-002', batch_date: '2026-03-08', currency: 'EUR', total_purchase_value: 9400, vat_code: '0MARGIN_PURCHASES', vat_amount: 0, status: 'RECEIVED', device_count: 35, supplier_name: 'Mobile Wholesale EU' },
  { purchase_batch_id: 'PB2026-003', company_id: COMPANY_ID, supplier_id: 'SUP003', external_invoice_ref: 'PF-TRD-7734', batch_code: 'PB2026-003', batch_date: '2026-03-15', currency: 'GBP', total_purchase_value: 8200, vat_code: '20RC_PURCHASES', vat_amount: 1640, status: 'CONFIRMED', device_count: 28, supplier_name: 'PhoneFlip Direct' },
  { purchase_batch_id: 'PB2026-004', company_id: COMPANY_ID, supplier_id: 'SUP001', external_invoice_ref: 'TS-INV-4498', batch_code: 'PB2026-004', batch_date: '2026-04-02', currency: 'GBP', total_purchase_value: 12100, vat_code: '20RC_PURCHASES', vat_amount: 2420, status: 'DRAFT', device_count: 40, supplier_name: 'TechSource Ltd' },
];

// ── Devices ───────────────────────────────────────────────────────────────────
export const devices: Device[] = [
  { device_id: 'DEV001', company_id: COMPANY_ID, imei_primary: '354678901234567', make: 'Apple', model: 'iPhone 14 Pro', storage: '256GB', colour: 'Space Black', grade: 'A', network: 'Unlocked', supplier_id: 'SUP001', purchase_batch_id: 'PB2026-001', cost_price: 320, landed_cost: 345, purchase_vat_code: '20RC_PURCHASES', current_status: 'AVAILABLE', current_custody_type: 'WAREHOUSE', first_received_at: '2026-03-05', last_updated_at: '2026-03-06' },
  { device_id: 'DEV002', company_id: COMPANY_ID, imei_primary: '354678901234568', make: 'Apple', model: 'iPhone 14 Pro', storage: '256GB', colour: 'Space Black', grade: 'A', network: 'Unlocked', supplier_id: 'SUP001', purchase_batch_id: 'PB2026-001', cost_price: 320, landed_cost: 345, purchase_vat_code: '20RC_PURCHASES', current_status: 'SHIPPED', current_custody_type: 'IN_TRANSIT', first_received_at: '2026-03-05', last_updated_at: '2026-04-01' },
  { device_id: 'DEV003', company_id: COMPANY_ID, imei_primary: '354678901234569', make: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512GB', colour: 'Titanium Black', grade: 'B', network: 'Unlocked', supplier_id: 'SUP002', purchase_batch_id: 'PB2026-002', cost_price: 280, landed_cost: 310, purchase_vat_code: '0MARGIN_PURCHASES', current_status: 'INTAKE_QC_PENDING', current_custody_type: 'WAREHOUSE', first_received_at: '2026-03-12', last_updated_at: '2026-03-12' },
  { device_id: 'DEV004', company_id: COMPANY_ID, imei_primary: '354678901234570', make: 'Apple', model: 'iPhone 13', storage: '128GB', colour: 'Midnight', grade: 'A', network: 'O2', supplier_id: 'SUP001', purchase_batch_id: 'PB2026-001', cost_price: 195, landed_cost: 220, purchase_vat_code: '20RC_PURCHASES', current_status: 'IN_OPR', current_custody_type: 'WITH_VENDOR', opr_batch_id: 'OPR2026-001', first_received_at: '2026-03-05', last_updated_at: '2026-03-20' },
  { device_id: 'DEV005', company_id: COMPANY_ID, imei_primary: '354678901234571', make: 'Apple', model: 'iPhone 15', storage: '128GB', colour: 'Pink', grade: 'A', network: 'Unlocked', supplier_id: 'SUP003', purchase_batch_id: 'PB2026-003', cost_price: 380, landed_cost: 380, purchase_vat_code: '20RC_PURCHASES', current_status: 'AVAILABLE', current_custody_type: 'WAREHOUSE', first_received_at: '2026-03-18', last_updated_at: '2026-03-18' },
  { device_id: 'DEV006', company_id: COMPANY_ID, imei_primary: '354678901234572', make: 'Samsung', model: 'Galaxy A54', storage: '256GB', colour: 'Awesome White', grade: 'C', network: 'EE', supplier_id: 'SUP002', purchase_batch_id: 'PB2026-002', cost_price: 85, landed_cost: 98, purchase_vat_code: '0MARGIN_PURCHASES', current_status: 'RETURN_QC_PENDING', current_custody_type: 'WAREHOUSE', first_received_at: '2026-03-12', last_updated_at: '2026-04-05' },
  { device_id: 'DEV007', company_id: COMPANY_ID, imei_primary: '354678901234573', make: 'Google', model: 'Pixel 8 Pro', storage: '256GB', colour: 'Obsidian', grade: 'A', network: 'Unlocked', supplier_id: 'SUP001', purchase_batch_id: 'PB2026-001', cost_price: 290, landed_cost: 315, purchase_vat_code: '20RC_PURCHASES', current_status: 'WITH_CUSTOMER', current_custody_type: 'WITH_CUSTOMER', first_received_at: '2026-03-05', last_updated_at: '2026-03-28' },
  { device_id: 'DEV008', company_id: COMPANY_ID, imei_primary: '354678901234574', make: 'Apple', model: 'iPhone 13 Pro Max', storage: '256GB', colour: 'Sierra Blue', grade: 'B', network: 'Unlocked', supplier_id: 'SUP003', purchase_batch_id: 'PB2026-003', cost_price: 270, landed_cost: 270, purchase_vat_code: '20RC_PURCHASES', current_status: 'LOCKED', current_custody_type: 'WAREHOUSE', first_received_at: '2026-03-18', last_updated_at: '2026-03-19' },
];

// ── OPR Batches ───────────────────────────────────────────────────────────────
export const oprBatches: OPRBatch[] = [
  { opr_batch_id: 'OPR2026-001', company_id: COMPANY_ID, batch_reference: 'OPR2026-001', opr_authorisation_number: 'GB369979995000', repair_vendor_id: 'VND001', export_date: '2026-02-15', reimport_deadline: '2026-08-14', days_remaining: 125, export_mrn: 'GB2026-EX-441122', awb_number_outbound: 'DHL-GB-778899', awb_number_inbound: '', processing_invoice_value: 4800, freight_cost_outbound: 220, freight_cost_inbound: 0, unit_count: 18, uplift_per_unit: 278, import_vat_on_uplift: 1004, reimport_date: undefined, c88_document_ref: undefined, status: 'IN_REPAIR', vendor_name: 'EuroRepair Solutions SRL' },
  { opr_batch_id: 'OPR2026-002', company_id: COMPANY_ID, batch_reference: 'OPR2026-002', opr_authorisation_number: 'GB369979995000', repair_vendor_id: 'VND001', export_date: '2026-01-10', reimport_deadline: '2026-07-09', days_remaining: 89, export_mrn: 'GB2026-EX-330045', awb_number_outbound: 'FDX-GB-445566', awb_number_inbound: 'FDX-EU-445567', processing_invoice_value: 3200, freight_cost_outbound: 180, freight_cost_inbound: 195, unit_count: 12, uplift_per_unit: 298, import_vat_on_uplift: 715, reimport_date: '2026-03-25', c88_document_ref: 'C88-2026-33045', status: 'REIMPORTED', vendor_name: 'EuroRepair Solutions SRL' },
  { opr_batch_id: 'OPR2025-009', company_id: COMPANY_ID, batch_reference: 'OPR2025-009', opr_authorisation_number: 'GB369979995000', repair_vendor_id: 'VND002', export_date: '2025-10-20', reimport_deadline: '2026-04-18', days_remaining: 7, export_mrn: 'GB2025-EX-998811', awb_number_outbound: 'UPS-GB-112233', awb_number_inbound: '', processing_invoice_value: 2100, freight_cost_outbound: 140, freight_cost_inbound: 0, unit_count: 8, uplift_per_unit: 280, import_vat_on_uplift: 448, reimport_date: undefined, c88_document_ref: undefined, status: 'EXPORTED', vendor_name: 'FixMasters Poland Sp. z o.o.' },
];

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders: Order[] = [
  { order_id: 'ORD-BM-44221', company_id: COMPANY_ID, marketplace_id: 'MKT002', external_order_ref: 'BM-FR-20260401-44221', customer_id: 'CUST001', customer_name: 'Julien Moreau', order_date: '2026-04-01', delivery_country: 'FR', is_export: true, total_sale_value: 520, total_net_value: 520, vat_code_applied: '0EXPORT_SALES', vat_amount: 0, vat_tax_point_date: '2026-04-01', order_status: 'SHIPPED', marketplace_name: 'Back Market', item_count: 1 },
  { order_id: 'ORD-AMZ-88754', company_id: COMPANY_ID, marketplace_id: 'MKT001', external_order_ref: 'AMZ-UK-20260402-88754', customer_id: 'CUST002', customer_name: 'Sarah Thompson', order_date: '2026-04-02', delivery_country: 'GB', is_export: false, total_sale_value: 6200, total_net_value: 5167, vat_code_applied: '0RCS_SALES', vat_amount: 0, vat_tax_point_date: '2026-04-02', order_status: 'DELIVERED', marketplace_name: 'Amazon', item_count: 12 },
  { order_id: 'ORD-AMZ-88800', company_id: COMPANY_ID, marketplace_id: 'MKT001', external_order_ref: 'AMZ-UK-20260403-88800', customer_id: 'CUST003', customer_name: 'Mark Davies', order_date: '2026-04-03', delivery_country: 'GB', is_export: false, total_sale_value: 450, total_net_value: 375, vat_code_applied: '20S_SALES', vat_amount: 75, vat_tax_point_date: '2026-04-03', order_status: 'PROCESSING', marketplace_name: 'Amazon', item_count: 1 },
  { order_id: 'ORD-BM-44350', company_id: COMPANY_ID, marketplace_id: 'MKT002', external_order_ref: 'BM-DE-20260404-44350', customer_id: 'CUST004', customer_name: 'Klaus Weber', order_date: '2026-04-04', delivery_country: 'DE', is_export: true, total_sale_value: 680, total_net_value: 680, vat_code_applied: '0EXPORT_SALES', vat_amount: 0, vat_tax_point_date: '2026-04-04', order_status: 'SHIPPED', marketplace_name: 'Back Market', item_count: 1 },
  { order_id: 'ORD-EBY-11209', company_id: COMPANY_ID, marketplace_id: 'MKT003', external_order_ref: 'EBY-UK-20260405-11209', customer_id: 'CUST005', customer_name: 'Emma Wilson', order_date: '2026-04-05', delivery_country: 'GB', is_export: false, total_sale_value: 285, total_net_value: 285, vat_code_applied: '0MARGIN_SALES', vat_amount: 13.75, vat_tax_point_date: '2026-04-05', order_status: 'PENDING', marketplace_name: 'eBay', item_count: 1 },
];

// ── VAT Records ───────────────────────────────────────────────────────────────
export const vatRecords: VatRecord[] = [
  { vat_record_id: 'VAT001', company_id: COMPANY_ID, linked_entity_type: 'Order', linked_entity_id: 'ORD-BM-44221', vat_code: '0EXPORT_SALES', tax_point_date: '2026-04-01', gross_amount: 520, net_amount: 520, vat_amount: 0, box_1_amount: 0, box_2_amount: 0, box_4_amount: 0, box_6_amount: 520, box_7_amount: 0, override_applied: true, override_reason: 'Export override: delivery to FR', vat_period_id: 'VP2026-Q1' },
  { vat_record_id: 'VAT002', company_id: COMPANY_ID, linked_entity_type: 'Order', linked_entity_id: 'ORD-AMZ-88754', vat_code: '0RCS_SALES', tax_point_date: '2026-04-02', gross_amount: 6200, net_amount: 5167, vat_amount: 0, box_1_amount: 0, box_2_amount: 0, box_4_amount: 0, box_6_amount: 5167, box_7_amount: 0, override_applied: true, override_reason: 'DRC threshold: net value £5,167 ≥ £5,000', vat_period_id: 'VP2026-Q1' },
  { vat_record_id: 'VAT003', company_id: COMPANY_ID, linked_entity_type: 'Order', linked_entity_id: 'ORD-AMZ-88800', vat_code: '20S_SALES', tax_point_date: '2026-04-03', gross_amount: 450, net_amount: 375, vat_amount: 75, box_1_amount: 75, box_2_amount: 0, box_4_amount: 0, box_6_amount: 375, box_7_amount: 0, override_applied: false, vat_period_id: 'VP2026-Q1' },
  { vat_record_id: 'VAT004', company_id: COMPANY_ID, linked_entity_type: 'Purchase Batch', linked_entity_id: 'PB2026-001', vat_code: '20RC_PURCHASES', tax_point_date: '2026-03-01', gross_amount: 15600, net_amount: 15600, vat_amount: 3120, box_1_amount: 3120, box_2_amount: 0, box_4_amount: 3120, box_6_amount: 0, box_7_amount: 15600, override_applied: false, vat_period_id: 'VP2026-Q1' },
  { vat_record_id: 'VAT005', company_id: COMPANY_ID, linked_entity_type: 'OPR Batch', linked_entity_id: 'OPR2026-002', vat_code: '20S_PURCHASES', tax_point_date: '2026-03-25', gross_amount: 3575, net_amount: 3575, vat_amount: 715, box_1_amount: 0, box_2_amount: 0, box_4_amount: 715, box_6_amount: 0, box_7_amount: 0, override_applied: false, override_reason: 'OPR Import VAT on uplift', vat_period_id: 'VP2026-Q1' },
  { vat_record_id: 'VAT006', company_id: COMPANY_ID, linked_entity_type: 'Order', linked_entity_id: 'ORD-EBY-11209', vat_code: '0MARGIN_SALES', tax_point_date: '2026-04-05', gross_amount: 285, net_amount: 285, vat_amount: 13.75, margin_amount: 82.5, box_1_amount: 13.75, box_2_amount: 0, box_4_amount: 0, box_6_amount: 285, box_7_amount: 0, override_applied: false, vat_period_id: 'VP2026-Q1' },
];

// ── VAT Periods ───────────────────────────────────────────────────────────────
export const vatPeriods: VatPeriod[] = [
  { vat_period_id: 'VP2026-Q1', company_id: COMPANY_ID, period_start: '2026-01-01', period_end: '2026-03-31', status: 'LOCKED', box_1: 3208.75, box_2: 0, box_3: 3208.75, box_4: 3835, box_5: -626.25, box_6: 6347, box_7: 15600, box_8: 1200, box_9: 0, submitted_at: '2026-04-07', submitted_by: 'admin@refurbiq.co.uk' },
  { vat_period_id: 'VP2026-Q2', company_id: COMPANY_ID, period_start: '2026-04-01', period_end: '2026-06-30', status: 'OPEN', box_1: 88.75, box_2: 0, box_3: 88.75, box_4: 0, box_5: 88.75, box_6: 6347, box_7: 0, box_8: 1200, box_9: 0 },
];

// ── Fintech Advances ──────────────────────────────────────────────────────────
export const fintechAdvances: FintechAdvance[] = [
  { advance_id: 'FT001', company_id: COMPANY_ID, order_id: 'ORD-BM-44221', marketplace: 'Back Market', gross_sale_value: 520, advance_amount: 416, fintech_fee: 8.11, net_advance_received: 407.89, advance_date: '2026-04-01', settlement_date: undefined, status: 'ADVANCED', vat_record_id: null },
  { advance_id: 'FT002', company_id: COMPANY_ID, order_id: 'ORD-AMZ-88800', marketplace: 'Amazon', gross_sale_value: 450, advance_amount: 360, fintech_fee: 7.02, net_advance_received: 352.98, advance_date: '2026-04-03', settlement_date: '2026-04-10', status: 'RECONCILED', vat_record_id: null },
];

// ── QC Records ────────────────────────────────────────────────────────────────
export const qcRecords: QCRecord[] = [
  { qc_id: 'QC001', company_id: COMPANY_ID, device_id: 'DEV001', imei: '354678901234567', qc_type: 'INTAKE', performed_by: 'ops@refurbiq.co.uk', performed_at: '2026-03-06', grade_assigned: 'A', lock_check_result: 'CLEAR', cosmetic_notes: 'Minor hairline on rear glass — below grade threshold', functional_tests: [{ test_name: 'Screen', result: 'PASS' }, { test_name: 'Battery', result: 'PASS' }, { test_name: 'Cameras', result: 'PASS' }, { test_name: 'Touch ID / Face ID', result: 'PASS' }, { test_name: 'Cellular', result: 'PASS' }, { test_name: 'WiFi', result: 'PASS' }], outcome: 'PASS' },
  { qc_id: 'QC002', company_id: COMPANY_ID, device_id: 'DEV008', imei: '354678901234574', qc_type: 'INTAKE', performed_by: 'ops@refurbiq.co.uk', performed_at: '2026-03-19', grade_assigned: 'B', lock_check_result: 'LOCKED', cosmetic_notes: 'Screen has visible crack bottom-right corner', functional_tests: [{ test_name: 'Screen', result: 'FAIL', notes: 'Crack visible, touch responsive' }, { test_name: 'Battery', result: 'PASS' }, { test_name: 'Cameras', result: 'PASS' }, { test_name: 'Face ID', result: 'FAIL', notes: 'Face ID locked — iCloud lock detected' }], outcome: 'LOCKED_BLOCKED', notes: 'DEVICE LOCKED — iCloud activation lock detected. All sale paths blocked.' },
];

// ── Support Tickets ───────────────────────────────────────────────────────────
export const supportTickets: SupportTicket[] = [
  { ticket_id: 'TKT001', company_id: COMPANY_ID, order_id: 'ORD-BM-44221', device_id: 'DEV002', customer_name: 'Julien Moreau', customer_email: 'julien.moreau@email.fr', marketplace: 'Back Market', subject: 'Device not received - tracking shows delivered', status: 'IN_PROGRESS', priority: 'HIGH', category: 'INR', created_at: '2026-04-05', updated_at: '2026-04-07', assigned_to: 'support@refurbiq.co.uk', ai_draft: "Dear Julien,\n\nThank you for contacting us regarding your recent order. I can see from our tracking that the item shows as delivered on 3rd April. We take all delivery concerns very seriously.\n\nI have raised this with our courier partner and will update you within 48 hours with a full investigation outcome.\n\nKind regards,\nRefurbIQ Support" },
  { ticket_id: 'TKT002', company_id: COMPANY_ID, order_id: 'ORD-AMZ-88800', customer_name: 'Mark Davies', customer_email: 'mark.davies@email.co.uk', marketplace: 'Amazon', subject: 'Battery drains very fast - not as described', status: 'OPEN', priority: 'NORMAL', category: 'FAULT', created_at: '2026-04-08', updated_at: '2026-04-08', assigned_to: undefined },
  { ticket_id: 'TKT003', company_id: COMPANY_ID, order_id: 'ORD-EBY-11209', device_id: 'DEV006', customer_name: 'Emma Wilson', customer_email: 'emma.wilson@email.co.uk', marketplace: 'eBay', subject: 'Return request - screen cracked on arrival', status: 'ESCALATED', priority: 'URGENT', category: 'RETURN', created_at: '2026-04-06', updated_at: '2026-04-09', assigned_to: 'manager@refurbiq.co.uk', rma_id: 'RMA-2026-009' },
];

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export function getDashboardStats(): DashboardStats {
  return {
    total_devices: devices.length,
    available_devices: devices.filter(d => d.current_status === 'AVAILABLE').length,
    in_opr: devices.filter(d => d.current_status === 'IN_OPR').length,
    pending_qc: devices.filter(d => ['INTAKE_QC_PENDING', 'RETURN_QC_PENDING', 'POST_REPAIR_QC'].includes(d.current_status)).length,
    open_orders: orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.order_status)).length,
    open_tickets: supportTickets.filter(t => ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(t.status)).length,
    opr_expiring_soon: oprBatches.filter(b => b.days_remaining <= 30 && b.status !== 'DISCHARGED').length,
    vat_liability: vatPeriods.find(p => p.status === 'OPEN')?.box_5 ?? 0,
    total_revenue_mtd: orders.filter(o => o.order_date.startsWith('2026-04')).reduce((s, o) => s + o.total_sale_value, 0),
    avg_margin_percent: 22.4,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 2 DATA — Courier Investigations, RMA, Profitability
// ══════════════════════════════════════════════════════════════════════════════

// ── Courier Investigations ────────────────────────────────────────────────────
export const courierInvestigations: CourierInvestigation[] = [
  {
    investigation_id: 'INV-2026-001',
    company_id: COMPANY_ID,
    order_id: 'ORD-BM-44221',
    ticket_id: 'TKT001',
    device_id: 'DEV002',
    imei: '354678901234568',
    event_type: 'INR',
    courier: 'DHL Express',
    tracking_number: 'DHL-GB-778899',
    dispatch_date: '2026-04-01',
    expected_delivery_date: '2026-04-03',
    last_tracking_event: 'Delivered — Signed by: NEIGHBOUR',
    last_tracking_date: '2026-04-03',
    customer_name: 'Julien Moreau',
    customer_email: 'julien.moreau@email.fr',
    marketplace: 'Back Market',
    sale_value: 520,
    claimed_amount: 520,
    recovery_amount: 0,
    status: 'UNDER_INVESTIGATION',
    carrier_reference: 'DHL-CLAIM-2026-88321',
    opened_at: '2026-04-05',
    resolved_at: undefined,
    assigned_to: 'support@refurbiq.co.uk',
    notes: 'Customer states parcel not received. Tracking shows "delivered to neighbour". P2P delivery screenshot required from DHL.',
    evidence_items: [
      { evidence_id: 'EV001', type: 'PROOF_OF_DISPATCH', filename: 'dispatch_label_DEV002.pdf', uploaded_at: '2026-04-05', uploaded_by: 'ops@refurbiq.co.uk' },
      { evidence_id: 'EV002', type: 'TRACKING_SCREENSHOT', filename: 'dhl_tracking_778899.png', uploaded_at: '2026-04-06', uploaded_by: 'support@refurbiq.co.uk' },
    ],
    timeline: [
      { event_id: 'TE001', timestamp: '2026-04-05T09:15:00Z', actor: 'system', action: 'INR investigation opened from ticket TKT001', system_generated: true },
      { event_id: 'TE002', timestamp: '2026-04-05T10:30:00Z', actor: 'support@refurbiq.co.uk', action: 'Proof of dispatch uploaded', system_generated: false },
      { event_id: 'TE003', timestamp: '2026-04-06T11:00:00Z', actor: 'support@refurbiq.co.uk', action: 'DHL claim submitted. Reference: DHL-CLAIM-2026-88321', system_generated: false },
      { event_id: 'TE004', timestamp: '2026-04-07T14:22:00Z', actor: 'system', action: 'Carrier acknowledged claim. Investigation period: 10 business days', system_generated: true },
    ],
  },
  {
    investigation_id: 'INV-2026-002',
    company_id: COMPANY_ID,
    order_id: 'ORD-BM-44350',
    ticket_id: undefined,
    device_id: 'DEV005',
    imei: '354678901234571',
    event_type: 'DAMAGED',
    courier: 'FedEx International',
    tracking_number: 'FDX-INT-556677',
    dispatch_date: '2026-04-04',
    expected_delivery_date: '2026-04-07',
    last_tracking_event: 'Delivered — Recipient: WEBER K',
    last_tracking_date: '2026-04-07',
    customer_name: 'Klaus Weber',
    customer_email: 'k.weber@email.de',
    marketplace: 'Back Market',
    sale_value: 680,
    claimed_amount: 680,
    recovery_amount: 680,
    status: 'CLAIM_APPROVED',
    carrier_reference: 'FDX-DMG-2026-44501',
    opened_at: '2026-04-08',
    resolved_at: '2026-04-09',
    assigned_to: 'support@refurbiq.co.uk',
    notes: 'Customer reported damaged screen on arrival. Photo evidence provided. FedEx accepted liability — full replacement value approved.',
    evidence_items: [
      { evidence_id: 'EV003', type: 'PROOF_OF_DISPATCH', filename: 'dispatch_DEV005.pdf', uploaded_at: '2026-04-08', uploaded_by: 'ops@refurbiq.co.uk' },
      { evidence_id: 'EV004', type: 'PHOTO', filename: 'damage_photo_weber.jpg', uploaded_at: '2026-04-08', uploaded_by: 'support@refurbiq.co.uk' },
      { evidence_id: 'EV005', type: 'CARRIER_RESPONSE', filename: 'fedex_claim_approval.pdf', uploaded_at: '2026-04-09', uploaded_by: 'support@refurbiq.co.uk' },
    ],
    timeline: [
      { event_id: 'TE005', timestamp: '2026-04-08T08:00:00Z', actor: 'support@refurbiq.co.uk', action: 'Damage claim opened. Customer photo evidence attached.', system_generated: false },
      { event_id: 'TE006', timestamp: '2026-04-08T10:30:00Z', actor: 'support@refurbiq.co.uk', action: 'FedEx damage claim submitted. Ref: FDX-DMG-2026-44501', system_generated: false },
      { event_id: 'TE007', timestamp: '2026-04-09T15:00:00Z', actor: 'system', action: 'Carrier approved claim — £680.00 recovery confirmed', system_generated: true },
      { event_id: 'TE008', timestamp: '2026-04-09T15:05:00Z', actor: 'system', action: 'Status → CLAIM_APPROVED. Recovery £680.00 logged to device P&L.', system_generated: true },
    ],
  },
  {
    investigation_id: 'INV-2026-003',
    company_id: COMPANY_ID,
    order_id: 'ORD-AMZ-88800',
    ticket_id: 'TKT002',
    device_id: 'DEV001',
    imei: '354678901234567',
    event_type: 'LATE_DELIVERY',
    courier: 'Royal Mail Tracked 48',
    tracking_number: 'RM-GB-99887766',
    dispatch_date: '2026-04-03',
    expected_delivery_date: '2026-04-05',
    last_tracking_event: 'Awaiting collection at depot',
    last_tracking_date: '2026-04-06',
    customer_name: 'Mark Davies',
    customer_email: 'mark.davies@email.co.uk',
    marketplace: 'Amazon',
    sale_value: 450,
    claimed_amount: 0,
    recovery_amount: 0,
    status: 'OPEN',
    carrier_reference: undefined,
    opened_at: '2026-04-08',
    resolved_at: undefined,
    assigned_to: undefined,
    notes: 'Parcel stuck at depot for 3 days. Customer threatening negative feedback.',
    evidence_items: [],
    timeline: [
      { event_id: 'TE009', timestamp: '2026-04-08T11:00:00Z', actor: 'system', action: 'Late delivery investigation opened automatically from ticket TKT002', system_generated: true },
    ],
  },
];

// ── RMA Records ───────────────────────────────────────────────────────────────
export const rmaRecords: RMARecord[] = [
  {
    rma_id: 'RMA-2026-009',
    company_id: COMPANY_ID,
    order_id: 'ORD-EBY-11209',
    ticket_id: 'TKT003',
    device_id: 'DEV006',
    imei_sold: '354678901234572',
    imei_returned: '354678901234572',
    imei_match: true,
    customer_name: 'Emma Wilson',
    customer_email: 'emma.wilson@email.co.uk',
    marketplace: 'eBay',
    return_reason: 'Screen cracked on arrival — packaging appeared undamaged. Item not as described.',
    return_category: 'DAMAGED_IN_TRANSIT',
    sale_value: 285,
    refund_amount: 285,
    status: 'RETURN_QC_PENDING',
    resolution: 'PENDING',
    authorised_by: 'manager@refurbiq.co.uk',
    authorised_at: '2026-04-07',
    received_at: '2026-04-09',
    qc_id: undefined,
    return_label_tracking: 'RM-RTN-2026-44321',
    marketplace_case_ref: 'EBY-CASE-20260406-77812',
    opened_at: '2026-04-06',
    closed_at: undefined,
    notes: 'Return authorised by manager. Device received, awaiting Return QC. IMEI verified on receipt.',
    timeline: [
      { event_id: 'RE001', timestamp: '2026-04-06T10:00:00Z', actor: 'system', action: 'RMA requested by customer via eBay case EBY-CASE-20260406-77812', system_generated: true },
      { event_id: 'RE002', timestamp: '2026-04-07T09:30:00Z', actor: 'manager@refurbiq.co.uk', action: 'Return authorised. RM return label issued: RM-RTN-2026-44321', system_generated: false },
      { event_id: 'RE003', timestamp: '2026-04-09T11:15:00Z', actor: 'ops@refurbiq.co.uk', action: 'Device received at warehouse. IMEI scanned: 354678901234572 — MATCH confirmed.', system_generated: false },
      { event_id: 'RE004', timestamp: '2026-04-09T11:16:00Z', actor: 'system', action: 'Status → RETURN_QC_PENDING. Device queued for Return QC inspection.', system_generated: true },
    ],
  },
  {
    rma_id: 'RMA-2026-007',
    company_id: COMPANY_ID,
    order_id: 'ORD-AMZ-88754',
    ticket_id: undefined,
    device_id: 'DEV007',
    imei_sold: '354678901234573',
    imei_returned: '354678901234999',
    imei_match: false,
    customer_name: 'Sarah Thompson',
    customer_email: 'sarah.thompson@email.co.uk',
    marketplace: 'Amazon',
    return_reason: 'Change of mind — no longer required',
    return_category: 'CHANGE_OF_MIND',
    sale_value: 6200,
    refund_amount: 0,
    status: 'IMEI_MISMATCH',
    resolution: 'PENDING',
    authorised_by: 'support@refurbiq.co.uk',
    authorised_at: '2026-04-03',
    received_at: '2026-04-08',
    qc_id: undefined,
    return_label_tracking: 'UPS-RTN-2026-55890',
    marketplace_case_ref: 'AMZ-CASE-20260402-33210',
    opened_at: '2026-04-02',
    closed_at: undefined,
    notes: 'CRITICAL: IMEI MISMATCH DETECTED. Sold IMEI: 354678901234573. Returned IMEI: 354678901234999. All refund/replacement paths FROZEN. Manager escalation required.',
    timeline: [
      { event_id: 'RE005', timestamp: '2026-04-02T14:00:00Z', actor: 'system', action: 'Return requested via Amazon case AMZ-CASE-20260402-33210', system_generated: true },
      { event_id: 'RE006', timestamp: '2026-04-03T09:00:00Z', actor: 'support@refurbiq.co.uk', action: 'Return authorised for change of mind. Label issued.', system_generated: false },
      { event_id: 'RE007', timestamp: '2026-04-08T10:30:00Z', actor: 'ops@refurbiq.co.uk', action: 'Device received. IMEI scanned: 354678901234999', system_generated: false },
      { event_id: 'RE008', timestamp: '2026-04-08T10:31:00Z', actor: 'system', action: '⚠ IMEI MISMATCH DETECTED — Sold: 354678901234573 | Returned: 354678901234999. RETURN_MISMATCH event created. All resolution paths FROZEN. Manager escalation mandatory.', system_generated: true },
    ],
  },
  {
    rma_id: 'RMA-2026-005',
    company_id: COMPANY_ID,
    order_id: 'ORD-AMZ-88800',
    ticket_id: 'TKT002',
    device_id: 'DEV001',
    imei_sold: '354678901234567',
    imei_returned: '354678901234567',
    imei_match: true,
    customer_name: 'Mark Davies',
    customer_email: 'mark.davies@email.co.uk',
    marketplace: 'Amazon',
    return_reason: 'Battery draining unusually fast — not as advertised',
    return_category: 'NOT_AS_DESCRIBED',
    sale_value: 450,
    refund_amount: 450,
    status: 'REFUND_APPROVED',
    resolution: 'FULL_REFUND',
    authorised_by: 'manager@refurbiq.co.uk',
    authorised_at: '2026-04-04',
    received_at: '2026-04-07',
    qc_id: 'QC003',
    return_label_tracking: 'DHL-RTN-2026-11223',
    marketplace_case_ref: 'AMZ-CASE-20260403-44512',
    opened_at: '2026-04-03',
    closed_at: '2026-04-09',
    notes: 'Return QC confirmed battery health at 61% — below advertised spec. Full refund approved. Device to be relisted at Grade C or scrapped.',
    timeline: [
      { event_id: 'RE009', timestamp: '2026-04-03T08:00:00Z', actor: 'system', action: 'Return requested via Amazon case', system_generated: true },
      { event_id: 'RE010', timestamp: '2026-04-04T10:00:00Z', actor: 'manager@refurbiq.co.uk', action: 'Return authorised. Fault category: battery health.', system_generated: false },
      { event_id: 'RE011', timestamp: '2026-04-07T12:00:00Z', actor: 'ops@refurbiq.co.uk', action: 'Device received. IMEI confirmed match. Queued for Return QC.', system_generated: false },
      { event_id: 'RE012', timestamp: '2026-04-08T09:30:00Z', actor: 'ops@refurbiq.co.uk', action: 'Return QC complete — QC003. Battery 61%, below Grade A threshold. Fault CONFIRMED.', system_generated: false },
      { event_id: 'RE013', timestamp: '2026-04-09T10:00:00Z', actor: 'manager@refurbiq.co.uk', action: 'Full refund of £450 approved and processed via Amazon.', system_generated: false },
    ],
  },
];

// ── Unit P&L Records ──────────────────────────────────────────────────────────
export const unitPnLRecords: UnitPnL[] = [
  {
    device_id: 'DEV002', imei: '354678901234568', make: 'Apple', model: 'iPhone 14 Pro', storage: '256GB', grade: 'A',
    order_id: 'ORD-BM-44221', marketplace: 'Back Market', sale_date: '2026-04-01',
    gross_sale: 520, vat_on_sale: 0, net_revenue: 520,
    purchase_cost: 320, opr_uplift: 0, marketplace_fee: 26, fintech_fee: 8.11, shipping_cost: 8.50, repair_cost: 0,
    total_costs: 362.61, recovery_amount: 0,
    net_profit: 157.39, margin_percent: 30.3, status: 'SOLD',
  },
  {
    device_id: 'DEV007', imei: '354678901234573', make: 'Google', model: 'Pixel 8 Pro', storage: '256GB', grade: 'A',
    order_id: 'ORD-AMZ-88754', marketplace: 'Amazon', sale_date: '2026-04-02',
    gross_sale: 480, vat_on_sale: 0, net_revenue: 480,
    purchase_cost: 290, opr_uplift: 0, marketplace_fee: 67.2, fintech_fee: 0, shipping_cost: 6.95, repair_cost: 0,
    total_costs: 364.15, recovery_amount: 0,
    net_profit: 115.85, margin_percent: 24.1, status: 'SOLD',
  },
  {
    device_id: 'DEV001', imei: '354678901234567', make: 'Apple', model: 'iPhone 14 Pro', storage: '256GB', grade: 'A',
    order_id: 'ORD-AMZ-88800', marketplace: 'Amazon', sale_date: '2026-04-03',
    gross_sale: 450, vat_on_sale: 75, net_revenue: 375,
    purchase_cost: 320, opr_uplift: 25, marketplace_fee: 45, fintech_fee: 7.02, shipping_cost: 6.95, repair_cost: 0,
    total_costs: 403.97, recovery_amount: 0,
    net_profit: -28.97, margin_percent: -7.7, status: 'SOLD',
  },
  {
    device_id: 'DEV005', imei: '354678901234571', make: 'Apple', model: 'iPhone 15', storage: '128GB', grade: 'A',
    order_id: 'ORD-BM-44350', marketplace: 'Back Market', sale_date: '2026-04-04',
    gross_sale: 680, vat_on_sale: 0, net_revenue: 680,
    purchase_cost: 380, opr_uplift: 0, marketplace_fee: 34, fintech_fee: 0, shipping_cost: 9.50, repair_cost: 0,
    total_costs: 423.50, recovery_amount: 680,
    net_profit: 936.50, margin_percent: 137.7, status: 'SOLD',
  },
  {
    device_id: 'DEV006', imei: '354678901234572', make: 'Samsung', model: 'Galaxy A54', storage: '256GB', grade: 'C',
    order_id: 'ORD-EBY-11209', marketplace: 'eBay', sale_date: '2026-04-05',
    gross_sale: 285, vat_on_sale: 13.75, net_revenue: 271.25,
    purchase_cost: 85, opr_uplift: 0, marketplace_fee: 28.5, fintech_fee: 0, shipping_cost: 4.50, repair_cost: 0,
    total_costs: 118, recovery_amount: 0,
    net_profit: 153.25, margin_percent: 56.5, status: 'SOLD',
  },
  {
    device_id: 'DEV003', imei: '354678901234569', make: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512GB', grade: 'B',
    order_id: undefined, marketplace: undefined, sale_date: undefined,
    gross_sale: 0, vat_on_sale: 0, net_revenue: 0,
    purchase_cost: 280, opr_uplift: 0, marketplace_fee: 0, fintech_fee: 0, shipping_cost: 0, repair_cost: 0,
    total_costs: 280, recovery_amount: 0,
    net_profit: -280, margin_percent: 0, status: 'IN_STOCK',
  },
  {
    device_id: 'DEV004', imei: '354678901234570', make: 'Apple', model: 'iPhone 13', storage: '128GB', grade: 'A',
    order_id: undefined, marketplace: undefined, sale_date: undefined,
    gross_sale: 0, vat_on_sale: 0, net_revenue: 0,
    purchase_cost: 195, opr_uplift: 25, marketplace_fee: 0, fintech_fee: 0, shipping_cost: 0, repair_cost: 0,
    total_costs: 220, recovery_amount: 0,
    net_profit: -220, margin_percent: 0, status: 'IN_OPR',
  },
];

export function getProfitabilitySummary(): ProfitabilitySummary {
  const sold = unitPnLRecords.filter(u => u.status === 'SOLD');
  const totalGross = sold.reduce((s, u) => s + u.gross_sale, 0);
  const totalVat = sold.reduce((s, u) => s + u.vat_on_sale, 0);
  const totalNet = sold.reduce((s, u) => s + u.net_revenue, 0);
  const totalCosts = sold.reduce((s, u) => s + u.total_costs, 0);
  const totalProfit = sold.reduce((s, u) => s + u.net_profit, 0);
  const avgMargin = totalNet > 0 ? (totalProfit / totalNet) * 100 : 0;

  const byMktMap: Record<string, { units: number; revenue: number; profit: number; fees: number }> = {};
  const byMakeMap: Record<string, { units: number; revenue: number; profit: number }> = {};

  for (const u of sold) {
    const mk = u.marketplace || 'Unknown';
    if (!byMktMap[mk]) byMktMap[mk] = { units: 0, revenue: 0, profit: 0, fees: 0 };
    byMktMap[mk].units++;
    byMktMap[mk].revenue += u.net_revenue;
    byMktMap[mk].profit += u.net_profit;
    byMktMap[mk].fees += u.marketplace_fee;

    const make = u.make;
    if (!byMakeMap[make]) byMakeMap[make] = { units: 0, revenue: 0, profit: 0 };
    byMakeMap[make].units++;
    byMakeMap[make].revenue += u.net_revenue;
    byMakeMap[make].profit += u.net_profit;
  }

  const bestUnit = sold.reduce((a, b) => a.margin_percent > b.margin_percent ? a : b, sold[0]);
  const worstUnit = sold.reduce((a, b) => a.margin_percent < b.margin_percent ? a : b, sold[0]);

  return {
    period: 'April 2026 (MTD)',
    total_units_sold: sold.length,
    total_gross_revenue: Math.round(totalGross * 100) / 100,
    total_vat_collected: Math.round(totalVat * 100) / 100,
    total_net_revenue: Math.round(totalNet * 100) / 100,
    total_costs: Math.round(totalCosts * 100) / 100,
    total_net_profit: Math.round(totalProfit * 100) / 100,
    avg_margin_percent: Math.round(avgMargin * 10) / 10,
    best_margin_device: bestUnit ? `${bestUnit.make} ${bestUnit.model} (${bestUnit.margin_percent}%)` : '—',
    worst_margin_device: worstUnit ? `${worstUnit.make} ${worstUnit.model} (${worstUnit.margin_percent}%)` : '—',
    by_marketplace: Object.entries(byMktMap).map(([marketplace, d]) => ({
      marketplace,
      units: d.units,
      revenue: Math.round(d.revenue * 100) / 100,
      profit: Math.round(d.profit * 100) / 100,
      margin_percent: d.revenue > 0 ? Math.round((d.profit / d.revenue) * 10000) / 100 : 0,
      avg_fee_percent: d.revenue > 0 ? Math.round((d.fees / d.revenue) * 10000) / 100 : 0,
    })),
    by_make: Object.entries(byMakeMap).map(([make, d]) => ({
      make,
      units: d.units,
      revenue: Math.round(d.revenue * 100) / 100,
      profit: Math.round(d.profit * 100) / 100,
      margin_percent: d.revenue > 0 ? Math.round((d.profit / d.revenue) * 10000) / 100 : 0,
    })),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 2+ DATA — Repairs & Refurbishment
// ══════════════════════════════════════════════════════════════════════════════

export const repairJobs: RepairJob[] = [
  {
    repair_id: 'REP-2026-001',
    company_id: COMPANY_ID,
    device_id: 'DEV008',
    imei: '354678901234574',
    make: 'Apple',
    model: 'iPhone 13 Pro Max',
    storage: '256GB',
    grade_before: 'B',
    grade_after: undefined,
    repair_type: 'SCREEN_REPLACEMENT',
    repair_description: 'Screen cracked bottom-right — full OLED replacement required. iCloud lock also detected at intake QC, awaiting customer unlock before repair can proceed.',
    trigger: 'INTAKE_QC_FAIL',
    source_qc_id: 'QC002',
    vendor_id: 'VND003',
    vendor_name: 'AppleParts UK Ltd',
    is_internal: false,
    quote_amount: 85,
    actual_cost: undefined,
    parts_cost: 72,
    labour_cost: 13,
    status: 'AWAITING_PARTS',
    outcome: 'PENDING',
    created_at: '2026-03-20',
    started_at: undefined,
    completed_at: undefined,
    technician: undefined,
    notes: 'Device locked — cannot begin repair until iCloud removed. Screen parts ordered from AppleParts UK. Parts ETA: 5 days.',
    parts_used: [
      { part_id: 'PT001', part_name: 'iPhone 13 Pro Max OLED Screen Assembly', part_number: 'AAPL-SCR-13PM-256', supplier: 'AppleParts UK Ltd', cost: 72, quantity: 1 },
    ],
    timeline: [
      { event_id: 'RV001', timestamp: '2026-03-19T11:16:00Z', actor: 'system', action: 'Repair job created from QC002 — outcome LOCKED_BLOCKED. Screen crack + iCloud lock detected.', system_generated: true },
      { event_id: 'RV002', timestamp: '2026-03-20T09:00:00Z', actor: 'ops@refurbiq.co.uk', action: 'Quote of £85 obtained from AppleParts UK. Parts ordered.', system_generated: false },
      { event_id: 'RV003', timestamp: '2026-03-20T09:05:00Z', actor: 'system', action: 'Status → AWAITING_PARTS. Parts ETA: 2026-03-25.', system_generated: true },
      { event_id: 'RV004', timestamp: '2026-04-05T10:00:00Z', actor: 'support@refurbiq.co.uk', action: 'Customer contacted re: iCloud lock. Awaiting unlock confirmation.', system_generated: false },
    ],
  },
  {
    repair_id: 'REP-2026-002',
    company_id: COMPANY_ID,
    device_id: 'DEV003',
    imei: '354678901234569',
    make: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage: '512GB',
    grade_before: 'B',
    grade_after: 'A',
    repair_type: 'BATTERY_REPLACEMENT',
    repair_description: 'Battery health 68% at intake QC — below Grade A threshold (80%). Battery replacement required to relist as Grade A and achieve target sale price.',
    trigger: 'INTAKE_QC_FAIL',
    source_qc_id: undefined,
    vendor_id: undefined,
    vendor_name: 'In-House',
    is_internal: true,
    quote_amount: 35,
    actual_cost: 32,
    parts_cost: 22,
    labour_cost: 10,
    status: 'COMPLETED',
    outcome: 'UPGRADED_GRADE',
    created_at: '2026-03-13',
    started_at: '2026-03-14',
    completed_at: '2026-03-16',
    post_repair_qc_id: 'QC004',
    technician: 'tech01@refurbiq.co.uk',
    notes: 'Battery replaced successfully. Post-repair QC passed — battery health now 100%. Grade upgraded from B to A. Ready for relisting.',
    parts_used: [
      { part_id: 'PT002', part_name: 'Samsung Galaxy S24 Ultra Battery', part_number: 'SAM-BAT-S24U', supplier: 'SamsungParts Direct', cost: 22, quantity: 1 },
    ],
    timeline: [
      { event_id: 'RV005', timestamp: '2026-03-13T10:00:00Z', actor: 'ops@refurbiq.co.uk', action: 'Repair job opened — battery health 68%, below Grade A threshold.', system_generated: false },
      { event_id: 'RV006', timestamp: '2026-03-14T09:00:00Z', actor: 'tech01@refurbiq.co.uk', action: 'Repair started. Battery removal in progress.', system_generated: false },
      { event_id: 'RV007', timestamp: '2026-03-16T14:30:00Z', actor: 'tech01@refurbiq.co.uk', action: 'Battery replacement complete. New battery installed — 100% health. Post-repair QC passed.', system_generated: false },
      { event_id: 'RV008', timestamp: '2026-03-16T14:35:00Z', actor: 'system', action: 'Status → COMPLETED. Outcome: UPGRADED_GRADE (B → A). Device status → AVAILABLE.', system_generated: true },
    ],
  },
  {
    repair_id: 'REP-2026-003',
    company_id: COMPANY_ID,
    device_id: 'DEV006',
    imei: '354678901234572',
    make: 'Samsung',
    model: 'Galaxy A54',
    storage: '256GB',
    grade_before: 'C',
    grade_after: undefined,
    repair_type: 'SCREEN_REPLACEMENT',
    repair_description: 'Customer returned device claiming screen cracked on arrival. Return QC pending — cosmetic damage matches "cracked screen" fault. Assessing economic viability of repair vs scrap.',
    trigger: 'RETURN_QC_FAIL',
    source_rma_id: 'RMA-2026-009',
    vendor_id: undefined,
    vendor_name: 'In-House',
    is_internal: true,
    quote_amount: 55,
    actual_cost: undefined,
    parts_cost: 40,
    labour_cost: 15,
    status: 'QUOTE_PENDING',
    outcome: 'PENDING',
    created_at: '2026-04-09',
    started_at: undefined,
    completed_at: undefined,
    technician: undefined,
    notes: 'Device received from RMA-2026-009. Return QC pending. Screen cracked — need to assess if repair is economically viable given Grade C device value (~£120 resale). Repair cost est. £55.',
    parts_used: [],
    timeline: [
      { event_id: 'RV009', timestamp: '2026-04-09T11:16:00Z', actor: 'system', action: 'Repair job created from RMA-2026-009 — Return QC pending, screen crack reported.', system_generated: true },
      { event_id: 'RV010', timestamp: '2026-04-09T14:00:00Z', actor: 'ops@refurbiq.co.uk', action: 'Economic viability assessment: Est. repair £55 vs resale value ~£120 (Grade C). Recommendation: PROCEED with repair if QC confirms Grade C-or-above post-repair.', system_generated: false },
    ],
  },
  {
    repair_id: 'REP-2026-004',
    company_id: COMPANY_ID,
    device_id: 'DEV001',
    imei: '354678901234567',
    make: 'Apple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    grade_before: 'A',
    grade_after: 'B',
    repair_type: 'BATTERY_REPLACEMENT',
    repair_description: 'Returned via RMA-2026-005 — battery health at 61%, below Grade A threshold. Battery replaced. Post-repair QC passed but cosmetic inspection revealed additional hairline scratches not present at original intake. Downgraded to Grade B.',
    trigger: 'RETURN_QC_FAIL',
    source_rma_id: 'RMA-2026-005',
    source_qc_id: 'QC003',
    vendor_id: undefined,
    vendor_name: 'In-House',
    is_internal: true,
    quote_amount: 40,
    actual_cost: 38,
    parts_cost: 28,
    labour_cost: 10,
    status: 'COMPLETED',
    outcome: 'DOWNGRADED_GRADE',
    created_at: '2026-04-08',
    started_at: '2026-04-08',
    completed_at: '2026-04-09',
    post_repair_qc_id: 'QC005',
    technician: 'tech01@refurbiq.co.uk',
    notes: 'Battery replaced. Device now functional but cosmetic condition worsened — additional scratches visible on rear glass. Downgraded A → B. Full refund already issued to customer. Device relisted at Grade B.',
    parts_used: [
      { part_id: 'PT003', part_name: 'iPhone 14 Pro Battery', part_number: 'AAPL-BAT-14P', supplier: 'AppleParts UK Ltd', cost: 28, quantity: 1 },
    ],
    timeline: [
      { event_id: 'RV011', timestamp: '2026-04-08T09:35:00Z', actor: 'system', action: 'Repair job created from Return QC QC003 — battery 61%, fault confirmed.', system_generated: true },
      { event_id: 'RV012', timestamp: '2026-04-08T11:00:00Z', actor: 'tech01@refurbiq.co.uk', action: 'Battery replacement started.', system_generated: false },
      { event_id: 'RV013', timestamp: '2026-04-09T09:00:00Z', actor: 'tech01@refurbiq.co.uk', action: 'Battery replaced. Post-repair QC complete. Battery health 100%. Cosmetic issue noted — hairline scratches on rear.', system_generated: false },
      { event_id: 'RV014', timestamp: '2026-04-09T09:05:00Z', actor: 'system', action: 'Status → COMPLETED. Outcome: DOWNGRADED_GRADE (A → B). Device → AVAILABLE at Grade B.', system_generated: true },
    ],
  },
];

export function getRepairStats(): RepairStats {
  const total = repairJobs.length;
  const inProgress = repairJobs.filter(r => r.status === 'IN_PROGRESS').length;
  const awaitingParts = repairJobs.filter(r => r.status === 'AWAITING_PARTS').length;
  const completed = repairJobs.filter(r => r.status === 'COMPLETED').length;
  const scrapped = repairJobs.filter(r => r.status === 'SCRAPPED').length;
  const totalCost = repairJobs.reduce((s, r) => s + (r.actual_cost ?? r.quote_amount ?? 0), 0);
  const avgCost = total > 0 ? Math.round((totalCost / total) * 100) / 100 : 0;
  const gradeUpgrades = repairJobs.filter(r => r.outcome === 'UPGRADED_GRADE').length;
  const unviable = repairJobs.filter(r => r.outcome === 'ECONOMICALLY_UNVIABLE').length;
  // Rough recovery: completed repairs on returned devices saved from write-off
  const recoveryValue = repairJobs.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + (r.actual_cost ?? 0) * 3, 0);
  return {
    total_jobs: total,
    in_progress: inProgress,
    awaiting_parts: awaitingParts,
    completed,
    scrapped,
    total_repair_cost: Math.round(totalCost * 100) / 100,
    avg_repair_cost: avgCost,
    grade_upgrades: gradeUpgrades,
    economically_unviable: unviable,
    recovery_value: Math.round(recoveryValue * 100) / 100,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 3 DATA — Supplier Analytics, Audit Log, MTD VAT Returns
// ══════════════════════════════════════════════════════════════════════════════

// ── Supplier Analytics ────────────────────────────────────────────────────────

export function getSupplierAnalytics(): SupplierAnalyticsSummary {
  const metrics: SupplierMetric[] = [
    {
      supplier_id: 'SUP001', name: 'TechSource Ltd', country: 'GB',
      vat_number: 'GB123456789', is_active: true,
      total_purchases: 145200, batch_count: 2, device_count: 92,
      avg_cost_per_device: 307.50,
      qc_pass_rate: 96.7, defect_count: 3, return_count: 1,
      locked_device_count: 1, repair_triggered_count: 2, repair_cost_total: 78,
      opr_batch_count: 1, opr_device_count: 18, opr_risk_value: 6210,
      units_sold: 3, gross_revenue: 1630, net_profit: 244.27, avg_margin_percent: 14.99,
      best_device: 'iPhone 15 (30.3%)', worst_device: 'iPhone 14 Pro (-7.7%)',
      risk_score: 28, risk_label: 'LOW',
    },
    {
      supplier_id: 'SUP002', name: 'Mobile Wholesale EU', country: 'DE',
      vat_number: 'DE987654321', is_active: true,
      total_purchases: 87450, batch_count: 1, device_count: 35,
      avg_cost_per_device: 249.86,
      qc_pass_rate: 82.9, defect_count: 6, return_count: 2,
      locked_device_count: 0, repair_triggered_count: 2, repair_cost_total: 87,
      opr_batch_count: 0, opr_device_count: 0, opr_risk_value: 0,
      units_sold: 2, gross_revenue: 965, net_profit: 209.53, avg_margin_percent: 21.71,
      best_device: 'Galaxy A54 (56.5%)', worst_device: 'Galaxy S24 Ultra (−in stock)',
      risk_score: 62, risk_label: 'MEDIUM',
    },
    {
      supplier_id: 'SUP003', name: 'PhoneFlip Direct', country: 'GB',
      vat_number: 'GB555123456', is_active: true,
      total_purchases: 62300, batch_count: 1, device_count: 28,
      avg_cost_per_device: 325,
      qc_pass_rate: 100, defect_count: 0, return_count: 0,
      locked_device_count: 0, repair_triggered_count: 0, repair_cost_total: 0,
      opr_batch_count: 0, opr_device_count: 0, opr_risk_value: 0,
      units_sold: 0, gross_revenue: 0, net_profit: 0, avg_margin_percent: 0,
      best_device: '—', worst_device: '—',
      risk_score: 12, risk_label: 'LOW',
    },
    {
      supplier_id: 'SUP004', name: 'Horizon Devices', country: 'US',
      vat_number: '', is_active: false,
      total_purchases: 34100, batch_count: 3, device_count: 41,
      avg_cost_per_device: 271.54,
      qc_pass_rate: 71.0, defect_count: 12, return_count: 5,
      locked_device_count: 2, repair_triggered_count: 6, repair_cost_total: 340,
      opr_batch_count: 0, opr_device_count: 0, opr_risk_value: 0,
      units_sold: 0, gross_revenue: 0, net_profit: 0, avg_margin_percent: 0,
      best_device: '—', worst_device: '—',
      risk_score: 88, risk_label: 'CRITICAL',
    },
  ];

  const active = metrics.filter(m => m.is_active);
  return {
    total_suppliers: metrics.length,
    active_suppliers: active.length,
    total_spend: metrics.reduce((s, m) => s + m.total_purchases, 0),
    total_devices_from_suppliers: metrics.reduce((s, m) => s + m.device_count, 0),
    avg_qc_pass_rate: Math.round(active.reduce((s, m) => s + m.qc_pass_rate, 0) / active.length * 10) / 10,
    highest_margin_supplier: 'Mobile Wholesale EU (21.7% avg margin)',
    highest_risk_supplier: 'Horizon Devices (score 88 / CRITICAL — inactive)',
    metrics,
  };
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export const auditLog: AuditEntry[] = [
  // Auth
  { audit_id: 'AUD-0001', company_id: COMPANY_ID, timestamp: '2026-04-11T08:00:00Z', module: 'AUTH', severity: 'INFO', actor: 'admin@refurbiq.co.uk', actor_role: 'ADMIN', action: 'User login', entity_type: 'User', entity_id: 'admin@refurbiq.co.uk', system_generated: false, ip_address: '82.44.112.56', session_id: 'SES-001' },
  // Inventory
  { audit_id: 'AUD-0002', company_id: COMPANY_ID, timestamp: '2026-03-05T09:15:00Z', module: 'INVENTORY', severity: 'INFO', actor: 'ops@refurbiq.co.uk', actor_role: 'WAREHOUSE', action: 'Device received into warehouse', entity_type: 'Device', entity_id: 'DEV001', after_state: { status: 'RECEIVED', custody: 'WAREHOUSE' }, system_generated: false },
  { audit_id: 'AUD-0003', company_id: COMPANY_ID, timestamp: '2026-03-06T10:30:00Z', module: 'QC', severity: 'INFO', actor: 'ops@refurbiq.co.uk', actor_role: 'WAREHOUSE', action: 'Intake QC passed — Grade A assigned', entity_type: 'Device', entity_id: 'DEV001', before_state: { status: 'INTAKE_QC_PENDING', grade: null }, after_state: { status: 'AVAILABLE', grade: 'A', lock_check: 'CLEAR' }, system_generated: false },
  { audit_id: 'AUD-0004', company_id: COMPANY_ID, timestamp: '2026-03-19T11:15:00Z', module: 'QC', severity: 'CRITICAL', actor: 'ops@refurbiq.co.uk', actor_role: 'WAREHOUSE', action: 'Intake QC BLOCKED — iCloud lock detected. Device status set to LOCKED. All sale paths blocked.', entity_type: 'Device', entity_id: 'DEV008', before_state: { status: 'INTAKE_QC_PENDING' }, after_state: { status: 'LOCKED', lock_check: 'LOCKED', outcome: 'LOCKED_BLOCKED' }, system_generated: false },
  // VAT critical changes
  { audit_id: 'AUD-0005', company_id: COMPANY_ID, timestamp: '2026-04-07T14:00:00Z', module: 'VAT', severity: 'CRITICAL', actor: 'admin@refurbiq.co.uk', actor_role: 'ADMIN', action: 'VAT period VP2026-Q1 locked and submitted to HMRC', entity_type: 'VatPeriod', entity_id: 'VP2026-Q1', before_state: { status: 'OPEN' }, after_state: { status: 'LOCKED', submitted_by: 'admin@refurbiq.co.uk', submitted_at: '2026-04-07T14:00:00Z' }, system_generated: false },
  { audit_id: 'AUD-0006', company_id: COMPANY_ID, timestamp: '2026-04-02T10:15:00Z', module: 'VAT', severity: 'WARNING', actor: 'system', actor_role: 'SYSTEM', action: 'DRC threshold triggered — VAT code escalated to 0RCS_SALES for order ORD-AMZ-88754 (net value £5,167 ≥ £5,000)', entity_type: 'Order', entity_id: 'ORD-AMZ-88754', before_state: { vat_code: '20S_SALES' }, after_state: { vat_code: '0RCS_SALES', override_reason: 'DRC threshold' }, system_generated: true },
  { audit_id: 'AUD-0007', company_id: COMPANY_ID, timestamp: '2026-04-01T09:05:00Z', module: 'VAT', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Export VAT override applied — delivery country FR, VAT code set to 0EXPORT_SALES', entity_type: 'Order', entity_id: 'ORD-BM-44221', after_state: { vat_code: '0EXPORT_SALES', override_reason: 'Export: delivery to FR' }, system_generated: true },
  // OPR
  { audit_id: 'AUD-0008', company_id: COMPANY_ID, timestamp: '2026-02-15T08:30:00Z', module: 'OPR', severity: 'INFO', actor: 'ops@refurbiq.co.uk', actor_role: 'WAREHOUSE', action: 'OPR batch exported — MRN: GB2026-EX-441122. 18 devices dispatched to EuroRepair Solutions.', entity_type: 'OPRBatch', entity_id: 'OPR2026-001', after_state: { status: 'EXPORTED', awb: 'DHL-GB-778899' }, system_generated: false },
  { audit_id: 'AUD-0009', company_id: COMPANY_ID, timestamp: '2026-04-11T09:00:00Z', module: 'OPR', severity: 'CRITICAL', actor: 'system', actor_role: 'SYSTEM', action: 'OPR EXPIRY ALERT — Batch OPR2025-009 expires in 7 days (2026-04-18). Immediate action required.', entity_type: 'OPRBatch', entity_id: 'OPR2025-009', system_generated: true, notes: 'If not reimported by 2026-04-18, full duty relief will be lost and customs penalties may apply.' },
  // RMA mismatch
  { audit_id: 'AUD-0010', company_id: COMPANY_ID, timestamp: '2026-04-08T10:31:00Z', module: 'RMA', severity: 'CRITICAL', actor: 'system', actor_role: 'SYSTEM', action: 'IMEI MISMATCH DETECTED — RMA-2026-007. Sold IMEI: 354678901234573. Returned IMEI: 354678901234999. All resolution paths FROZEN.', entity_type: 'RMARecord', entity_id: 'RMA-2026-007', before_state: { status: 'IN_TRANSIT_BACK' }, after_state: { status: 'IMEI_MISMATCH', frozen: true }, system_generated: true },
  // Orders / Fintech
  { audit_id: 'AUD-0011', company_id: COMPANY_ID, timestamp: '2026-04-01T09:10:00Z', module: 'FINTECH', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Fintech advance issued — 80% of £520 = £416. Fee: £8.11. Net received: £407.89. vat_record_id = NULL (advance is not a VAT event).', entity_type: 'FintechAdvance', entity_id: 'FT001', system_generated: true },
  { audit_id: 'AUD-0012', company_id: COMPANY_ID, timestamp: '2026-04-03T14:00:00Z', module: 'ORDERS', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Order received from Amazon marketplace. Tax point set to sale date 2026-04-03.', entity_type: 'Order', entity_id: 'ORD-AMZ-88800', after_state: { status: 'PROCESSING', tax_point: '2026-04-03' }, system_generated: true },
  // Courier
  { audit_id: 'AUD-0013', company_id: COMPANY_ID, timestamp: '2026-04-09T15:05:00Z', module: 'COURIER', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Carrier claim approved — £680 recovery for INV-2026-002 (FedEx damage claim). Recovery posted to device DEV005 P&L.', entity_type: 'CourierInvestigation', entity_id: 'INV-2026-002', after_state: { status: 'CLAIM_APPROVED', recovery: 680 }, system_generated: true },
  // Repairs
  { audit_id: 'AUD-0014', company_id: COMPANY_ID, timestamp: '2026-03-16T14:35:00Z', module: 'REPAIRS', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Repair REP-2026-002 completed — Grade upgraded B → A. Device DEV003 status set to AVAILABLE.', entity_type: 'RepairJob', entity_id: 'REP-2026-002', before_state: { grade: 'B', status: 'IN_PROGRESS' }, after_state: { grade: 'A', status: 'AVAILABLE', outcome: 'UPGRADED_GRADE' }, system_generated: true },
  { audit_id: 'AUD-0015', company_id: COMPANY_ID, timestamp: '2026-04-09T09:05:00Z', module: 'REPAIRS', severity: 'WARNING', actor: 'system', actor_role: 'SYSTEM', action: 'Repair REP-2026-004 completed — Grade DOWNGRADED A → B. Additional cosmetic damage found post-repair. Device relisted at Grade B.', entity_type: 'RepairJob', entity_id: 'REP-2026-004', before_state: { grade: 'A' }, after_state: { grade: 'B', outcome: 'DOWNGRADED_GRADE' }, system_generated: true },
  // Security
  { audit_id: 'AUD-0016', company_id: COMPANY_ID, timestamp: '2026-04-10T22:17:00Z', module: 'AUTH', severity: 'SECURITY', actor: 'unknown', actor_role: 'UNKNOWN', action: 'Failed login attempt — 3 consecutive failures for user ops@refurbiq.co.uk. Account temporarily locked.', entity_type: 'User', entity_id: 'ops@refurbiq.co.uk', system_generated: true, ip_address: '45.227.88.12' },
  { audit_id: 'AUD-0017', company_id: COMPANY_ID, timestamp: '2026-04-07T09:00:00Z', module: 'VAT', severity: 'WARNING', actor: 'admin@refurbiq.co.uk', actor_role: 'ADMIN', action: 'VAT code manually overridden on VAT001 — requires manager sign-off. Reason: Export reclassification.', entity_type: 'VatRecord', entity_id: 'VAT001', before_state: { vat_code: '20S_SALES' }, after_state: { vat_code: '0EXPORT_SALES', override_by: 'admin@refurbiq.co.uk' }, system_generated: false },
  { audit_id: 'AUD-0018', company_id: COMPANY_ID, timestamp: '2026-04-11T07:58:00Z', module: 'SYSTEM', severity: 'INFO', actor: 'system', actor_role: 'SYSTEM', action: 'Daily backup completed — operational data 6yr retention policy verified. OPR documents 4yr. VAT records 6yr. Audit logs 2yr.', entity_type: 'System', entity_id: 'BACKUP-20260411', system_generated: true },
];

// ── MTD VAT Returns ───────────────────────────────────────────────────────────

export const mtdVatReturns: MTDVatReturn[] = [
  {
    return_id: 'MTD-2026-Q1',
    company_id: COMPANY_ID,
    vat_period_id: 'VP2026-Q1',
    period_start: '2026-01-01',
    period_end: '2026-03-31',
    period_key: '26AA',
    status: 'ACCEPTED',
    box_1: 3208.75,
    box_2: 0,
    box_3: 3208.75,
    box_4: 3835,
    box_5: -626.25,
    box_6: 6347,
    box_7: 15600,
    box_8: 1200,
    box_9: 0,
    prepared_by: 'admin@refurbiq.co.uk',
    prepared_at: '2026-04-05T10:00:00Z',
    reviewed_by: 'finance@refurbiq.co.uk',
    reviewed_at: '2026-04-06T14:30:00Z',
    approved_by: 'director@refurbiq.co.uk',
    approved_at: '2026-04-07T09:00:00Z',
    submitted_at: '2026-04-07T14:00:00Z',
    hmrc_receipt_id: 'HMRC-RCT-2026-884411',
    hmrc_correlation_id: 'COR-20260407-77322',
    hmrc_processing_date: '2026-04-07',
    validation_errors: [],
    validation_warnings: [],
    finalised: true,
    payment_due_date: '2026-05-07',
    payment_amount: 0,
    payment_reference: 'REFUND-626.25',
  },
  {
    return_id: 'MTD-2026-Q2',
    company_id: COMPANY_ID,
    vat_period_id: 'VP2026-Q2',
    period_start: '2026-04-01',
    period_end: '2026-06-30',
    period_key: '26AB',
    status: 'DRAFT',
    box_1: 88.75,
    box_2: 0,
    box_3: 88.75,
    box_4: 0,
    box_5: 88.75,
    box_6: 6347,
    box_7: 0,
    box_8: 1200,
    box_9: 0,
    prepared_by: undefined,
    prepared_at: undefined,
    reviewed_by: undefined,
    reviewed_at: undefined,
    approved_by: undefined,
    approved_at: undefined,
    submitted_at: undefined,
    hmrc_receipt_id: undefined,
    hmrc_correlation_id: undefined,
    hmrc_processing_date: undefined,
    validation_errors: [
      'Period is not yet closed — return cannot be submitted until 2026-07-01',
    ],
    validation_warnings: [
      'Box 4 (input VAT) is £0 — verify no purchase VAT reclaim has been missed',
      'Box 7 (purchases) is £0 — verify supplier invoices have been reconciled',
      '2 orders have DRC (0RCS_SALES) applied — ensure customer has been notified per HMRC requirements',
    ],
    finalised: false,
    payment_due_date: '2026-08-07',
    payment_amount: 88.75,
    payment_reference: undefined,
  },
];
