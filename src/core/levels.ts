import type { Level } from './types'

/** Clamp to [0, 100] and round. */
export function clampScore(x: number): number {
  if (!Number.isFinite(x)) return 0
  return Math.round(Math.min(100, Math.max(0, x)))
}

/**
 * Our own (non-normative) cut-offs on the 0..100 distance-from-rational scale.
 * The UI states these are illustrative, not population norms.
 */
export function levelOf(score: number, cuts: [number, number] = [25, 60]): Level {
  if (score < cuts[0]) return 'low'
  if (score < cuts[1]) return 'mid'
  return 'high'
}

export const LEVEL_LABEL: Record<Level, string> = {
  low: 'ใกล้ rational',
  mid: 'มีให้เห็น',
  high: 'ชัดมาก',
}
