// ============================================================
// RefurbIQ — API Routes
// ============================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  suppliers, purchaseBatches, devices, oprBatches,
  orders, vatRecords, vatPeriods, fintechAdvances,
  qcRecords, supportTickets, getDashboardStats,
  courierInvestigations, rmaRecords, unitPnLRecords, getProfitabilitySummary,
  repairJobs, getRepairStats,
  getSupplierAnalytics,
  auditLog,
  mtdVatReturns,
  tenants, getTenantSaaSSummary,
  marketplaceIntegrations,
  notifications, getNotificationSummary,
} from '../lib/data-store.js';
import {
  VAT_CODE_DEFINITIONS, evaluateDRCThreshold, calculateVat,
  calculateOPRUplift, calculateFintechAdvance, aggregateVatPeriod,
} from '../lib/vat-engine.js';

export const api = new Hono();

api.use('*', cors());

// ── Dashboard ─────────────────────────────────────────────────────────────────
api.get('/dashboard', (c) => c.json(getDashboardStats()));

// ── VAT Codes ─────────────────────────────────────────────────────────────────
api.get('/vat-codes', (c) => c.json(Object.values(VAT_CODE_DEFINITIONS)));

// ── VAT Engine — DRC Threshold Check ─────────────────────────────────────────
api.post('/vat/evaluate', async (c) => {
  const body = await c.req.json();
  const result = evaluateDRCThreshold(body.netValue, body.deliveryCountry, body.vatCode);
  const calc = calculateVat({ vatCode: result.code, grossAmount: body.grossAmount, costPrice: body.costPrice });
  return c.json({ ...result, ...calc, drc_legal_text: result.code === '0RCS_SALES' ? "Customer to account to HMRC for the reverse charge output tax on the VAT exclusive price of items marked 'reverse charge'." : null });
});

// ── VAT Calculator ────────────────────────────────────────────────────────────
api.post('/vat/calculate', async (c) => {
  const body = await c.req.json();
  return c.json(calculateVat({ vatCode: body.vatCode, grossAmount: body.grossAmount, costPrice: body.costPrice }));
});

// ── OPR Calculator ────────────────────────────────────────────────────────────
api.post('/opr/calculate', async (c) => {
  const body = await c.req.json();
  return c.json(calculateOPRUplift({
    processingInvoiceValue: body.processingInvoiceValue,
    freightOutbound: body.freightOutbound,
    freightInbound: body.freightInbound,
    unitCount: body.unitCount,
  }));
});

// ── Fintech Calculator ────────────────────────────────────────────────────────
api.post('/fintech/calculate', async (c) => {
  const body = await c.req.json();
  return c.json(calculateFintechAdvance(body.grossSaleValue));
});

// ── Suppliers ─────────────────────────────────────────────────────────────────
api.get('/suppliers', (c) => c.json(suppliers));
api.get('/suppliers/:id', (c) => {
  const s = suppliers.find(x => x.supplier_id === c.req.param('id'));
  return s ? c.json(s) : c.notFound();
});

// ── Purchase Batches ──────────────────────────────────────────────────────────
api.get('/purchase-batches', (c) => c.json(purchaseBatches));
api.get('/purchase-batches/:id', (c) => {
  const b = purchaseBatches.find(x => x.purchase_batch_id === c.req.param('id'));
  return b ? c.json(b) : c.notFound();
});

// ── Devices ───────────────────────────────────────────────────────────────────
api.get('/devices', (c) => {
  const { status, grade, make } = c.req.query();
  let result = [...devices];
  if (status) result = result.filter(d => d.current_status === status);
  if (grade) result = result.filter(d => d.grade === grade);
  if (make) result = result.filter(d => d.make.toLowerCase() === make.toLowerCase());
  return c.json(result);
});
api.get('/devices/:id', (c) => {
  const d = devices.find(x => x.device_id === c.req.param('id'));
  if (!d) return c.notFound();
  const qc = qcRecords.filter(q => q.device_id === d.device_id);
  return c.json({ ...d, qc_records: qc });
});

// ── OPR Batches ───────────────────────────────────────────────────────────────
api.get('/opr-batches', (c) => c.json(oprBatches));
api.get('/opr-batches/:id', (c) => {
  const b = oprBatches.find(x => x.opr_batch_id === c.req.param('id'));
  return b ? c.json(b) : c.notFound();
});

