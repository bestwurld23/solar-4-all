// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Core Calculation Engine
// Pure functions only. No UI, no I/O, no framework deps.
// ─────────────────────────────────────────────────────────────────────────────

// A single appliance in the home, shop, or community space
export interface ApplianceLoad {
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

// Load derived from an energy bill
export interface LoadFromBill {
  annualKwh?: number;
  monthlyKwh?: number;
  // 1.0 = offset 100% of usage, 0.5 = cover half
  offsetFraction: number;
}

// Site and system settings
export interface SiteConfig {
  psh: number;              // Peak Sun Hours per day (Chicago ~4.2–4.5)
  systemEfficiency: number; // Derate factor (0.78–0.80 typical)
  panelWattage: number;     // Watts per panel (e.g. 410)
}

// What we hand back to the UI
export interface SizingResult {
  dailyKwh: number;    // How much energy you need per day
  arrayKw: number;     // Total solar array size in kilowatts
  panelCount: number;  // Number of panels needed
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bill-based daily load
// ─────────────────────────────────────────────────────────────────────────────
export function calculateDailyKwhFromBill(load: LoadFromBill): number {
  if (load.offsetFraction <= 0 || load.offsetFraction > 1) {
    throw new Error("offsetFraction must be between 0 (exclusive) and 1 (inclusive).");
  }

  if (load.annualKwh !== undefined && load.annualKwh > 0) {
    return (load.annualKwh * load.offsetFraction) / 365;
  }

  if (load.monthlyKwh !== undefined && load.monthlyKwh > 0) {
    return (load.monthlyKwh * 12 * load.offsetFraction) / 365;
  }

  throw new Error("Provide either annualKwh or monthlyKwh to calculate from a bill.");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Appliance-based daily load
// ─────────────────────────────────────────────────────────────────────────────
export function calculateDailyKwhFromAppliances(appliances: ApplianceLoad[]): number {
  if (appliances.length === 0) return 0;

  const totalWh = appliances.reduce((sum, a) => {
    return sum + a.watts * a.hoursPerDay * a.quantity;
  }, 0);

  return totalWh / 1000; // Wh → kWh
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Size the solar array
// ─────────────────────────────────────────────────────────────────────────────
export function sizeArray(dailyKwh: number, site: SiteConfig): SizingResult {
  if (dailyKwh <= 0) {
    return { dailyKwh: 0, arrayKw: 0, panelCount: 0 };
  }

  const arrayKw = dailyKwh / (site.psh * site.systemEfficiency);
  const panelCount = Math.ceil((arrayKw * 1000) / site.panelWattage);

  return {
    dailyKwh: Math.round(dailyKwh * 100) / 100,
    arrayKw: Math.round(arrayKw * 100) / 100,
    panelCount,
  };
}
