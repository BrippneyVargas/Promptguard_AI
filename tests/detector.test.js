const detector = require('../src/lib/detector.js');

describe('scan()', () => {
  test('returns no matches for clean text', () => {
    const matches = detector.scan("What's a good recipe for banana bread?");
    expect(matches).toEqual([]);
  });

  test('detects a US SSN', () => {
    const matches = detector.scan('My SSN is 123-45-6789, please help.');
    expect(matches.some((m) => m.id === 'ssn')).toBe(true);
  });

  test('detects a valid credit card number (Luhn-checked)', () => {
    // 4111 1111 1111 1111 is a standard Luhn-valid test Visa number.
    const matches = detector.scan('Card: 4111 1111 1111 1111');
    expect(matches.some((m) => m.id === 'credit_card')).toBe(true);
  });

  test('does not flag a Luhn-invalid 16-digit number as a credit card', () => {
    const matches = detector.scan('Order number: 1234 5678 9012 3456');
    expect(matches.some((m) => m.id === 'credit_card')).toBe(false);
  });

  test('detects an email address', () => {
    const matches = detector.scan('Contact me at jane.doe@example.com');
    expect(matches.some((m) => m.id === 'email')).toBe(true);
  });

  test('detects a US phone number', () => {
    const matches = detector.scan('Call me at (801) 555-0199');
    expect(matches.some((m) => m.id === 'phone_us')).toBe(true);
  });

  test('detects an AWS access key', () => {
    const matches = detector.scan('Key: AKIAIOSFODNN7EXAMPLE');
    expect(matches.some((m) => m.id === 'aws_access_key')).toBe(true);
  });

  test('detects an OpenAI-style API key', () => {
    const matches = detector.scan('sk-abcdefghijklmnopqrstuvwxyz123456');
    expect(matches.some((m) => m.id === 'openai_key')).toBe(true);
  });

  test('detects an Anthropic-style API key', () => {
    const matches = detector.scan('sk-ant-abcdefghijklmnopqrstuvwxyz1234567890');
    expect(matches.some((m) => m.id === 'anthropic_key')).toBe(true);
  });

  test('detects a GitHub token', () => {
    const matches = detector.scan('ghp_' + 'a'.repeat(36));
    expect(matches.some((m) => m.id === 'github_token')).toBe(true);
  });

  test('detects a private key block', () => {
    const matches = detector.scan('-----BEGIN RSA PRIVATE KEY-----\nMIIEow...');
    expect(matches.some((m) => m.id === 'private_key_block')).toBe(true);
  });

  test('finds multiple distinct categories in one prompt', () => {
    const text =
      'Email me at jane@example.com or call (801) 555-0199. SSN: 123-45-6789.';
    const matches = detector.scan(text);
    const ids = new Set(matches.map((m) => m.id));
    expect(ids.has('email')).toBe(true);
    expect(ids.has('phone_us')).toBe(true);
    expect(ids.has('ssn')).toBe(true);
  });

  test('handles empty/undefined input gracefully', () => {
    expect(detector.scan('')).toEqual([]);
    expect(detector.scan(undefined)).toEqual([]);
    expect(detector.scan(null)).toEqual([]);
  });
});

describe('redact()', () => {
  test('replaces each match with a [REDACTED:TYPE] marker', () => {
    const text = 'My SSN is 123-45-6789.';
    const matches = detector.scan(text);
    const redacted = detector.redact(text, matches);
    expect(redacted).toBe('My SSN is [REDACTED:SSN].');
  });

  test('leaves text unchanged when there are no matches', () => {
    const text = 'Nothing sensitive here.';
    expect(detector.redact(text, [])).toBe(text);
  });

  test('redacts multiple matches left to right', () => {
    const text = 'Email jane@example.com, SSN 123-45-6789.';
    const matches = detector.scan(text);
    const redacted = detector.redact(text, matches);
    expect(redacted).not.toContain('jane@example.com');
    expect(redacted).not.toContain('123-45-6789');
    expect(redacted).toContain('[REDACTED:EMAIL]');
    expect(redacted).toContain('[REDACTED:SSN]');
  });
});

describe('luhnCheck()', () => {
  test('validates a known-good number', () => {
    expect(detector.luhnCheck('4111111111111111')).toBe(true);
  });

  test('rejects a known-bad number', () => {
    expect(detector.luhnCheck('1234567890123456')).toBe(false);
  });
});
