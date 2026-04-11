// ============================================================
// RefurbIQ — API Routes
// ============================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  suppliers, purchaseBatches, devices, oprBatches,
  orders, vatRecords, vatPeriods, fintechAdvances,
  qcRecords, supportTickets, getDashboardStats,
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