// ── Orders ────────────────────────────────────────────────────────────────────
api.get('/orders', (c) => {
  const { status, marketplace } = c.req.query();
  let result = [...orders];
  if (status) result = result.filter(o => o.order_status === status);
  if (marketplace) result = result.filter(o => o.marketplace_name?.toLowerCase() === marketplace.toLowerCase());
  return c.json(result);
});
api.get('/orders/:id', (c) => {
  const o = orders.find(x => x.order_id === c.req.param('id'));
  if (!o) return c.notFound();
  const vr = vatRecords.find(v => v.linked_entity_id === o.order_id);
  const ft = fintechAdvances.find(f => f.order_id === o.order_id);
  return c.json({ ...o, vat_record: vr, fintech_advance: ft });
});

// ── VAT Records ───────────────────────────────────────────────────────────────
api.get('/vat-records', (c) => c.json(vatRecords));
api.get('/vat-records/period/:periodId', (c) => {
  const records = vatRecords.filter(v => v.vat_period_id === c.req.param('periodId'));
  const aggregate = aggregateVatPeriod(records);
  return c.json({ records, aggregate });
});

// ── VAT Periods ───────────────────────────────────────────────────────────────
api.get('/vat-periods', (c) => c.json(vatPeriods));
api.get('/vat-periods/:id', (c) => {
  const p = vatPeriods.find(x => x.vat_period_id === c.req.param('id'));
  return p ? c.json(p) : c.notFound();
});

// ── Fintech ───────────────────────────────────────────────────────────────────
api.get('/fintech', (c) => c.json(fintechAdvances));

// ── QC Records ────────────────────────────────────────────────────────────────
api.get('/qc', (c) => c.json(qcRecords));
api.get('/qc/pending', (c) => {
  const pending = devices.filter(d => ['INTAKE_QC_PENDING', 'RETURN_QC_PENDING', 'POST_REPAIR_QC'].includes(d.current_status));
  return c.json(pending);
});

// ── Support Tickets ───────────────────────────────────────────────────────────
api.get('/tickets', (c) => {
  const { status, priority } = c.req.query();
  let result = [...supportTickets];
  if (status) result = result.filter(t => t.status === status);
  if (priority) result = result.filter(t => t.priority === priority);
  return c.json(result);
});
api.get('/tickets/:id', (c) => {
  const t = supportTickets.find(x => x.ticket_id === c.req.param('id'));
  return t ? c.json(t) : c.notFound();
});

// ── Courier Investigations ─────────────────────────────────────────────────────
api.get('/investigations', (c) => {
  const { status, event_type } = c.req.query();
  let result = [...courierInvestigations];
  if (status) result = result.filter(i => i.status === status);
  if (event_type) result = result.filter(i => i.event_type === event_type);
  return c.json(result);
});
api.get('/investigations/:id', (c) => {
  const inv = courierInvestigations.find(x => x.investigation_id === c.req.param('id'));
  return inv ? c.json(inv) : c.notFound();
});
api.get('/investigations/stats/summary', (c) => {
  const open = courierInvestigations.filter(i => !['RESOLVED_LOSS','RESOLVED_FOUND','CLOSED'].includes(i.status)).length;
  const totalClaimed = courierInvestigations.reduce((s, i) => s + i.claimed_amount, 0);
  const totalRecovered = courierInvestigations.reduce((s, i) => s + i.recovery_amount, 0);
  const recoveryRate = totalClaimed > 0 ? Math.round((totalRecovered / totalClaimed) * 100) : 0;
  return c.json({ open, total: courierInvestigations.length, totalClaimed, totalRecovered, recoveryRate });
});

// ── RMA Records ───────────────────────────────────────────────────────────────
api.get('/rma', (c) => {
  const { status } = c.req.query();
  let result = [...rmaRecords];
  if (status) result = result.filter(r => r.status === status);
  return c.json(result);
});
api.get('/rma/:id', (c) => {
  const r = rmaRecords.find(x => x.rma_id === c.req.param('id'));
  return r ? c.json(r) : c.notFound();
});
api.get('/rma/stats/summary', (c) => {
  const open = rmaRecords.filter(r => !['CLOSED','CLOSED_NO_ACTION'].includes(r.status)).length;
  const mismatches = rmaRecords.filter(r => r.imei_match === false).length;
  const totalRefunded = rmaRecords.filter(r => r.status === 'REFUND_APPROVED').reduce((s, r) => s + r.refund_amount, 0);
  const pendingQC = rmaRecords.filter(r => r.status === 'RETURN_QC_PENDING').length;
  return c.json({ open, mismatches, totalRefunded, pendingQC, total: rmaRecords.length });
});

