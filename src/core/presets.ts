// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Presets & Defaults
// Community scenarios + site configuration defaults
// ─────────────────────────────────────────────────────────────────────────────

import type { SiteConfig, ApplianceLoad } from "./calculations";

// ─── Site Defaults ────────────────────────────────────────────────────────────

export const CHICAGO_SITE: SiteConfig = {
  psh: 4.2,              // Chicago avg peak sun hours
  systemEfficiency: 0.80,
  panelWattage: 410,
};

// Peak sun hours by US state (average annual daily hours)
export const US_STATE_PSH: Record<string, number> = {
  AL: 5.0, AK: 3.0, AZ: 6.5, AR: 4.8, CA: 5.5, CO: 5.5, CT: 4.0,
  DE: 4.2, FL: 5.5, GA: 5.0, HI: 5.8, ID: 4.8, IL: 4.2, IN: 4.2,
  IA: 4.4, KS: 5.0, KY: 4.5, LA: 5.0, ME: 3.8, MD: 4.4, MA: 4.0,
  MI: 4.0, MN: 4.4, MS: 5.0, MO: 4.8, MT: 4.5, NE: 5.0, NV: 6.5,
  NH: 4.0, NJ: 4.2, NM: 6.5, NY: 4.0, NC: 4.8, ND: 4.5, OH: 4.0,
  OK: 5.5, OR: 4.2, PA: 4.2, RI: 4.0, SC: 5.0, SD: 4.8, TN: 4.8,
  TX: 5.5, UT: 6.0, VT: 3.8, VA: 4.5, WA: 3.8, WV: 4.0, WI: 4.2,
  WY: 5.5, DC: 4.4,
  OTHER: 4.5,
};

// World regions with average PSH for international users
export interface WorldRegion {
  code: string;
  name: string;
  psh: number;
}

export const WORLD_REGIONS: WorldRegion[] = [
  { code: 'AF_WEST',      name: 'West Africa (Nigeria, Ghana, Senegal…)',   psh: 5.5 },
  { code: 'AF_EAST',      name: 'East Africa (Kenya, Ethiopia, Tanzania…)', psh: 5.8 },
  { code: 'AF_SOUTH',     name: 'Southern Africa (South Africa, Zimbabwe…)',psh: 5.8 },
  { code: 'AF_NORTH',     name: 'North Africa (Egypt, Morocco, Algeria…)',  psh: 6.2 },
  { code: 'AF_CENTRAL',   name: 'Central Africa (DRC, Cameroon, Congo…)',   psh: 5.0 },
  { code: 'AS_SOUTH',     name: 'South Asia (India, Pakistan, Bangladesh)', psh: 5.5 },
  { code: 'AS_SOUTHEAST', name: 'Southeast Asia (Philippines, Indonesia…)', psh: 5.0 },
  { code: 'AS_EAST',      name: 'East Asia (China, Japan, Korea)',          psh: 4.0 },
  { code: 'AS_MIDDLE',    name: 'Middle East (Saudi Arabia, UAE, Iraq…)',   psh: 6.0 },
  { code: 'AS_CENTRAL',   name: 'Central Asia (Kazakhstan, Uzbekistan…)',   psh: 5.2 },
  { code: 'EU_SOUTH',     name: 'Southern Europe (Spain, Italy, Greece)',   psh: 4.8 },
  { code: 'EU_CENTRAL',   name: 'Central Europe (Germany, France, Poland)', psh: 3.5 },
  { code: 'EU_NORTH',     name: 'Northern Europe (UK, Scandinavia)',        psh: 2.8 },
  { code: 'AM_CARIBBEAN', name: 'Caribbean (Jamaica, Haiti, Puerto Rico…)', psh: 5.8 },
  { code: 'AM_CENTRAL',   name: 'Central America (Guatemala, Honduras…)',   psh: 5.5 },
  { code: 'AM_MEXICO',    name: 'Mexico',                                   psh: 5.5 },
  { code: 'AM_SOUTH_N',   name: 'Northern South America (Colombia, Venezuela…)', psh: 5.0 },
  { code: 'AM_SOUTH_BR',  name: 'Brazil',                                   psh: 5.2 },
  { code: 'AM_SOUTH_S',   name: 'Southern South America (Argentina, Chile)', psh: 4.5 },
  { code: 'AM_CANADA',    name: 'Canada',                                   psh: 3.5 },
  { code: 'OC_AUSTRALIA', name: 'Australia',                                psh: 5.5 },
  { code: 'OC_NZ',        name: 'New Zealand',                              psh: 4.0 },
  { code: 'OC_PACIFIC',   name: 'Pacific Islands',                          psh: 5.5 },
];

// ─── Scenario Presets ─────────────────────────────────────────────────────────

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  suggestedDailyKwh: number;
  exampleAppliances: string;
}

export const PRESETS: ScenarioPreset[] = [
  {
    id: "apartment-1br",
    name: "One-Bedroom Apartment",
    description:
      "Energy-conscious living — lights, TV, phone chargers, a small fridge. Covering what matters most.",
    suggestedDailyKwh: 8,
    exampleAppliances: "Fridge, LED lights, TV, phone chargers, ceiling fan",
  },
  {
    id: "home-3br",
    name: "Three-Bedroom Chicago Home",
    description:
      "Typical household — family cooking, central AC in summer, washer, multiple screens.",
    suggestedDailyKwh: 28,
    exampleAppliances: "Fridge, stove, washer, AC unit, TVs, lights",
  },
  {
    id: "barbershop",
    name: "Barbershop / Salon",
    description:
      "Small business keeping the clippers running, chairs lit, and the vibe right.",
    suggestedDailyKwh: 20,
    exampleAppliances: "Clippers, hair dryers, lighting, AC, point-of-sale",
  },
  {
    id: "community-studio",
    name: "Community Studio / Rec Room",
    description:
      "A creative space — recording booth, studio lights, speakers, screens. Powering the culture.",
    suggestedDailyKwh: 15,
    exampleAppliances: "Studio monitors, mics, mixers, LED studio lights, laptops",
  },
  {
    id: "church-hall",
    name: "Church / Community Center",
    description:
      "Keeping the doors open — sanctuary lights, kitchen, sound system, office equipment.",
    suggestedDailyKwh: 45,
    exampleAppliances: "Sound system, sanctuary lights, kitchen appliances, office gear",
  },
];

// ─── Starter Appliance Templates ─────────────────────────────────────────────

export const STARTER_APPLIANCES: ApplianceLoad[] = [
  { name: "Refrigerator", watts: 150, hoursPerDay: 24, quantity: 1 },
  { name: "LED Lights (per bulb)", watts: 10, hoursPerDay: 6, quantity: 8 },
  { name: "TV (55\")", watts: 120, hoursPerDay: 5, quantity: 1 },
  { name: "Laptop", watts: 65, hoursPerDay: 6, quantity: 1 },
  { name: "Phone Charger", watts: 20, hoursPerDay: 4, quantity: 2 },
];
