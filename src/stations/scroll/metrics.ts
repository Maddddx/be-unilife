import { clampScore, levelOf } from '../../core/levels'
import type { TraitScore } from '../../core/types'

/** Prediction slider range (seconds). */
export const PREDICT_MIN = 15
export const PREDICT_MAX = 150
export const PREDICT_STEP = 15
/** Hard cap of the feed round (seconds) so the station stays short. */
export const FEED_CAP_SEC = 150
/** Limit options offered for "tomorrow" (seconds). */
export const LIMIT_OPTIONS = [30, 60, 90, 120] as const

export interface Raw {
  /** what the player said they'd scroll, seconds */
  predictedSec: number
  /** real elapsed time in the feed (performance.now), seconds, ≤ FEED_CAP_SEC */
  actualSec: number
  /** true when the round was ended by the cap, not by the player */
  capped: boolean
  /** how many feed cards the player reached */
  cardsSeen: number
  /** round 2: did the player set a limit for tomorrow, and which one */
  commitment: { chosen: boolean; limitSec: number | null }
}

function safe(x: number, fallback = 0): number {
  return Number.isFinite(x) ? x : fallback
}

/** Overrun ratio actual / predicted (predicted floored at 1 s to avoid ÷0). */
export function overrunRatio(raw: Pick<Raw, 'predictedSec' | 'actualSec'>): number {
  const predicted = Math.max(1, safe(raw.predictedSec, 1))
  const actual = Math.max(0, safe(raw.actualSec))
  return actual / predicted
}

/** "2 นาที 10 วิ", "40 วิ", "1 นาที" */
export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(safe(sec)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m === 0) return `${r} วิ`
  if (r === 0) return `${m} นาที`
  return `${m} นาที ${r} วิ`
}

/**
 * Naivete gap (distance from a rational benchmark that predicts its own behaviour).
 *
 *   r     = actual / predicted
 *   score = 0                              if r ≤ 1  (stopped on or before own forecast = rational)
 *         = 100 · log2(r) / log2(4)        otherwise, clamped to 0..100
 *
 * So scrolling 2× the forecast → 50, 4× or more → 100. A log scale treats "double" the same
 * whether the forecast was 30 s or 2 min. Cut-offs (our own, not a norm): low < 25 (r < ~1.41),
 * mid < 60 (r < ~2.3), high otherwise.
 *
 * When the round hit the cap, actualSec is a lower bound, so the score is a lower bound too.
 * Commitment uptake (setting a limit for tomorrow) does NOT change the score: it measures
 * sophistication (awareness of one's own self-control problem), a different construct, and is
 * reported as a fact on the reveal instead.
 */
export function score(raw: Raw): TraitScore {
  const r = overrunRatio(raw)
  const s = clampScore(r <= 1 ? 0 : (100 * Math.log2(r)) / 2)
  const committed = !!raw.commitment?.chosen

  let headline: string
  if (r <= 1) headline = 'เลิกได้ภายในเวลาที่ทายไว้เอง: ทายตัวเองแม่น'
  else if (r < 1.2) headline = 'ไถเกินที่ทายไว้นิดเดียว: เกือบแม่น'
  else headline = `ไถนานกว่าที่ตัวเองทายไว้ ${r.toFixed(1)} เท่า`

  const facts = [
    { label: 'ทายไว้ว่าจะไถ', value: formatDuration(raw.predictedSec) },
    {
      label: 'ไถจริง',
      value: formatDuration(raw.actualSec) + (raw.capped ? ' (เกมตัดให้เอง)' : ''),
    },
    {
      label: 'ตั้งลิมิตให้พรุ่งนี้',
      value: committed
        ? raw.commitment.limitSec
          ? `ตั้ง ${formatDuration(raw.commitment.limitSec)}`
          : 'ตั้ง'
        : 'ไม่ตั้ง',
    },
  ]

  return { score: s, level: levelOf(s), headline, facts }
}

/** Neutral memory line — never names a bias. */
export function memoryLine(raw: Raw): string {
  const actual = formatDuration(raw.actualSec)
  if (raw.capped) return `บอกว่าแป๊บเดียว... รู้ตัวอีกทีก็ตีสอง (ไถไป ${actual})`
  if (overrunRatio(raw) <= 1) return `บอกว่าแป๊บเดียว แล้วก็แป๊บเดียวจริง ไถไป ${actual} ก็วางมือถือ`
  return `บอกว่าแป๊บเดียว... คืนนั้นไถไป ${actual}`
}
