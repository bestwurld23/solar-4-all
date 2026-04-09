// ─────────────────────────────────────────────────────────────────────────────
// BillTab — Upload your bill, we extract the kWh automatically
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
// Use the locally installed worker so versions always match
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  calculateDailyKwhFromBill,
  sizeArray,
  type SiteConfig,
  type SizingResult,
} from "../core/calculations";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface Props {
  onResult: (r: SizingResult) => void;
  site: SiteConfig;
}

type Status = "idle" | "reading" | "done" | "failed";

// ── kWh extraction ──────────────────────────────────────────────────────────

function pickKwh(raw: string): number | null {
  // Normalise: collapse whitespace, make uppercase for case-insensitive matching
  const text = raw.replace(/\s+/g, " ").toUpperCase();

  // Patterns from most-specific to least-specific
  const patterns = [
    // "Usage This Period  1,234 kWh" / "Total Usage: 1,234 kWh"
    /(?:USAGE\s+THIS\s+PERIOD|TOTAL\s+USAGE|CURRENT\s+USAGE|MONTHLY\s+USAGE|BILLING\s+USAGE|ENERGY\s+USAGE|ELECTRIC\s+USAGE)[:\s,]+(\d[\d,]*)/,
    // "kWh Used  1,234" / "kWh Billed: 1,234"
    /KWH\s+(?:USED|BILLED|DELIVERED|CONSUMED|CHARGED)[:\s,]+(\d[\d,]*)/,
    // "1,234 kWh" — number directly before kWh label
    /(\d[\d,]+)\s*KWH\b/,
    // "kWh  1,234" — number directly after kWh label
    /\bKWH[:\s]+(\d[\d,]+)/,
    // "Kilowatt Hours  1,234"
    /KILOWATT.?HOURS?[:\s,]+(\d[\d,]*)/,
    // "Energy Delivered  1,234 kWh" / "Total Electric  1,234"
    /(?:ENERGY\s+DELIVERED|TOTAL\s+ELECTRIC|CONSUMPTION)[:\s,]+(\d[\d,]*)/,
    // Generic: any 3-4 digit number near "kWh" anywhere in the same sentence
    /(\d{3,4})\s*KWH/,
  ];

  const candidates: number[] = [];

  for (const p of patterns) {
    const m = p.exec(text);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val >= 10 && val <= 9999) {
        candidates.push(val);
      }
    }
  }

  if (candidates.length === 0) return null;

  // If multiple candidates, prefer the one that looks most like a monthly total
  // (between 100 and 3000 kWh is typical for a home)
  const preferred = candidates.find((v) => v >= 100 && v <= 3000);
  return preferred ?? candidates[0];
}

// ── Component ───────────────────────────────────────────────────────────────

export default function BillTab({ onResult, site }: Props) {
  const [kwh, setKwh] = useState<number | null>(null);
  const [kwhEditable, setKwhEditable] = useState<string>("");
  const [offset, setOffset] = useState<number>(100);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyKwh(found: number | null) {
    if (found !== null) {
      setKwh(found);
      setKwhEditable(String(found));
      setStatus("done");
    } else {
      setKwh(null);
      setKwhEditable("");
      setStatus("failed");
    }
  }

  // ── PDF ────────────────────────────────────────────────────────────────────

  async function extractFromPdf(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }
    console.debug("[BillTab] PDF text extracted:\n", fullText);
    applyKwh(pickKwh(fullText));
  }

  // ── Image OCR ──────────────────────────────────────────────────────────────

  async function extractFromImage(file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const worker = await createWorker("eng");
    try {
      const { data } = await worker.recognize(url);
      console.debug("[BillTab] OCR text:\n", data.text);
      applyKwh(pickKwh(data.text));
    } finally {
      await worker.terminate();
    }
  }

  // ── File handler ───────────────────────────────────────────────────────────

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("reading");
    setError("");
    setKwh(null);
    setKwhEditable("");
    setPreviewUrl(null);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        await extractFromPdf(file);
      } else if (file.type.startsWith("image/")) {
        await extractFromImage(file);
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("[BillTab] Extraction error:", err);
      setStatus("failed");
    }
    e.target.value = "";
  }

  // ── Calculate ──────────────────────────────────────────────────────────────

  function calculate() {
    setError("");
    const val = kwh ?? parseFloat(kwhEditable);
    if (isNaN(val) || val <= 0) {
      setError("Enter a valid monthly kWh value.");
      return;
    }
    try {
      const dailyKwh = calculateDailyKwhFromBill({
        monthlyKwh: val,
        offsetFraction: offset / 100,
      });
      onResult(sizeArray(dailyKwh, site));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const activeKwh = kwh ?? (kwhEditable ? parseFloat(kwhEditable) : null);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="tab-content">
      <p className="tab-intro">
        Upload a photo or PDF of your electricity bill — we'll automatically
        read your monthly usage so you don't have to type anything.
      </p>

      {/* Upload zone */}
      <div
        className={`upload-zone${status === "reading" ? " loading" : ""}`}
        onClick={() => status !== "reading" && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />

        {status === "idle" && (
          <>
            <span className="upload-zone-icon">📎</span>
            <span className="upload-zone-label">Upload Your Bill</span>
            <span className="upload-zone-hint">PDF or photo · click to browse</span>
          </>
        )}

        {status === "reading" && (
          <>
            <span className="upload-zone-icon spin">⚙️</span>
            <span className="upload-zone-label">Reading your bill…</span>
            <span className="upload-zone-hint">This takes a few seconds</span>
          </>
        )}

        {status === "done" && (
          <>
            <span className="upload-zone-icon">✅</span>
            <span className="upload-zone-label">Got it — {kwh} kWh found</span>
            <span className="upload-zone-hint">Click to upload a different bill</span>
          </>
        )}

        {status === "failed" && (
          <>
            <span className="upload-zone-icon">⚠️</span>
            <span className="upload-zone-label">Couldn't read usage automatically</span>
            <span className="upload-zone-hint">Enter it below · or try a clearer image</span>
          </>
        )}
      </div>

      {/* Bill image preview */}
      {previewUrl && (
        <div className="bill-preview">
          <img src={previewUrl} alt="Your electricity bill" />
        </div>
      )}

      {/* Manual entry — only shown when extraction failed */}
      {status === "failed" && (
        <div className="form-group">
          <label htmlFor="monthlyKwh">Monthly Usage (kWh)</label>
          <input
            id="monthlyKwh"
            type="number"
            min="0"
            placeholder="e.g. 900"
            value={kwhEditable}
            onChange={(e) => {
              setKwhEditable(e.target.value);
              const v = parseFloat(e.target.value);
              setKwh(!isNaN(v) && v > 0 ? v : null);
            }}
          />
          <span className="field-hint">
            Look for "kWh", "Usage", or "Energy Used" on your bill.
          </span>
        </div>
      )}

      {/* Offset slider */}
      {(status === "done" || (status === "failed" && kwhEditable)) && (
        <div className="form-group">
          <label htmlFor="offset">
            How much of your bill should solar cover?{" "}
            <strong>{offset}%</strong>
          </label>
          <input
            id="offset"
            type="range"
            min="10"
            max="100"
            step="5"
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>10% (partial)</span>
            <span>50% (half)</span>
            <span>100% (full)</span>
          </div>
          <span className="field-hint">
            100% covers your whole bill on average. Many start at 75–80% and keep the grid as backup.
          </span>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {activeKwh !== null && !isNaN(activeKwh) && activeKwh > 0 && (
        <button className="calc-btn" onClick={calculate}>
          Calculate My System
        </button>
      )}
    </div>
  );
}
