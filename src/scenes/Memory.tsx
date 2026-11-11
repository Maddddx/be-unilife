import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

/** Neutral "memory" polaroid after each station — never names a bias. */
export function Memory() {
  const { index, results, next } = useGame()
  const reduce = useReducedMotion()
  const def = STATIONS[index]
  const accent = YEAR_ACCENT[def.year]
  const line = results[def.id]?.memoryLine ?? ''
  const isLast = index === STATIONS.length - 1

  return (
    <Screen className="gap-8">
      <ProgressRail current={index} done={index + 1} />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <p className="text-sm font-medium tracking-wide text-muted">บันทึกความทรงจำ</p>
        <motion.figure
          initial={reduce ? false : { rotate: 6, y: 30, opacity: 0 }}
          animate={{ rotate: -2, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          className="w-64 bg-card p-3 pb-5 shadow-(--shadow-card)"
        >
          <div className="grid aspect-square place-items-center text-7xl" style={{ background: accent.soft }} aria-hidden>
            {def.icon}
          </div>
          <figcaption className="mt-3 text-center">
            <span className="block font-display text-sm font-semibold" style={{ color: accent.solid }}>
              {momentLabel(def)} · {def.title}
            </span>
            <span className="mt-1 block text-base leading-snug">{line}</span>
          </figcaption>
        </motion.figure>
      </div>

      <Button full accent={accent.solid} onClick={next}>
        {isLast ? 'ไปงานรับปริญญา 🎓' : 'ไปช่วงต่อไป →'}
      </Button>
    </Screen>
  )
}
