import type { ReactNode } from 'react'
import { BookOpen, FlaskConical, Lightbulb, MapPin, Sparkles } from 'lucide-react'
import { IconTile } from '../../components/StationIcon'
import { YEAR_ACCENT } from '../../core/accent'
import { SOURCES } from '../../core/sources'
import { COURSES, gradeOf } from '../../core/transcript'
import type { StationDef, StationResult } from '../../core/types'
import { momentLabel } from '../../stations/registry'
import { GradeStamp } from './GradeStamp'

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span aria-hidden className="text-ink">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** "Author (year)" from a citation string, for compact inline references. */
function shortCite(id: string): string {
  const c = SOURCES[id]?.citation ?? id
  const m = c.match(/^(.*?)\s*\((\d{4})\)/)
  return m ? `${m[1]} (${m[2]})` : c
}

/**
 * One course of the transcript, mechanism-first:
 * why the brain does it → its textbook name → your result → research → real life → coping.
 */
export function StationReveal({
  def,
  result,
  onOpenSources,
}: {
  def: StationDef
  result: StationResult | undefined
  onOpenSources: () => void
}) {
  const accent = YEAR_ACCENT[def.year]
  const course = COURSES[def.id]
  const r = def.reveal
  const grade = result ? gradeOf(result.trait.score).grade : '–'

  return (
    <article className="flex flex-col gap-7">
      <header className="flex items-center gap-4">
        <IconTile id={def.id} fill={accent.mark} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs font-semibold" style={{ color: accent.deep }}>
            {course.code} {momentLabel(def)}
          </p>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-sm text-muted">{def.title}</p>
        </div>
        <GradeStamp grade={grade} fill={accent.mark} />
      </header>

      <Section icon={<Sparkles size={20} />} title="ทำไมสมองทำแบบนี้">
        <p className="leading-relaxed">{r.mechanism}</p>
        <p className="text-sm text-muted">
          ในตำราเรียกว่า{' '}
          <span className="rounded-md px-1.5 py-0.5 font-display font-semibold text-ink" style={{ background: accent.soft }}>
            {r.biasName}
          </span>
        </p>
      </Section>

      <Section icon={<MapPin size={20} />} title="ของคุณเอง">
        {result ? (
          <div className="rounded-(--radius-card) border-2 border-ink bg-card p-4">
            <p className="font-display text-lg leading-snug font-semibold">{result.trait.headline}</p>
            {result.trait.facts.length > 0 && (
              <dl className="mt-3 flex flex-col divide-y divide-line text-sm">
                {result.trait.facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-muted">{f.label}</dt>
                    <dd className="text-right font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-3 text-xs text-muted">
              คะแนนห่างจาก rational {result.trait.score}/100 (0 = ตัดสินใจเหมือนตำราเป๊ะ) เกณฑ์เกรดเป็นของเราเอง ไม่ใช่ค่ามาตรฐาน
            </p>
          </div>
        ) : (
          <p className="text-muted">ยังไม่ได้เล่นช่วงนี้</p>
        )}
      </Section>

      {r.research.length > 0 && (
        <Section icon={<FlaskConical size={20} />} title="งานวิจัยว่าไง">
          <ul className="flex flex-col gap-3">
            {r.research.map((n, i) => (
              <li key={i} className="rounded-(--radius-card) bg-card p-4 ring-1 ring-line">
                <p className="leading-relaxed">{n.claim}</p>
                {n.caveat && <p className="mt-2 text-sm text-muted">ข้อจำกัด: {n.caveat}</p>}
                <button
                  type="button"
                  onClick={onOpenSources}
                  className="mt-2 text-left text-sm font-medium underline decoration-2 underline-offset-4"
                  style={{ textDecorationColor: accent.mark }}
                >
                  {shortCite(n.sourceId)}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={<BookOpen size={20} />} title="เจอในชีวิตจริงตอนไหน">
        <p className="leading-relaxed">{r.inLife}</p>
      </Section>

      <Section icon={<Lightbulb size={20} />} title="รับมือยังไงดี">
        <p className="rounded-(--radius-card) p-4 leading-relaxed" style={{ background: accent.soft }}>
          {r.howToCope}
        </p>
      </Section>

      {r.courseLink && <p className="text-sm text-muted">อ่านต่อในวิชา EC416: {r.courseLink}</p>}
    </article>
  )
}
