// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Unit Tests
// Run with: npm test
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  calculateDailyKwhFromBill,
  calculateDailyKwhFromAppliances,
  sizeArray,
} from "./calculations";
import { CHICAGO_SITE } from "./presets";
import { sizeBattery, BATTERY_OPTIONS } from "./battery";
import { calculatePayback } from "./payback";

// ─── Bill-Based Tests ─────────────────────────────────────────────────────────

describe("calculateDailyKwhFromBill", () => {
  it("calculates daily kWh from monthly bill at 100% offset", () => {
    // Chicago home: 900 kWh/month, covering everything
    const result = calculateDailyKwhFromBill({ monthlyKwh: 900, offsetFraction: 1.0 });
    // 900 * 12 / 365 ≈ 29.59
    expect(result).toBeCloseTo(29.59, 1);
  });

  it("calculates daily kWh from monthly bill at 75% offset", () => {
    const result = calculateDailyKwhFromBill({ monthlyKwh: 900, offsetFraction: 0.75 });
    expect(result).toBeCloseTo(22.19, 1);
  });

  it("calculates daily kWh from annual bill", () => {
    const result = calculateDailyKwhFromBill({ annualKwh: 10800, offsetFraction: 1.0 });
    expect(result).toBeCloseTo(29.59, 1);
  });

  it("prefers annualKwh over monthlyKwh when both provided", () => {
    const result = calculateDailyKwhFromBill({
      annualKwh: 3650,
      monthlyKwh: 999,
      offsetFraction: 1.0,
    });
    expect(result).toBeCloseTo(10, 1);
  });

  it("throws if neither annualKwh nor monthlyKwh provided", () => {
    expect(() =>
      calculateDailyKwhFromBill({ offsetFraction: 1.0 })
    ).toThrow();
  });

  it("throws if offsetFraction is 0 or negative", () => {
    expect(() =>
      calculateDailyKwhFromBill({ monthlyKwh: 900, offsetFraction: 0 })
    ).toThrow();
  });
});

// ─── Appliance-Based Tests ────────────────────────────────────────────────────

describe("calculateDailyKwhFromAppliances", () => {
  it("returns 0 for empty appliance list", () => {
    expect(calculateDailyKwhFromAppliances([])).toBe(0);
  });

  it("correctly sums a simple appliance list", () => {
    const appliances = [
      { name: "Fridge", watts: 150, hoursPerDay: 24, quantity: 1 },  // 3.6 kWh
      { name: "Lights", watts: 10, hoursPerDay: 6, quantity: 8 },    // 0.48 kWh
      { name: "TV", watts: 120, hoursPerDay: 5, quantity: 1 },       // 0.6 kWh
    ];
    // 3.6 + 0.48 + 0.6 = 4.68 kWh
    expect(calculateDailyKwhFromAppliances(appliances)).toBeCloseTo(4.68, 2);
  });

  it("handles quantity > 1 correctly", () => {
    const appliances = [
      { name: "Clipper", watts: 100, hoursPerDay: 8, quantity: 4 }, // 3.2 kWh
    ];
    expect(calculateDailyKwhFromAppliances(appliances)).toBeCloseTo(3.2, 2);
  });
});

// ─── Array Sizing Tests ───────────────────────────────────────────────────────

describe("sizeArray", () => {
  it("sizes correctly for a Chicago home at 100% offset", () => {
    // 900 kWh/month → ~29.59 kWh/day
    const dailyKwh = calculateDailyKwhFromBill({ monthlyKwh: 900, offsetFraction: 1.0 });
    const result = sizeArray(dailyKwh, CHICAGO_SITE);

    // arrayKw = 29.59 / (4.2 * 0.80) ≈ 8.81 kW
    expect(result.arrayKw).toBeCloseTo(8.81, 1);
    // panelCount = ceil(8810 / 410) = ceil(21.49) = 22
    expect(result.panelCount).toBe(22);
  });

  it("returns zeros for zero daily demand", () => {
    const result = sizeArray(0, CHICAGO_SITE);
    expect(result.dailyKwh).toBe(0);
    expect(result.arrayKw).toBe(0);
    expect(result.panelCount).toBe(0);
  });

  it("always rounds panel count UP", () => {
    // Any fractional panel count must round up
    const result = sizeArray(5, CHICAGO_SITE);
    const rawPanels = (result.arrayKw * 1000) / CHICAGO_SITE.panelWattage;
    expect(result.panelCount).toBe(Math.ceil(rawPanels));
  });
});

// ─── Battery Sizing Tests ─────────────────────────────────────────────────────

