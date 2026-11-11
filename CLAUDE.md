# BE UniLife — "4 ปีมหาลัย"

Interactive web game for the EC416 Behavioral Economics Free-Form project (solo, due 2026-12-16).
Players (Thai university students) live through 5 moments of university life; each moment quietly
measures one behavioral pattern; the game ends with a **Behavioral Transcript** that reveals the
biases, the mechanism behind each, the research, and how to cope. Full idea + plan: `docs/PLAN.md`.

## Non-negotiable rules
1. **Never name a bias during play.** Station titles, intros, buttons and memory lines stay neutral
   ("คืนนั้นคุณไถไป 11 นาที"). Bias names, mechanisms and research appear only on the Reveal screens.
2. **Mechanism-first reveal:** explain *why the brain does this* before the label.
3. **Score = distance from a rational benchmark (0 = rational)**, never vs. a population norm (we have no
   Thai data). Low/mid/high thresholds are our own and the UI must say so.
4. **Results are illustrative, not a diagnosis.** Keep the disclaimer on landing + reveal.
5. **No data leaves the browser.** No backend, no analytics, no network calls at runtime.
6. **No real brands / UI clones** (no Shopee, SPayLater, TikTok look-alikes). Use invented names, e.g. "ShopLater".
7. **Research claims only from `src/core/sources.ts`**, and only entries marked `verified: true` may show
   numbers. Unverified → show qualitatively or drop.
8. All user-facing copy is **Thai**; keep technical BE terms in English (present bias, sunk cost, ...).
9. Git is **local only. Never push / create remotes** unless the user explicitly asks.

## Design
Brand + CI live in **`docs/DESIGN.md`** (archetype Jester + Sage, voice "เพื่อนสนิทที่ชอบแซว", ink + highlighter CI,
mascot "ต่อม"). Follow it for every screen. Key rules: highlighter colours (`YEAR_ACCENT[y].mark`) are fills only —
text uses `.deep` (import from `src/core/accent.ts`, never from `stations/registry` inside a station); icons via `StationIcon`/`lucide-react`, never emoji; use `Button`, `IconTile`, `Highlight`, `Mascot`
from `src/components/`. Design skills: `.claude/skills/frontend-design`, `.claude/skills/ui-ux-pro-max`.

## Stack
Vite + React 19 + TypeScript · Tailwind v4 (`@tailwindcss/vite`, tokens in `src/index.css` `@theme`) ·
`motion` (Framer Motion, import from `motion/react`) · `lucide-react` icons · Zustand · Recharts · html-to-image · Vitest.

## Commands
- `npm run dev` — dev server (http://localhost:5173)
- `npm test` — Vitest (pure logic only: `metrics.ts` / scoring)
- `npm run build` — type-check + production build
- `npm run lint` — oxlint

## Structure
```
src/
  core/        types.ts (contracts), store.ts (game flow), rng.ts, sources.ts, levels.ts
  components/  shared UI (Button, ProgressRail, Screen, ...)
  scenes/      Landing, YearIntro, StationRunner, Memory, Graduation, Reveal
  stations/
    registry.ts         ordered list of stations (play order)
    <id>/index.ts       exports the StationDef
    <id>/Play.tsx       interactive UI; calls onComplete(raw) exactly once
    <id>/metrics.ts     pure functions raw → TraitScore (+ memory line)
    <id>/metrics.test.ts
    <id>/content.ts     Thai copy (intro, reveal content)
```

## Station contract (see `src/core/types.ts`)
- `Play` receives `{ onComplete, rng }`. Use `rng()` (seeded) for any randomization/counterbalancing —
  never `Math.random()` — so runs are reproducible in tests.
- `score(raw)` and `memoryLine(raw)` must be **pure** and unit-tested (rational answers → score 0).
- Target **≤ ~90 seconds** of play per station. Mobile-first at 390px wide; must also work on desktop.
- Respect `prefers-reduced-motion` (use `useReducedMotion` from `motion/react`).

## Play order
| # | id | Year | Moment | Measures |
|---|---|---|---|---|
| 1 | `scroll` | ปี 1 เทอม 1 | คืนแรกในหอ | predicted vs actual scrolling, commitment uptake |
| 2 | `paylater` | ปี 1 เทอม 2 | ค่าขนมก้อนแรก + ผ่อน 0% | buy rate full-price vs installment, perceived vs actual obligations |
| 3 | `sunkcost` | ปี 2 | จะเปลี่ยนเอกไหม | inconsistency across matched sunk/no-sunk scenario pairs |
| 4 | `groupwork` | ปี 3 | งานกลุ่ม | conditional contribution slope (strategy method) |
| 5 | `thesis` | ปี 4 | ธีสิส / senior project | plan vs actual work, self-imposed deadlines |

## Working as a subagent on one station
Touch **only** `src/stations/<id>/` (plus new entries in `src/core/sources.ts` if asked). Don't change
contracts, shared components or other stations — if a contract change is needed, report it instead.
Done = `npm test` and `npm run build` pass and the station plays end-to-end in the dev server.
