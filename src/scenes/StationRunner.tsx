import { useMemo } from 'react'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { IconTile } from '../components/StationIcon'
import { createRng } from '../core/rng'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

/** Hosts the current station's Play component. */
export function StationRunner() {
  const { index, seed, complete } = useGame()
  const def = STATIONS[index]
  const accent = YEAR_ACCENT[def.year]
  const rng = useMemo(() => createRng(seed + index * 7919), [seed, index])
  const { Play } = def

  return (
    <Screen className="gap-5">
      <ProgressRail current={index} done={index} />
      <header className="flex items-center gap-3">
        <IconTile id={def.id} fill={accent.mark} size="sm" />
        <div className="leading-tight">
          <p className="text-xs font-semibold" style={{ color: accent.deep }}>
            {momentLabel(def)}
          </p>
          <p className="font-display font-semibold">{def.title}</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <Play onComplete={complete} rng={rng} />
      </div>
    </Screen>
  )
}
