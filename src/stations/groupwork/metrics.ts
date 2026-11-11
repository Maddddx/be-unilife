import { clampScore, levelOf } from '../../core/levels'
import type { Fact, TraitScore } from '../../core/types'

/*
 * Station "งานกลุ่มปีสาม" — a one-shot linear public-goods game, strategy method
 * (Fischbacher, Gächter & Fehr 2001 style).
 *
 * Payoff (shown to the player in plain Thai):
 *   - 4 members, each has ENDOWMENT = 10 hours this week.
 *   - every hour you KEEP is worth 1 point to you (sleep, part-time job, friends).
 *   - every hour ANYONE puts into the group project raises the shared grade:
 *     each of the 4 members gets +MPCR = 0.4 points (same grade for everyone).
 *   => your payoff = (10 - own) + 0.4 * (own + sum of others)
 *   An hour you contribute costs you 1 and returns you 0.4, so whatever the others do,
 *   the payoff-maximising (selfish / Nash) answer is 0. The group optimum is 10 each
 *   (16 points each vs 10 when nobody contributes) — a social dilemma.
 *
 * Benchmark (score 0) = the selfish Nash player: contribute 0 in every decision.
 * Being far from it is NOT "bad": cooperating is socially sensible; the reveal says so.
 *
 * score = 100 * mean(own contribution over all 5 decisions: 1 unconditional + 4 conditional) / 10
 *   -> 0 = always 0 hours, 100 = always 10 hours. Levels use the shared cut-offs [25, 60] (our own,
 *   not a population norm).
 *
 * Type (from the conditional table, sorted by others' average; FGF-like rules, our own tolerances):
 *   1. free-rider     : every conditional answer <= 1 hour
 *   2. hump-shaped    : peak at an interior level, at least 2 h above both ends
 *   3. conditional    : OLS slope of own on others >= 0.3
 *   4. unconditional  : range (max - min) <= 2 hours (and not a free-rider)
 *   5. other          : anything else (e.g. decreasing)
 */

export const ENDOWMENT = 10
export const MPCR = 0.4
export const GROUP_SIZE = 4
/** others' average contribution levels asked in the conditional table */
export const LEVELS = [0, 3, 6, 9] as const

export interface CondAnswer {
  /** average hours of the other 3 members (one of LEVELS) */
  others: number
  /** player's own hours, 0..ENDOWMENT */
  own: number
}

export interface Raw {
  /** hours put in before knowing what others do */
  unconditional: number
  /** conditional answers, in presentation order */
  conditional: CondAnswer[]
  /** LEVELS in the order they were shown (randomised with rng) */
  order: number[]
  /** real elapsed play time, ms */
  ms: number
}

export type CoopType = 'freeRider' | 'conditional' | 'unconditional' | 'hump' | 'other'

export const TYPE_LABEL: Record<CoopType, string> = {
  freeRider: 'Free-rider (เก็บเวลาไว้กับตัว)',
  conditional: 'Conditional cooperator (ลงแรงตามเพื่อน)',
  unconditional: 'Unconditional contributor (ลงเท่าเดิมไม่สนเพื่อน)',
  hump: 'Hump-shaped (ตามเพื่อนถึงจุดหนึ่งแล้วถอย)',
  other: 'แบบอื่น (สูตรของตัวเอง)',
}

function hours(x: unknown): number {
  const n = typeof x === 'number' && Number.isFinite(x) ? x : 0
  return Math.min(ENDOWMENT, Math.max(0, n))
}

/** conditional answers cleaned and sorted by others' level (ascending) */
export function sortedAnswers(raw: Raw): CondAnswer[] {
  const list = Array.isArray(raw?.conditional) ? raw.conditional : []
  return list
    .map((a) => ({ others: hours(a?.others), own: hours(a?.own) }))
    .sort((a, b) => a.others - b.others)
}

/** OLS slope of own on others. 0 when undefined (fewer than 2 distinct x). */
export function slopeOf(answers: CondAnswer[]): number {
  const n = answers.length
  if (n < 2) return 0
  const mx = answers.reduce((s, a) => s + a.others, 0) / n
  const my = answers.reduce((s, a) => s + a.own, 0) / n
  let sxy = 0
  let sxx = 0
  for (const a of answers) {
    sxy += (a.others - mx) * (a.own - my)
    sxx += (a.others - mx) ** 2
  }
  return sxx === 0 ? 0 : sxy / sxx
}

