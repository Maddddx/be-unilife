import { Lock } from 'lucide-react'
import { Button } from '../components/Button'
import { Campus } from '../components/Campus'
import { Highlight } from '../components/Highlight'
import { Screen } from '../components/Screen'
import { IconTile } from '../components/StationIcon'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

export function Landing() {
  const start = useGame((s) => s.start)
  return (
    <Screen className="gap-7">
      <header className="pt-2 text-center">
        <p className="text-sm font-medium text-muted">EC416 Behavioral Economics</p>
      </header>

      <Campus className="mx-auto -mb-2 w-full max-w-xs" />

      <section className="text-center">
        <h1 className="text-[2.75rem] leading-tight font-bold">
          <Highlight>4 ปีมหาลัย</Highlight>
        </h1>
        <p className="mx-auto mt-3 max-w-[22rem] text-lg text-muted">
          ใช้ชีวิตมหาลัยใหม่อีกรอบใน 7 นาที แล้วดูว่าสมองคุณแอบทำอะไรไว้บ้าง
        </p>
      </section>

      {/* the five moments really are a sequence → a connected timeline */}
      <ol className="relative flex flex-col gap-3" aria-label="ช่วงเวลาที่จะได้เจอ">
        <span aria-hidden className="absolute top-5 bottom-5 left-5 w-0.5 -translate-x-1/2 bg-line" />
        {STATIONS.map((s) => (
          <li key={s.id} className="relative flex items-center gap-4">
            <IconTile id={s.id} fill={YEAR_ACCENT[s.year].mark} size="sm" />
            <span className="font-medium">{s.title}</span>
            <span className="ml-auto text-sm text-muted">{momentLabel(s)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-4 pt-2">
        <Button full accent="var(--color-y1)" onClick={start}>
          เริ่มปีหนึ่ง
        </Button>
        <p className="flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-muted">
          <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span>ทุกอย่างคำนวณในเครื่องคุณ ไม่มีการเก็บข้อมูล ผลลัพธ์มีไว้เพื่อการเรียนรู้ ไม่ใช่แบบทดสอบทางจิตวิทยา</span>
        </p>
      </div>
    </Screen>
  )
}
