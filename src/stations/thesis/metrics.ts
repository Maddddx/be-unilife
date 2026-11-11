import { clampScore, levelOf } from '../../core/levels'
import type { Fact, TraitScore } from '../../core/types'

/** Game constants (shared by Play and scoring). */
export const DAYS = 7
export const TOTAL_UNITS = 12
export const PARTS = 3
export const UNITS_PER_PART = TOTAL_UNITS / PARTS // 4
/** most units one normal day can hold (plan and actual, days 1..DAYS-1) */
export const MAX_PER_DAY = 6
/** max units on a day the player goes out with friends */
export const MAX_IF_OUT = 2
/** units above this in one day start to cost quality ("ปั่น") */
export const CRUNCH_FROM = 4
export const CRUNCH_PENALTY = 3
export const MISSED_DEADLINE_PENALTY = 10

export interface Raw {
  total: number
  days: number
  /** day (1..days) the player chose as their own deadline for part 1 and part 2 */
  deadlines: [number, number]
  /** planned units per day, length = days */
  plan: number[]
  /** units actually done per day, length = days (last day is forced to finish) */
  actual: number[]
  /** temptation id shown each day ('' = none) */
  temptations: string[]
  /** did the player accept the temptation that day */
  wentOut: boolean[]
}

const num = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, x) : 0)

function norm(raw: Raw) {
  const days = Math.max(1, Math.round(num(raw?.days)) || DAYS)
  const total = num(raw?.total) || TOTAL_UNITS
  const arr = (a: unknown) => Array.from({ length: days }, (_, i) => num(Array.isArray(a) ? a[i] : 0))
  const dl = Array.isArray(raw?.deadlines) ? raw.deadlines : []
  const deadlines = [0, 1].map((i) => Math.min(days, Math.max(1, Math.round(num(dl[i])) || days)))
  return {
    days,
    total,
    plan: arr(raw?.plan),
    actual: arr(raw?.actual),
    deadlines,
    wentOut: Array.from({ length: days }, (_, i) => Boolean(raw?.wentOut?.[i])),
  }
}

function cumulative(xs: number[]): number[] {
  let s = 0
  return xs.map((x) => (s += x))
}

/** Day index (0-based) at which each self-set sub-deadline was missed, or null if met. */
export function missedDeadlines(raw: Raw): (number | null)[] {
  const n = norm(raw)
  const cum = cumulative(n.actual)
  return n.deadlines.map((d, part) => {
    const need = Math.min(n.total, ((part + 1) * n.total) / PARTS)
    return cum[d - 1] + 1e-9 >= need ? null : d - 1
  })
}

/**
 * In-game "quality" of the submitted project (feedback only, NOT the trait score):
 * 100 − 10 per missed self-set sub-deadline − 3 per unit above 4 done in a single day.
 */
export function quality(raw: Raw): number {
  const n = norm(raw)
  const missed = missedDeadlines(raw).filter((m) => m !== null).length
  const crunch = n.actual.reduce((s, a) => s + Math.max(0, a - CRUNCH_FROM), 0)
  return Math.max(0, Math.round(100 - MISSED_DEADLINE_PENALTY * missed - CRUNCH_PENALTY * crunch))
}

/**
 * Score (0 = rational benchmark: a time-consistent planner who does what they planned and spreads work).
 *
 *   P_k, A_k = cumulative planned / actual units by end of day k
 *   gap      = Σ_{k<last} max(0, P_k − A_k) / Σ_{k<last} P_k        (0..1; 0 when the plan put nothing before the last day)
 *              → share of the planned progress that slipped behind schedule (being ahead never counts)
 *   backload = max(0, (actual share done on the last 2 days − 2/7) / (1 − 2/7))   (0..1; 0 for a smooth or front-loaded run)
 *   score    = 100 × (0.7 × gap + 0.3 × backload), clamped; thresholds [25, 60] are our own.
 *
 * Did-as-planned with a spread plan → 0. Spread plan but everything crammed at the end → 100.
 * Planned to cram and did → 30 (backload only). The deadline choice is reported as a fact, not scored.
 */
