import { create } from 'zustand'
import { STATIONS } from '../stations/registry'
import { randomSeed } from './rng'
import type { StationId, StationResult } from './types'

export type Phase = 'landing' | 'intro' | 'play' | 'memory' | 'graduation' | 'reveal'

interface GameState {
  phase: Phase
  /** index into STATIONS (play order) */
  index: number
  seed: number
  results: Partial<Record<StationId, StationResult>>

  start: () => void
  beginPlay: () => void
  complete: (raw: unknown) => void
  next: () => void
  toReveal: () => void
  restart: () => void
  /** dev helper: jump straight to a phase/station */
  jump: (phase: Phase, index?: number) => void
  /** dev helper: inject results (e.g. to preview the reveal) */
  setResults: (results: Partial<Record<StationId, StationResult>>) => void
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'landing',
  index: 0,
  seed: randomSeed(),
  results: {},

  start: () => set({ phase: 'intro', index: 0, results: {}, seed: randomSeed() }),

  beginPlay: () => set({ phase: 'play' }),

  complete: (raw) => {
    const { index, results } = get()
    const def = STATIONS[index]
    const result: StationResult = {
      id: def.id,
      raw,
      trait: def.score(raw),
      memoryLine: def.memoryLine(raw),
    }
    set({ phase: 'memory', results: { ...results, [def.id]: result } })
  },

  next: () => {
    const { index } = get()
    if (index + 1 < STATIONS.length) set({ phase: 'intro', index: index + 1 })
    else set({ phase: 'graduation' })
  },

  toReveal: () => set({ phase: 'reveal' }),

  restart: () => set({ phase: 'landing', index: 0, results: {}, seed: randomSeed() }),

  jump: (phase, index = 0) => set({ phase, index }),

  setResults: (results) => set({ results }),
}))