// ── Profitability / Unit P&L ─────────────────────────────────────────────────
api.get('/pnl/units', (c) => {
  const { status } = c.req.query();
  let result = [...unitPnLRecords];
  if (status) result = result.filter(u => u.status === status);
  return c.json(result);
});
api.get('/pnl/summary', (c) => c.json(getProfitabilitySummary()));
api.get('/pnl/units/:device_id', (c) => {
  const u = unitPnLRecords.find(x => x.device_id === c.req.param('device_id'));
  return u ? c.json(u) : c.notFound();
});

// ── Repairs & Refurbishment ────────────────────────────────────────────────────
api.get('/repairs', (c) => {
  const { status, outcome, device_id } = c.req.query();
  let result = [...repairJobs];
  if (status) result = result.filter(r => r.status === status);
  if (outcome) result = result.filter(r => r.outcome === outcome);
  if (device_id) result = result.filter(r => r.device_id === device_id);
  return c.json(result);
});
api.get('/repairs/stats/summary', (c) => c.json(getRepairStats()));
api.get('/repairs/:id', (c) => {
  const r = repairJobs.find(x => x.repair_id === c.req.param('id'));
  return r ? c.json(r) : c.notFound();
});

// ── Supplier Analytics ─────────────────────────────────────────────────────────
api.get('/supplier-analytics', (c) => c.json(getSupplierAnalytics()));
api.get('/supplier-analytics/:id', (c) => {
  const analytics = getSupplierAnalytics();
  const metric = analytics.metrics.find(m => m.supplier_id === c.req.param('id'));
  return metric ? c.json(metric) : c.notFound();
});

// ── Audit Log ─────────────────────────────────────────────────────────────────
api.get('/audit-log', (c) => {
  const { module, severity, actor, limit } = c.req.query();
  let result = [...auditLog].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (module) result = result.filter(e => e.module === module);
  if (severity) result = result.filter(e => e.severity === severity);
  if (actor) result = result.filter(e => e.actor.includes(actor));
  const n = parseInt(limit || '50');
  return c.json({ total: result.length, entries: result.slice(0, n) });
});
api.get('/audit-log/:id', (c) => {
  const e = auditLog.find(x => x.audit_id === c.req.param('id'));
  return e ? c.json(e) : c.notFound();
});
api.get('/audit-log/stats/summary', (c) => {
  const bySeverity = { INFO: 0, WARNING: 0, CRITICAL: 0, SECURITY: 0 };
  const byModule: Record<string, number> = {};
  for (const e of auditLog) {
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    byModule[e.module] = (byModule[e.module] || 0) + 1;
  }
  const recent = [...auditLog].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);
  return c.json({ total: auditLog.length, bySeverity, byModule, recent });
});

// ── MTD VAT Returns ───────────────────────────────────────────────────────────
api.get('/mtd-returns', (c) => c.json(mtdVatReturns));
api.get('/mtd-returns/:id', (c) => {
  const r = mtdVatReturns.find(x => x.return_id === c.req.param('id'));
  return r ? c.json(r) : c.notFound();
});
api.get('/mtd-returns/:id/validate', (c) => {
  const r = mtdVatReturns.find(x => x.return_id === c.req.param('id'));
  if (!r) return c.notFound();
  const errors = [...r.validation_errors];
  const warnings = [...r.validation_warnings];
  // Computed validations
  if (Math.abs(r.box_1 + r.box_2 - r.box_3) > 0.01) errors.push('Box 3 must equal Box 1 + Box 2');
  if (Math.abs(r.box_3 - r.box_4 - r.box_5) > 0.01) errors.push('Box 5 must equal Box 3 − Box 4');
  return c.json({ return_id: r.return_id, valid: errors.length === 0, errors, warnings, can_submit: errors.length === 0 && r.status !== 'ACCEPTED' });
});

// ── MTD Submit (simulated) ─────────────────────────────────────────────────────
api.post('/mtd-returns/:id/submit', async (c) => {
  const r = mtdVatReturns.find(x => x.return_id === c.req.param('id'));
  if (!r) return c.notFound();
  if (r.status === 'ACCEPTED') return c.json({ error: 'Already submitted' }, 400);
  const errors = [...r.validation_errors];
  if (Math.abs(r.box_1 + r.box_2 - r.box_3) > 0.01) errors.push('Box 3 must equal Box 1 + Box 2');
  if (errors.length > 0) return c.json({ error: 'Validation failed', errors }, 422);
  // Simulate HMRC acceptance
  r.status = 'ACCEPTED';
  r.submitted_at = new Date().toISOString();
  r.hmrc_receipt_id = 'HMRC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  r.hmrc_processing_date = new Date().toISOString().split('T')[0];
  return c.json({ success: true, receipt_id: r.hmrc_receipt_id, processing_date: r.hmrc_processing_date, return_id: r.return_id });
});

