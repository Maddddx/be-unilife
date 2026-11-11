import { STATIONS, YEAR_ACCENT } from '../stations/registry'

/** Five-step rail showing where the player is in their four years. */
export function ProgressRail({ current, done }: { current: number; done: number }) {
  return (
    <nav aria-label="ความคืบหน้า" className="flex items-center gap-1.5">
      {STATIONS.map((s, i) => {
        const accent = YEAR_ACCENT[s.year].solid
        const isDone = i < done
        const isNow = i === current
        return (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="h-1.5 w-full rounded-full transition-colors"
              style={{ background: isDone || isNow ? accent : 'var(--color-line)', opacity: isNow && !isDone ? 0.55 : 1 }}
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
