import { forwardRef, useRef, useState } from 'react'
import { Download, FileText, RotateCcw } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { toPng } from 'html-to-image'
import { Button } from '../../components/Button'
import { Highlight } from '../../components/Highlight'
import { Mascot } from '../../components/Mascot'
import { GRAD_ACCENT, YEAR_ACCENT } from '../../core/accent'
import { COURSES, gpa, gradeOf, professorRemark } from '../../core/transcript'
import type { StationId, StationResult } from '../../core/types'
import { STATIONS } from '../../stations/registry'

type Results = Partial<Record<StationId, StationResult>>

/** The shareable transcript card. Fixed 360px wide so the PNG looks the same on every device. */
const TranscriptCard = forwardRef<HTMLDivElement, { results: Results }>(function TranscriptCard({ results }, ref) {
  const g = gpa(results)
  return (
    <div ref={ref} className="w-[360px] max-w-full self-center bg-paper p-3">
      <div className="rounded-(--radius-card) border-2 border-ink bg-card p-5 shadow-(--shadow-sticker)">
        <header className="flex items-start justify-between gap-3 border-b-2 border-ink pb-3">
          <div>
            <p className="font-display text-xl leading-tight font-bold">Behavioral Transcript</p>
            <p className="text-xs text-muted">สาขา Homo economicus ปีการศึกษา 4 ปี</p>
          </div>
          <Mascot pose="sly" size={52} bob={false} />
        </header>

        <table className="mt-2 w-full text-sm">
          <caption className="sr-only">ผลการเรียนแต่ละวิชา</caption>
          <tbody>
            {STATIONS.map((s) => {
              const r = results[s.id]
              const grade = r ? gradeOf(r.trait.score).grade : '–'
              return (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-2 font-mono text-xs text-muted">{COURSES[s.id].code}</td>
                  <td className="py-2 font-medium">{COURSES[s.id].name}</td>
                  <td className="py-2 text-right">
                    <span
                      className="inline-block min-w-10 rounded-md border-2 border-ink px-1.5 text-center font-display font-bold"
                      style={{ background: YEAR_ACCENT[s.year].mark }}
                    >
                      {grade}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2" style={{ background: GRAD_ACCENT.soft }}>
          <span className="font-display font-semibold">GPA (ความ rational)</span>
          <span className="font-display text-2xl font-bold">{g === null ? '–' : g.toFixed(2)}</span>
        </div>

        <p className="mt-3 text-sm leading-snug">
          <span className="font-semibold">หมายเหตุอาจารย์ต่อม: </span>
          {professorRemark(results)}
        </p>

        <p className="mt-3 border-t border-line pt-2 text-[11px] leading-snug text-muted">
          A = ตัดสินใจเหมือนหุ่นยนต์ในตำรา F = มนุษย์เต็มตัว เกณฑ์ของเราเอง ไม่ใช่การวินิจฉัย
          <br />
          4 ปีมหาลัย เกมจากวิชา EC416 Behavioral Economics
        </p>
      </div>
    </div>
  )
})

function HumanRadar({ results }: { results: Results }) {
  const data = STATIONS.map((s) => ({ axis: s.reveal.axisLabel, value: results[s.id]?.trait.score ?? 0 }))
  return (
    <figure className="flex flex-col items-center">
      <div className="h-64 w-full" role="img" aria-label={`กราฟ 5 แกน: ${data.map((d) => `${d.axis} ${d.value}`).join(', ')}`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="var(--color-line)" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--color-ink)', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="var(--color-ink)"
              strokeWidth={2}
              fill="var(--color-y2)"
              fillOpacity={0.75}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="text-center text-sm text-muted">ยิ่งกว้าง ยิ่งห่างจาก Homo economicus (ยิ่งเป็นมนุษย์)</figcaption>
    </figure>
  )
}

export function Transcript({
  results,
  onOpenSources,
  onRestart,
}: {
  results: Results
  onOpenSources: () => void
  onRestart: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState<'idle' | 'busy' | 'error'>('idle')

  const save = async () => {
    if (!cardRef.current) return
    setSaving('busy')
    const opts = { pixelRatio: 3, backgroundColor: '#f6f7fb', cacheBust: true }
    try {
      let url: string
      try {
        url = await toPng(cardRef.current, opts)
      } catch {
        // web-font embedding can fail on some browsers; fall back to system fonts
        url = await toPng(cardRef.current, { ...opts, skipFonts: true })
      }
      const a = document.createElement('a')
      a.href = url
      a.download = 'behavioral-transcript.png'
      a.click()
      setSaving('idle')
    } catch {
      setSaving('error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">
          <Highlight color={GRAD_ACCENT.mark}>ใบ transcript ของคุณ</Highlight>
        </h1>
        <p className="mt-2 text-muted">แคปไปแซวเพื่อน แล้วชวนมาเล่นบ้าง</p>
      </header>

      <TranscriptCard ref={cardRef} results={results} />

      <div className="flex flex-col gap-3">
        <Button full accent={GRAD_ACCENT.mark} onClick={save} disabled={saving === 'busy'}>
          <Download size={18} aria-hidden /> {saving === 'busy' ? 'กำลังสร้างรูป...' : 'บันทึกเป็นรูป'}
        </Button>
        {saving === 'error' && (
          <p role="alert" className="text-center text-sm text-y2-deep">
            สร้างรูปไม่สำเร็จ ลองแคปหน้าจอแทนได้เลย
          </p>
        )}
      </div>

      <HumanRadar results={results} />

      <div className="flex flex-col gap-3">
        <Button full variant="ghost" onClick={onOpenSources}>
          <FileText size={18} aria-hidden /> ที่มาและข้อจำกัด
        </Button>
        <Button full variant="ghost" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden /> เล่นใหม่
        </Button>
      </div>
    </div>
  )
}
