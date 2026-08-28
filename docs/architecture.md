# Architecture — PromptGuard

> Fill in decisions as they're made in Phase 2. Structure below is a starting skeleton.

## Deployment Options (choose one or combine)

1. **Browser extension** — content script intercepts the prompt textbox on supported chatbot sites before submission
2. **API/proxy middleware** — for teams calling AI APIs programmatically, PromptGuard sits between the app and the provider's API
3. **Desktop app / local agent** — broader interception, higher complexity

**[ ] Decision:** _____

## Detection Engine

Options, roughly in order of complexity:

1. **Rules/regex-based** — fast, explainable, good for structured data (SSNs, credit cards, API key formats). Low compute cost. Weak on unstructured/contextual sensitive info.
2. **Named Entity Recognition (NER) model** — better at catching names, addresses, contextual PII. Higher compute cost, needs a model (local or hosted).
3. **Hybrid** — rules for high-confidence structured patterns + a lightweight NER/classifier for the rest.

**[ ] Decision:** _____

## Data Flow (draft — must preserve privacy by design)

```
User types prompt
      ↓
[Interception layer captures prompt text locally]
      ↓
[Detection engine scans text — ideally on-device/local, not sent to a third-party server]
      ↓
   Sensitive data found?
    ├── No  → prompt submitted normally
    └── Yes → user warned → [cancel | redact & proceed | override & proceed]
```

**Critical constraint:** the raw sensitive data PromptGuard scans should never leave the user's device / org boundary as part of PromptGuard's own operation — otherwise the tool becomes the very risk it's meant to prevent.

## Tech Stack

Recommended starting stack for MVP, with a lower-effort path and an alternative if requirements grow. Revisit once Phase 0/1 decisions (consumer vs. enterprise wedge, deployment form factor) are locked in.

### Browser Extension (front line — where prompts are intercepted)
- **Manifest V3 (Chrome/Edge/Brave)** — content script injected into supported chatbot pages (chat.openai.com, claude.ai, gemini.google.com) to read the prompt box before submission
- **Plain JavaScript or TypeScript** for the extension itself — TypeScript recommended once the codebase grows past a few files, for safer refactoring
- **No framework needed for v1** — the UI surface (a warning banner/modal) is small enough for vanilla JS + CSS; avoid React/Vue overhead unless the popup/options page grows complex

### Detection Engine (MVP: regex/rules-based, in-browser)
- **JavaScript, running entirely inside the extension** — keeps sensitive text on-device, satisfies the "never transmit raw content" constraint by construction, and needs no backend for v1
- Rule set as a versioned JSON/JS config (pattern name → regex → severity) so categories can be added without redeploying core logic
- Categories to start with: SSNs, credit card numbers (Luhn-checked), email addresses, API key formats (AWS, OpenAI, GitHub tokens, etc. — most have recognizable prefixes), phone numbers

### If/when you add NER (Phase 2+, hybrid detection)
- **Python** for model serving — matches your existing Python background, so this is the natural place to extend rather than the extension itself
- **spaCy** (lightweight, runs well locally, good off-the-shelf NER) as the first choice over heavier LLM-based extraction — cheaper, faster, easier to explain to users why something was flagged
- Served via a small **FastAPI** service if server-side scanning becomes necessary — but treat this as a fallback only for cases regex can't handle, since sending prompt text to any server (even your own) weakens the "stays on-device" privacy story. On-device options if this matters: compile a small NER model to run in-browser via **transformers.js** or **ONNX Runtime Web**.

### Enterprise Dashboard (only if pursuing the enterprise wedge — Phase 6+)
- **Backend:** Python + FastAPI (matches your background) or Node.js + Express if you want one language across extension and backend
- **Database:** PostgreSQL for policy config and aggregate audit metadata (counts/categories only — never raw flagged content)
- **Frontend:** a simple React app is reasonable here since it's a real dashboard, not just a warning popup

### Testing & CI
- **Jest** for the JS/TS extension code
- **pytest** if a Python detection/backend service is added
- **GitHub Actions** for CI (lint + test on push) — fits naturally with the `.github/` folder already in this repo

### Summary table

| Layer | MVP choice | If it grows |
|---|---|---|
| Extension UI | Vanilla JS/TS | Add React only if options/dashboard UI gets complex |
| Detection (structured data) | Regex rules, in-browser | Keep as first-pass filter even after adding NER |
| Detection (contextual/NER) | Skip for MVP | spaCy (Python) or transformers.js (in-browser) |
| Backend | None needed for MVP | FastAPI (Python) for enterprise dashboard/API |
| Storage | None needed for MVP | PostgreSQL for enterprise policy/audit metadata |
| CI | GitHub Actions | Same |

**[ ] Decision to confirm once Phase 0/1 wraps:** does the enterprise dashboard get built at all, or does v1 stay a standalone browser extension with no backend?

## Threat Model (PromptGuard as a security tool)

- [ ] Must not log or transmit raw sensitive content
- [ ] Extension permissions kept to the minimum needed (avoid broad "read all site data" if a narrower permission works)
- [ ] Clear, published privacy policy
- [ ] Regular security review given the sensitivity of what it processes
