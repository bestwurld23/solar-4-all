// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Payback Calculator
// Pure functions only. No UI, no I/O, no framework deps.
// ─────────────────────────────────────────────────────────────────────────────

export interface PaybackInput {
  arrayKw: number;
  dailyKwh: number;
  costPerWatt: number;              // installed $/W, default 3.00
  electricityRate: number;          // $/kWh, default 0.15 (Illinois avg)
  federalItcRate: number;           // default 0.30
  additionalIncentivesUsd: number;  // extra $ off from state/local rebates
}

export interface PaybackResult {
  grossCost: number;
  federalCredit: number;
  netCost: number;
  annualSavings: number;
  paybackYears: number;
  twentyFiveYearSavings: number;
  roi25Year: number; // percentage
}

export function calculatePayback(input: PaybackInput): PaybackResult {
  const grossCost = input.arrayKw * 1000 * input.costPerWatt;
  const federalCredit = grossCost * input.federalItcRate;
  const netCost = Math.max(0, grossCost - federalCredit - input.additionalIncentivesUsd);
  const annualSavings = input.dailyKwh * 365 * input.electricityRate;
  const paybackYears = annualSavings > 0 ? netCost / annualSavings : 0;
  const twentyFiveYearSavings = annualSavings * 25 - netCost;
  const roi25Year = netCost > 0 ? (twentyFiveYearSavings / netCost) * 100 : 0;
  return {
    grossCost: Math.round(grossCost),
    federalCredit: Math.round(federalCredit),
    netCost: Math.round(netCost),
    annualSavings: Math.round(annualSavings),
    paybackYears: Math.round(paybackYears * 10) / 10,
    twentyFiveYearSavings: Math.round(twentyFiveYearSavings),
    roi25Year: Math.round(roi25Year),
  };
}
