import { levelOf } from './levels'
import type { StationId, StationResult } from './types'

/**
 * Dev-only sample results so the reveal can be previewed with ?dev=reveal
 * without playing all five stations. Never used in a normal play-through.
 */
const demo = (id: StationId, score: number, headline: string, facts: [string, string][]): StationResult => ({
  id,
  raw: null,
  memoryLine: '',
  trait: { score, level: levelOf(score), headline, facts: facts.map(([label, value]) => ({ label, value })) },
})

export const DEMO_RESULTS: Partial<Record<StationId, StationResult>> = {
  scroll: demo('scroll', 58, 'ไถนานกว่าที่ตัวเองทายไว้ 2.2 เท่า', [
    ['ทายไว้ว่าจะไถ', '1 นาที'],
    ['ไถจริง', '2 นาที 10 วิ'],
    ['ตั้งลิมิตให้พรุ่งนี้', 'ตั้ง 1 นาที'],
  ]),
  paylater: demo('paylater', 50, 'ของราคาเท่ากัน แต่พอโชว์เป็นงวด อัตราซื้อขึ้นจาก 25% เป็น 75%', [
    ['อัตราซื้อตอนโชว์ราคาเต็ม', '25%'],
    ['อัตราซื้อตอนโชว์เป็นงวด', '75%'],
    ['ยอดผ่อนเดือนหน้าที่คิดไว้', '500 ฿'],
    ['ยอดผ่อนเดือนหน้าจริง', '1,459 ฿'],
  ]),
  sunkcost: demo('sunkcost', 25, '1 จาก 4 คู่ คุณเลือก "ไปต่อ" เฉพาะตอนที่จ่ายเงินหรือลงแรงไปแล้ว', [
    ['คู่ที่ตอบ', '4'],
    ['ตอบเหมือนกันทั้งคู่', '3'],
  ]),
  groupwork: demo('groupwork', 46, 'แบบ conditional cooperator: เพื่อนลงเพิ่ม 1 ชม. คุณลงเพิ่มราว 0.8 ชม.', [
    ['ประเภท', 'conditional cooperator'],
    ['ลงแรงตอนยังไม่รู้ว่าเพื่อนลงเท่าไร', '5 ชม.'],
  ]),
  thesis: demo('thesis', 88, 'แผนบอกว่าจบวันที่ 5 จะเสร็จ 10 ชิ้น ของจริงทำได้ 2 ชิ้น', [
    ['ตั้งกำหนดส่งย่อยก่อนวันส่ง', '2/2'],
    ['กำหนดย่อยที่หลุด', '2 ครั้ง'],
    ['วันที่ทำเยอะสุด', 'วันที่ 7 (10 ชิ้น)'],
  ]),
}
