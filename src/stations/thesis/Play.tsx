import { useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Cake,
  CloudRain,
  Coffee,
  Flag,
  Gamepad2,
  Minus,
  Moon,
  Music,
  Plus,
  Tv,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { Bubble, Mascot } from '../../components/Mascot'
import { shuffle } from '../../core/rng'
import type { StationPlayProps } from '../../core/types'
import { TEMPTATIONS } from './content'
import {
  CRUNCH_FROM,
  DAYS,
  MAX_IF_OUT,
  MAX_PER_DAY,
  MISSED_DEADLINE_PENALTY,
  TOTAL_UNITS,
  UNITS_PER_PART,
  quality,
  type Raw,
} from './metrics'

// Same values as YEAR_ACCENT[4] in ../registry. Importing registry here would create an import cycle
// (registry → thesis → registry) that crashes at module init, so the year-4 tokens are referenced directly.
const ACCENT = { mark: 'var(--color-y4)', deep: 'var(--color-y4-deep)', soft: 'var(--color-y4-soft)' }
const DAY_NUMS = Array.from({ length: DAYS }, (_, i) => i + 1)

const TEMPT_ICON: Record<string, LucideIcon> = {
  mookata: UtensilsCrossed,
  series: Tv,
  game: Gamepad2,
  cafe: Coffee,
  concert: Music,
  birthday: Cake,
  nap: CloudRain,
}

type Phase = { kind: 'deadline' } | { kind: 'plan' } | { kind: 'day'; day: number } | { kind: 'summary' }

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)

