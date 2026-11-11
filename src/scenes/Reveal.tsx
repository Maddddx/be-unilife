import { Button } from '../components/Button'
import { Bubble, Mascot } from '../components/Mascot'
import { Screen } from '../components/Screen'
import { IconTile } from '../components/StationIcon'
import { LEVEL_LABEL } from '../core/levels'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT } from '../stations/registry'

// TODO(Phase 2): full reveal sequence, transcript, radar, share card, sources page.
export function Reveal() {
  const { results, restart } = useGame()
  return (
    <Screen className="gap-4">
      <h1 className="text-2xl font-bold">Behavioral Transcript</h1>
      <p className="text-sm text-muted">(ร่าง Phase 2 จะทำหน้านี้เต็ม)</p>
      <div className="flex items-center gap-3">
        <Mascot pose="confess" size={88} className="shrink-0" />
        <Bubble>โทษที ทั้ง 4 ปีนั้นผมทำเอง ขออธิบายหน่อยว่าทำไป ทำไม</Bubble>
      </div>
      <ul className="flex flex-col gap-3">
        {STATIONS.map((s) => {
          const r = results[s.id]
          return (
            <li key={s.id} className="flex items-center gap-3 rounded-(--radius-card) border-2 border-ink/10 bg-card p-4">
              <IconTile id={s.id} fill={YEAR_ACCENT[s.year].mark} size="sm" />
              <div>
                <p className="font-display font-semibold">{s.reveal.biasName}</p>
                <p className="text-sm text-muted">
                  {r ? `${r.trait.score}/100 ${LEVEL_LABEL[r.trait.level]}: ${r.trait.headline}` : 'ยังไม่มีผล'}
                </p>
              </div>
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