// ── Tenants / SaaS Management ─────────────────────────────────────────────────
api.get('/tenants', (c) => c.json(tenants));
api.get('/tenants/summary', (c) => c.json(getTenantSaaSSummary()));
api.get('/tenants/:id', (c) => {
  const t = tenants.find(x => x.tenant_id === c.req.param('id'));
  return t ? c.json(t) : c.notFound();
});
api.patch('/tenants/:id/status', async (c) => {
  const t = tenants.find(x => x.tenant_id === c.req.param('id'));
  if (!t) return c.notFound();
  const body = await c.req.json();
  if (body.status) t.status = body.status;
  return c.json({ success: true, tenant_id: t.tenant_id, status: t.status });
});
api.get('/tenants/:id/usage', (c) => {
  const t = tenants.find(x => x.tenant_id === c.req.param('id'));
  return t ? c.json(t.usage) : c.notFound();
});

// ── Marketplace Integrations ──────────────────────────────────────────────────
api.get('/marketplace', (c) => c.json(marketplaceIntegrations));
api.get('/marketplace/integrations', (c) => c.json(marketplaceIntegrations));
api.get('/marketplace/stats/summary', (c) => {
  const total = marketplaceIntegrations.length;
  const connected = marketplaceIntegrations.filter(m => m.status === 'CONNECTED').length;
  const errors = marketplaceIntegrations.filter(m => m.status === 'ERROR').length;
  const totalOrders = marketplaceIntegrations.reduce((s, m) => s + m.total_orders_synced, 0);
  const pendingOrders = marketplaceIntegrations.reduce((s, m) => s + m.pending_orders, 0);
  const totalErrors = marketplaceIntegrations.reduce((s, m) => s + m.recent_errors.filter(e => !e.resolved).length, 0);
  return c.json({ total, connected, errors, disconnected: total - connected - errors, total_orders_synced: totalOrders, pending_orders: pendingOrders, unresolved_errors: totalErrors });
});
api.get('/marketplace/:id', (c) => {
  const m = marketplaceIntegrations.find(x => x.integration_id === c.req.param('id'));
  return m ? c.json(m) : c.notFound();
});
api.post('/marketplace/:id/reconnect', async (c) => {
  const m = marketplaceIntegrations.find(x => x.integration_id === c.req.param('id'));
  if (!m) return c.notFound();
  // Simulate reconnection for demo
  m.status = 'CONNECTED';
  m.credentials_valid = true;
  m.credentials_expiry = '2027-04-11';
  m.last_sync_at = new Date().toISOString();
  m.last_sync_status = 'SYNCED';
  m.recent_errors.forEach(e => e.resolved = true);
  return c.json({ success: true, integration_id: m.integration_id, status: m.status });
});
api.post('/marketplace/:id/sync', async (c) => {
  const m = marketplaceIntegrations.find(x => x.integration_id === c.req.param('id'));
  if (!m) return c.notFound();
  if (m.status !== 'CONNECTED') return c.json({ error: 'Integration not connected' }, 400);
  const newEntry = { log_id: 'SL' + Date.now(), timestamp: new Date().toISOString(), direction: 'INBOUND' as const, entity_type: 'Orders', count: Math.floor(Math.random() * 5), status: 'SYNCED' as const, duration_ms: 400 + Math.floor(Math.random() * 600), errors: 0 };
  m.sync_log.unshift(newEntry);
  m.last_sync_at = newEntry.timestamp;
  m.last_sync_status = 'SYNCED';
  m.last_sync_orders = newEntry.count;
  return c.json({ success: true, orders_synced: newEntry.count, duration_ms: newEntry.duration_ms });
});