export function Play({ onComplete, rng }: StationPlayProps<Raw>) {
  const reduce = useReducedMotion()
  // one temptation for each of days 1..6; the last night has none
  const temptations = useMemo(() => shuffle(TEMPTATIONS, rng).slice(0, DAYS - 1), [rng])

  const [phase, setPhase] = useState<Phase>({ kind: 'deadline' })
  const [deadlines, setDeadlines] = useState<[number | null, number | null]>([null, null])
  const [plan, setPlan] = useState<number[]>(() => Array(DAYS).fill(0))
  const [actual, setActual] = useState<number[]>(() => Array(DAYS).fill(0))
  const [wentOut, setWentOut] = useState<boolean[]>(() => Array(DAYS).fill(false))
  const [missed, setMissed] = useState<number[]>([]) // parts (0/1) whose self-set deadline was missed
  const [notice, setNotice] = useState<string | null>(null)
  const sent = useRef(false)

  const raw = (): Raw => ({
    total: TOTAL_UNITS,
    days: DAYS,
    deadlines: [deadlines[0] ?? DAYS, deadlines[1] ?? DAYS],
    plan,
    actual,
    temptations: [...temptations.map((t) => t.id), ''],
    wentOut,
  })

  /** end of day `day` (1-based) with `units` done: record, check self-set deadlines, advance */
  const endDay = (day: number, units: number, out: boolean) => {
    const nextActual = actual.map((a, i) => (i === day - 1 ? units : a))
    setActual(nextActual)
    setWentOut((w) => w.map((x, i) => (i === day - 1 ? out : x)))
    const done = sum(nextActual.slice(0, day))
    const newlyMissed = [0, 1].filter((p) => deadlines[p] === day && done < (p + 1) * UNITS_PER_PART)
    setMissed((m) => [...m, ...newlyMissed])
    setNotice(
      newlyMissed.length
        ? `พาร์ต ${newlyMissed.map((p) => p + 1).join(' กับ ')} ไม่เสร็จทันวันที่ตั้งไว้เอง คุณภาพงาน −${
            MISSED_DEADLINE_PENALTY * newlyMissed.length
          } ไม่เป็นไร ยังไปต่อได้`
        : null,
    )
    setPhase(day >= DAYS ? { kind: 'summary' } : { kind: 'day', day: day + 1 })
  }

  const finish = () => {
    if (sent.current) return
    sent.current = true
    onComplete(raw())
  }

  const key = phase.kind === 'day' ? `day-${phase.day}` : phase.kind
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        className="flex flex-1 flex-col gap-5"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
        transition={{ duration: reduce ? 0.15 : 0.25, ease: 'easeOut' }}
      >
        {phase.kind === 'deadline' && (
          <DeadlineStep value={deadlines} onChange={setDeadlines} onNext={() => setPhase({ kind: 'plan' })} />
        )}
        {phase.kind === 'plan' && (
          <PlanStep
            plan={plan}
            setPlan={setPlan}
            deadlines={deadlines}
            onNext={() => setPhase({ kind: 'day', day: 1 })}
          />
        )}
        {phase.kind === 'day' && (
          <DayStep
            day={phase.day}
            plan={plan}
            done={sum(actual.slice(0, phase.day - 1))}
            deadlines={deadlines}
            temptation={phase.day <= DAYS - 1 ? temptations[phase.day - 1] : undefined}
            notice={notice}
            onEnd={(units, out) => endDay(phase.day, units, out)}
          />
        )}
        {phase.kind === 'summary' && (
          <Summary plan={plan} actual={actual} missed={missed.length} quality={quality(raw())} onNext={finish} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/* ---------- shared bits ---------- */

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-(--radius-card) border-2 border-ink bg-card p-4 ${className}`}>{children}</section>
}

function StepTitle({ step, children }: { step: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold" style={{ color: ACCENT.deep }}>
        {step}
      </p>
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  )
}

/** 12 unit cells, filled = done; thicker dividers at part boundaries */
function UnitBar({ done, preview = 0 }: { done: number; preview?: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`เสร็จแล้ว ${done} จาก ${TOTAL_UNITS} ชิ้น`}>
      {Array.from({ length: TOTAL_UNITS }, (_, i) => {
        const filled = i < done
        const pending = !filled && i < done + preview
        return (
          <span
            key={i}
            className={`h-5 flex-1 rounded-[4px] border-2 border-ink transition-colors ${
              i > 0 && i % UNITS_PER_PART === 0 ? 'ml-1.5' : ''
            }`}
            style={{
              background: filled ? ACCENT.mark : pending ? ACCENT.soft : 'var(--color-card)',
              borderStyle: pending ? 'dashed' : 'solid',
            }}
          />
        )
      })}
    </div>
  )
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label={`ลด ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-13 place-items-center rounded-2xl border-2 border-ink bg-card shadow-(--shadow-sticker) transition-transform duration-100 active:translate-y-[3px] active:shadow-(--shadow-sticker-pressed) disabled:opacity-30 disabled:shadow-none"
      >
        <Minus size={22} aria-hidden />
      </button>
      <output aria-live="polite" className="min-w-20 text-center font-display text-4xl font-bold tabular-nums">
        {value}
        <span className="ml-1 text-base font-medium text-muted">ชิ้น</span>
      </output>
      <button
        type="button"
        aria-label={`เพิ่ม ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-13 place-items-center rounded-2xl border-2 border-ink bg-(--btn) shadow-(--shadow-sticker) transition-transform duration-100 active:translate-y-[3px] active:shadow-(--shadow-sticker-pressed) disabled:opacity-30 disabled:shadow-none"
        style={{ ['--btn' as string]: ACCENT.mark }}
      >
        <Plus size={22} aria-hidden />
      </button>
    </div>
  )
}

/* ---------- step 1: self-set sub-deadlines ---------- */

function DeadlineStep({
  value,
  onChange,
  onNext,
}: {
  value: [number | null, number | null]
  onChange: (v: [number | null, number | null]) => void
  onNext: () => void
}) {
  const set = (part: 0 | 1, day: number) => {
    const next: [number | null, number | null] = [...value]
    next[part] = day
    // part 2 can't be due before part 1
    if (part === 0 && next[1] !== null && next[1] < day) next[1] = day
    if (part === 1 && next[0] !== null && next[0] > day) next[0] = day
    onChange(next)
  }
  return (
    <>
      <StepTitle step="วางแผน 1/2">ตั้งกำหนดส่งย่อยให้ตัวเอง</StepTitle>
      <p className="text-muted">
        งานมี 3 พาร์ต พาร์ตละ {UNITS_PER_PART} ชิ้น พาร์ต 3 ส่งวันที่ {DAYS} (เลื่อนไม่ได้) ส่วนพาร์ต 1 กับ 2 แกเลือกเองว่าจะให้เสร็จภายในวันไหน
        ถ้าทำไม่ทันวันที่เลือก คุณภาพงานลด {MISSED_DEADLINE_PENALTY} แต้ม
      </p>
      {([0, 1] as const).map((part) => (
        <Card key={part} className="flex flex-col gap-3">
          <p className="font-display font-semibold">
            พาร์ต {part + 1}{' '}
            <span className="font-sans text-sm font-normal text-muted">
              (ชิ้นที่ {part * UNITS_PER_PART + 1}–{(part + 1) * UNITS_PER_PART}) เสร็จภายในวันที่
            </span>
          </p>
          <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label={`กำหนดส่งพาร์ต ${part + 1}`}>
            {DAY_NUMS.map((d) => {
              const on = value[part] === d
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set(part, d)}
                  className={`min-h-11 rounded-xl border-2 border-ink font-display font-semibold transition-[transform,background-color] duration-100 active:translate-y-[2px] ${
                    on ? 'bg-(--btn)' : 'bg-card'
                  }`}
                  style={{ ['--btn' as string]: ACCENT.mark }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </Card>
      ))}
      <p className="text-sm text-muted">เลือกวันที่ {DAYS} = ไม่ตั้งกำหนดย่อย ไปส่งรวมทีเดียววันสุดท้าย</p>
      <div className="mt-auto">
        <Button full accent={ACCENT.mark} disabled={value[0] === null || value[1] === null} onClick={onNext}>
          ไปวางแผนรายวัน
        </Button>
      </div>
    </>
  )
}

/* ---------- step 2: plan units per day ---------- */

function PlanStep({
  plan,
  setPlan,
  deadlines,
  onNext,
}: {
  plan: number[]
  setPlan: (p: number[]) => void
  deadlines: [number | null, number | null]
  onNext: () => void
}) {
  const total = sum(plan)
  const left = TOTAL_UNITS - total
  const bump = (i: number, delta: number) =>
    setPlan(plan.map((p, j) => (j === i ? Math.min(MAX_PER_DAY, Math.max(0, p + delta)) : p)))

  return (
    <>
      <StepTitle step="วางแผน 2/2">แต่ละวันจะทำกี่ชิ้น</StepTitle>
      <p className="text-muted">
        วันนึงทำได้ไม่เกิน {MAX_PER_DAY} ชิ้น วันไหนทำเกิน {CRUNCH_FROM} ชิ้น งานเริ่มหยาบ คุณภาพลดนิดนึง
      </p>
      <Card className="flex flex-col gap-3 px-2.5">
        <div className="grid grid-cols-7 gap-1">
          {plan.map((p, i) => {
            const flags = [0, 1].filter((part) => deadlines[part] === i + 1)
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="flex h-5 items-center text-[11px] font-semibold" style={{ color: ACCENT.deep }}>
                  {flags.length > 0 && (
                    <>
                      <Flag size={12} aria-hidden />
                      <span className="sr-only">กำหนดส่ง</span>P{flags.map((f) => f + 1).join(',')}
                    </>
                  )}
                  {i === DAYS - 1 && flags.length === 0 && 'ส่ง'}
                </span>
                <button
                  type="button"
                  aria-label={`เพิ่มแผนวันที่ ${i + 1}`}
                  disabled={left <= 0 || p >= MAX_PER_DAY}
                  onClick={() => bump(i, 1)}
                  className="grid h-11 w-full place-items-center rounded-xl border-2 border-ink bg-(--btn) transition-transform duration-100 active:translate-y-[2px] disabled:opacity-30"
                  style={{ ['--btn' as string]: ACCENT.mark }}
                >
                  <Plus size={18} aria-hidden />
                </button>
                {/* mini stack of planned units */}
                <div className="flex h-[78px] w-full flex-col-reverse items-center gap-0.5" aria-hidden>
                  {Array.from({ length: p }, (_, k) => (
                    <span
                      key={k}
                      className="h-2.5 w-7 rounded-[3px] border-2 border-ink"
                      style={{ background: k >= CRUNCH_FROM ? 'var(--color-grad)' : ACCENT.soft }}
                    />
                  ))}
                </div>
                <span className="font-display text-lg leading-none font-bold tabular-nums">{p}</span>
                <button
                  type="button"
                  aria-label={`ลดแผนวันที่ ${i + 1}`}
                  disabled={p <= 0}
                  onClick={() => bump(i, -1)}
                  className="grid h-11 w-full place-items-center rounded-xl border-2 border-ink bg-card transition-transform duration-100 active:translate-y-[2px] disabled:opacity-30"
                >
                  <Minus size={18} aria-hidden />
                </button>
                <span className="text-xs text-muted">วัน {i + 1}</span>
              </div>
            )
          })}
        </div>
      </Card>
      <p className="text-center font-medium" aria-live="polite">
        {left > 0 ? `วางแล้ว ${total}/${TOTAL_UNITS} ชิ้น เหลืออีก ${left}` : `ครบ ${TOTAL_UNITS} ชิ้นแล้ว`}
      </p>
      <div className="mt-auto">
        <Button full accent={ACCENT.mark} disabled={left !== 0} onClick={onNext}>
          เริ่มวันที่ 1
        </Button>
      </div>
    </>
  )
}

/* ---------- step 3: live through each day ---------- */

function DayStep({
  day,
  plan,
  done,
  deadlines,
  temptation,
  notice,
  onEnd,
}: {
  day: number
  plan: number[]
  done: number
  deadlines: [number | null, number | null]
  temptation?: { id: string; text: string; go: string }
  notice: string | null
  onEnd: (units: number, wentOut: boolean) => void
}) {
  const [choice, setChoice] = useState<'go' | 'stay' | null>(null)
  const [units, setUnits] = useState(0)
  const remaining = TOTAL_UNITS - done
  const isLast = day === DAYS
  const planToday = plan[day - 1]
  const plannedBy = sum(plan.slice(0, day))
  const cap = Math.min(remaining, choice === 'go' ? MAX_IF_OUT : MAX_PER_DAY)
  const dueToday = [0, 1].filter((p) => deadlines[p] === day && deadlines[p] !== DAYS)
  const Icon = temptation ? (TEMPT_ICON[temptation.id] ?? Tv) : Moon

  const pick = (c: 'go' | 'stay') => {
    setChoice(c)
    if (c === 'go') setUnits((u) => Math.min(u, MAX_IF_OUT, remaining))
  }

  return (
    <>
      <div className="flex items-end justify-between">
        <StepTitle step={`วันที่ ${day} จาก ${DAYS}`}>{isLast ? 'คืนก่อนส่ง' : 'อีกวันในปีสี่'}</StepTitle>
        <p className="text-right text-sm text-muted">
          แผนวันนี้ <span className="font-display text-lg font-bold text-ink">{planToday}</span> ชิ้น
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border-2 border-dashed border-ink/40 px-3 py-2 text-sm" style={{ background: 'var(--color-grad-soft)' }}>
          {notice}
        </p>
      )}

      <Card className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
            เสร็จแล้ว <b className="tabular-nums">{done}</b>/{TOTAL_UNITS}
          </span>
          <span className="text-muted">ตามแผนจบวันนี้ควรได้ {plannedBy}</span>
        </div>
        <UnitBar done={done} preview={units} />
        {dueToday.length > 0 && (
          <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: ACCENT.deep }}>
            <Flag size={14} aria-hidden /> วันนี้ครบกำหนดพาร์ต {dueToday.map((p) => p + 1).join(' กับ ')} ที่ตั้งไว้เอง (ต้องได้{' '}
            {(Math.max(...dueToday) + 1) * UNITS_PER_PART} ชิ้น)
          </p>
        )}
      </Card>

      {isLast ? (
        <Card className="flex items-start gap-3">
          <Icon size={28} aria-hidden className="mt-0.5 shrink-0" />
          <p>
            {remaining > 0
              ? `คืนนี้คืนสุดท้าย เหลืออีก ${remaining} ชิ้น ไม่มีใครชวนไปไหน มีแต่กาแฟกับเดดไลน์`
              : 'งานเสร็จครบแล้ว คืนนี้แค่กดส่ง แล้วไปนอน'}
          </p>
        </Card>
      ) : (
        temptation && (
          <Card className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ background: ACCENT.soft }}>
                <Icon size={22} aria-hidden />
              </span>
              <p className="leading-snug">{temptation.text}</p>
            </div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="วันนี้จะทำอะไร">
              {(
                [
                  ['go', temptation.go, `เหลือเวลาทำงานได้ ${MAX_IF_OUT} ชิ้น`],
                  ['stay', 'อยู่ห้องทำงาน', `ทำได้ถึง ${MAX_PER_DAY} ชิ้น`],
                ] as const
              ).map(([c, label, sub]) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={choice === c}
                  onClick={() => pick(c)}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-2 border-ink px-2 py-1.5 leading-tight transition-[transform,background-color] duration-100 active:translate-y-[2px] ${
                    choice === c ? 'bg-(--btn)' : 'bg-card'
                  }`}
                  style={{ ['--btn' as string]: ACCENT.mark }}
                >
                  <span className="font-display font-semibold">{label}</span>
                  <span className="text-xs text-muted">{sub}</span>
                </button>
              ))}
            </div>
          </Card>
        )
      )}

      {!isLast && choice && (
        <div className="flex flex-col gap-2">
          <p className="text-center font-medium">วันนี้ทำไปกี่ชิ้น</p>
          <Stepper value={units} min={0} max={cap} onChange={setUnits} label="ชิ้นงานวันนี้" />
        </div>
      )}

      <div className="mt-auto">
        {isLast ? (
          <Button full accent={ACCENT.mark} onClick={() => onEnd(remaining, false)}>
            {remaining > 0 ? `ปั่นให้เสร็จ ${remaining} ชิ้น แล้วส่ง` : 'กดส่งงาน'}
          </Button>
        ) : (
          <Button full accent={ACCENT.mark} disabled={!choice} onClick={() => onEnd(Math.min(units, cap), choice === 'go')}>
            จบวันที่ {day}
          </Button>
        )}
      </div>
    </>
  )
}

