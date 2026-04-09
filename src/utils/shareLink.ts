// ─────────────────────────────────────────────────────────────────────────────
// Solar 4 All — Shareable Results Link Utilities
// ─────────────────────────────────────────────────────────────────────────────

import type { SizingResult } from '../core/calculations';

interface SharePayload {
  dailyKwh: number;
  arrayKw: number;
  panelCount: number;
  method: string;
  state: string;
  county: string;
}

export function encodeShareParams(
  result: SizingResult,
  method: string,
  state: string,
  county: string,
): string {
  const payload: SharePayload = {
    dailyKwh: result.dailyKwh,
    arrayKw: result.arrayKw,
    panelCount: result.panelCount,
    method,
    state,
    county,
  };
  const json = JSON.stringify(payload);
  const encoded = btoa(json);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('r', encoded);
  return url.toString();
}

export function decodeShareParams(
  search: string,
): { result: SizingResult; method: string; state: string; county: string } | null {
  try {
    const params = new URLSearchParams(search);
    const encoded = params.get('r');
    if (!encoded) return null;
    const json = atob(encoded);
    const payload = JSON.parse(json) as SharePayload;
    if (
      typeof payload.dailyKwh !== 'number' ||
      typeof payload.arrayKw !== 'number' ||
      typeof payload.panelCount !== 'number'
    ) {
      return null;
    }
    return {
      result: {
        dailyKwh: payload.dailyKwh,
        arrayKw: payload.arrayKw,
        panelCount: payload.panelCount,
      },
      method: payload.method ?? 'bill',
      state: payload.state ?? 'IL',
      county: payload.county ?? 'Cook',
    };
  } catch {
    return null;
  }
}
