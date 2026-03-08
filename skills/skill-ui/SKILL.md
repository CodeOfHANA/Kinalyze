---
name: skill-ui
description: >
  Build premium, production-grade UI components and screens for the Kinalyze frontend. Use this skill whenever building or editing any React component, page,
  or screen in kinalyze-frontend — including the live session webcam overlay, dashboard, exercise
  cards, auth screens, and summary views. Also use when generating screens via Stitch MCP,
  integrating Framer Motion animations, working with HTML5 Canvas for skeleton overlay, or
  wiring Supabase auth/data into UI. Trigger on any frontend task: "build the dashboard",
  "add animation", "create the exercise card", "wire up the webcam feed", "style this screen".
---

# skill-ui — Kinalyze Frontend

This skill governs all UI work in `kinalyze-frontend`. Read it before writing any component, page,
animation, or Stitch prompt. It covers four domains — load the relevant reference file when
working in that domain.

---

## Quick Reference: Which Reference File to Read

| Task | File to Read |
|------|-------------|
| Generating screens via Stitch MCP | `references/stitch-mcp.md` |
| Building React components with Tailwind | `references/components.md` |
| Adding Framer Motion animations | `references/motion.md` |
| HTML5 Canvas skeleton overlay + webcam | `references/canvas-overlay.md` |

Read only the file(s) relevant to your current task. Don't load all four at once.

---

## Design System (Always Apply)

### Palette — CSS Variables

```css
:root {
  --bg-primary:    #0a0a0f;   /* near-black base */
  --bg-surface:    #12121a;   /* card / panel surface */
  --bg-elevated:   #1a1a26;   /* modals, dropdowns */
  --accent-blue:   #3b82f6;   /* primary CTA, active states */
  --accent-green:  #22c55e;   /* correct joint / success */
  --accent-red:    #ef4444;   /* incorrect joint / error */
  --accent-amber:  #f59e0b;   /* warnings */
  --text-primary:  #f1f5f9;
  --text-muted:    #64748b;
  --border:        #1e1e2e;
  --glow-green:    0 0 20px rgba(34,197,94,0.4);
  --glow-red:      0 0 20px rgba(239,68,68,0.4);
  --glow-blue:     0 0 20px rgba(59,130,246,0.3);
}
```

Apply via Tailwind custom config (`tailwind.config.js`) mapping these to utility classes.

### Typography

- **Display / Headings:** `font-display` → `Space Grotesk` or `DM Sans` (bold, geometric)
- **Body / UI:** `font-sans` → `Inter` (readable, clean)
- **Monospace / Scores:** `font-mono` → `JetBrains Mono` (accuracy numbers, angles)

```html
<!-- Load in index.html -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

### Spacing & Radius

Always use Tailwind utilities. Key conventions:
- Cards: `rounded-2xl` with `border border-[var(--border)]`
- Panels: `rounded-xl p-6`
- Buttons: `rounded-xl px-6 py-3`
- Inner elements: `rounded-lg`

### Component Rules

1. **No inline styles** — use Tailwind classes or CSS variables only
2. **Dark mode always** — never use white/light backgrounds in Kinalyze screens
3. **Glow on interaction** — correct state gets `--glow-green`, error gets `--glow-red`
4. **Single responsibility** — one component per file, max ~150 lines
5. **Named exports only** — no default exports except pages

---

## File & Folder Conventions

```
src/
├── components/
│   ├── ui/           # Primitives: Button, Card, Badge, Spinner
│   ├── session/      # LiveSession, SkeletonOverlay, FeedbackPanel
│   ├── dashboard/    # ExerciseCard, SessionHistory, StreakBadge
│   └── layout/       # Navbar, PageWrapper, AuthGuard
├── pages/
│   ├── Landing.jsx
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── ExerciseDetail.jsx
│   ├── LiveSession.jsx
│   └── Summary.jsx
├── hooks/
│   ├── useWebcam.js         # getUserMedia, stream management
│   ├── usePoseDetection.js  # MediaPipe integration
│   └── useSession.js        # Session state, Supabase writes
├── lib/
│   ├── supabase.js          # Supabase client init
│   └── api.js               # Backend API calls (/analyze)
└── assets/
    └── exercises/           # Reference GIFs per exercise
```

---

## Supabase Auth Patterns (Quick Reference)

Full patterns in `references/components.md`. Key rules:

```js
// Always use the shared client
import { supabase } from '@/lib/supabase'

// Auth state — use onAuthStateChange, not manual checks
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => setUser(session?.user ?? null)
  )
  return () => subscription.unsubscribe()
}, [])

// Google OAuth
await supabase.auth.signInWithOAuth({ provider: 'google',
  options: { redirectTo: `${window.location.origin}/dashboard` }
})

// RLS: queries auto-filter by user — never pass user_id manually
const { data } = await supabase.from('sessions').select('*').order('started_at', { ascending: false })
```

---

## Accessibility Baseline

Every screen must pass these before commit:
- Contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- All interactive elements keyboard-focusable with visible focus ring
- `aria-label` on icon-only buttons
- Webcam permission denial → accessible error state (not just visual)
- Run Stitch MCP accessibility check on generated screens before implementing

---

## Performance Rules

- Webcam frame processing: never block React render thread — use `useRef` + `requestAnimationFrame`
- Canvas draws: always clear before redraw (`ctx.clearRect`)
- Supabase queries: always `await`, always handle error state
- Framer Motion: use `layoutId` for shared element transitions, not manual position math
- Images/GIFs: lazy load exercise reference GIFs (`loading="lazy"`)

---

## Reference Files

- **`references/stitch-mcp.md`** — Stitch MCP setup, prompt templates per Kinalyze screen, Design DNA extraction, token export workflow
- **`references/components.md`** — React + Tailwind component patterns, Supabase integration, auth flows, reusable primitives
- **`references/motion.md`** — Framer Motion patterns for page transitions, exercise cards, countdown, joint pulse animations
- **`references/canvas-overlay.md`** — HTML5 Canvas skeleton overlay, MediaPipe landmark drawing, joint color coding, confidence-based rendering
