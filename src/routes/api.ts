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
