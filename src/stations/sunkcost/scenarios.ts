import { shuffle } from '../../core/rng'

/**
 * 4 matched pairs. Within a pair the FUTURE is identical (same costs and benefits from
 * now on); the only difference is whether money/time was already spent and can't be
 * recovered (`sunk: true`). A forward-looking decision maker answers both halves alike.
 *
 * "go" (ไปต่อ) always means: carry on with the option the sunk cost is attached to.
 * Copy is neutral on purpose — no hints about "wasting" anything.
 */
export type PairId = 'concert' | 'track' | 'gym' | 'project'

export interface Scenario {
  id: string
  pairId: PairId
  sunk: boolean
  /** situation, Thai */
  text: string
  /** the question, Thai */
  ask: string
  /** small caption under ไปต่อ */
  go: string
  /** small caption under พอแค่นี้ */
  stop: string
}

export const PAIR_LABEL: Record<PairId, string> = {
  concert: 'บัตรคอนเสิร์ตคืนที่ป่วย',
  track: 'สายวิชาที่ไม่ชอบ',
  gym: 'ฟิตเนสเย็นวันเหนื่อย',
  project: 'ไอเดียโปรเจกต์ที่มีคนทำแล้ว',
}

export const PAIR_IDS: PairId[] = ['concert', 'track', 'gym', 'project']

export const SCENARIOS: Scenario[] = [
  {
    id: 'concert-sunk',
    pairId: 'concert',
    sunk: true,
    text: 'กดบัตรคอนเสิร์ตวงที่ชอบไว้เอง 2,500 บาท คืนจริงดันเป็นไข้ ตัวรุม ๆ ฝนก็ตก ต้องนั่งรถไปอีกชั่วโมงนึง',
    ask: 'คืนนี้จะไปไหม',
    go: 'ไปคอน',
    stop: 'นอนพักที่หอ',
  },
  {
    id: 'concert-free',
    pairId: 'concert',
    sunk: false,
    text: 'จับฉลากงานคณะได้บัตรคอนเสิร์ตวงที่ชอบมาฟรี คืนจริงดันเป็นไข้ ตัวรุม ๆ ฝนก็ตก ต้องนั่งรถไปอีกชั่วโมงนึง',
    ask: 'คืนนี้จะไปไหม',
    go: 'ไปคอน',
    stop: 'นอนพักที่หอ',
  },
  {
    id: 'track-sunk',
    pairId: 'track',
    sunk: true,
    text: 'เรียนสายวิชาเลือก "การเงินเชิงปริมาณ" มา 3 เทอมแล้ว ยิ่งเรียนยิ่งไม่ชอบ ถ้าย้ายไปอีกสายที่สนใจกว่า หน่วยกิตเดิมนับเป็นวิชาเลือกเสรีได้ จบพร้อมกันพอดี',
    ask: 'เรียนสายเดิมต่อไหม',
    go: 'อยู่สายเดิม',
    stop: 'ย้ายสาย',
  },
  {
    id: 'track-fresh',
    pairId: 'track',
    sunk: false,
    text: 'เทอมหน้าต้องเลือกสายวิชาเลือก ลองนั่งฟังสาย "การเงินเชิงปริมาณ" แล้วไม่ชอบเลย อีกสายน่าสนใจกว่า เลือกสายไหนก็จบพร้อมกันพอดี',
    ask: 'เลือกสายนี้ไหม',
    go: 'ลงสายนี้',
    stop: 'ไปอีกสาย',
  },
  {
    id: 'gym-sunk',
    pairId: 'gym',
    sunk: true,
    text: 'สมัครฟิตเนสรายปีไว้ 6,000 บาท ขอคืนไม่ได้ เย็นนี้เพิ่งออกจากแล็บ เหนื่อยมาก อยากกลับไปนอนดูซีรีส์',
    ask: 'เย็นนี้ไปออกกำลังไหม',
    go: 'ไปฟิตเนส',
    stop: 'กลับหอ',
  },
  {
    id: 'gym-free',
    pairId: 'gym',
    sunk: false,
    text: 'ฟิตเนสของมหาลัยให้นักศึกษาเข้าฟรี เย็นนี้เพิ่งออกจากแล็บ เหนื่อยมาก อยากกลับไปนอนดูซีรีส์',
    ask: 'เย็นนี้ไปออกกำลังไหม',
    go: 'ไปฟิตเนส',
    stop: 'กลับหอ',
  },
  {
    id: 'project-sunk',
    pairId: 'project',
    sunk: true,
    text: 'ทำโปรเจกต์ส่งประกวดมาแล้ว 40 ชั่วโมง เพิ่งรู้ว่ามีทีมอื่นทำไอเดียนี้ไปแล้วและทำดีกว่า มีอีกไอเดียที่เจ๋งกว่า ใช้เวลาเท่ากับที่เหลือพอดี',
    ask: 'ทำไอเดียเดิมต่อไหม',
    go: 'ทำไอเดียเดิม',
    stop: 'เปลี่ยนไอเดีย',
  },
  {
    id: 'project-fresh',
    pairId: 'project',
    sunk: false,
    text: 'กำลังจะเริ่มโปรเจกต์ส่งประกวด ไอเดียแรกมีทีมอื่นทำไปแล้วและทำดีกว่า มีอีกไอเดียที่เจ๋งกว่า ใช้เวลาทำเท่ากันพอดี',
    ask: 'ทำไอเดียแรกไหม',
    go: 'ทำไอเดียแรก',
    stop: 'เปลี่ยนไอเดีย',
  },
]

/** true if two halves of the same pair sit next to each other */
export function hasAdjacentPair(deck: readonly Scenario[]): boolean {
  for (let i = 1; i < deck.length; i++) if (deck[i].pairId === deck[i - 1].pairId) return true
  return false
}

/**
 * Shuffle the 8 cards with the seeded rng so that the two halves of a pair are never
 * adjacent. Rejection sampling (most shuffles pass); deterministic interleave as fallback.
 */
export function arrangeDeck(rng: () => number, cards: readonly Scenario[] = SCENARIOS): Scenario[] {
  for (let tries = 0; tries < 500; tries++) {
    const deck = shuffle(cards, rng)
    if (!hasAdjacentPair(deck)) return deck
  }
  // fallback: all first halves, then all second halves (pairs 4 apart)
  const pairs = [...new Set(cards.map((c) => c.pairId))]
  const first = pairs.map((p) => cards.find((c) => c.pairId === p && c.sunk)!).filter(Boolean)
  const second = pairs.map((p) => cards.find((c) => c.pairId === p && !c.sunk)!).filter(Boolean)
  return [...first, ...second]
}
