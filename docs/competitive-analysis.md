# Competitive Analysis AI Guardian (PromptGuard)

## Landscape Overview

The "AI data leakage prevention" space splits into three tiers: enterprise DLP platforms (expensive, IT-managed), point solutions bundled into broader security suites, and a thin, mostly-empty layer of free, individual-facing tools. AI Guardian's opportunity sits in that last, largely unoccupied layer.

## Direct & Adjacent Competitors

| Competitor | Category | Target | Pricing | Strengths | Weaknesses / Gap AI Guardian Exploits |
|---|---|---|---|---|---|
| **Nightfall AI** | Enterprise DLP | Large orgs, IT/security teams | Custom quote; G2 lists ~$4/feature/month as a low-end entry point, but real deployments run into the thousands/month | Strong ML-based detection across SaaS + cloud; established enterprise trust (4.6/5 on G2, 98 reviews) | Requires IT deployment and admin overhead; nothing for the individual, non-corporate user; no free tier |
| **Cyberhaven** | Enterprise DLP | Large orgs | No public pricing (custom) | Deep data-lineage tracking, strong enterprise reviews (4.5/5, G2) | Same enterprise-only gap as Nightfall; heavier, more complex deployment |
| **Harmonic Security** | Enterprise "zero-touch" AI data protection | Mid-market to enterprise, CISO-led | Custom quote; company has raised **$26M+ total** ($7M seed 2023, $17.5M Series A Oct 2024) | Delivered via a lightweight browser extension (closest architecture match to AI Guardian); monitors 1,000+ sites including embedded AI in Canva/Gamma/Notion; backed by well-known security operators (founders previously built Digital Shadows, sold for $160M) | Still B2B-only, CISO-sold, no self-serve individual product; validates that "browser extension as the interception point" is the right technical bet |
| **Metomic** | DLP / SaaS security | Mid-market teams | Custom quote (no public tier) | Well-regarded UX, strong reviews (4.6/5, G2) | Same enterprise/team-only positioning |
| **Prompt Security** | AI governance platform | Enterprise (healthcare, finance) | Custom (acquired by SentinelOne, Aug 2025, at $250–300M valuation) | Broad coverage: employee use, AI code assistants, agentic AI, homegrown apps | Acquisition signals the *category* is being consolidated into big security suites — reinforces that a lightweight, independent, individual-first tool is a distinct (and currently open) lane |
| **Generic browser security extensions (e.g., Avast, Malwarebytes browser guard)** | Consumer browser security | Individual consumers | Free / freemium | Massive install base, trusted brand | Protect against malicious *sites*, not against what a user *types into* a legitimate chatbot; functionally blind to this problem entirely |
| **Fake "AI privacy" extensions** | N/A:  malicious | Individual consumers | Free (malicious) | N/A | Actively harmful category (see Data Correction below); creates a trust gap AI Guardian can close by being genuinely open source and verifiable |

## Incidents

- **LayerX (Feb 2026):** 30 fake AI-themed Chrome extensions, ~260,000–300,000 downloads combined, exfiltrating page content, Gmail data, and browsing activity.
- **OX Security (Dec 2025):** ~900,000 downloads across two malicious extensions impersonating a real AI sidebar tool, stealing AI chat conversations.
- **Koi Security ("RedDirection," 2025):** 2.3M users affected across 18 hijacked extensions (broader spying campaign, not AI-specific).
- **Urban VPN Proxy (Koi Security, July 2025):** ~7.3M combined installs (Chrome + Edge) turned into an AI-prompt harvester via a malicious update — this is the one case that could plausibly support a multi-million figure, but it's a single VPN extension repurposed for AI harvesting, not "8M+ users tricked by fake AI privacy extensions" as a category.


## Where AI Guardian Actually Differentiates

1. **Individual-first, not IT-first.** Every direct competitor above sells to a CISO or IT admin. Nobody is shipping a free, self-install tool for the individual employee or consumer, this is the real white space, not "better detection."
2. **Local-only processing as a trust story.** Given the fake-extension epidemic above, "100% local, open source, verifiable" is a genuine differentiator and directly defuses the trust problem the market just created for itself.
3. **Cross-platform coverage in one lightweight tool.** Harmonic covers 1,000+ sites but is enterprise-sold; nothing free covers ChatGPT + Claude + Gemini + Copilot in one place for an individual.
4. **Realistic weakness to plan for:** regex/pattern-based detection (your current approach) will have a lower detection ceiling than the ML-based engines Nightfall/Cyberhaven/Harmonic use. That's an acceptable MVP tradeoff, but Rachel or David may ask about it — worth having a one-line answer ready (e.g., "Phase 2 roadmap adds a local NER model for unstructured PII without sending data off-device").

## Risks

- Established DLP vendors could add "AI prompt" scanning as a feature to their existing enterprise suites
- AI providers themselves could build this in natively (reduces the addressable problem over time)
- Detection accuracy (false positives) is the make-or-break factor; a tool that's too noisy gets disabled
