import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { StationIcon } from '../components/StationIcon'
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

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-1">
          <Mascot pose="sly" size={52} bob={false} />
          <p className="text-sm font-medium text-muted">บันทึกความทรงจำ</p>
        </div>
        <motion.figure
          initial={reduce ? false : { rotate: 6, y: 30, opacity: 0 }}
          animate={{ rotate: -2, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          className="relative w-64 rounded-sm border-2 border-ink bg-card p-3 pb-5 shadow-(--shadow-sticker)"
        >
          {/* washi tape in the year's highlighter */}
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3 opacity-90"
            style={{ background: accent.mark }}
          />
          <div className="grid aspect-square place-items-center border-2 border-ink" style={{ background: accent.soft }}>
            <StationIcon id={def.id} size={88} />
          </div>
          <figcaption className="mt-3 text-center">
            <span className="block text-xs font-semibold" style={{ color: accent.deep }}>
              {momentLabel(def)}
            </span>
            <span className="block font-display font-semibold">{def.title}</span>
            <span className="mt-1 block text-base leading-snug">{line}</span>
          </figcaption>
        </motion.figure>
      </div>

      <Button full accent={accent.mark} onClick={next}>
        {isLast ? 'ไปงานรับปริญญา' : 'ไปช่วงต่อไป'}
      </Button>
    </Screen>
  )
}
