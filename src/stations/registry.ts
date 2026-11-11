import type { StationDef } from '../core/types'
import { scroll } from './scroll'
import { paylater } from './paylater'
import { sunkcost } from './sunkcost'
import { groupwork } from './groupwork'
import { thesis } from './thesis'

/** Play order = chronological order through university. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STATIONS: StationDef<any>[] = [scroll, paylater, sunkcost, groupwork, thesis]

// Re-exported for existing imports; stations should import from '../../core/accent'.
export { YEAR_ACCENT, GRAD_ACCENT, type Accent } from '../core/accent'

export function momentLabel(def: Pick<StationDef, 'year' | 'term'>): string {
  return def.term ? `ปี ${def.year} เทอม ${def.term}` : `ปี ${def.year}`
}
