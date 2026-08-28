# 🛡️ PromptGuard

**A local, real-time privacy shield for AI chatbots.** PromptGuard scans your prompts *before* you hit send — flagging passwords, SSNs, card numbers, API keys, and other sensitive data — so you don't accidentally hand it to ChatGPT, Claude, or Gemini.

[![Tests](https://github.com/OWNER/promptguard/actions/workflows/test.yml/badge.svg)](https://github.com/OWNER/promptguard/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> Replace `OWNER` in the badge URL above with your GitHub username/org once this is pushed, so the badge actually links to your workflow runs.

---

## Why

People paste sensitive data into AI chatbots every day without realizing where it goes — customer records, credentials, financials, source code, personal information. Once it's sent, it may be logged, retained, or used for training, and there's no undo. Existing options don't fill the gap: enterprise DLP tools cost thousands a month and need an IT team, general browser-security extensions are blind to what you type into a chat box, and "be careful" blog posts aren't a product.

PromptGuard is a free, open-source browser extension that catches this **before** it happens — entirely on your device.

## Features

- 🔍 **Pre-send scanning** — detects SSNs, credit card numbers (Luhn-validated), emails, phone numbers, and API keys/secrets (AWS, OpenAI, Anthropic, GitHub, Slack, private key blocks)
- ✏️ **Redact & send** — swap flagged text for `[REDACTED:TYPE]` and send safely instead of canceling outright
- 🧠 **Plain-English warnings** — see exactly what was flagged and why, then decide: cancel, redact, or send anyway
- 🔒 **100% local** — detection runs entirely in your browser; nothing is transmitted or logged anywhere
- 🌐 **Works across chatbots** — ChatGPT, Claude, and Gemini out of the box; easy to extend to more

## Screenshot

*(Add a screenshot or short GIF of the warning modal here once you have one — it's the single highest-impact thing you can add to this README.)*

## Installation

**From source (current):**

1. Clone this repo
2. Open `chrome://extensions`, enable **Developer mode**
3. Click **Load unpacked**, select the `src/` folder
4. Visit ChatGPT, Claude, or Gemini and start typing — PromptGuard activates automatically

**From the Chrome Web Store:** not yet published — see [Roadmap](#roadmap).

## Development

```bash
npm install
npm test
```

The detection engine (`src/lib/detector.js`) is fully unit-tested independently of the browser — see `tests/detector.test.js`. For manual end-to-end testing without a live chatbot session, open `tests/manual/test-page.html` and try the sample sensitive strings on the page.

## Project Structure

```
promptguard/
├── src/                  # Extension source (Manifest V3)
│   ├── manifest.json
│   ├── lib/detector.js   # Detection engine — regex + Luhn validation, no framework
│   ├── content-script.js # Intercepts prompt submission
│   ├── ui.js              # Warning modal (shadow DOM, isolated styling)
│   ├── background.js      # Minimal service worker
│   └── popup.html/js/css  # On/off toggle
├── tests/                 # Jest unit tests + manual test page
├── docs/                  # Market research, competitive analysis, requirements, architecture
├── MILESTONES.md          # Full roadmap: research → build → test → launch
└── .github/workflows/     # CI — runs the test suite on every push/PR
```

## Roadmap

See [MILESTONES.md](./MILESTONES.md) for the full phase-by-phase plan. Short version:

- ✅ **Phase 1 (MVP):** detection engine, interception, warning UI — built and unit-tested
- ⬜ **Phase 2:** smarter redaction, contextual (NER) detection, broader browser support
- ⬜ **Phase 3:** more chatbots, company/admin policy layer
- ⬜ **Phase 4:** mobile, IDE plugin, enterprise API

## Contributing

Issues and PRs welcome — see the issue templates under `.github/ISSUE_TEMPLATE/`. This is an early-stage project, so expect the interception heuristics in particular to need real-world tuning against live chatbot DOMs.

## License

[MIT](./LICENSE) — free to use, modify, and distribute.
