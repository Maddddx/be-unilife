import { describe, expect, it } from 'vitest'
import { createRng } from '../../core/rng'
import { components, memoryLine, score, type OfferRecord, type Raw } from './metrics'
import { ALLOWANCE, ESSENTIALS, balanceIn, buildSchedule, canAfford, dueInMonth, remainingAfter } from './model'

/** Build a Raw from a buy rule, simulating the money flow exactly like Play does. */
function play(seed: number, buy: (o: OfferRecord) => boolean, perceive: (actual: number) => number | null): Raw {
  const schedule = buildSchedule(createRng(seed))
  const offers: OfferRecord[] = []
  const startBalances: number[] = []
  for (const m of [1, 2, 3]) {
    startBalances.push(balanceIn(offers, m))
    for (const o of schedule.filter((x) => x.month === m)) {
      const rec: OfferRecord = {
        id: o.id,
        pair: o.pair,
        month: o.month,
        framing: o.framing,
        price: o.price,
        months: o.months,
        affordable: canAfford(balanceIn(offers, m), o),
        bought: false,
      }
      rec.bought = rec.affordable && buy(rec)
      offers.push(rec)
    }
  }
  const actualNextMonth = dueInMonth(offers, 4)
  return {
    offers,
    startBalances,
    actualNextMonth,
    actualRemaining: remainingAfter(offers, 3),
    perceivedNextMonth: offers.some((o) => o.bought && o.framing === 'installment') ? perceive(actualNextMonth) : null,
  }
}

const BIAS_WORDS = /present bias|mental accounting|framing|pain of paying|bias|ไบแอส|อคติ/i

describe('schedule', () => {
  it('is counterbalanced: 4 full + 4 installment, one of each per pair, months 3/3/2', () => {
    for (let seed = 1; seed < 40; seed++) {
      const s = buildSchedule(createRng(seed))
      expect(s).toHaveLength(8)
      expect(s.filter((o) => o.framing === 'installment')).toHaveLength(4)
      for (const p of [1, 2, 3, 4]) {
        const fr = s.filter((o) => o.pair === p).map((o) => o.framing).sort()
        expect(fr).toEqual(['full', 'installment'])
      }
      expect([1, 2, 3].map((m) => s.filter((o) => o.month === m).length)).toEqual([3, 3, 2])
    }
  })
  it('is deterministic per seed', () => {
    expect(buildSchedule(createRng(7))).toEqual(buildSchedule(createRng(7)))
  })
})

describe('money model', () => {
  const p = (month: number, months: number, price: number) => ({
    month,
    months,
    price,
    framing: 'installment' as const,
    bought: true,
  })
  it('charges installments from the purchase month on', () => {
    const ps = [p(1, 3, 1596), p(3, 10, 2970)]
    expect(dueInMonth(ps, 1)).toBe(532)
    expect(dueInMonth(ps, 3)).toBe(532 + 297)
    expect(dueInMonth(ps, 4)).toBe(297)
    expect(remainingAfter(ps, 3)).toBe(297 * 9)
  })
  it('starting balance = allowance − essentials − auto-debits', () => {
    expect(balanceIn([p(1, 6, 1980)], 2)).toBe(ALLOWANCE - ESSENTIALS - 330)
  })
})

