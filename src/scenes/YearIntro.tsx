import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { IconTile } from '../components/StationIcon'
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
          animate={{ scale: 1, rotate: -3, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <IconTile id={def.id} fill={accent.mark} size="lg" sticker />
        </motion.div>

        <div>
          <p className="font-display text-base font-semibold" style={{ color: accent.deep }}>
            {momentLabel(def)}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{def.title}</h1>
        </div>

        <p className="max-w-xs text-lg leading-relaxed text-ink/85">{def.intro}</p>
      </div>

      <Button full accent={accent.mark} onClick={beginPlay}>
        ไปกันเลย
      </Button>
    </Screen>
  )
}
