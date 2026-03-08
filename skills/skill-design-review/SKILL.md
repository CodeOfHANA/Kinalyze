---
name: skill-design-review
description: >
  UX review, design approval gating, Figma handoff, visual regression testing, and
  accessibility checks for the Kinalyze project. Use this skill in kinalyze-design-review for:
  reviewing screens against Figma designs, running Playwright screenshot comparisons,
  checking WCAG 2.1 accessibility compliance, running Stitch MCP accessibility audits,
  approving or rejecting UI implementations before they merge to main, and generating
  design review reports. Trigger on: "review this screen", "compare to Figma",
  "check accessibility", "WCAG audit", "visual regression", "design approval",
  "does this match the design", or any UX quality gate task.
---

# skill-design-review — Kinalyze UX Approval Gate

## Reference Map

| Task | File |
|------|------|
| Playwright screenshot comparison vs Figma | `references/visual-regression.md` |
| WCAG 2.1 accessibility audit | `references/accessibility.md` |
| Design approval process + report template | `references/approval-process.md` |

---

## Design Approval Gate — How It Works

No screen merges to `kinalyze-frontend/main` without passing this gate.

```
Developer opens PR for a screen
        ↓
Design reviewer runs skill-design-review
        ↓
    ┌───────────────────────────────────┐
    │ 1. Playwright screenshot capture  │
    │ 2. Visual compare vs Figma export │
    │ 3. WCAG 2.1 AA accessibility scan │
    │ 4. Interaction / animation check  │
    │ 5. Mobile responsiveness check    │
    └───────────────────────────────────┘
        ↓
PASS (score ≥ 8/10 + 0 WCAG errors)
  → Approve PR, add label "design-approved"
        ↓
FAIL → Comment specific fixes on PR
  → Developer iterates → re-review
```

---

## The 5 Kinalyze Screens

| Screen | Route | Key Elements to Review |
|--------|-------|----------------------|
| Landing | `/` | Hero, CTA button, disclaimer text, responsive layout |
| Auth | `/auth` | Sign in/up form, Google OAuth button, error states |
| Dashboard | `/dashboard` | Exercise cards, session history, progress stats |
| Live Session | `/session/:id` | Webcam feed, skeleton overlay, feedback panel, countdown |
| Summary | `/summary/:id` | Score ring, joint breakdown, AI coaching text, CTA |

---

## Design Tokens (reference for review)

```
Background:  #0a0a0f (primary)  #111118 (surface)  #1a1a2e (card)
Accent:      #3b82f6 (blue)     #22c55e (green/correct)  #ef4444 (red/error)
Text:        #f8fafc (primary)  #94a3b8 (muted)
Font:        Space Grotesk (headings)  Inter (body)  JetBrains Mono (scores)
Border:      1px solid rgba(255,255,255,0.08)
Radius:      12px (cards)  8px (inputs)  50% (avatars)
```

---

## Reference Files

- **`references/visual-regression.md`** — Playwright screenshot capture, Figma export, pixel comparison workflow
- **`references/accessibility.md`** — WCAG 2.1 AA checklist, axe-core automated scan, manual checks
- **`references/approval-process.md`** — Review report template, scoring rubric, PR comment format
