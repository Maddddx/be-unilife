import { Button } from '../components/Button'
import { Campus } from '../components/Campus'
import { Screen } from '../components/Screen'
import { useGame } from '../core/store'
import { STATIONS, YEAR_ACCENT, momentLabel } from '../stations/registry'

export function Landing() {
  const start = useGame((s) => s.start)
  return (
    <Screen className="gap-6">
      <header className="pt-2 text-center">
        <p className="text-sm font-medium tracking-wide text-muted">EC416 · Behavioral Economics</p>
      </header>

      <Campus className="mx-auto w-full max-w-sm" />

      <section className="text-center">
        <h1 className="text-4xl font-bold">4 ปีมหาลัย</h1>
        <p className="mt-2 text-lg text-muted">ใช้ชีวิตมหาลัยใหม่อีกรอบใน 7 นาที แล้วดูว่าสมองคุณแอบทำอะไรไว้บ้าง</p>
      </section>

      <ol className="flex flex-col gap-2" aria-label="ช่วงเวลาที่จะได้เจอ">
        {STATIONS.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5"
            style={{ background: YEAR_ACCENT[s.year].soft }}
          >
            <span className="text-xl" aria-hidden>
              {s.icon}
            </span>
            <span className="font-medium">{s.title}</span>
            <span className="ml-auto text-sm text-muted">{momentLabel(s)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-3">
        <Button full accent="var(--color-y1)" onClick={start}>
          เริ่มปีหนึ่ง →
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          🔒 ทุกอย่างคำนวณในเครื่องคุณ ไม่มีการเก็บข้อมูล · ผลลัพธ์มีไว้เพื่อการเรียนรู้ ไม่ใช่แบบทดสอบทางจิตวิทยา
        </p>
      </div>
    </Screen>
  )
}
