// ─────────────────────────────────────────────────────────────────────────────
// ApplianceTab — Build your load from a list of appliances
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  calculateDailyKwhFromAppliances,
  sizeArray,
  type ApplianceLoad,
  type SiteConfig,
  type SizingResult,
} from "../core/calculations";
import { STARTER_APPLIANCES } from "../core/presets";

interface Props {
  onResult: (r: SizingResult) => void;
  site: SiteConfig;
}

function emptyAppliance(): ApplianceLoad {
  return { name: "", watts: 0, hoursPerDay: 0, quantity: 1 };
}

export default function ApplianceTab({ onResult, site }: Props) {
  const [appliances, setAppliances] = useState<ApplianceLoad[]>([...STARTER_APPLIANCES]);

  function updateRow(index: number, field: keyof ApplianceLoad, value: string | number) {
    setAppliances((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addRow() {
    setAppliances((prev) => [...prev, emptyAppliance()]);
  }

  function removeRow(index: number) {
    setAppliances((prev) => prev.filter((_, i) => i !== index));
  }

  function calculate() {
    const valid = appliances.filter((a) => a.watts > 0 && a.hoursPerDay > 0);
    const dailyKwh = calculateDailyKwhFromAppliances(valid);
    onResult(sizeArray(dailyKwh, site));
  }

  return (
    <div className="tab-content">
      <p className="tab-intro">
        List out your appliances — how many watts they use and how long you run
        them each day. Don't know the watts? Check the label on the back of the
        appliance or Google it.
      </p>

      <div className="appliance-table-wrapper">
        <table className="appliance-table">
          <thead>
            <tr>
              <th>Appliance</th>
              <th>Watts (W)</th>
              <th>Hours/Day</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appliances.map((a, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    placeholder="e.g. Space heater"
                    value={a.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="150"
                    value={a.watts || ""}
                    onChange={(e) => updateRow(i, "watts", parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    placeholder="6"
                    value={a.hoursPerDay || ""}
                    onChange={(e) =>
                      updateRow(i, "hoursPerDay", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={a.quantity}
                    onChange={(e) =>
                      updateRow(i, "quantity", parseInt(e.target.value) || 1)
                    }
                  />
                </td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeRow(i)}
                    title="Remove row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="add-btn" onClick={addRow}>
        + Add Appliance
      </button>

      <button className="calc-btn" onClick={calculate}>
        Calculate My System
      </button>
    </div>
  );
}
