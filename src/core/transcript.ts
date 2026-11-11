import type { StationId, StationResult } from './types'

/**
 * The Behavioral Transcript grades each "course" by how much you behaved like
 * Homo economicus — the textbook rational agent. Score 0 (= rational benchmark) → A.
 * So a low grade is not "bad": it means "very human". Bands are our own, not a norm.
 */
export type Grade = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F'

const BANDS: [max: number, grade: Grade, points: number][] = [
  [9, 'A', 4],
  [24, 'B+', 3.5],
  [39, 'B', 3],
  [54, 'C+', 2.5],
  [69, 'C', 2],
  [84, 'D+', 1.5],
  [94, 'D', 1],
  [100, 'F', 0],
]

export function gradeOf(score: number): { grade: Grade; points: number } {
  const s = Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0
  const band = BANDS.find(([max]) => s <= max) ?? BANDS[BANDS.length - 1]
  return { grade: band[1], points: band[2] }
}

/** GPA over the courses that have a result; null when none. */
export function gpa(results: Partial<Record<StationId, StationResult>>): number | null {
  const pts = Object.values(results)
    .filter((r): r is StationResult => !!r)
    .map((r) => gradeOf(r.trait.score).points)
  if (pts.length === 0) return null
  return Math.round((pts.reduce((a, b) => a + b, 0) / pts.length) * 100) / 100
}

export interface Course {
  code: string
  /** joke course name (Thai) — playful, about behaviour, never about the person */
  name: string
  /** professor's remark when this course scored the most "human" */
  remark: string
}

export const COURSES: Record<StationId, Course> = {
  scroll: {
    code: 'SCRL101',
    name: 'ไถแป๊บเดียว',
    remark: 'ทายเวลาตัวเองแม่นเท่าพยากรณ์อากาศ แป๊บเดียวของเธอยาวกว่าคาบเรียน',
  },
  paylater: {
    code: 'BUY102',
    name: 'ผ่อนสบาย ๆ',
    remark: 'เดือนละนิดเดียวจริง ๆ แหละ แค่หลายเดือนไปหน่อย',
  },
  sunkcost: {
    code: 'SUNK201',
    name: 'จ่ายแล้วต้องคุ้ม',
    remark: 'ตัดใจยากเป็นเลิศ ของที่จ่ายไปแล้วก็ไม่ได้คืนมานะ',
  },
  groupwork: {
    code: 'TEAM301',
    name: 'คิดแต้มตัวเอง',
    remark: 'สอบตกวิชาเห็นแก่ตัวอย่างสวยงาม เพื่อนในกลุ่มน่าจะรักเธอ',
  },
  thesis: {
    code: 'THES401',
    name: 'เดี๋ยวค่อยทำ',
    remark: 'แผนสวยมาก ส่วนคืนก่อนส่งก็ระห่ำเหมือนกัน',
  },
}

/** Remark for the course that scored highest (most human); a robot joke if everything was near-rational. */
export function professorRemark(results: Partial<Record<StationId, StationResult>>): string {
  const rows = (Object.keys(COURSES) as StationId[])
    .map((id) => ({ id, score: results[id]?.trait.score ?? -1 }))
    .filter((r) => r.score >= 0)
  if (rows.length === 0) return 'ยังไม่ได้ลงเรียนสักวิชา'
  const top = rows.reduce((a, b) => (b.score > a.score ? b : a))
  if (top.score < 25) return 'rational ทุกวิชา ครูขอตรวจหน่อยว่าเป็นคนจริงไหม'
  return COURSES[top.id].remark
}
