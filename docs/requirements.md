# Requirements — PromptGuard

## Functional Requirements

- [ ] Detect sensitive data categories in outgoing chatbot prompts before submission, including (starting set — adjust based on Phase 0 research):
  - Personally Identifiable Information (SSNs, phone numbers, addresses, emails)
  - Financial data (credit card numbers, bank account numbers)
  - Credentials & secrets (API keys, passwords, tokens)
  - Company-confidential markers (configurable keyword/pattern lists per organization)
  - Health information (configurable, higher sensitivity)
- [ ] Warn the user when sensitive data is detected, with a clear explanation of what was flagged
- [ ] Allow the user to: cancel submission, redact/mask the flagged portion and proceed, or override and submit anyway (with optional audit logging for enterprise use)
- [ ] Work across target chatbot platforms (define exact list — ChatGPT, Claude, Gemini, Copilot, etc.)
- [ ] (Enterprise tier) Admin dashboard for policy configuration and visibility into flagged events (aggregate, not raw content)

## Non-Functional Requirements

- [ ] **Privacy-by-design:** PromptGuard must not transmit or store the actual sensitive data it detects — only metadata (category, count, timestamp) unless the user/org explicitly opts into more
- [ ] **Low latency:** detection should add minimal delay to the user's workflow (define target, e.g. <200ms)
- [ ] **Low false-positive rate:** define acceptable threshold from Phase 4 testing benchmarks
- [ ] **Cross-browser support:** define which browsers are in scope for v1
- [ ] **Security of PromptGuard itself:** since it inspects sensitive data, it must be held to a higher security bar than a typical extension (minimal permissions, no third-party data sharing, clear privacy policy)

## Out of Scope (for MVP)

- [ ] Define explicitly — e.g., mobile app support, non-browser desktop AI clients, languages beyond English detection patterns, etc.

## Success Metrics

- [ ] Detection accuracy (precision/recall) per data-type category
- [ ] False-positive rate ceiling
- [ ] User retention / uninstall rate post-install
- [ ] (If enterprise) number of policy violations prevented per org per month
