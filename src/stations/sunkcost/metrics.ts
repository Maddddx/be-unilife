import { clampScore, levelOf } from '../../core/levels'
import type { Fact, TraitScore } from '../../core/types'
import { PAIR_IDS, PAIR_LABEL, type PairId } from './scenarios'

export type Choice = 'go' | 'stop'

export interface Answer {
  scenarioId: string
  pairId: PairId
  /** true = money/time already spent on the "go" option and unrecoverable */
  sunk: boolean
  choice: Choice
  /** 0-based position in the shuffled deck */
  position: number
  /** decision time (performance.now delta) */
  ms: number
}

export interface Raw {
  answers: Answer[]
}

export interface PairSummary {
  /** pairs where both halves were answered */
  complete: number
  /** go when sunk, stop when not sunk — the sunk-cost direction (counted) */
  sunkDirection: PairId[]
  /** stop when sunk, go when not sunk — opposite direction (reported, not counted) */
  reverse: PairId[]
  consistent: number
}

export function summarize(raw: Raw): PairSummary {
  const answers = Array.isArray(raw?.answers) ? raw.answers : []
  const out: PairSummary = { complete: 0, sunkDirection: [], reverse: [], consistent: 0 }
  for (const p of PAIR_IDS) {
    // if a half was somehow answered twice, the last answer wins
    const s = answers.filter((a) => a.pairId === p && a.sunk).at(-1)
    const n = answers.filter((a) => a.pairId === p && !a.sunk).at(-1)
    if (!s || !n) continue
    out.complete++
    if (s.choice === n.choice) out.consistent++
    else if (s.choice === 'go') out.sunkDirection.push(p)
    else out.reverse.push(p)
  }
  return out
}

/**
 * Score formula
 * -------------
 * Rational benchmark: decisions depend only on future costs/benefits, which are identical
 * within each pair, so both halves get the same answer (either both ไปต่อ or both พอแค่นี้).
 *
 *   score = 100 × (#pairs with ไปต่อ only in the sunk version) / (#pairs with both halves answered)
 *
 * With 4 pairs: 0 / 25 / 50 / 75 / 100. Levels via levelOf default cuts (our own, not a norm):
 * 0 → low, 25–50 → mid, 75–100 → high.
 *
 * Inconsistency in the opposite direction (พอแค่นี้ only when sunk) is also non-rational but
 * is NOT a sunk-cost effect (could be noise or a "don't throw good money after bad" overcorrection),
 * so it is shown as a fact and not counted in the score.
 */
export function score(raw: Raw): TraitScore {
  const sum = summarize(raw)
  const s = sum.complete === 0 ? 0 : clampScore((100 * sum.sunkDirection.length) / sum.complete)
  const k = sum.sunkDirection.length

  const headline =
    sum.complete === 0
      ? 'ยังไม่มีคำตอบให้เทียบ'
      : k === 0
        ? `ทั้ง ${sum.complete} คู่ คุณตัดสินใจจากสิ่งที่อยู่ข้างหน้าล้วน ๆ ของที่จ่ายไปแล้วไม่ได้ดึงคุณไว้`
        : `${k} จาก ${sum.complete} คู่ คุณเลือก "ไปต่อ" เฉพาะตอนที่จ่ายเงินหรือลงแรงไปแล้ว`

  const facts: Fact[] = [
    { label: 'คู่สถานการณ์ที่อนาคตเหมือนกันเป๊ะ', value: `${sum.complete} คู่` },
    { label: 'ตอบเหมือนกันทั้งสองแบบ', value: `${sum.consistent} คู่` },
    { label: 'ไปต่อเฉพาะตอนที่ลงทุนไปแล้ว (sunk cost)', value: `${k} คู่` },
  ]
  if (k > 0) {
    facts.push({ label: 'เรื่องที่ตัดใจยาก', value: sum.sunkDirection.map((p) => PAIR_LABEL[p]).join(', ') })
  }
  if (sum.reverse.length > 0) {
    facts.push({
      label: 'ตอบต่างกันแบบกลับทาง (พอเฉพาะตอนลงทุนไปแล้ว) ไม่นับคะแนน',
      value: `${sum.reverse.length} คู่`,
    })
  }
  return { score: s, level: levelOf(s), headline, facts }
}

/** Neutral memory line — never names or hints at the bias. */
export function memoryLine(raw: Raw): string {
  const answers = Array.isArray(raw?.answers) ? raw.answers : []
  const n = answers.length
  if (n === 0) return 'ปีสองผ่านไปไวมาก ไวจนไม่ทันได้ตัดสินใจอะไรเลย'
  const k = summarize(raw).sunkDirection.length
  if (k === 0) return `ปีสองคุณตัดสินใจไป ${n} เรื่อง เด็ดขาดใช้ได้เลยนะ`
  return `ปีสองคุณตัดสินใจไป ${n} เรื่อง บางเรื่องก็... ตัดใจยากหน่อย`
}
