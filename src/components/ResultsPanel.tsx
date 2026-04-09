// ─────────────────────────────────────────────────────────────────────────────
// ResultsPanel — Displays sizing output in plain language
// ─────────────────────────────────────────────────────────────────────────────

import type { SiteConfig, SizingResult } from "../core/calculations";

interface Props {
  result: SizingResult | null;
  site: SiteConfig;
}

export default function ResultsPanel({ result, site }: Props) {
  if (!result || result.panelCount === 0) {
    return (
      <div className="results-empty">
        <p>Fill in your info above and your estimate will show up here.</p>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <h2 className="results-title">Your Solar Estimate</h2>

      <div className="results-grid">
        <div className="result-card">
          <span className="result-label">Daily Energy Need</span>
          <span className="result-value">{result.dailyKwh} kWh/day</span>
          <span className="result-hint">
            How much electricity your space uses on an average day.
          </span>
        </div>

        <div className="result-card">
          <span className="result-label">Solar Array Size</span>
          <span className="result-value">{result.arrayKw} kW</span>
          <span className="result-hint">
            The total power output your system needs to generate.
          </span>
        </div>

        <div className="result-card highlight">
          <span className="result-label">Panels Needed</span>
          <span className="result-value big">{result.panelCount} panels</span>
          <span className="result-hint">
            Based on {site.panelWattage}W panels · {site.psh} peak sun hrs/day · {Math.round(site.systemEfficiency * 100)}% system efficiency.
          </span>
        </div>
      </div>

      <p className="results-disclaimer">
        This is a ballpark estimate — a licensed installer will do a full site
        assessment before any real design. Think of this as your starting point,
        not the final word.
      </p>
    </div>
  );
}
