/**
 * Content generator for the invented feed app "วนวน" (Wonwon).
 * Pure + seeded so a run is reproducible. No real brands, creators or platforms.
 */

export type Topic = 'cat' | 'food' | 'music' | 'game' | 'joke' | 'dog' | 'travel' | 'study' | 'fashion' | 'drama'
export type Tint = 'y1' | 'y2' | 'y3' | 'y4' | 'grad'

export interface FeedCard {
  id: number
  topic: Topic
  tint: Tint
  caption: string
  handle: string
  likes: string
  comments: number
}

const CAPTIONS: Record<Topic, string[]> = {
  cat: [
    'แมวหอข้าง ๆ เดินมาขอข้าวทุกคืน ตอนนี้มันจำห้องได้แล้ว',
    'แมวนอนทับโน้ตเลคเชอร์ อ่านไม่ได้เลยจ้า',
    'พาแมวไปหาหมอ แมวทำหน้าเหมือนโดนหักหลัง',
  ],
  food: [
    'มาม่าเวอร์ชันเด็กหอ ใส่ไข่สองฟอง ถือว่ารวยแล้ว',
    'รีวิวร้านตามสั่งหน้ามอ จานละ 45 บาท อิ่มยันเที่ยงคืน',
    'ชาไทยแก้วที่สามของวัน ไม่ได้ติดนะ แค่ชอบ',
  ],
  music: [
    'เพลงนี้ฟังตอนตีหนึ่งแล้วอินกว่าปกติสามเท่า',
    'คัฟเวอร์เพลงด้วยกีตาร์สายขาด 1 สาย',
    'วงดนตรีชมรมซ้อมเสียงดังจนหอสั่น',
  ],
  game: [
    'อีกตาเดียวแล้วนอน (ตาที่สิบสอง)',
    'รวมช็อตพลาดที่ทำให้แพ้ทั้งทีม',
    'เปิดกล่องสุ่ม 50 รอบ ได้ของซ้ำ 49',
  ],
  joke: [
    'เพื่อนถามว่าอ่านหนังสือยัง ผมตอบว่า "เปิดไฟล์แล้ว"',
    'ตอนอาจารย์บอกว่า "ข้อนี้ง่าย ๆ"',
    'ป้ายรถไฟฟ้าตอนแปดโมงเช้า: ภาพจริงไม่ได้จัดฉาก',
  ],
  dog: [
    'หมาที่ร้านป้าข้างหอ ยืนเฝ้าร้านเหมือนเป็นพนักงาน',
    'สอนหมานั่ง 3 วัน หมาสอนเรานอนแทน',
    'หมาเห็นอาบน้ำทีไรวิ่งหนีทุกที',
  ],
  travel: [
    'เที่ยวทะเลงบ 500 บาท ทำได้จริงไหม',
    'ขึ้นดอยตอนตีห้า หมอกเต็ม มองไม่เห็นอะไรเลย',
    'นั่งรถไฟชั้นสามไปเที่ยว 8 ชั่วโมง',
  ],
  study: [
    'จดเลคเชอร์ด้วยปากกาไฮไลต์ 7 สี สวยแต่อ่านไม่รู้เรื่อง',
    'เทคนิคอ่านหนังสือคืนก่อนสอบ (อย่าทำตาม)',
    'โต๊ะอ่านหนังสือในฝัน vs โต๊ะจริงในหอ',
  ],
  fashion: [
    'แต่งชุดนักศึกษาให้ดูไม่เหมือนชุดนักศึกษา',
    'รองเท้าผ้าใบคู่เดียวใส่มา 4 ปี',
    'เสื้อตัวละ 99 บาทจากตลาดนัดหลังมอ',
  ],
  drama: [
    'สรุปดราม่าในกลุ่มไลน์ชั้นปีเมื่อคืน (ยาวมาก)',
    'ภาคต่อของเรื่องเมื่อวาน คนดูรอกันทั้งหอ',
    'ตอนจบที่ไม่มีใครคาดคิด... ไปดูภาคสองต่อ',
  ],
}

const TOPICS = Object.keys(CAPTIONS) as Topic[]
const TINTS: Tint[] = ['y1', 'y2', 'y3', 'y4', 'grad']
const HANDLES = [
  'dek.hor.daily',
  'pa.la.pa',
  'namjai.eat',
  'kao.niew.cat',
  'nong.ploy.studies',
  'tam.sang.reviews',
  'guitar.1.string',
  'gamer.mai.non',
  'tee.ha.nai.dongs',
  'maew.lab',
]

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length]
}

/** Generate `count` cards starting at id `from`. Avoids repeating the previous topic/tint. */
export function makeCards(rng: () => number, from: number, count: number, prev?: FeedCard): FeedCard[] {
  const out: FeedCard[] = []
  let last = prev
  for (let i = 0; i < count; i++) {
    let topic = pick(TOPICS, rng)
    if (last && topic === last.topic) topic = TOPICS[(TOPICS.indexOf(topic) + 1) % TOPICS.length]
    let tint = pick(TINTS, rng)
    if (last && tint === last.tint) tint = TINTS[(TINTS.indexOf(tint) + 1) % TINTS.length]
    const k = Math.floor(rng() * 980) + 12
    const card: FeedCard = {
      id: from + i,
      topic,
      tint,
      caption: pick(CAPTIONS[topic], rng),
      handle: pick(HANDLES, rng),
      likes: k >= 100 ? `${(k / 10).toFixed(1)}K` : `${k}`,
      comments: Math.floor(rng() * 400) + 3,
    }
    out.push(card)
    last = card
  }
  return out
}
