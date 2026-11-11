import { describe, expect, it } from 'vitest'
import { COURSES, gpa, gradeOf, professorRemark } from './transcript'
import type { StationResult } from './types'

const r = (id: StationResult['id'], score: number): StationResult => ({
  id,
  raw: null,
  memoryLine: '',
  trait: { score, level: 'low', headline: '', facts: [] },
})

describe('gradeOf', () => {
  it('maps the rational benchmark to A and the extreme to F', () => {
    expect(gradeOf(0).grade).toBe('A')
    expect(gradeOf(100).grade).toBe('F')
  })
  it('is monotone and handles bad input', () => {
    let last = 5
    for (let s = 0; s <= 100; s++) {
      const p = gradeOf(s).points
      expect(p).toBeLessThanOrEqual(last)
      last = p
    }
    expect(gradeOf(NaN).grade).toBe('A')
    expect(gradeOf(-5).grade).toBe('A')
    expect(gradeOf(400).grade).toBe('F')
  })
})

describe('gpa', () => {
  it('averages grade points and returns null with no results', () => {
    expect(gpa({})).toBeNull()
    expect(gpa({ scroll: r('scroll', 0), thesis: r('thesis', 100) })).toBe(2)
  })
})

describe('professorRemark', () => {
  it('picks the most "human" course', () => {
    expect(professorRemark({ scroll: r('scroll', 10), thesis: r('thesis', 80) })).toBe(COURSES.thesis.remark)
  })
  it('jokes when everything is near-rational', () => {
    expect(professorRemark({ scroll: r('scroll', 5) })).toContain('rational')
  })
  it('never names a person-level judgement word', () => {
    for (const c of Object.values(COURSES)) expect(c.remark).not.toMatch(/โง่|ขี้เกียจ|นิสัยเสีย/)
  })
})
