/**
 * Year colours (CI "ink + highlighter", see docs/DESIGN.md).
 * Lives in core — not in stations/registry.ts — so stations can import it without
 * a circular import (registry imports every station).
 */
export interface Accent {
  /** highlighter colour: fills, marks, buttons with ink text. Never use as text colour. */
  mark: string
  /** same hue, dark enough for text on white */
  deep: string
  /** faint tint for large surfaces */
  soft: string
}

const accent = (k: string): Accent => ({
  mark: `var(--color-${k})`,
  deep: `var(--color-${k}-deep)`,
  soft: `var(--color-${k}-soft)`,
})

export const YEAR_ACCENT: Record<number, Accent> = {
  1: accent('y1'),
  2: accent('y2'),
  3: accent('y3'),
  4: accent('y4'),
}

export const GRAD_ACCENT: Accent = accent('grad')
