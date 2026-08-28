# PromptGuard Development Milestones

This roadmap covers the full lifecycle: market research → design → build → test → launch → iterate. Check off items as they're completed and adjust dates as the project evolves.

---

## Phase 0  Market Research & Problem Validation
**Goal:** Confirm the problem is real, sized, and worth building for.

- [ ] Define target segments (individual users vs. company/IT buyers)
- [ ] Document real-world incidents of sensitive data leaking into chatbots
- [ ] Identify and interview 5–10 potential users (students, employees, IT/security staff)
- [ ] Complete competitive analysis (see `docs/competitive-analysis.md`)
- [ ] Estimate market size / opportunity (TAM/SAM/SOM, even roughly)
- [ ] Write up findings in `docs/market-research.md`
- [ ] Decide on initial wedge: consumer-first vs. enterprise-first

**Deliverable:** `docs/market-research.md` finalized, go/no-go decision made.

---

## Phase 1 Product Definition
**Goal:** Turn research into a concrete spec.

- [ ] Define MVP scope (what sensitive data types are detected at launch: PII, API keys/secrets, financials, credentials, health data, etc.)
- [ ] Decide deployment form factor (browser extension, API/proxy middleware, both)
- [ ] Write functional & non-functional requirements (`docs/requirements.md`)
- [ ] Define success metrics (detection accuracy, false-positive rate, latency added)
- [ ] Draft initial UX flow (what the user sees when something is flagged)

**Deliverable:** `docs/requirements.md` finalized.

---

## Phase 2 Architecture & Design
**Goal:** Decide how it's built before writing code.

- [ ] Choose detection approach (regex/rules engine, NER model, hybrid)
- [ ] Choose interception point (browser content script, proxy, API wrapper)
- [ ] Design data flow — critical: confirm no sensitive data is itself logged/stored by PromptGuard
- [ ] Choose tech stack (frontend, backend if any, model hosting if using NER)
- [ ] Document system design in `docs/architecture.md`
- [ ] Threat-model PromptGuard itself (it's a security tool — it can't become a new leak vector)

**Deliverable:** `docs/architecture.md` finalized, stack locked in.

---

## Phase 3  MVP Build
**Goal:** Working prototype that detects and blocks/redacts sensitive data.

- [x] Set up repo scaffolding, CI (GitHub Actions runs `npm test` on push/PR)
- [x] Build core detection engine — regex/Luhn-based, covers SSNs, credit cards, emails, phone numbers, AWS/OpenAI/Anthropic/GitHub/Slack keys, private key blocks (`src/lib/detector.js`, 18 passing Jest tests)
- [x] Build interception layer — Manifest V3 content script, heuristic-based (Enter key + send-button click) so it isn't tied to one site's exact selectors (`src/content-script.js`)
- [x] Build user-facing warning/block UI — shadow-DOM modal, shows category + severity counts only, never raw matched text (`src/ui.js`)
- [x] Build redaction/masking option (`detector.redact()` + native-setter trick for `<textarea>` inputs)
- [ ] Basic logging/analytics (non-sensitive: counts of flags by category, not the data itself) — not yet wired up, no telemetry exists yet
- [ ] Linting — not yet set up (ESLint/Prettier)

**Deliverable:** Installable MVP that works end-to-end on at least one target chatbot.
**Status:** Loads and runs (`npm test` passes, manual test page in `tests/manual/` confirms interception works against a plain textarea + button). **Not yet verified against the live DOM of chat.openai.com/claude.ai/gemini** — see Phase 4.

---

## Phase 4  Testing & Validation
**Goal:** Make sure it actually works and doesn't get in the way.

- [ ] Unit tests for detection engine (per data-type category)
- [ ] False-positive / false-negative benchmarking against a labeled test set
- [ ] Performance testing (latency added to prompt submission)
- [ ] Security review of PromptGuard itself
- [ ] Usability testing with real users from Phase 0 interviews
- [ ] Iterate on detection thresholds based on results

**Deliverable:** Test coverage report + benchmark results documented.

---

## Phase 5 Beta Release
**Goal:** Get it in front of real users before public launch.

- [ ] Recruit beta testers (mix of individuals + at least one team/company if enterprise wedge)
- [ ] Set up feedback channel (form, Discord, GitHub issues)
- [ ] Track key metrics: adoption, flags triggered, false-positive complaints
- [ ] Fix critical bugs and refine UX based on feedback
- [ ] Write beta retrospective

**Deliverable:** Beta cohort feedback summarized, product refined.

---

## Phase 6 Public Launch
**Goal:** Ship it.

- [ ] Finalize pricing/model if applicable (free, freemium, enterprise tier)
- [ ] Publish to relevant store (Chrome Web Store, etc.) if browser extension
- [ ] Launch landing page / docs site
- [ ] Announce (relevant communities, socials, Product Hunt, etc.)
- [ ] Set up support channel

**Deliverable:** Public v1.0 live.

---

## Phase 7 Post-Launch Iteration
**Goal:** Keep improving based on real usage.

- [ ] Monitor detection accuracy in production, expand data-type coverage
- [ ] Add support for additional chatbots/platforms as needed
- [ ] Explore enterprise features (admin dashboard, policy controls, audit logs) if pursuing that wedge
- [ ] Regular security/privacy audits of PromptGuard itself

---

## How to use this file
Update checkboxes as work is completed. Add dates/owners per item as the team (if any) grows. Treat Phase 0 and Phase 1 as the most important — a good chunk of the value of this project comes from confirming the right problem and scope before building.
