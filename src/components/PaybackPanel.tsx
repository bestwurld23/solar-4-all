// ─────────────────────────────────────────────────────────────────────────────
// PaybackPanel — Solar system payback and ROI calculator
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { calculatePayback } from '../core/payback';

interface Props {
  arrayKw: number;
  dailyKwh: number;
  additionalIncentivesUsd: number;
}

function fmtDollar(n: number): string {
  return '$' + Math.abs(n).toLocaleString('en-US');
}

export default function PaybackPanel({ arrayKw, dailyKwh, additionalIncentivesUsd }: Props) {
  const [costPerWatt, setCostPerWatt] = useState<string>('3.00');
  const [electricityRate, setElectricityRate] = useState<string>('0.15');

  const cpw = parseFloat(costPerWatt) || 3.0;
  const rate = parseFloat(electricityRate) || 0.15;

  const result = calculatePayback({
    arrayKw,
    dailyKwh,
    costPerWatt: cpw,
    electricityRate: rate,
    federalItcRate: 0.3,
    additionalIncentivesUsd,
  });

  return (
    <div className="payback-panel">
      <h2 className="results-title">💰 Payback & Savings Calculator</h2>
      <p className="tab-intro">
        See how long it takes for your solar system to pay for itself — and how
        much you'll save over 25 years.
      </p>

      <div className="payback-inputs">
        <div className="form-group">
          <label htmlFor="costPerWatt">Installed Cost per Watt ($)</label>
          <input
            id="costPerWatt"
            type="number"
            min="1"
            max="10"
            step="0.10"
            value={costPerWatt}
            onChange={(e) => setCostPerWatt(e.target.value)}
          />
          <span className="field-hint">
            US average: $2.50–$4.00/W installed. Use $3.00 as a starting point — get quotes to confirm.
          </span>
        </div>
        <div className="form-group">
          <label htmlFor="electricityRate">Your Electricity Rate ($/kWh)</label>
          <input
            id="electricityRate"
            type="number"
            min="0.01"
            max="1.00"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
          />
          <span className="field-hint">
            Check your bill for your exact rate. US average is ~$0.13–$0.17/kWh — varies widely by location.
          </span>
        </div>
      </div>

      <div className="payback-grid">
        <div className="payback-row">
          <span className="payback-label">Gross System Cost</span>
          <span className="payback-value">{fmtDollar(result.grossCost)}</span>
        </div>
        <div className="payback-row credit">
          <span className="payback-label">Federal Tax Credit (30%)</span>
          <span className="payback-value">− {fmtDollar(result.federalCredit)}</span>
        </div>
        {additionalIncentivesUsd > 0 && (
          <div className="payback-row credit">
            <span className="payback-label">State / Local Incentives</span>
            <span className="payback-value">− {fmtDollar(additionalIncentivesUsd)}</span>
          </div>
        )}
        <div className="payback-row total">
          <span className="payback-label">Net Cost After Incentives</span>
          <span className="payback-value">{fmtDollar(result.netCost)}</span>
        </div>
        <div className="payback-row">
          <span className="payback-label">Annual Electric Bill Savings</span>
          <span className="payback-value">{fmtDollar(result.annualSavings)}/yr</span>
        </div>
      </div>

      <div className="results-grid" style={{ marginTop: '1rem' }}>
        <div className="result-card highlight">
          <span className="result-label">Payback Period</span>
          <span className="result-value big">{result.paybackYears} yrs</span>
          <span className="result-hint">
            Your panels pay for themselves in {result.paybackYears} years, then it's all savings.
          </span>
        </div>
        <div className="result-card">
          <span className="result-label">25-Year Net Savings</span>
          <span className="result-value">
            {result.twentyFiveYearSavings >= 0
              ? fmtDollar(result.twentyFiveYearSavings)
              : '−' + fmtDollar(result.twentyFiveYearSavings)}
          </span>
          <span className="result-hint">
            Total savings minus net cost over 25 years (typical panel lifespan).
          </span>
        </div>
        <div className="result-card">
          <span className="result-label">25-Year ROI</span>
          <span className="result-value">{result.roi25Year}%</span>
          <span className="result-hint">
            Return on your net investment over the system's lifetime.
          </span>
        </div>
      </div>

      <p className="results-disclaimer">
        Payback assumes your electricity rate stays constant — rates have historically risen
        ~3% per year, which would shorten your payback. Excludes battery storage costs.
        Always get multiple installer quotes.
      </p>
    </div>
  );
}
