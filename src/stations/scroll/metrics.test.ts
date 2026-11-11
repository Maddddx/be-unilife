import { describe, expect, it } from 'vitest'
import { formatDuration, memoryLine, overrunRatio, score, type Raw } from './metrics'
import { makeCards } from './feed'
import { createRng } from '../../core/rng'

const base: Raw = {
  predictedSec: 60,
  actualSec: 60,
  capped: false,
  cardsSeen: 5,
  commitment: { chosen: false, limitSec: null },
}

const BANNED = /present bias|naive|naivete|sophisticat|self-control|bias|commitment/i

describe('scroll metrics', () => {
  it('rational: stopping at or before the forecast scores 0', () => {
    expect(score(base).score).toBe(0)
    expect(score({ ...base, actualSec: 20 }).score).toBe(0)
    expect(score(base).level).toBe('low')
  })

  it('double the forecast → 50, 4× or more → 100', () => {
    expect(score({ ...base, actualSec: 120 }).score).toBe(50)
    expect(score({ ...base, predictedSec: 30, actualSec: 120 }).score).toBe(100)
    expect(score({ ...base, predictedSec: 15, actualSec: 150, capped: true }).score).toBe(100)
    expect(score({ ...base, predictedSec: 15, actualSec: 150 }).level).toBe('high')
  })

  it('commitment does not change the score but is reported', () => {
    const a = score({ ...base, actualSec: 120 })
    const b = score({ ...base, actualSec: 120, commitment: { chosen: true, limitSec: 60 } })
    expect(b.score).toBe(a.score)
    expect(b.facts.find((f) => f.label.includes('ลิมิต'))?.value).toContain('1 นาที')
    expect(a.facts.find((f) => f.label.includes('ลิมิต'))?.value).toBe('ไม่ตั้ง')
  })

  it('edge cases stay in bounds', () => {
    const weird: Raw[] = [
      { ...base, predictedSec: 0, actualSec: 0 },
      { ...base, predictedSec: 0, actualSec: 1000 },
      { ...base, predictedSec: NaN, actualSec: NaN },
      { ...base, predictedSec: -5, actualSec: Infinity },
      { ...base, commitment: { chosen: true, limitSec: null } },
    ]
    for (const r of weird) {
      const t = score(r)
      expect(t.score).toBeGreaterThanOrEqual(0)
      expect(t.score).toBeLessThanOrEqual(100)
      expect(Number.isFinite(t.score)).toBe(true)
      expect(typeof memoryLine(r)).toBe('string')
    }
    expect(overrunRatio({ predictedSec: 0, actualSec: 0 })).toBe(0)
  })

  it('formats durations in Thai', () => {
    expect(formatDuration(130)).toBe('2 นาที 10 วิ')
    expect(formatDuration(40)).toBe('40 วิ')
    expect(formatDuration(60)).toBe('1 นาที')
    expect(formatDuration(NaN)).toBe('0 วิ')
  })

  it('memory line is neutral and mentions the real time', () => {
    const lines = [
      memoryLine(base),
      memoryLine({ ...base, actualSec: 130 }),
      memoryLine({ ...base, actualSec: 150, capped: true }),
    ]
    expect(lines[1]).toContain('2 นาที 10 วิ')
    expect(lines[2]).toContain('ตีสอง')
    for (const l of lines) expect(l).not.toMatch(BANNED)
  })

  it('feed generation is reproducible with the seeded rng', () => {
    const a = makeCards(createRng(7), 0, 8)
    const b = makeCards(createRng(7), 0, 8)
    expect(a).toEqual(b)
    expect(a).toHaveLength(8)
    expect(a.every((c) => !BANNED.test(c.caption))).toBe(true)
  })
})
