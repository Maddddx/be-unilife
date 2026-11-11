import { Button } from '../components/Button'
import { Screen } from '../components/Screen'
import { LEVEL_LABEL } from '../core/levels'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT } from '../stations/registry'

// TODO(Phase 2): full reveal sequence, transcript, radar, share card, sources page.
export function Reveal() {
  const { results, restart } = useGame()
  return (
    <Screen className="gap-4">
      <h1 className="text-2xl font-bold">Behavioral Transcript</h1>
      <p className="text-sm text-muted">(ร่าง — Phase 2 จะทำหน้านี้เต็ม)</p>
      <ul className="flex flex-col gap-2">
        {STATIONS.map((s) => {
          const r = results[s.id]
          return (
            <li key={s.id} className="rounded-2xl p-4" style={{ background: YEAR_ACCENT[s.year].soft }}>
              <p className="font-display font-semibold">{s.reveal.biasName}</p>
              <p className="text-sm">
                {r ? `${r.trait.score}/100 · ${LEVEL_LABEL[r.trait.level]} — ${r.trait.headline}` : 'ยังไม่มีผล'}
              </p>
            </li>
          )
        })}
      </ul>
      <Button variant="ghost" onClick={restart} className="mt-auto">
        เล่นใหม่
      </Button>
    </Screen>
  )
}
