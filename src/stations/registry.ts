import type { StationDef } from '../core/types'
import { scroll } from './scroll'
import { paylater } from './paylater'
import { sunkcost } from './sunkcost'
import { groupwork } from './groupwork'
import { thesis } from './thesis'

/** Play order = chronological order through university. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STATIONS: StationDef<any>[] = [scroll, paylater, sunkcost, groupwork, thesis]

export const YEAR_ACCENT: Record<number, { solid: string; soft: string }> = {
  1: { solid: 'var(--color-y1)', soft: 'var(--color-y1-soft)' },
  2: { solid: 'var(--color-y2)', soft: 'var(--color-y2-soft)' },
  3: { solid: 'var(--color-y3)', soft: 'var(--color-y3-soft)' },
  4: { solid: 'var(--color-y4)', soft: 'var(--color-y4-soft)' },
}

export function momentLabel(def: Pick<StationDef, 'year' | 'term'>): string {
  return def.term ? `ปี ${def.year} · เทอม ${def.term}` : `ปี ${def.year}`
}
