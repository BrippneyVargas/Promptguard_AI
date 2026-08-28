/**
 * PromptGuard detection engine.
 *
 * Pure, dependency-free pattern matching over a block of text. No network
 * calls, no logging of raw matches anywhere else in the codebase — this
 * module only ever returns matches to the caller in-memory.
 *
 * Loaded two ways:
 *   - As a plain <script> in the browser extension (attaches to `window`)
 *   - Via `require()` in Node for the Jest test suite
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------

  /** Luhn checksum — used to cut down credit-card false positives. */
  function luhnCheck(digitsOnly) {
    let sum = 0;
    let alternate = false;
    for (let i = digitsOnly.length - 1; i >= 0; i--) {
      let n = parseInt(digitsOnly[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // ---------------------------------------------------------------------
  // Rule set
  // ---------------------------------------------------------------------
  // Each rule: id, label (shown to user), severity, regex pattern, and an
  // optional validate(matchText) => bool for cutting false positives.
  // Keep patterns anchored with \b where possible and case-insensitive
  // only where the data itself isn't case-sensitive.

  const RULES = [
    {
      id: 'ssn',
      label: 'US Social Security Number',
      severity: 'high',
      pattern: /\b\d{3}-\d{2}-\d{4}\b/g
    },
    {
      id: 'credit_card',
      label: 'Credit card number',
      severity: 'high',
      pattern: /\b(?:\d[ -]?){13,19}\b/g,
      validate: (match) => {
        const digits = match.replace(/[ -]/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        return luhnCheck(digits);
      }
    },
    {
      id: 'email',
      label: 'Email address',
      severity: 'low',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
    },
    {
      id: 'phone_us',
      label: 'US phone number',
      severity: 'low',
      pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
    },
    {
      id: 'aws_access_key',
      label: 'AWS access key',
      severity: 'high',
      pattern: /\bAKIA[0-9A-Z]{16}\b/g
    },
    {
      id: 'openai_key',
      label: 'OpenAI API key',
      severity: 'high',
      pattern: /\bsk-[A-Za-z0-9]{20,}\b/g
    },
    {
      id: 'anthropic_key',
      label: 'Anthropic API key',
      severity: 'high',
      pattern: /\bsk-ant-[A-Za-z0-9\-_]{20,}\b/g
    },
    {
      id: 'github_token',
      label: 'GitHub token',
      severity: 'high',
      pattern: /\bgh[pousr]_[A-Za-z0-9]{20,255}\b/g
    },
    {
      id: 'slack_token',
      label: 'Slack token',
      severity: 'high',
      pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g
    },
    {
      id: 'private_key_block',
      label: 'Private key block',
      severity: 'high',
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
    }
  ];

  // ---------------------------------------------------------------------
  // Scanner
  // ---------------------------------------------------------------------

  /**
   * Scan `text` against every rule.
   * Returns an array of { id, label, severity, match, index }.
   * `match` is the raw matched substring — callers should treat it as
   * sensitive: never log it, never send it anywhere, only use it in-memory
   * (e.g. to build a redacted version of the text).
   */
  function scan(text) {
    if (!text || typeof text !== 'string') return [];

    const results = [];
    for (const rule of RULES) {
      // Reset lastIndex since patterns are reused across calls (global flag).
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        const matchText = m[0];
        if (rule.validate && !rule.validate(matchText)) continue;
        results.push({
          id: rule.id,
          label: rule.label,
          severity: rule.severity,
          match: matchText,
          index: m.index
        });
        // Guard against zero-width matches causing infinite loops.
        if (m.index === rule.pattern.lastIndex) rule.pattern.lastIndex++;
      }
    }
    // Sort by position so redaction can walk the string left-to-right.
    results.sort((a, b) => a.index - b.index);
    return results;
  }

  /**
   * Build a redacted copy of `text` given the matches returned by scan().
   * Replaces each match with [REDACTED:LABEL].
   */
  function redact(text, matches) {
    if (!matches || matches.length === 0) return text;
    let out = '';
    let cursor = 0;
    for (const m of matches) {
      // Skip overlapping matches (can happen when two rules match the same
      // span, e.g. a phone-shaped number inside a longer digit run).
      if (m.index < cursor) continue;
      out += text.slice(cursor, m.index);
      out += `[REDACTED:${m.id.toUpperCase()}]`;
      cursor = m.index + m.match.length;
    }
    out += text.slice(cursor);
    return out;
  }

  const api = { RULES, scan, redact, luhnCheck };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.PromptGuardDetector = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
