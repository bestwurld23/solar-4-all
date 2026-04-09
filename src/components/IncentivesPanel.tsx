// ─────────────────────────────────────────────────────────────────────────────
// IncentivesPanel — Shows incentives for the user's already-selected location
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { getIncentives, type Incentive } from '../core/incentives';

interface Props {
  state: string;
  county: string;
  additionalIncentivesUsd: number;
  onIncentiveValueChange: (usd: number) => void;
}

const TYPE_LABELS: Record<Incentive['type'], string> = {
  tax_credit: '💸 Tax Credit',
  rebate:     '💵 Rebate',
  net_metering: '⚡ Net Metering',
  exemption:  '🏠 Tax Exemption',
  program:    '🌱 Program',
};

const SCOPE_LABELS: Record<Incentive['scope'], string> = {
  federal: 'Federal',
  state:   'State',
  county:  'County',
  utility: 'Utility',
};

export default function IncentivesPanel({
  state,
  county,
  additionalIncentivesUsd,
  onIncentiveValueChange,
}: Props) {
  const [incentiveInput, setIncentiveInput] = useState<string>(
    additionalIncentivesUsd > 0 ? String(additionalIncentivesUsd) : '',
  );

  // Automatically use the location already selected at the top of the app
  const incentives = getIncentives(state, county);

  function handleIncentiveInput(val: string) {
    setIncentiveInput(val);
    const parsed = parseFloat(val);
    onIncentiveValueChange(isNaN(parsed) || parsed < 0 ? 0 : parsed);
  }

  return (
    <div className="incentives-panel">
      <h2 className="results-title">💰 Money Back — Programs For You</h2>
      <p className="tab-intro">
        These are real programs available in your area that can cut your solar
        cost significantly. Most homeowners get 30–50% back through credits and
        rebates.
      </p>

      <div className="incentives-list">
        {incentives.map((incentive, i) => (
          <div key={i} className="incentive-card">
            <div className="incentive-card-header">
              <span className="incentive-name">{incentive.name}</span>
              <div className="incentive-tags">
                <span className="incentive-tag type">{TYPE_LABELS[incentive.type]}</span>
                <span className="incentive-tag scope">{SCOPE_LABELS[incentive.scope]}</span>
              </div>
            </div>
            <p className="incentive-description">{incentive.description}</p>
            <div className="incentive-details">
              <div className="incentive-detail">
                <span className="detail-label">What you get</span>
                <span className="detail-value">{incentive.estimatedValue}</span>
              </div>
              <div className="incentive-detail">
                <span className="detail-label">Who qualifies</span>
                <span className="detail-value">{incentive.eligibility}</span>
              </div>
            </div>
            {incentive.link && (
              <a
                href={incentive.link}
                target="_blank"
                rel="noopener noreferrer"
                className="incentive-link"
              >
                Learn more →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="incentive-add-value">
        <h3 className="incentive-add-title">Add a rebate to your payback estimate</h3>
        <p className="tab-intro">
          If you find out you qualify for a cash rebate, enter it here — we'll
          subtract it from your total cost above.
        </p>
        <div className="form-group">
          <label htmlFor="incentiveValue">Rebate or incentive amount ($)</label>
          <input
            id="incentiveValue"
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 2500"
            value={incentiveInput}
            onChange={(e) => handleIncentiveInput(e.target.value)}
          />
          <span className="field-hint">
            Only enter direct cash rebates or tax credits you expect to receive.
          </span>
        </div>
      </div>
    </div>
  );
}
