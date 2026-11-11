import { describe, expect, it } from 'vitest'
import { createRng } from '../../core/rng'
import { memoryLine, score, type Answer, type Choice, type Raw } from './metrics'
import { PAIR_IDS, SCENARIOS, arrangeDeck, hasAdjacentPair, type PairId } from './scenarios'

/** Build a full Raw from a per-pair [sunkChoice, freshChoice] map. */
function rawFrom(map: Partial<Record<PairId, [Choice, Choice]>>): Raw {
  const answers: Answer[] = []
  SCENARIOS.forEach((s, i) => {
    const pick = map[s.pairId]
    if (!pick) return
    answers.push({
      scenarioId: s.id,
      pairId: s.pairId,
      sunk: s.sunk,
      choice: s.sunk ? pick[0] : pick[1],
      position: i,
      ms: 3000,
    })
  })
  return { answers }
}

const all = (sunk: Choice, fresh: Choice) =>
  Object.fromEntries(PAIR_IDS.map((p) => [p, [sunk, fresh]])) as Record<PairId, [Choice, Choice]>

describe('sunkcost score', () => {
  it('consistent answers (all stop / all go / mixed) score 0', () => {
    expect(score(rawFrom(all('stop', 'stop'))).score).toBe(0)
    expect(score(rawFrom(all('go', 'go'))).score).toBe(0)
    const mixed = score(rawFrom({ concert: ['go', 'go'], track: ['stop', 'stop'], gym: ['go', 'go'], project: ['stop', 'stop'] }))
    expect(mixed.score).toBe(0)
    expect(mixed.level).toBe('low')
  })

  it('go only when sunk in every pair scores 100 / high', () => {
    const t = score(rawFrom(all('go', 'stop')))
    expect(t.score).toBe(100)
    expect(t.level).toBe('high')
  })

  it('counts share of pairs in the sunk direction', () => {
    const t = score(rawFrom({ concert: ['go', 'stop'], track: ['go', 'stop'], gym: ['stop', 'stop'], project: ['go', 'go'] }))
    expect(t.score).toBe(50)
    expect(t.level).toBe('mid')
  })

  it('reverse inconsistency is reported but not counted', () => {
    const t = score(rawFrom(all('stop', 'go')))
    expect(t.score).toBe(0)
    expect(t.facts.some((f) => f.label.includes('กลับทาง') && f.value === '4 คู่')).toBe(true)
  })

  it('handles empty / partial / malformed input', () => {
    expect(score({ answers: [] }).score).toBe(0)
    expect(score({} as Raw).score).toBe(0)
    const partial = score(rawFrom({ concert: ['go', 'stop'] }))
    expect(partial.score).toBe(100)
    // half a pair only -> nothing comparable
    const half = score({ answers: [rawFrom({ gym: ['go', 'stop'] }).answers[0]] })
    expect(half.score).toBe(0)
    for (const r of [rawFrom(all('go', 'stop')), { answers: [] }]) {
      const s = score(r).score
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(100)
    }
  })
})

describe('sunkcost memoryLine', () => {
  const banned = /sunk|bias|เสียดาย|fallacy|จมไป/i
  it('stays neutral', () => {
    for (const r of [rawFrom(all('go', 'stop')), rawFrom(all('stop', 'stop')), rawFrom(all('stop', 'go')), { answers: [] }]) {
      expect(memoryLine(r)).not.toMatch(banned)
    }
  })
  it('mentions the number of decisions', () => {
    expect(memoryLine(rawFrom(all('go', 'stop')))).toContain('8 เรื่อง')
  })
})

describe('sunkcost deck', () => {
  it('has 4 pairs, each with one sunk and one fresh card', () => {
    expect(SCENARIOS).toHaveLength(8)
    for (const p of PAIR_IDS) {
      const cards = SCENARIOS.filter((s) => s.pairId === p)
      expect(cards.map((c) => c.sunk).sort()).toEqual([false, true])
    }
  })

  it('never puts the two halves of a pair next to each other, and is reproducible', () => {
    for (let seed = 0; seed < 300; seed++) {
      const deck = arrangeDeck(createRng(seed))
      expect(deck).toHaveLength(8)
      expect(new Set(deck.map((d) => d.id)).size).toBe(8)
      expect(hasAdjacentPair(deck)).toBe(false)
    }
    expect(arrangeDeck(createRng(42)).map((d) => d.id)).toEqual(arrangeDeck(createRng(42)).map((d) => d.id))
  })

  it('falls back to a valid deck when the rng is degenerate', () => {
    const deck = arrangeDeck(() => 0)
    expect(deck).toHaveLength(8)
    expect(hasAdjacentPair(deck)).toBe(false)
  })

  it('card copy never names the bias', () => {
    const banned = /sunk|bias|เสียดาย|fallacy|เสียเปล่า/i
    for (const s of SCENARIOS) for (const t of [s.text, s.ask, s.go, s.stop]) expect(t).not.toMatch(banned)
  })
})