// ── Notifications ─────────────────────────────────────────────────────────────
api.get('/notifications', (c) => {
  const { unread_only } = c.req.query();
  let result = [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (unread_only === 'true') result = result.filter(n => !n.read);
  return c.json(result);
});
api.get('/notifications/summary', (c) => c.json(getNotificationSummary()));
api.patch('/notifications/:id/read', async (c) => {
  const n = notifications.find(x => x.notif_id === c.req.param('id'));
  if (!n) return c.notFound();
  n.read = true;
  n.read_at = new Date().toISOString();
  return c.json({ success: true, notif_id: n.notif_id });
});
api.post('/notifications/mark-all-read', async (c) => {
  notifications.forEach(n => { n.read = true; n.read_at = new Date().toISOString(); });
  return c.json({ success: true, count: notifications.length });
});

// ── Enhanced Dashboard (Phase 4) ──────────────────────────────────────────────
api.get('/dashboard/v2', async (c) => {
  const base = getDashboardStats();
  const repairStats = getRepairStats();
  const pnlSummary = getProfitabilitySummary();
  const notifSummary = getNotificationSummary();
  const mktSummary = {
    connected: marketplaceIntegrations.filter(m => m.status === 'CONNECTED').length,
    errors: marketplaceIntegrations.filter(m => m.status === 'ERROR').length,
  };
  return c.json({ ...base, repair_stats: repairStats, pnl_summary: pnlSummary, notifications: notifSummary, marketplace: mktSummary });
});

// ── Barcode / IMEI Scanner ────────────────────────────────────────────────────
api.post('/scanner/lookup', async (c) => {
  const body = await c.req.json();
  const { imei, barcode } = body;
  const query = imei || barcode;
  if (!query) return c.json({ error: 'imei or barcode required' }, 400);

  // Check existing devices
  const existing = devices.find(d => (d as any).imei_primary === query || (d as any).imei_secondary === query || (d as any).imei === query || (d as any).imei_2 === query);
  if (existing) {
    return c.json({ found: true, type: 'device', device: existing, status: (existing as any).status, action: (existing as any).status === 'AVAILABLE' ? 'READY_TO_SHIP' : (existing as any).status === 'INTAKE_QC_PENDING' ? 'NEEDS_QC' : 'VIEW_DEVICE' });
  }

  // Check purchase batches (barcode on batch label)
  const batch = purchaseBatches.find(b => b.purchase_batch_id === query || b.batch_code === query);
  if (batch) {
    return c.json({ found: true, type: 'batch', batch, action: 'VIEW_BATCH' });
  }

  // IMEI lookup — device model inference from IMEI prefix (demo logic)
  const makeMap: Record<string, { make: string; model: string }> = {
    '35467890': { make: 'Apple', model: 'iPhone 14' },
    '35998800': { make: 'Samsung', model: 'Galaxy S24' },
    '86440012': { make: 'Google', model: 'Pixel 8' },
    '35123456': { make: 'Apple', model: 'iPhone 15' },
  };
  const prefix = query.substring(0, 8);
  const inferred = makeMap[prefix];

  return c.json({ found: false, imei: query, inferred_make: inferred?.make || null, inferred_model: inferred?.model || null, action: 'CREATE_DEVICE', suggestion: inferred ? `Looks like a ${inferred.make} ${inferred.model} — create intake record?` : 'Unknown device — create intake record manually?' });
});

api.post('/scanner/intake', async (c) => {
  const body = await c.req.json();
  const required = ['imei', 'make', 'model', 'grade', 'storage', 'colour', 'network', 'purchase_batch_id'];
  const missing = required.filter(f => !body[f]);
  if (missing.length) return c.json({ error: 'Missing fields: ' + missing.join(', ') }, 400);

  // Check duplicate IMEI
  if (devices.find(d => (d as any).imei_primary === body.imei || (d as any).imei === body.imei)) {
    return c.json({ error: 'DUPLICATE_IMEI', message: `IMEI ${body.imei} already exists in system` }, 409);
  }

  const newId = 'DEV' + String(devices.length + 1).padStart(3, '0') + '-NEW';
  const batch = purchaseBatches.find(b => b.purchase_batch_id === body.purchase_batch_id);
  const newDevice = {
    device_id: newId, company_id: 'REFURBIQ_DEMO',
    imei: body.imei, imei_2: body.imei_2 || null,
    make: body.make, model: body.model, storage: body.storage,
    colour: body.colour, grade: body.grade, network: body.network,
    supplier_id: batch?.supplier_id || 'SUP001',
    purchase_batch_id: body.purchase_batch_id,
    unit_cost: body.unit_cost || 0, vat_code: body.vat_code || '20RC_PURCHASES',
    status: 'INTAKE_QC_PENDING', custody: 'WAREHOUSE',
    location: 'Goods-In Bay', created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  (devices as any[]).push(newDevice);
  return c.json({ success: true, device_id: newId, status: 'INTAKE_QC_PENDING', message: `Device ${newId} created — awaiting QC` });
});