export function classify(answers: CondAnswer[]): CoopType {
  if (answers.length === 0) return 'freeRider'
  const owns = answers.map((a) => a.own)
  const max = Math.max(...owns)
  const min = Math.min(...owns)
  if (max <= 1) return 'freeRider'
  const peak = owns.indexOf(max)
  const last = owns.length - 1
  if (peak > 0 && peak < last && max - owns[0] >= 2 && max - owns[last] >= 2) return 'hump'
  if (slopeOf(answers) >= 0.3) return 'conditional'
  if (max - min <= 2) return 'unconditional'
  return 'other'
}

/** player's payoff for a given decision (used in copy/tests; documents the game) */
export function payoff(own: number, othersAvg: number): number {
  const o = hours(own)
  return ENDOWMENT - o + MPCR * (o + (GROUP_SIZE - 1) * hours(othersAvg))
}

const fmt = (x: number) => (Math.round(x * 10) / 10).toLocaleString('th-TH', { maximumFractionDigits: 1 })

export function score(raw: Raw): TraitScore {
  const answers = sortedAnswers(raw)
  const unc = hours(raw?.unconditional)
  const all = [unc, ...answers.map((a) => a.own)]
  const mean = all.reduce((s, x) => s + x, 0) / all.length
  const s = clampScore((100 * mean) / ENDOWMENT)
  const type = classify(answers)
  const slope = slopeOf(answers)
  const avgCond = answers.length ? answers.reduce((t, a) => t + a.own, 0) / answers.length : 0

  const headline: Record<CoopType, string> = {
    freeRider: 'แบบ free-rider: ตรงกับคำตอบที่ได้แต้มส่วนตัวสูงสุด แต่ถ้าทั้งกลุ่มคิดแบบนี้ ทุกคนได้น้อยลง',
    conditional: `แบบ conditional cooperator: เพื่อนลงเพิ่ม 1 ชม. คุณลงเพิ่มราว ${fmt(slope)} ชม.`,
    unconditional: `แบบ unconditional: คุณลงราว ${fmt(avgCond)} ชม. ไม่ว่าเพื่อนจะลงเท่าไร`,
    hump: 'แบบ hump-shaped: คุณลงตามเพื่อนช่วงแรก แล้วลดลงเมื่อเพื่อนลงเยอะ',
    other: 'แบบเฉพาะตัว: การลงแรงของคุณไม่ได้ขึ้นลงตามเพื่อนตรง ๆ',
  }

  const facts: Fact[] = [
    { label: 'ประเภท', value: TYPE_LABEL[type] },
    { label: 'ตอนยังไม่รู้ว่าเพื่อนลงเท่าไร', value: `${fmt(unc)} จาก ${ENDOWMENT} ชม.` },
    {
      label:
        'ถ้าเพื่อนลงเฉลี่ย ' +
        (answers.length ? answers.map((a) => fmt(a.others)) : LEVELS.map(String)).join(' / ') +
        ' ชม.',
      value: answers.length ? 'คุณลง ' + answers.map((a) => fmt(a.own)).join(' / ') + ' ชม.' : 'ไม่มีข้อมูล',
    },
    { label: 'ความชัน (slope)', value: `เพื่อนลงเพิ่ม 1 ชม. คุณลงเพิ่ม ${fmt(slope)} ชม.` },
    {
      label: 'จุดอ้างอิง (score 0)',
      value: 'ลง 0 ชม. ทุกกรณี: ได้แต้มส่วนตัวสูงสุด แต่ไม่ใช่ผลที่ดีที่สุดของกลุ่ม',
    },
  ]

  return { score: s, level: levelOf(s), headline: headline[type], facts }
}

export function memoryLine(raw: Raw): string {
  const answers = sortedAnswers(raw)
  const type = classify(answers)
  const top = answers.length ? answers[answers.length - 1] : undefined
  switch (type) {
    case 'freeRider':
      return 'ปีสามคุณเก็บชั่วโมงไว้กับตัวแทบทุกกรณี แต่ชื่อยังอยู่บนหน้าปกเหมือนเดิมนะ'
    case 'conditional':
      return top
        ? `ปีสามคุณดูเพื่อนก่อนแล้วค่อยขยับ เพื่อนลง ${fmt(top.others)} ชม. คุณลง ${fmt(top.own)} ชม.`
        : 'ปีสามคุณดูเพื่อนก่อนแล้วค่อยขยับ'
    case 'unconditional':
      return 'ปีสามเพื่อนจะลงแรงเท่าไรก็ช่าง คุณลงเท่าเดิมทุกรอบ'
    case 'hump':
      return 'ปีสามคุณขยับตามเพื่อนอยู่ดี ๆ ถึงจุดหนึ่งก็ถอยออกมาซะงั้น'
    default:
      return 'ปีสามคุณลงแรงตามเพื่อน... หรือไม่ตาม? สูตรนี้มีแต่คุณที่รู้'
  }
}
