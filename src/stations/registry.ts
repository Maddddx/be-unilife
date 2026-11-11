import type { StationDef } from '../core/types'
import { scroll } from './scroll'
import { paylater } from './paylater'
import { sunkcost } from './sunkcost'
import { groupwork } from './groupwork'
import { thesis } from './thesis'

/** Play order = chronological order through university. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STATIONS: StationDef<any>[] = [scroll, paylater, sunkcost, groupwork, thesis]

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

export function momentLabel(def: Pick<StationDef, 'year' | 'term'>): string {
  return def.term ? `ปี ${def.year} เทอม ${def.term}` : `ปี ${def.year}`
}
