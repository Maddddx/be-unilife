import { describe, expect, it } from 'vitest'
import { classify, LEVELS, memoryLine, payoff, score, slopeOf, sortedAnswers, type Raw } from './metrics'

const make = (unconditional: number, owns: number[], order: number[] = [...LEVELS]): Raw => ({
  unconditional,
  // store in presentation order to check sorting
  conditional: order.map((others) => ({ others, own: owns[LEVELS.indexOf(others as (typeof LEVELS)[number])] })),
  order,
  ms: 40_000,
})

const BIAS_WORDS = /free.?rid|cooperat|conditional|nash|hump|reciproc|public good|social preference/i

describe('groupwork payoff', () => {
  it('contributing 0 is the selfish best response whatever others do', () => {
    for (const o of LEVELS) {
      for (let own = 1; own <= 10; own++) expect(payoff(0, o)).toBeGreaterThan(payoff(own, o))
    }
  })
  it('everyone contributing 10 beats nobody contributing', () => {
    expect(payoff(10, 10)).toBeCloseTo(16)
    expect(payoff(0, 0)).toBe(10)
  })
})

describe('groupwork score', () => {
  it('selfish-rational answers score 0 and are free-riders', () => {
    const r = make(0, [0, 0, 0, 0])
    const t = score(r)
    expect(t.score).toBe(0)
    expect(t.level).toBe('low')
    expect(classify(sortedAnswers(r))).toBe('freeRider')
  })

  it('full contribution everywhere scores 100, unconditional', () => {
    const r = make(10, [10, 10, 10, 10])
    expect(score(r).score).toBe(100)
    expect(score(r).level).toBe('high')
    expect(classify(sortedAnswers(r))).toBe('unconditional')
  })

  it('perfect matcher is a conditional cooperator with slope 1', () => {
    const r = make(5, [0, 3, 6, 9], [6, 0, 9, 3])
    const a = sortedAnswers(r)
    expect(slopeOf(a)).toBeCloseTo(1)
    expect(classify(a)).toBe('conditional')
    expect(score(r).score).toBe(Math.round((100 * (5 + 0 + 3 + 6 + 9)) / 5 / 10))
    expect(score(r).headline).toContain('conditional cooperator')
  })

  it('detects hump-shaped and decreasing ("other")', () => {
    expect(classify(sortedAnswers(make(4, [1, 6, 7, 2])))).toBe('hump')
    expect(classify(sortedAnswers(make(4, [9, 6, 3, 0])))).toBe('other')
  })

  it('handles empty / malformed / extreme input without crashing or leaving bounds', () => {
    const empty = { unconditional: NaN, conditional: [], order: [], ms: 0 } as Raw
    const t = score(empty)
    expect(t.score).toBe(0)
    expect(memoryLine(empty)).toBeTypeOf('string')
    const wild = make(999, [-5, 50, Infinity, NaN])
    const w = score(wild)
    expect(w.score).toBeGreaterThanOrEqual(0)
    expect(w.score).toBeLessThanOrEqual(100)
    expect(score(null as unknown as Raw).score).toBe(0)
  })
})

describe('groupwork memoryLine', () => {
  it('never names the pattern', () => {
    const cases = [
      make(0, [0, 0, 0, 0]),
      make(5, [0, 3, 6, 9]),
      make(7, [7, 7, 7, 7]),
      make(4, [1, 6, 7, 2]),
      make(4, [9, 6, 3, 0]),
    ]
    const lines = new Set(cases.map(memoryLine))
    expect(lines.size).toBe(5)
    for (const l of lines) expect(l).not.toMatch(BIAS_WORDS)
  })
})
