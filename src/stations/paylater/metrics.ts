import { clampScore, levelOf } from '../../core/levels'
import type { TraitScore } from '../../core/types'
import { ALLOWANCE, ESSENTIALS, baht, type Framing, type Purchase } from './model'

/** One offer the player saw, and what they did. */
export interface OfferRecord extends Purchase {
  id: string
  /** matched-pair id: both members share price + plan, differ only in product */
  pair: number
  month: number
  framing: Framing
  price: number
  /** installment plan length (also stored for full-price offers; unused there) */
  months: number
  /** could the player pay for it when it was shown? (full: price; installment: first payment) */
  affordable: boolean
  bought: boolean
}

export interface Raw {
  offers: OfferRecord[]
  /** player's answer to "ยอดผ่อนค้างเดือนหน้าเท่าไร" (baht); null if not asked (no installments bought) */
  perceivedNextMonth: number | null
  /** installments actually due in month 4 */
  actualNextMonth: number
  /** everything still owed after month 3 */
  actualRemaining: number
  /** money available to shop at the start of months 1..3 (after essentials + auto-debits) */
  startBalances: number[]
}

/* ------------------------------------------------------------------ scoring
 * Rational benchmark (score 0):
 *  (a) the buy decision does not depend on how the same price is displayed — 0% installments
 *      cost exactly the same total, so buy-rate(installment) = buy-rate(full price);
 *  (b) the player knows what they already owe: perceived next-month installments = actual.
 *
 *  framingGap  g = max(0, rate_installment − rate_full)                         ∈ [0, 1]
 *     rates use only offers the player could afford when shown (a forced skip is not a choice).
 *     If either framing has no affordable offer, g = 0 (no evidence). Buying *more* at full
 *     price is not counted (only the positive part).
 *  underEstimate u = max(0, actual − perceived) / actual   if actual > 0, else 0  ∈ [0, 1]
 *     over-estimating is cautious, not penalised.
 *
 *  score = clamp(100 × (0.5·g + 0.5·u))
 *  levels: our own cut-offs [25, 60] (levelOf default) — illustrative, not a population norm.
 * ------------------------------------------------------------------------ */

export interface Components {
  rateFull: number | null
  rateInst: number | null
  nFull: number
  nInst: number
  framingGap: number
  underEstimate: number
}

function rate(offers: OfferRecord[], f: Framing): { r: number | null; n: number; k: number } {
  const pool = offers.filter((o) => o.framing === f && o.affordable)
  const k = pool.filter((o) => o.bought).length
  return { r: pool.length ? k / pool.length : null, n: pool.length, k }
}

const num = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0)

export function components(raw: Raw): Components {
  const offers = Array.isArray(raw?.offers) ? raw.offers : []
  const full = rate(offers, 'full')
  const inst = rate(offers, 'installment')
  const framingGap = full.r !== null && inst.r !== null ? Math.max(0, inst.r - full.r) : 0
  const actual = Math.max(0, num(raw?.actualNextMonth))
  const perceived = Math.max(0, num(raw?.perceivedNextMonth))
  const underEstimate = actual > 0 ? Math.min(1, Math.max(0, actual - perceived) / actual) : 0
  return { rateFull: full.r, rateInst: inst.r, nFull: full.n, nInst: inst.n, framingGap, underEstimate }
}

const pct = (r: number | null) => (r === null ? '—' : `${Math.round(r * 100)}%`)

export function score(raw: Raw): TraitScore {
  const c = components(raw)
  const s = clampScore(100 * (0.5 * c.framingGap + 0.5 * c.underEstimate))
  const offers = Array.isArray(raw?.offers) ? raw.offers : []
  const boughtOf = (f: Framing) => offers.filter((o) => o.framing === f && o.affordable && o.bought).length
  const actual = Math.max(0, num(raw?.actualNextMonth))
  const perceived = raw?.perceivedNextMonth == null ? null : Math.max(0, num(raw.perceivedNextMonth))
  const gapBaht = perceived === null ? 0 : Math.max(0, actual - perceived)

  let headline: string
  if (c.framingGap > 0 && gapBaht > 0)
    headline = `ของที่โชว์เป็น "เดือนละ..." ถูกกดซื้อง่ายกว่า และยอดผ่อนเดือนหน้าจริงมากกว่าที่คิดไว้ ${baht(gapBaht)}`
  else if (c.framingGap > 0)
    headline = `ของราคาเท่ากัน แต่พอโชว์เป็นงวด อัตราซื้อขึ้นจาก ${pct(c.rateFull)} เป็น ${pct(c.rateInst)}`
  else if (gapBaht > 0)
    headline = `วิธีโชว์ราคาไม่ได้เปลี่ยนใจ แต่ยอดผ่อนเดือนหน้าจริงมากกว่าที่คิดไว้ ${baht(gapBaht)}`
  else headline = 'วิธีโชว์ราคาไม่ได้เปลี่ยนการตัดสินใจ และรู้ยอดผ่อนของตัวเองชัดเจน'

  const facts = [
    { label: 'ซื้อตอนเห็นราคาเต็ม', value: `${boughtOf('full')}/${c.nFull} ชิ้น (${pct(c.rateFull)})` },
    { label: 'ซื้อตอนเห็นเป็นงวด 0%', value: `${boughtOf('installment')}/${c.nInst} ชิ้น (${pct(c.rateInst)})` },
    { label: 'ยอดผ่อนเดือนหน้าที่คิดไว้', value: perceived === null ? 'ไม่ได้ผ่อนอะไร' : baht(perceived) },
    { label: 'ยอดผ่อนเดือนหน้าจริง', value: baht(actual) },
    { label: 'ยอดผ่อนที่ยังค้างทั้งหมด', value: baht(Math.max(0, num(raw?.actualRemaining))) },
  ]
  return { score: s, level: levelOf(s), headline, facts }
}

/** Neutral, teasing-the-behaviour memory line. Never names a bias. */
export function memoryLine(raw: Raw): string {
  const offers = Array.isArray(raw?.offers) ? raw.offers : []
  const bought = offers.filter((o) => o.bought)
  const balances = Array.isArray(raw?.startBalances) ? raw.startBalances.map(num) : []
  const first = balances[0] ?? ALLOWANCE - ESSENTIALS
  const last = balances[balances.length - 1] ?? first
  const next = Math.max(0, num(raw?.actualNextMonth))

  if (bought.length === 0) return 'สามเดือนนั้นแอปเด้งโปรรัว ๆ แต่ตะกร้ายังว่างเปล่า ใจแข็งเหมือนหิน'
  if (first - last >= 300)
    return `เดือนแรกรวย เดือนสามเริ่มนับเหรียญ (เปิดเดือนมาเหลือใช้ ${baht(last)})`
  if (next > 0) return `ได้ของมา ${bought.length} ชิ้น เดือนหน้ายังมีบิลตามมาทักอีก ${baht(next)}`
  return `สามเดือนนั้นได้ของใหม่มา ${bought.length} ชิ้น กระเป๋าตังค์ยังยิ้มได้`
}
