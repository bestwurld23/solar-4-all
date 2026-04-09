// ─────────────────────────────────────────────────────────────────────────────
// ShareButton — Copy shareable link for a solar estimate
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { encodeShareParams } from '../utils/shareLink';
import type { SizingResult } from '../core/calculations';

interface Props {
  result: SizingResult;
  state: string;
  county: string;
  method: string;
}

export default function ShareButton({ result, state, county, method }: Props) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = encodeShareParams(result, method, state, county);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback for browsers where clipboard API is unavailable
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // silently fail
        }
        document.body.removeChild(textarea);
      });
  }

  return (
    <button className="share-btn" onClick={handleShare} disabled={copied}>
      {copied ? '✅ Copied!' : '🔗 Share My Estimate'}
    </button>
  );
}
