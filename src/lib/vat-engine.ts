// ============================================================
// RefurbIQ — VAT Engine (Core Business Logic)
// ============================================================

import type { VatCode, VatCodeDefinition, VatRecord } from '../types/index.js';

export const VAT_CODE_DEFINITIONS: Record<VatCode, VatCodeDefinition> = {
  '20S_SALES': {
    vat_code: '20S_SALES',
    display_name: '20.0% S (Sales)',
    rate_percent: 20,
    scope: 'SALES',
    scheme: 'STANDARD',
    description: 'Standard VAT Sales (20%). Adds 20% Output VAT to invoice total.',
    box_1_flag: true, box_2_flag: false, box_4_flag: false, box_6_flag: true, box_7_flag: false,
  },
  '20S_PURCHASES': {
    vat_code: '20S_PURCHASES',
    display_name: '20.0% S (Purchases)',
    rate_percent: 20,
    scope: 'PURCHASES',
    scheme: 'STANDARD',
    description: 'Standard VAT Purchases (20%). Records 20% Input VAT as reclaimable.',
    box_1_flag: false, box_2_flag: false, box_4_flag: true, box_6_flag: false, box_7_flag: true,
  },
  '20RC_PURCHASES': {
    vat_code: '20RC_PURCHASES',
    display_name: '20.0% RC (Purchases)',
    rate_percent: 20,
    scope: 'PURCHASES',
    scheme: 'REVERSE_CHARGE',
    description: 'Reverse Charge Purchases. Self-accounting: 20% Output (Box 1) + 20% Input (Box 4). Net cash = £0.',
    box_1_flag: true, box_2_flag: false, box_4_flag: true, box_6_flag: false, box_7_flag: true,
  },
  '0RCS_SALES': {
    vat_code: '0RCS_SALES',
    display_name: '0.0% RCS (Sales)',
    rate_percent: 0,
    scope: 'SALES',
    scheme: 'REVERSE_CHARGE',
    description: 'Reverse Charge Sales (0%). Mandatory legal footer text applied.',
    box_1_flag: false, box_2_flag: false, box_4_flag: false, box_6_flag: true, box_7_flag: false,
  },
  '0MARGIN_PURCHASES': {
    vat_code: '0MARGIN_PURCHASES',
    display_name: '0.0% Margin (Purchases)',
    rate_percent: 0,
    scope: 'PURCHASES',
    scheme: 'MARGIN',
    description: 'Margin Scheme Purchase (0%). Records purchase price with 0% VAT.',
    box_1_flag: false, box_2_flag: false, box_4_flag: false, box_6_flag: false, box_7_flag: true,
  },
  '0MARGIN_SALES': {
    vat_code: '0MARGIN_SALES',
    display_name: '0.0% Margin (Sales)',
    rate_percent: 0,
    scope: 'SALES',
    scheme: 'MARGIN',
    description: 'Margin Scheme Sale. VAT at 16.67% on profit margin only.',
    box_1_flag: true, box_2_flag: false, box_4_flag: false, box_6_flag: true, box_7_flag: false,
  },
  '0EXPORT_SALES': {
    vat_code: '0EXPORT_SALES',
    display_name: '0.0% Export (Sales)',
    rate_percent: 0,
    scope: 'SALES',
    scheme: 'EXPORT',
    description: 'Zero-Rated Export (0%). Records 0% VAT for sales outside UK.',
    box_1_flag: false, box_2_flag: false, box_4_flag: false, box_6_flag: true, box_7_flag: false,
  },
  'NOVAT_PURCHASES': {
    vat_code: 'NOVAT_PURCHASES',
    display_name: 'No VAT (Purchases)',
    rate_percent: 0,
    scope: 'PURCHASES',
    scheme: 'OUT_OF_SCOPE',
    description: 'Outside of Scope. No VAT impact. Wages, rates, non-taxable fees.',
    box_1_flag: false, box_2_flag: false, box_4_flag: false, box_6_flag: false, box_7_flag: false,
  },
};

export const DRC_THRESHOLD = 5000;
export const DRC_LEGAL_TEXT =
  "Customer to account to HMRC for the reverse charge output tax on the VAT exclusive price of items marked 'reverse charge'.";

// ── Evaluate DRC threshold ────────────────────────────────────────────────────
export function evaluateDRCThreshold(
  netInvoiceValue: number,
  deliveryCountry: string,
  originalCode: VatCode
): { code: VatCode; overrideApplied: boolean; reason?: string } {
  // Export override takes absolute precedence
  if (deliveryCountry.toUpperCase() !== 'GB' && deliveryCountry.toUpperCase() !== 'UK') {
    if (originalCode !== '0EXPORT_SALES') {
      return { code: '0EXPORT_SALES', overrideApplied: true, reason: `Export override: delivery to ${deliveryCountry}` };
    }
    return { code: '0EXPORT_SALES', overrideApplied: false };
  }
  // DRC threshold
  if (originalCode === '20S_SALES' && netInvoiceValue >= DRC_THRESHOLD) {
    return { code: '0RCS_SALES', overrideApplied: true, reason: `DRC threshold: net value £${netInvoiceValue.toFixed(2)} ≥ £${DRC_THRESHOLD}` };
  }
  return { code: originalCode, overrideApplied: false };
}

