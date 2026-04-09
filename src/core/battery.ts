// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Battery Sizing Engine
// Pure functions only. No UI, no I/O, no framework deps.
// ─────────────────────────────────────────────────────────────────────────────

export interface BatteryOption {
  id: string;
  name: string;
  capacityKwh: number;
  estimatedUnitCost: number; // rough installed $ per unit
}

export interface BatteryInput {
  dailyKwh: number;
  daysOfBackup: number;
  depthOfDischarge: number; // 0.0–1.0, default 0.80
  battery: BatteryOption;
}

export interface BatteryResult {
  capacityNeededKwh: number;
  unitCount: number;
  estimatedTotalCost: number;
}

export const BATTERY_OPTIONS: BatteryOption[] = [
  { id: 'powerwall', name: 'Tesla Powerwall 3', capacityKwh: 13.5, estimatedUnitCost: 12000 },
  { id: 'enphase', name: 'Enphase IQ Battery 5P', capacityKwh: 5.0, estimatedUnitCost: 6000 },
  { id: 'franklin', name: 'Franklin Home Power 2', capacityKwh: 13.6, estimatedUnitCost: 11500 },
  { id: 'sungrow', name: 'SunGrow SBR (3.2 kWh)', capacityKwh: 3.2, estimatedUnitCost: 3500 },
];

export function sizeBattery(input: BatteryInput): BatteryResult {
  const capacityNeededKwh = (input.dailyKwh * input.daysOfBackup) / input.depthOfDischarge;
  const unitCount = Math.ceil(capacityNeededKwh / input.battery.capacityKwh);
  return {
    capacityNeededKwh: Math.round(capacityNeededKwh * 100) / 100,
    unitCount,
    estimatedTotalCost: unitCount * input.battery.estimatedUnitCost,
  };
}
