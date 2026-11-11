# Shared brief for station subagents (Phase 1)

You build ONE station of the web game "4 ปีมหาลัย" (EC416 Behavioral Economics). Read first, in this order:
`CLAUDE.md` (hard rules), `docs/DESIGN.md` (brand/CI/voice — follow it), `docs/PLAN.md` §3–4 (concept + your
station's mechanic), `src/core/types.ts` (contract), `src/core/levels.ts`, `src/core/sources.ts`,
`src/components/*` (reuse Button, IconTile, Highlight, Mascot/Bubble, StationIcon), and your stub in
`src/stations/<id>/`.

## Scope
- Edit **only** `src/stations/<id>/` (Play.tsx, metrics.ts, metrics.test.ts, content.ts, extra files/components
  inside that folder are fine). Do not touch contracts, shared components, other stations, sources.ts, package.json.
  If you truly need a contract/shared change, don't make it — describe it in your final report.
- Do not commit to any branch other than your worktree's; commit your work there with a clear message
  (end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Never push.

## Must-haves
1. **Play.tsx**: real interactive station, mobile-first at 390px (works on desktop), target ≤ ~90 s of play,
   calls `onComplete(raw)` exactly once. Use `rng()` for any randomisation/counterbalancing (never Math.random).
   Respect reduced motion (`useReducedMotion` from `motion/react`). Touch targets ≥ 44px.
   Any timing must use real elapsed time (performance.now) but keep the station short.
2. **Never name or hint the bias during play** (no "present bias", "sunk cost", no moralising). Intro, buttons,
   memory line stay neutral but in the brand voice: เพื่อนสนิทที่ชอบแซว, แซวพฤติกรรมไม่แซวคน, money topics gentle.
3. **metrics.ts**: define `Raw`, pure `score(raw): TraitScore` and `memoryLine(raw)`. Score = distance from a
   rational benchmark on 0..100 (0 = rational), via `clampScore` / `levelOf`. `headline` + `facts` are shown on the
   reveal (may name the bias). Document the formula in a comment.
4. **metrics.test.ts** (Vitest): rational answers → score 0; clearly biased answers → high; edge cases (empty,
   extreme) don't crash or exceed bounds; memoryLine never contains the bias name.
5. **content.ts**: Thai copy. Keep TITLE/ICON/INTRO (you may polish INTRO in the brand voice). Fill REVEAL fully:
   `mechanism` (why the brain does it — mechanism first, 2–4 sentences), `research` (ResearchNote[] using existing
   `sourceId`s from sources.ts; numbers only from that source's verified `facts`; state the sample/limitation
   in `caveat`), `inLife`, `howToCope`, `courseLink`. Thai, BE terms in English.
6. Visual style: ink + highlighter CI from DESIGN.md. Import `YEAR_ACCENT` from `src/core/accent.ts` (NOT from registry — circular import). Use `YEAR_ACCENT[year].mark` for fills only, `.deep` for
   coloured text; icons from `lucide-react` (already installed), never emoji as icons. Invented brand names only.
   The mascot "ต่อม" may appear at most once during play with a neutral tease.

## Done =
`npm test`, `npm run build`, `npm run lint` all pass in your worktree. Final report (short): what the player does,
Raw shape, scoring formula + thresholds, anything you couldn't do, any contract change you'd want.
You can't open a browser; the orchestrator will play-test visually — so make the UI states explicit and robust.
