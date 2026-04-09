// ─────────────────────────────────────────────────────────────────────────────
// BatteryPanel — Battery backup sizing
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { BATTERY_OPTIONS, sizeBattery } from '../core/battery';

interface Props {
  dailyKwh: number;
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

export default function BatteryPanel({ dailyKwh }: Props) {
  const [batteryId, setBatteryId] = useState<string>(BATTERY_OPTIONS[0].id);
  const [daysOfBackup, setDaysOfBackup] = useState<number>(1);

  const battery = BATTERY_OPTIONS.find((b) => b.id === batteryId) ?? BATTERY_OPTIONS[0];

  const result = sizeBattery({
    dailyKwh,
    daysOfBackup,
    depthOfDischarge: 0.8,
    battery,
  });

  return (
    <div className="battery-panel">
      <h2 className="results-title">🔋 Battery Backup Sizing</h2>
      <p className="tab-intro">
        Want to keep the lights on when the grid goes down? Battery storage
        lets you run your essentials through outages.
      </p>

      <div className="battery-controls">
        <div className="form-group">
          <label htmlFor="batteryModel">Battery Model</label>
          <select
            id="batteryModel"
            value={batteryId}
            onChange={(e) => setBatteryId(e.target.value)}
            className="select-input"
          >
            {BATTERY_OPTIONS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.capacityKwh} kWh/unit
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="daysBackup">
            Days of Backup: <strong>{daysOfBackup} {daysOfBackup === 1 ? 'day' : 'days'}</strong>
          </label>
          <input
            id="daysBackup"
            type="range"
            min="1"
            max="7"
            step="1"
            value={daysOfBackup}
            onChange={(e) => setDaysOfBackup(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>1 day</span>
            <span>4 days</span>
            <span>7 days</span>
          </div>
          <span className="field-hint">
            {daysOfBackup === 1
              ? '1 day of backup covers a typical outage — a blown transformer or brief storm.'
              : daysOfBackup <= 3
              ? `${daysOfBackup} days handles most storms and weather events.`
              : `${daysOfBackup} days of backup is solid resilience for extended outages.`}
          </span>
        </div>
      </div>

      <div className="results-grid">
        <div className="result-card">
          <span className="result-label">Capacity Needed</span>
          <span className="result-value">{result.capacityNeededKwh} kWh</span>
          <span className="result-hint">
            Total usable battery storage at 80% depth of discharge.
          </span>
        </div>
        <div className="result-card">
          <span className="result-label">Units Needed</span>
          <span className="result-value">{result.unitCount}</span>
          <span className="result-hint">
            {battery.name} × {result.unitCount} (each {battery.capacityKwh} kWh)
          </span>
        </div>
        <div className="result-card highlight">
          <span className="result-label">Estimated Battery Cost</span>
          <span className="result-value big">{fmt(result.estimatedTotalCost)}</span>
          <span className="result-hint">
            Rough installed cost. Get quotes from licensed installers for accurate pricing.
          </span>
        </div>
      </div>

      <p className="results-disclaimer">
        Battery costs are rough estimates based on typical installed prices. Actual costs
        vary by installer, location, and available incentives. Batteries may also qualify
        for the 30% federal tax credit when installed with solar.
      </p>
    </div>
  );
}
