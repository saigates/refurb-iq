// ============================================================
// RefurbIQ — Demo Data Store (in-memory, tenant-scoped)
// ============================================================

import type {
  Device, PurchaseBatch, OPRBatch, Order, VatRecord,
  VatPeriod, FintechAdvance, Supplier, QCRecord, SupportTicket, DashboardStats
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
