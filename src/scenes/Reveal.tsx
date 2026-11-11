import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { Highlight } from '../components/Highlight'
import { Bubble, Mascot } from '../components/Mascot'
import { Screen } from '../components/Screen'
import { useGame } from '../core/store'
import { STATIONS } from '../stations/registry'
import { SourcesSheet } from './reveal/SourcesSheet'
import { StationReveal } from './reveal/StationReveal'
import { Transcript } from './reveal/Transcript'

/** -1 = intro, 0..4 = one course per station, 5 = transcript */
type Step = number
const TRANSCRIPT = STATIONS.length

function Intro({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Bubble tail="bottom">
          โทษที ทั้ง 4 ปีนั้นผมทำเอง ผมชื่อต่อม สมองส่วนที่ชอบทางลัด ขออธิบายทีละเรื่องว่าทำไปทำไม
        </Bubble>
        <Mascot pose="confess" size={140} />
        <h1 className="text-3xl font-bold">
          <Highlight>ใบ transcript ออกแล้ว</Highlight>
        </h1>
        <div className="rounded-(--radius-card) bg-card p-4 text-left text-sm leading-relaxed ring-1 ring-line">
          <p>
            ใบนี้ให้เกรดว่าคุณตัดสินใจเหมือน <span className="font-semibold">Homo economicus</span> มนุษย์ในตำราที่ rational
            เป๊ะแค่ไหน <span className="font-semibold">A</span> = เหมือนหุ่นยนต์ในตำรา <span className="font-semibold">F</span> =
            มนุษย์เต็มตัว
          </p>
          <p className="mt-2 text-muted">เกณฑ์เกรดเป็นของเราเอง ไม่ใช่ค่ามาตรฐาน และเกมสั้น ๆ นี้ไม่ใช่การวินิจฉัย</p>
        </div>
      </div>
      <Button full accent="var(--color-y1)" onClick={onNext}>
        เปิดดูทีละวิชา
      </Button>
    </div>
  )
}

export function Reveal() {
  const { results, restart } = useGame()
  const reduce = useReducedMotion()
  const [step, setStep] = useState<Step>(-1)
  const [sources, setSources] = useState(false)
  const openSources = useCallback(() => setSources(true), [])
  const closeSources = useCallback(() => setSources(false), [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const def = step >= 0 && step < TRANSCRIPT ? STATIONS[step] : null

  return (
    <Screen className="gap-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          {step === -1 && <Intro onNext={() => setStep(0)} />}

          {def && (
            <div className="flex flex-1 flex-col gap-8">
              <nav aria-label="วิชาใน transcript" className="flex items-center gap-1.5">
                {STATIONS.map((s, i) => (
                  <span
                    key={s.id}
                    className={`h-2 flex-1 rounded-full ${i === step ? 'ring-2 ring-ink' : ''}`}
                    style={{ background: i <= step ? `var(--color-y${s.year})` : 'var(--color-line)' }}
                  />
                ))}
                <span className="sr-only">
                  วิชาที่ {step + 1} จาก {STATIONS.length}
                </span>
              </nav>
              <StationReveal def={def} result={results[def.id]} onOpenSources={openSources} />
              <div className="mt-auto flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="shrink-0">
                  ย้อน
                </Button>
                <Button full accent={`var(--color-y${def.year})`} onClick={() => setStep(step + 1)}>
                  {step === TRANSCRIPT - 1 ? 'ดูใบ transcript' : 'วิชาต่อไป'}
                </Button>
              </div>
            </div>
          )}

          {step === TRANSCRIPT && <Transcript results={results} onOpenSources={openSources} onRestart={restart} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{sources && <SourcesSheet onClose={closeSources} />}</AnimatePresence>
    </Screen>
  )
}
