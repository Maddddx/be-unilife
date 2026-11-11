import { STATIONS, YEAR_ACCENT } from '../stations/registry'

/** Five highlighter strokes showing where the player is in their four years. */
export function ProgressRail({ current, done }: { current: number; done: number }) {
  return (
    <nav aria-label="ความคืบหน้า" className="flex items-start gap-1.5">
      {STATIONS.map((s, i) => {
        const isDone = i < done
        const isNow = i === current
        return (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`h-2 w-full rounded-full transition-colors ${isNow && !isDone ? 'ring-2 ring-ink' : ''}`}
              style={{ background: isDone || isNow ? YEAR_ACCENT[s.year].mark : 'var(--color-line)' }}
            />
            <span className={`text-[11px] leading-none ${isNow ? 'font-semibold text-ink' : 'text-muted'}`}>
              {s.term ? `ปี${s.year}/${s.term}` : `ปี${s.year}`}
            </span>
          </div>
        )
      })}
      <span className="sr-only">
        ช่วงที่ {current + 1} จาก {STATIONS.length}
      </span>
    </nav>
  )
}
