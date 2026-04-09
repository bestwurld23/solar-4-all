// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Main App
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import BillTab from "./components/BillTab";
import ApplianceTab from "./components/ApplianceTab";
import PresetTab from "./components/PresetTab";
import ResultsPanel from "./components/ResultsPanel";
import BatteryPanel from "./components/BatteryPanel";
import PaybackPanel from "./components/PaybackPanel";
import IncentivesPanel from "./components/IncentivesPanel";
import ShareButton from "./components/ShareButton";
import { decodeShareParams } from "./utils/shareLink";
import { US_STATES } from "./core/incentives";
import type { SizingResult, SiteConfig } from "./core/calculations";
import { CHICAGO_SITE, US_STATE_PSH, WORLD_REGIONS } from "./core/presets";
import "./App.css";

type Tab = "bill" | "appliances" | "presets";

const COUNTIES_BY_STATE: Record<string, string[]> = {
  IL: ["Cook", "DuPage", "Lake", "Will", "Kane", "McHenry", "Other"],
  CA: ["Los Angeles", "San Diego", "San Francisco", "Alameda", "Other"],
  NY: ["New York City", "Nassau", "Suffolk", "Westchester", "Other"],
  TX: ["Harris", "Dallas", "Travis", "Bexar", "Other"],
  MI: ["Wayne", "Oakland", "Macomb", "Kent", "Other"],
  GA: ["Fulton", "DeKalb", "Gwinnett", "Cobb", "Other"],
  OH: ["Cuyahoga", "Franklin", "Hamilton", "Summit", "Other"],
  FL: ["Miami-Dade", "Broward", "Palm Beach", "Orange", "Other"],
  CO: ["Denver", "Jefferson", "Arapahoe", "Adams", "Other"],
  NJ: ["Bergen", "Essex", "Middlesex", "Monmouth", "Other"],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("bill");
  const [result, setResult] = useState<SizingResult | null>(null);
  const [state, setState] = useState<string>("IL");
  const [county, setCounty] = useState<string>("Cook");
  const [incentiveValue, setIncentiveValue] = useState<number>(0);
  const [sharedBanner, setSharedBanner] = useState<boolean>(false);
  const [locMode, setLocMode] = useState<"us" | "intl">("us");
  const [worldRegionCode, setWorldRegionCode] = useState<string>("AM_CARIBBEAN");

  // On mount: check for shared link params
  useEffect(() => {
    const decoded = decodeShareParams(window.location.search);
    if (decoded) {
      setResult(decoded.result);
      setState(decoded.state);
      setCounty(decoded.county);
      setActiveTab(decoded.method as Tab);
      setSharedBanner(true);
    }
  }, []);

  function handleStateChange(newState: string) {
    setState(newState);
    const defaultCounty = (COUNTIES_BY_STATE[newState] ?? ["Other"])[0];
    setCounty(defaultCounty);
  }

  // Build the site config based on location
  const siteConfig: SiteConfig = locMode === "us"
    ? { ...CHICAGO_SITE, psh: US_STATE_PSH[state] ?? 4.5 }
    : { ...CHICAGO_SITE, psh: WORLD_REGIONS.find(r => r.code === worldRegionCode)?.psh ?? 5.0 };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-badge">☀️ Green Rangers</div>
          <h1 className="hero-title">Solar 4 All</h1>
          <p className="hero-sub">
            Find out how many solar panels you need — and how much money you
            could save. Free, no sign-up, works anywhere in the world.
          </p>
          <p className="hero-note">
            📍 Pick your location below, then upload your electricity bill or
            choose a scenario. We'll do the math.
          </p>
        </div>
      </header>

      {/* ── Location Selector ── */}
      <div className="location-bar">
        <div className="location-bar-inner">
        <span className="loc-label">📍 Step 1 — Where are you?</span>
        <div className="loc-toggle">
          <button
            className={locMode === "us" ? "loc-btn active" : "loc-btn"}
            onClick={() => setLocMode("us")}
          >
            🇺🇸 United States
          </button>
          <button
            className={locMode === "intl" ? "loc-btn active" : "loc-btn"}
            onClick={() => setLocMode("intl")}
          >
            🌍 International
          </button>
        </div>
        {locMode === "us" && (
          <div className="loc-select-row">
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="select-input"
              aria-label="Select state"
            >
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <span className="loc-psh-badge">
              ☀️ {siteConfig.psh} PSH/day
            </span>
          </div>
        )}
        {locMode === "intl" && (
          <div className="loc-select-row">
            <select
              value={worldRegionCode}
              onChange={(e) => setWorldRegionCode(e.target.value)}
              className="select-input"
              aria-label="Select world region"
            >
              {WORLD_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
            <span className="loc-psh-badge">
              ☀️ {siteConfig.psh} PSH/day
            </span>
          </div>
        )}
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <div className="tab-nav-label">📋 Step 2 — How do you want to estimate your usage?</div>
      <nav className="tab-nav">
        <button
          className={activeTab === "bill" ? "tab active" : "tab"}
          onClick={() => setActiveTab("bill")}
        >
          📄 Upload My Bill
        </button>
        <button
          className={activeTab === "appliances" ? "tab active" : "tab"}
          onClick={() => setActiveTab("appliances")}
        >
          🔌 I Know My Usage
        </button>
        <button
          className={activeTab === "presets" ? "tab active" : "tab"}
          onClick={() => setActiveTab("presets")}
        >
          🏘️ Not Sure? Start Here
        </button>
      </nav>

      {/* ── Tab Content ── */}
      <main className="main-content">
        {activeTab === "bill" && <BillTab onResult={setResult} site={siteConfig} />}
        {activeTab === "appliances" && <ApplianceTab onResult={setResult} site={siteConfig} />}
        {activeTab === "presets" && <PresetTab onResult={setResult} site={siteConfig} />}

        {/* ── Shared Estimate Banner ── */}
        {sharedBanner && (
          <div className="shared-banner">
            <span>🔗 You're viewing a shared solar estimate.</span>
            <button
              className="shared-banner-close"
              onClick={() => setSharedBanner(false)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Results Section ── */}
        {result && result.panelCount > 0 && (
          <div className="results-section">
            <ResultsPanel result={result} site={siteConfig} />
            <BatteryPanel dailyKwh={result.dailyKwh} />
            <PaybackPanel
              arrayKw={result.arrayKw}
              dailyKwh={result.dailyKwh}
              additionalIncentivesUsd={incentiveValue}
            />
            {locMode === "us" ? (
              <IncentivesPanel
                state={state}
                county={county}
                additionalIncentivesUsd={incentiveValue}
                onIncentiveValueChange={setIncentiveValue}
              />
            ) : (
              <div className="intl-incentives-note">
                <h2 className="results-title">🗺️ Incentives in Your Region</h2>
                <p className="tab-intro">
                  Solar incentives vary widely by country and region. Search for
                  programs offered by your national government, local utility, or
                  municipalities — many countries now offer tax credits, rebates,
                  net metering, or subsidized financing for solar.
                </p>
                <p className="tab-intro" style={{ marginTop: "0.75rem" }}>
                  Common terms to search: <strong>"solar rebate [your country]"</strong>,{" "}
                  <strong>"net metering policy"</strong>,{" "}
                  <strong>"renewable energy subsidy"</strong>.
                </p>
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label htmlFor="intlIncentiveValue">
                    Found a rebate or incentive? Enter the dollar-equivalent value ($)
                  </label>
                  <input
                    id="intlIncentiveValue"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g. 2500"
                    value={incentiveValue || ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setIncentiveValue(isNaN(v) || v < 0 ? 0 : v);
                    }}
                  />
                  <span className="field-hint">
                    This amount is deducted from your net cost in the payback calculator above.
                  </span>
                </div>
              </div>
            )}
            <div className="share-row">
              <ShareButton
                result={result}
                state={state}
                county={county}
                method={activeTab}
              />
            </div>
          </div>
        )}

        {/* Empty state — only shown when no result yet */}
        {(!result || result.panelCount === 0) && (
          <div className="results-empty">
            <p>☝️ Pick your location, then upload your bill or choose a scenario above — your estimate will appear here.</p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          Built by <strong>Green Rangers</strong> · Chicago, IL ·{" "}
          Solar access for every community, everywhere.
        </p>
        <p className="footer-note">
          Estimates only — always get a professional assessment before
          purchasing equipment.
        </p>
      </footer>
    </div>
  );
}