/* ---------- step 4: plan vs actual ---------- */

function Summary({
  plan,
  actual,
  missed,
  quality: q,
  onNext,
}: {
  plan: number[]
  actual: number[]
  missed: number
  quality: number
  onNext: () => void
}) {
  const reduce = useReducedMotion()
  const maxV = Math.max(MAX_PER_DAY, ...actual)
  const H = 120
  const colW = 44
  const W = colW * DAYS
  const y = (v: number) => H - (v / maxV) * H
  return (
    <>
      <StepTitle step="ส่งงานแล้ว">แผนในหัว กับ 7 วันจริง</StepTitle>
      <Card className="flex flex-col gap-3">
        <svg viewBox={`-4 -8 ${W + 8} ${H + 32}`} className="w-full" role="img" aria-label={`แผน ${plan.join(', ')} ทำจริง ${actual.join(', ')}`}>
          <line x1={0} x2={W} y1={H} y2={H} stroke="var(--color-ink)" strokeWidth={2} />
          {DAY_NUMS.map((d, i) => {
            const x = i * colW
            const a = actual[i]
            const p = plan[i]
            return (
              <g key={d}>
                {/* actual: highlighter fill off-register + ink outline */}
                {a > 0 && (
                  <>
                    <motion.rect
                      x={x + 13}
                      width={22}
                      rx={3}
                      fill={ACCENT.mark}
                      initial={reduce ? false : { y: H, height: 0 }}
                      animate={{ y: y(a) + 3, height: H - y(a) - 3 }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                    />
                    <rect x={x + 10} y={y(a)} width={22} height={H - y(a)} rx={3} fill="none" stroke="var(--color-ink)" strokeWidth={2} />
                  </>
                )}
                {/* plan: dashed marker line */}
                <line
                  x1={x + 4}
                  x2={x + 40}
                  y1={y(p)}
                  y2={y(p)}
                  stroke="var(--color-ink)"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                <text x={x + 22} y={H + 18} textAnchor="middle" fontSize={12} fill="var(--color-muted)">
                  วัน {d}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-[3px] border-dashed border-ink" aria-hidden /> แผน
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[3px] border-2 border-ink" style={{ background: ACCENT.mark }} aria-hidden /> ทำจริง
          </span>
        </div>
      </Card>
      <Card className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-sm text-muted">คุณภาพงาน</p>
          <p className="font-display text-2xl font-bold tabular-nums">{q}/100</p>
        </div>
        <div>
          <p className="text-sm text-muted">กำหนดย่อยที่หลุด</p>
          <p className="font-display text-2xl font-bold tabular-nums">{missed} ครั้ง</p>
        </div>
      </Card>
      <div className="flex items-center gap-2">
        <Mascot pose="sly" size={64} bob={false} />
        <Bubble>ส่งทันก็คือส่งทัน เรียนจบแล้วนะเพื่อน</Bubble>
      </div>
      <div className="mt-auto">
        <Button full accent={ACCENT.mark} onClick={onNext}>
          ไปต่อ
        </Button>
      </div>
    </>
  )
}
