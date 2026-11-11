import { describe, expect, it } from 'vitest'
import { memoryLine, missedDeadlines, quality, score, type Raw } from './metrics'

const make = (plan: number[], actual: number[], deadlines: [number, number] = [3, 5], wentOut?: boolean[]): Raw => ({
  total: 12,
  days: 7,
  deadlines,
  plan,
  actual,
  temptations: ['a', 'b', 'c', 'd', 'e', 'f', ''],
  wentOut: wentOut ?? plan.map(() => false),
})

const SMOOTH = [2, 2, 2, 2, 2, 1, 1]
const BIAS_WORDS = /procrastinat|planning fallacy|present bias|ผัดวัน|ขี้เกียจ|bias/i

describe('thesis score', () => {
  it('did exactly the smooth plan → 0', () => {
    const t = score(make(SMOOTH, SMOOTH))
    expect(t.score).toBe(0)
    expect(t.level).toBe('low')
  })

  it('working ahead of plan never counts as a gap', () => {
    expect(score(make(SMOOTH, [4, 4, 4, 0, 0, 0, 0])).score).toBe(0)
  })

  it('spread plan but everything crammed on the last night → 100', () => {
    const t = score(make(SMOOTH, [0, 0, 0, 0, 0, 0, 12]))
    expect(t.score).toBe(100)
    expect(t.level).toBe('high')
    expect(t.headline).toContain('ของจริงทำได้')
  })

  it('planned to cram and did → backload only (mid-low)', () => {
    const plan = [0, 0, 0, 0, 0, 6, 6]
    const t = score(make(plan, plan, [7, 7]))
    expect(t.score).toBe(30)
  })

  it('half-slipping is in between', () => {
    const s = score(make(SMOOTH, [1, 1, 1, 1, 2, 2, 4])).score
    expect(s).toBeGreaterThan(20)
    expect(s).toBeLessThan(80)
  })

  it('reports deadline choice and misses as facts', () => {
    const raw = make(SMOOTH, [0, 0, 0, 0, 0, 0, 12], [2, 4])
    expect(missedDeadlines(raw)).toEqual([1, 3])
    const facts = score(raw).facts.map((f) => f.value).join('|')
    expect(facts).toContain('ตั้งก่อนวันส่ง 2/2')
    expect(facts).toContain('2 ครั้ง')
  })

  it('quality: −10 per missed sub-deadline, −3 per crunch unit above 4/day', () => {
    expect(quality(make(SMOOTH, SMOOTH))).toBe(100)
    // two misses (−20) and 8 crunch units (−24)
    expect(quality(make(SMOOTH, [0, 0, 0, 0, 0, 0, 12], [2, 4]))).toBe(56)
    // last-day deadlines can't be missed
    expect(missedDeadlines(make(SMOOTH, [0, 0, 0, 0, 0, 0, 12], [7, 7]))).toEqual([null, null])
  })

  it('edge cases stay in bounds', () => {
    const cases: Raw[] = [
      make([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]),
      make([], [], [7, 7]),
      make([99, 99, 99, 99, 99, 99, 99], [0, 0, 0, 0, 0, 0, 0]),
      { total: NaN, days: 0, deadlines: [-3, 99], plan: [NaN], actual: [-5], temptations: [], wentOut: [] } as Raw,
      {} as Raw,
    ]
    for (const r of cases) {
      const t = score(r)
      expect(t.score).toBeGreaterThanOrEqual(0)
      expect(t.score).toBeLessThanOrEqual(100)
      expect(typeof memoryLine(r)).toBe('string')
      expect(quality(r)).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('thesis memoryLine', () => {
  it('describes a final-night cram neutrally', () => {
    const line = memoryLine(make(SMOOTH, [0, 0, 0, 0, 0, 0, 12]))
    expect(line).toBe('วางแผนไว้วันละ 2 ชิ้น... คืนสุดท้ายทำไป 12')
  })
  it('mentions a mid-week burst', () => {
    expect(memoryLine(make(SMOOTH, [0, 0, 6, 2, 2, 1, 1]))).toContain('วันที่ 3 ทำรวดเดียว 6')
  })
  it('on-plan run', () => {
    expect(memoryLine(make(SMOOTH, SMOOTH))).toContain('ประมาณนั้น')
  })
  it('never names a bias', () => {
    const runs = [
      make(SMOOTH, SMOOTH),
      make(SMOOTH, [0, 0, 0, 0, 0, 0, 12]),
      make([0, 0, 0, 0, 0, 6, 6], [0, 0, 0, 0, 0, 6, 6]),
      make([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 12]),
    ]
    for (const r of runs) expect(memoryLine(r)).not.toMatch(BIAS_WORDS)
  })
})
