import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { SOURCES } from '../../core/sources'

const LIMITS = [
  'เกมสั้น ๆ นี้เป็นภาพประกอบเพื่อการเรียนรู้ ไม่ใช่แบบทดสอบทางจิตวิทยาหรือการวินิจฉัย',
  'คะแนนคือระยะห่างจากตัวแทนที่ rational ตามตำรา (0 = ตัดสินใจเหมือนตำราเป๊ะ) ไม่ได้เทียบกับค่าเฉลี่ยของใคร เพราะเราไม่มีข้อมูลนักศึกษาไทย',
  'เกณฑ์ ต่ำ/กลาง/สูง และเกรด A–F เป็นเกณฑ์ที่เราตั้งเอง',
  'สถานการณ์ในเกมเป็นการจำลอง ไม่เท่ากับชีวิตจริง เช่น ฟีดในเกมไม่ใช่โซเชียลจริง เงินในเกมไม่ใช่เงินจริง',
  'งานวิจัยที่อ้างทำกับกลุ่มตัวอย่างต่างประเทศทั้งหมด ตัวเลขทุกตัวตรวจกับต้นฉบับแล้ว และระบุกลุ่มตัวอย่างไว้ทุกครั้ง',
  'ทุกอย่างคำนวณในเครื่องคุณ ไม่มีการส่งหรือเก็บข้อมูลการเล่น',
]

/** Full-screen sheet: references (verified facts with page numbers) + limitations. */
export function SourcesSheet({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sources-title"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper"
    >
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
        <div className="sticky top-0 -mx-4 flex items-center justify-between bg-paper/95 px-4 py-3 backdrop-blur">
          <h1 id="sources-title" className="text-2xl font-bold">
            ที่มาและข้อจำกัด
          </h1>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-xl border-2 border-ink bg-card"
            aria-label="ปิด"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">ข้อจำกัดที่ควรรู้</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
            {LIMITS.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">งานวิจัยที่ใช้</h2>
          {Object.values(SOURCES).map((s) => (
            <article key={s.id} className="rounded-(--radius-card) bg-card p-4 ring-1 ring-line">
              <p className="font-medium leading-snug">{s.citation}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm break-all text-y4-deep underline underline-offset-4"
              >
                {s.url}
              </a>
              {s.facts && s.facts.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-sm">
                  {s.facts.map((f, i) => (
                    <li key={i}>
                      {f.claim} <span className="text-muted">({f.where})</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-muted">{s.verified ? 'ตรวจกับต้นฉบับแล้ว' : 'ยังไม่ได้ตรวจกับต้นฉบับ'}</p>
            </article>
          ))}
        </section>
      </div>
    </motion.div>
  )
}
