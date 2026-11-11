import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

export function YearIntro() {
  const { index, beginPlay } = useGame()
  const reduce = useReducedMotion()
  const def = STATIONS[index]
  const accent = YEAR_ACCENT[def.year]

  return (
    <Screen className="gap-8">
      <ProgressRail current={index} done={index} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={reduce ? false : { scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="grid size-28 place-items-center rounded-[2rem] text-6xl shadow-(--shadow-card)"
          style={{ background: accent.soft }}
          aria-hidden
        >
          {def.icon}
        </motion.div>

        <div>
          <p className="font-display text-lg font-semibold" style={{ color: accent.solid }}>
            {momentLabel(def)}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{def.title}</h1>
        </div>

        <p className="max-w-xs text-lg leading-relaxed text-ink/85">{def.intro}</p>
      </div>

      <Button full accent={accent.solid} onClick={beginPlay}>
        ไปกันเลย
      </Button>
    </Screen>
  )
}