// ── Calculate VAT for a single transaction ───────────────────────────────────
export function calculateVat(params: {
  vatCode: VatCode;
  grossAmount: number;
  costPrice?: number; // for margin scheme
}): {
  netAmount: number;
  vatAmount: number;
  marginAmount: number;
  box1: number; box2: number; box4: number; box6: number; box7: number;
} {
  const { vatCode, grossAmount, costPrice = 0 } = params;
  const def = VAT_CODE_DEFINITIONS[vatCode];

  let netAmount = 0, vatAmount = 0, marginAmount = 0;
  let box1 = 0, box2 = 0, box4 = 0, box6 = 0, box7 = 0;

  switch (vatCode) {
    case '20S_SALES':
      netAmount = grossAmount / 1.2;
      vatAmount = grossAmount - netAmount;
      box1 = vatAmount;
      box6 = netAmount;
      break;

    case '20S_PURCHASES':
      netAmount = grossAmount / 1.2;
      vatAmount = grossAmount - netAmount;
      box4 = vatAmount;
      box7 = netAmount;
      break;

    case '20RC_PURCHASES':
      // Self-accounting: both Box 1 AND Box 4 — net cash = £0
      netAmount = grossAmount;
      vatAmount = grossAmount * 0.20;
      box1 = vatAmount;  // notional output
      box4 = vatAmount;  // notional input (same value)
      box7 = netAmount;
      break;

    case '0RCS_SALES':
      netAmount = grossAmount;
      vatAmount = 0;
      box6 = netAmount;
      break;

    case '0MARGIN_PURCHASES':
      netAmount = grossAmount;
      vatAmount = 0;
      box7 = netAmount;
      break;

    case '0MARGIN_SALES':
      // VAT = 1/6 of margin
      marginAmount = grossAmount - costPrice;
      vatAmount = marginAmount > 0 ? marginAmount * (1 / 6) : 0;
      netAmount = grossAmount;
      box1 = vatAmount;
      box6 = netAmount;
      break;

    case '0EXPORT_SALES':
      netAmount = grossAmount;
      vatAmount = 0;
      box6 = netAmount;
      break;

    case 'NOVAT_PURCHASES':
      netAmount = grossAmount;
      vatAmount = 0;
      break;
  }

  return {
    netAmount: Math.round(netAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    marginAmount: Math.round(marginAmount * 100) / 100,
    box1: Math.round(box1 * 100) / 100,
    box2: Math.round(box2 * 100) / 100,
    box4: Math.round(box4 * 100) / 100,
    box6: Math.round(box6 * 100) / 100,
    box7: Math.round(box7 * 100) / 100,
  };
}

// ── Aggregate VAT period boxes ────────────────────────────────────────────────
export function aggregateVatPeriod(records: VatRecord[]) {
  const totals = { box1: 0, box2: 0, box4: 0, box6: 0, box7: 0 };
  for (const r of records) {
    totals.box1 += r.box_1_amount;
    totals.box2 += r.box_2_amount;
    totals.box4 += r.box_4_amount;
    totals.box6 += r.box_6_amount;
    totals.box7 += r.box_7_amount;
  }
  const box3 = totals.box1 + totals.box2;
  const box5 = box3 - totals.box4; // positive = owe HMRC, negative = reclaim
  return { ...totals, box3, box5 };
}

// ── OPR calculations ──────────────────────────────────────────────────────────
export function calculateOPRUplift(params: {
  processingInvoiceValue: number;
  freightOutbound: number;
  freightInbound: number;
  unitCount: number;
}): { upliftPerUnit: number; importVatOnUplift: number; totalUplift: number } {
  const { processingInvoiceValue, freightOutbound, freightInbound, unitCount } = params;
  if (unitCount === 0) return { upliftPerUnit: 0, importVatOnUplift: 0, totalUplift: 0 };
  const totalUplift = processingInvoiceValue + freightOutbound + freightInbound;
  const upliftPerUnit = totalUplift / unitCount;
  const importVatOnUplift = totalUplift * 0.20;
  return {
    upliftPerUnit: Math.round(upliftPerUnit * 100) / 100,
    importVatOnUplift: Math.round(importVatOnUplift * 100) / 100,
    totalUplift: Math.round(totalUplift * 100) / 100,
  };
}

// ── Fintech advance calculation ───────────────────────────────────────────────
export function calculateFintechAdvance(grossSaleValue: number) {
  const advanceAmount = grossSaleValue * 0.80;
  const fintechFee = advanceAmount * 0.0195;
  const netAdvanceReceived = advanceAmount - fintechFee;
  return {
    advanceAmount: Math.round(advanceAmount * 100) / 100,
    fintechFee: Math.round(fintechFee * 100) / 100,
    netAdvanceReceived: Math.round(netAdvanceReceived * 100) / 100,
  };
}

// ── Unit P&L ──────────────────────────────────────────────────────────────────
export function calculateUnitPnL(params: {
  grossSale: number;
  vatOnSale: number;
  purchaseCost: number;
  oprUplift: number;
  marketplaceFee: number;
  fintechFee: number;
  shippingCost: number;
  repairCost: number;
  recoveryAmount: number;
}) {
  const {
    grossSale, vatOnSale, purchaseCost, oprUplift,
    marketplaceFee, fintechFee, shippingCost, repairCost, recoveryAmount,
  } = params;
  const revenue = grossSale - vatOnSale;
  const costs = purchaseCost + oprUplift + marketplaceFee + fintechFee + shippingCost + repairCost;
  const netProfit = revenue - costs + recoveryAmount;
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  return {
    revenue: Math.round(revenue * 100) / 100,
    totalCosts: Math.round(costs * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
  };
}