export function score(raw: Raw): TraitScore {
  const n = norm(raw)
  const P = cumulative(n.plan)
  const A = cumulative(n.actual)
  const last = n.days - 1

  let shortfall = 0
  let planned = 0
  let worstDay = -1
  let worstGap = 0
  for (let k = 0; k < last; k++) {
    const g = Math.max(0, P[k] - A[k])
    shortfall += g
    planned += P[k]
    if (g > worstGap) {
      worstGap = g
      worstDay = k
    }
  }
  const gap = planned > 0 ? Math.min(1, shortfall / planned) : 0

  const doneTotal = A[last] ?? 0
  const tailDays = Math.min(2, n.days)
  const tail = n.actual.slice(n.days - tailDays).reduce((s, x) => s + x, 0)
  const smooth = tailDays / n.days
  const tailShare = doneTotal > 0 ? tail / doneTotal : 0
  const backload = smooth < 1 ? Math.min(1, Math.max(0, (tailShare - smooth) / (1 - smooth))) : 0

  const s = clampScore(100 * (0.7 * gap + 0.3 * backload))

  let headline: string
  if (worstDay >= 0 && gap >= 0.15) {
    headline = `แผนบอกว่าจบวันที่ ${worstDay + 1} จะเสร็จ ${P[worstDay]} ชิ้น ของจริงทำได้ ${A[worstDay]} ชิ้น`
  } else if (backload >= 0.3) {
    headline = 'ทำตามแผนได้ แต่ทั้งแผนและงานจริงไปกองอยู่ช่วงท้าย'
  } else {
    headline = 'ทำได้ใกล้แผนที่วางไว้ และกระจายงานได้ค่อนข้างเรียบ'
  }

  const early = n.deadlines.filter((d) => d < n.days).length
  const missed = missedDeadlines(raw).filter((m) => m !== null).length
  const peak = Math.max(0, ...n.actual)
  const facts: Fact[] = [
    { label: 'แผนรายวัน (ชิ้น)', value: n.plan.join(' · ') },
    { label: 'ที่ทำจริง (ชิ้น)', value: n.actual.join(' · ') },
    {
      label: 'deadline ย่อยที่ตั้งเอง',
      value: `พาร์ต 1 วันที่ ${n.deadlines[0]}, พาร์ต 2 วันที่ ${n.deadlines[1]} (ตั้งก่อนวันส่ง ${early}/2)`,
    },
    { label: 'deadline ย่อยที่หลุด', value: `${missed} ครั้ง` },
    { label: 'วันที่ทำเยอะสุด', value: `${peak} ชิ้น` },
    { label: 'วันที่ออกไปกับเพื่อน', value: `${n.wentOut.filter(Boolean).length} วัน` },
    { label: 'คุณภาพงานในเกม', value: `${quality(raw)}/100` },
  ]

  return { score: s, level: levelOf(s), headline, facts }
}

/** Neutral memory line — describes what happened, never names a bias. */
export function memoryLine(raw: Raw): string {
  const n = norm(raw)
  const planDays = n.plan.filter((p) => p > 0)
  const perDay = planDays.length ? Math.round(planDays.reduce((s, x) => s + x, 0) / planDays.length) : 0
  const last = n.days - 1
  const lastActual = n.actual[last]
  if (perDay === 0) return `คืนสุดท้ายทำไป ${lastActual} ชิ้น แล้วก็ส่งทัน`
  // the day the player did the most, latest one on ties (so a final-night cram wins)
  let peakDay = 0
  n.actual.forEach((a, i) => {
    if (a >= n.actual[peakDay]) peakDay = i
  })
  const peak = n.actual[peakDay]
  if (peak > Math.max(perDay, n.plan[peakDay])) {
    return peakDay === last
      ? `วางแผนไว้วันละ ${perDay} ชิ้น... คืนสุดท้ายทำไป ${peak}`
      : `วางแผนไว้วันละ ${perDay} ชิ้น... วันที่ ${peakDay + 1} ทำรวดเดียว ${peak}`
  }
  return `วางแผนไว้วันละ ${perDay} ชิ้น ทำจริงก็ประมาณนั้น ส่งทันแบบได้นอน`
}
