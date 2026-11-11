import { clampScore, levelOf } from '../../core/levels'
import type { TraitScore } from '../../core/types'

// TODO(Phase 1): real raw shape + scoring. 0 = rational benchmark.
export interface Raw {
  stub: true
}

export function score(_raw: Raw): TraitScore {
  const s = clampScore(0)
  return { score: s, level: levelOf(s), headline: 'TODO', facts: [] }
}

export function memoryLine(_raw: Raw): string {
  return 'TODO'
}
