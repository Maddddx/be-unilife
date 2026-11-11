/**
 * Pure money model for the "ค่าขนมก้อนแรก" station: catalog, counterbalanced schedule,
 * and installment arithmetic. No React here so it can be unit-tested.
 */
import { shuffle } from '../../core/rng'

export type Framing = 'full' | 'installment'
export type MonthNo = 1 | 2 | 3

export const MONTHS: MonthNo[] = [1, 2, 3]
export const ALLOWANCE = 8000
/** rent + food + transport, deducted every month before the player can shop */
export const ESSENTIALS = 4500

export type ItemIcon = 'headphones' | 'speaker' | 'shoe' | 'jacket' | 'watch' | 'keyboard' | 'backpack' | 'lamp'

export interface CatalogItem {
  id: string
  name: string
  blurb: string
  icon: ItemIcon
}

/**
 * Matched pairs: both members share the same total price and the same installment plan,
 * only the product differs. One member of each pair is shown as a full price, the other as
 * installments (which one is decided by rng), so every player sees both framings
 * on near-identical offers (within-subject).
 * Prices are divisible by the plan length so monthly × months = price exactly.
 */
export interface Pair {
  pair: number
  price: number
  months: number
  items: [CatalogItem, CatalogItem]
}

export const PAIRS: Pair[] = [
  {
    pair: 1,
    price: 1980,
    months: 6,
    items: [
      { id: 'earbuds', name: 'หูฟังไร้สายตัดเสียง', blurb: 'ฟังเลคเชอร์ย้อนหลังแบบไม่ได้ยินรูมเมตกรน', icon: 'headphones' },
      { id: 'speaker', name: 'ลำโพงบลูทูธพกพา', blurb: 'ปาร์ตี้ในหอแบบเบา ๆ (ถ้าข้างห้องไม่บ่น)', icon: 'speaker' },
    ],
  },
  {
    pair: 2,
    price: 2388,
    months: 4,
    items: [
      { id: 'sneakers', name: 'รองเท้าผ้าใบรุ่นใหม่', blurb: 'เดินข้ามตึกเรียนได้ทั้งวัน', icon: 'shoe' },
      { id: 'jacket', name: 'แจ็กเก็ตกันลม', blurb: 'ห้องเรียนแอร์เย็นแค่ไหนก็ไม่หวั่น', icon: 'jacket' },
    ],
  },
  {
    pair: 3,
    price: 2970,
    months: 10,
    items: [
      { id: 'watch', name: 'สมาร์ตวอทช์', blurb: 'นับก้าว เตือนเข้าเรียน ดูเท่ไปอีก', icon: 'watch' },
      { id: 'keyboard', name: 'คีย์บอร์ดเมคานิคอล', blurb: 'พิมพ์รายงานเสียงแก๊ก ๆ ฟีลโปร', icon: 'keyboard' },
    ],
  },
  {
    pair: 4,
    price: 1596,
    months: 3,
    items: [
      { id: 'backpack', name: 'เป้ใส่โน้ตบุ๊ก', blurb: 'ช่องเยอะจนหาของไม่เจอ', icon: 'backpack' },
      { id: 'lamp', name: 'โคมไฟอ่านหนังสือ', blurb: 'ไฟสวย อ่านหนังสือได้ (ในทางทฤษฎี)', icon: 'lamp' },
    ],
  },
]

/** One offer as scheduled for this run. */
export interface Offer {
  id: string
  pair: number
  month: MonthNo
  framing: Framing
  price: number
  months: number
  monthly: number
  item: CatalogItem
}

/** month slots for the 8 offers: 3 + 3 + 2 */
const SLOTS: MonthNo[] = [1, 1, 1, 2, 2, 2, 3, 3]

/**
 * Counterbalanced schedule: for each pair a coin flip decides which item is shown as
 * installments; then all 8 offers are shuffled into the month slots.
 * Always yields exactly 4 full-price and 4 installment offers.
 */
export function buildSchedule(rng: () => number): Offer[] {
  const offers: Offer[] = []
  for (const p of PAIRS) {
    const instIdx = rng() < 0.5 ? 0 : 1
    p.items.forEach((item, i) => {
      offers.push({
        id: item.id,
        pair: p.pair,
        month: 1,
        framing: i === instIdx ? 'installment' : 'full',
        price: p.price,
        months: p.months,
        monthly: p.price / p.months,
        item,
      })
    })
  }
  const order = shuffle(offers, rng)
  return order.map((o, i) => ({ ...o, month: SLOTS[i] ?? 3 })).sort((a, b) => a.month - b.month)
}

/** Minimal shape needed for the money arithmetic (also what Raw stores). */
export interface Purchase {
  month: number
  framing: Framing
  price: number
  months: number
  bought: boolean
}

/** Installment plans charge their first payment in the month of purchase. */
function monthlyOf(p: Purchase): number {
  return p.months > 0 ? p.price / p.months : p.price
}

/** Total installment payments that fall due in month `m`. */
export function dueInMonth(purchases: readonly Purchase[], m: number): number {
  let sum = 0
  for (const p of purchases) {
    if (!p.bought || p.framing !== 'installment') continue
    const last = p.month + p.months - 1
    if (m >= p.month && m <= last) sum += monthlyOf(p)
  }
  return Math.round(sum)
}

/** Everything still owed after month `after` (all remaining installments). */
export function remainingAfter(purchases: readonly Purchase[], after: number): number {
  let sum = 0
  for (const p of purchases) {
    if (!p.bought || p.framing !== 'installment') continue
    const last = p.month + p.months - 1
    const left = Math.max(0, last - Math.max(after, p.month - 1))
    sum += left * monthlyOf(p)
  }
  return Math.round(sum)
}

/** Full-price purchases made in month `m`. */
export function fullSpentIn(purchases: readonly Purchase[], m: number): number {
  return purchases
    .filter((p) => p.bought && p.framing === 'full' && p.month === m)
    .reduce((s, p) => s + p.price, 0)
}

/**
 * "เงินที่เหลือเดือนนี้": allowance − essentials − installments due this month − full-price
 * buys this month. With only earlier months' purchases it is the month's starting balance.
 */
export function balanceIn(purchases: readonly Purchase[], m: number): number {
  return ALLOWANCE - ESSENTIALS - dueInMonth(purchases, m) - fullSpentIn(purchases, m)
}

/** Can the player pay for this offer right now? (full: whole price; installment: first payment) */
export function canAfford(balance: number, o: Pick<Purchase, 'framing' | 'price' | 'months'>): boolean {
  const need = o.framing === 'full' ? o.price : o.price / Math.max(1, o.months)
  return balance >= need
}

export function baht(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} ฿`
}
