import { useMemo } from 'react'
import { ProgressRail } from '../components/ProgressRail'
import { Screen } from '../components/Screen'
import { createRng } from '../core/rng'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

/** Hosts the current station's Play component. */
export function StationRunner() {
  const { index, seed, complete } = useGame()
  const def = STATIONS[index]
  const rng = useMemo(() => createRng(seed + index * 7919), [seed, index])
  const { Play } = def

  return (
    <Screen className="gap-4">
      <ProgressRail current={index} done={index} />
      <p className="text-sm font-medium" style={{ color: YEAR_ACCENT[def.year].solid }}>
        {def.icon} {momentLabel(def)} · {def.title}
      </p>
      <div className="flex flex-1 flex-col">
        <Play onComplete={complete} rng={rng} />
      </div>
    </Screen>
  )
}
