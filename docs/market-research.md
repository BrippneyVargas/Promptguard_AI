# Market Research — PromptGuard

> This document is a working draft. Fill in the bracketed sections with your own research as you go.

## 1. Problem Statement

People and employees frequently paste sensitive data into AI chatbots (ChatGPT, Claude, Gemini, Copilot, etc.) without realizing the risk:
- Individuals: personal identifiers (SSNs, addresses, financial details), health information, private messages
- Employees: customer PII, internal source code, credentials/API keys, financial reports, unreleased product info, legal documents

Once submitted, this data may be used for model training (depending on provider settings), retained in logs, or exposed via a data breach — and in a company context, this can violate data-handling policy, contracts, or regulations (GDPR, HIPAA, SOC 2, etc.) even if no breach ever occurs.

## 2. Target Segments

| Segment | Description | Pain Point |
|---|---|---|
| Individual users | Students, freelancers, general consumers | Accidentally shares personal data, no awareness of AI provider data policies |
| Employees (unmanaged) | Staff using AI tools without company oversight ("shadow AI") | Leaks company data without realizing it's against policy |
| IT/Security teams | Buyers at companies who need to control AI usage risk | Need visibility & enforcement, not just employee trust |

**[ ] To determine:** which segment is the initial wedge — consumer (bottom-up adoption) or enterprise (top-down IT purchase)?

## 3. Evidence the Problem Is Real

**[ ] To fill in:** cite specific incidents, surveys, or reports — e.g., known cases of employees pasting proprietary code or confidential data into public AI tools, industry surveys on "shadow AI" usage rates, etc. Document sources here as you find them.

## 4. Market Sizing (rough)

**[ ] To fill in:**
- TAM: total addressable market (e.g., all companies with employees using AI tools)
- SAM: serviceable segment (e.g., companies with existing DLP/security budgets, or individual power users of AI tools)
- SOM: realistic near-term target

## 5. User Interviews

**[ ] To fill in as conducted:**

| # | Persona | Key takeaway |
|---|---|---|
| 1 | | |
| 2 | | |

## 6. Positioning

**Working statement:**
> For [target segment], who [need/pain], PromptGuard is a [product category] that [core benefit] — unlike [alternative], it [key differentiator].

**[ ] To finalize** once competitive analysis and segment decision are locked in — see `competitive-analysis.md`.

## 7. Open Questions

- [ ] Consumer-first or enterprise-first go-to-market?
- [ ] Browser extension vs. API/proxy — which matches how the target segment actually works?
- [ ] Free tier vs. paid-only — what's the monetization path?
- [ ] How much friction is acceptable before users disable/uninstall it?
