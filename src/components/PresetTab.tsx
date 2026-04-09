// ─────────────────────────────────────────────────────────────────────────────
// PresetTab — Community scenario presets
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { sizeArray, type SiteConfig, type SizingResult } from "../core/calculations";
import { PRESETS, type ScenarioPreset } from "../core/presets";

interface Props {
  onResult: (r: SizingResult) => void;
  site: SiteConfig;
}

export default function PresetTab({ onResult, site }: Props) {
  const [selected, setSelected] = useState<ScenarioPreset | null>(null);

  function selectPreset(preset: ScenarioPreset) {
    setSelected(preset);
    onResult(sizeArray(preset.suggestedDailyKwh, site));
  }

  return (
    <div className="tab-content">
      <p className="tab-intro">
        Not sure where to start? Pick a scenario that's close to your situation
        and see a ballpark estimate — you can always dig deeper from there.
      </p>

      <div className="preset-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${selected?.id === preset.id ? "active" : ""}`}
            onClick={() => selectPreset(preset)}
          >
            <span className="preset-name">{preset.name}</span>
            <span className="preset-desc">{preset.description}</span>
            <span className="preset-appliances">
              <em>Common loads:</em> {preset.exampleAppliances}
            </span>
            <span className="preset-kwh">
              ~{preset.suggestedDailyKwh} kWh/day
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