describe('score', () => {
  it('rational: buys everything affordable regardless of framing, knows the bill → 0', () => {
    for (let seed = 1; seed < 20; seed++) {
      const raw = play(seed, () => true, (a) => a)
      // whatever was affordable in each framing was bought → rates equal (both 1)
      expect(score(raw).score).toBe(0)
    }
  })
  it('rational: buys nothing → 0', () => {
    const raw = play(3, () => false, () => 0)
    expect(raw.perceivedNextMonth).toBeNull()
    expect(score(raw).score).toBe(0)
    expect(score(raw).level).toBe('low')
  })
  it('rational: same buy rate in both framings (half of each) + accurate bill → 0', () => {
    const offers: OfferRecord[] = [1, 2, 3, 4].flatMap((pair) => [
      { id: `f${pair}`, pair, month: 1, framing: 'full' as const, price: 1000, months: 4, affordable: true, bought: pair <= 2 },
      { id: `i${pair}`, pair, month: 1, framing: 'installment' as const, price: 1000, months: 4, affordable: true, bought: pair > 2 },
    ])
    const raw: Raw = { offers, perceivedNextMonth: 500, actualNextMonth: 500, actualRemaining: 0, startBalances: [3500] }
    expect(components(raw).framingGap).toBe(0)
    expect(score(raw).score).toBe(0)
  })
  it('unaffordable offers are excluded from buy rates', () => {
    const offers: OfferRecord[] = [
      { id: 'a', pair: 1, month: 3, framing: 'full', price: 2970, months: 10, affordable: false, bought: false },
      { id: 'b', pair: 1, month: 1, framing: 'installment', price: 2970, months: 10, affordable: true, bought: true },
      { id: 'c', pair: 2, month: 1, framing: 'full', price: 1980, months: 6, affordable: true, bought: true },
    ]
    const raw: Raw = { offers, perceivedNextMonth: 297, actualNextMonth: 297, actualRemaining: 0, startBalances: [] }
    expect(components(raw).rateFull).toBe(1)
    expect(score(raw).score).toBe(0)
  })
  it('biased: buys only installments and thinks nothing is due → high', () => {
    for (let seed = 1; seed < 20; seed++) {
      const raw = play(seed, (o) => o.framing === 'installment', () => 0)
      const t = score(raw)
      expect(t.level).toBe('high')
      expect(t.score).toBeGreaterThanOrEqual(90)
    }
  })
  it('only the positive framing gap counts', () => {
    const raw = play(9, (o) => o.framing === 'full', () => 0)
    expect(components(raw).framingGap).toBe(0)
    expect(score(raw).score).toBe(0)
  })
  it('overestimating the bill is not penalised', () => {
    const raw = play(11, () => true, (a) => a * 3 + 1000)
    expect(components(raw).underEstimate).toBe(0)
  })
  it('half underestimate alone → about 25', () => {
    const raw = play(4, () => true, (a) => a / 2)
    expect(score(raw).score).toBeGreaterThanOrEqual(20)
    expect(score(raw).score).toBeLessThanOrEqual(30)
  })
  it('edge cases stay in bounds and do not crash', () => {
    const empty: Raw = { offers: [], perceivedNextMonth: null, actualNextMonth: 0, actualRemaining: 0, startBalances: [] }
    expect(score(empty).score).toBe(0)
    const weird = { ...empty, perceivedNextMonth: -500, actualNextMonth: Number.NaN } as Raw
    expect(score(weird).score).toBe(0)
    const huge = play(2, (o) => o.framing === 'installment', () => 1e12)
    const s = score(huge).score
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => score({} as any)).not.toThrow()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => memoryLine({} as any)).not.toThrow()
  })
  it('facts and headline are filled', () => {
    const t = score(play(1, (o) => o.framing === 'installment', () => 0))
    expect(t.headline.length).toBeGreaterThan(0)
    expect(t.facts).toHaveLength(5)
  })
})

describe('memoryLine', () => {
  it('never names a bias, in every branch', () => {
    const rules: [(o: OfferRecord) => boolean, (a: number) => number][] = [
      [() => false, () => 0],
      [() => true, (a) => a],
      [(o) => o.framing === 'installment', () => 0],
      [(o) => o.framing === 'full', () => 0],
      [(o) => o.pair === 4, () => 0],
    ]
    for (let seed = 1; seed < 15; seed++)
      for (const [b, p] of rules) {
        const line = memoryLine(play(seed, b, p))
        expect(line.length).toBeGreaterThan(0)
        expect(line).not.toMatch(BIAS_WORDS)
      }
  })
})