describe("sizeBattery", () => {
  it("returns correct unit count for 1 day backup at 30 kWh/day home", () => {
    // Capacity needed = (30 * 1) / 0.80 = 37.5 kWh
    // Powerwall 3 = 13.5 kWh/unit → ceil(37.5 / 13.5) = ceil(2.78) = 3 units
    const powerwall = BATTERY_OPTIONS.find((b) => b.id === "powerwall")!;
    const result = sizeBattery({
      dailyKwh: 30,
      daysOfBackup: 1,
      depthOfDischarge: 0.8,
      battery: powerwall,
    });
    expect(result.capacityNeededKwh).toBeCloseTo(37.5, 1);
    expect(result.unitCount).toBe(3);
    expect(result.estimatedTotalCost).toBe(3 * powerwall.estimatedUnitCost);
  });

  it("correctly sizes Enphase battery for small system", () => {
    // Capacity needed = (10 * 1) / 0.80 = 12.5 kWh
    // Enphase 5P = 5.0 kWh/unit → ceil(12.5 / 5.0) = ceil(2.5) = 3 units
    const enphase = BATTERY_OPTIONS.find((b) => b.id === "enphase")!;
    const result = sizeBattery({
      dailyKwh: 10,
      daysOfBackup: 1,
      depthOfDischarge: 0.8,
      battery: enphase,
    });
    expect(result.capacityNeededKwh).toBeCloseTo(12.5, 1);
    expect(result.unitCount).toBe(3);
  });

  it("scales correctly with multiple days of backup", () => {
    // 3 days backup: (20 * 3) / 0.80 = 75 kWh needed
    // Powerwall 3 = 13.5 kWh/unit → ceil(75 / 13.5) = ceil(5.56) = 6 units
    const powerwall = BATTERY_OPTIONS.find((b) => b.id === "powerwall")!;
    const result = sizeBattery({
      dailyKwh: 20,
      daysOfBackup: 3,
      depthOfDischarge: 0.8,
      battery: powerwall,
    });
    expect(result.capacityNeededKwh).toBeCloseTo(75, 1);
    expect(result.unitCount).toBe(6);
  });
});

// ─── Payback Calculator Tests ─────────────────────────────────────────────────

describe("calculatePayback", () => {
  it("returns reasonable payback for 8.81 kW system at $3/W with 30% ITC", () => {
    // From the Chicago home test: 900 kWh/month → 8.81 kW system
    // Gross cost = 8.81 * 1000 * 3 = $26,430
    // Federal credit = 26,430 * 0.30 = $7,929
    // Net cost = 26,430 - 7,929 = $18,501
    // Daily kWh = ~29.59
    // Annual savings = 29.59 * 365 * 0.15 = $1,620.57
    // Payback = 18,501 / 1,620.57 ≈ 11.4 years
    const result = calculatePayback({
      arrayKw: 8.81,
      dailyKwh: 29.59,
      costPerWatt: 3.0,
      electricityRate: 0.15,
      federalItcRate: 0.3,
      additionalIncentivesUsd: 0,
    });
    expect(result.grossCost).toBe(26430);
    expect(result.federalCredit).toBe(7929);
    expect(result.netCost).toBe(18501);
    expect(result.annualSavings).toBeCloseTo(1620, 0);
    // Payback should be in 10–14 year range
    expect(result.paybackYears).toBeGreaterThan(10);
    expect(result.paybackYears).toBeLessThan(14);
  });

  it("correctly applies additional incentives to reduce net cost", () => {
    const result = calculatePayback({
      arrayKw: 5,
      dailyKwh: 20,
      costPerWatt: 3.0,
      electricityRate: 0.15,
      federalItcRate: 0.3,
      additionalIncentivesUsd: 2000,
    });
    // Gross = 5 * 1000 * 3 = $15,000
    // Federal = 15,000 * 0.30 = $4,500
    // Net = 15,000 - 4,500 - 2,000 = $8,500
    expect(result.grossCost).toBe(15000);
    expect(result.federalCredit).toBe(4500);
    expect(result.netCost).toBe(8500);
  });

  it("calculates positive 25-year ROI for standard system", () => {
    const result = calculatePayback({
      arrayKw: 8.81,
      dailyKwh: 29.59,
      costPerWatt: 3.0,
      electricityRate: 0.15,
      federalItcRate: 0.3,
      additionalIncentivesUsd: 0,
    });
    expect(result.roi25Year).toBeGreaterThan(0);
    expect(result.twentyFiveYearSavings).toBeGreaterThan(0);
  });

  it("returns 0 payback years when annualSavings is 0", () => {
    const result = calculatePayback({
      arrayKw: 5,
      dailyKwh: 0,
      costPerWatt: 3.0,
      electricityRate: 0.15,
      federalItcRate: 0.3,
      additionalIncentivesUsd: 0,
    });
    expect(result.annualSavings).toBe(0);
    expect(result.paybackYears).toBe(0);
  });
});
