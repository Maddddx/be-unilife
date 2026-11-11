import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Clock, Coffee, Minus, Plus, UserRound, Users } from 'lucide-react'
import { Button } from '../../components/Button'
import { Bubble, Mascot } from '../../components/Mascot'
import type { StationPlayProps } from '../../core/types'
import { shuffle } from '../../core/rng'
import { YEAR_ACCENT } from '../../core/accent'
import { PLAY } from './content'
import { ENDOWMENT, LEVELS, type CondAnswer, type Raw } from './metrics'

type Step = 'rules' | 'solo' | 'bridge' | 'cond'

/*
 * Order of the conditional table: randomised with rng() and shown one case per screen.
 * Why not fixed ascending: on a 390px screen we show one case at a time, and an ascending
 * 0-3-6-9 sequence invites "drawing a staircase" — a presentation artefact that would
 * mechanically inflate the slope and push people into the conditional-cooperator bin.
 * Randomising (seeded, so tests/replays are reproducible) breaks that ladder; metrics sort
 * answers by level before computing the slope, so the order doesn't affect scoring.
 */
export function Play({ onComplete, rng }: StationPlayProps<Raw>) {
  const accent = YEAR_ACCENT[3]
  const reduce = useReducedMotion()
  const [order] = useState<number[]>(() => shuffle(LEVELS, rng))
  const [step, setStep] = useState<Step>('rules')
  const [solo, setSolo] = useState<number | null>(null)
  const [condIdx, setCondIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => LEVELS.map(() => null))
  const started = useRef<number | null>(null)
  const done = useRef(false)
  useEffect(() => {
    started.current = performance.now()
  }, [])

  const current = answers[condIdx]
  const isLast = condIdx === order.length - 1

  function setCurrent(v: number) {
    setAnswers((prev) => prev.map((x, i) => (i === condIdx ? v : x)))
  }

  function nextCond() {
    if (current === null) return
    if (!isLast) {
      setCondIdx((i) => i + 1)
      return
    }
    if (done.current) return
    done.current = true
    const conditional: CondAnswer[] = order.map((others, i) => ({ others, own: answers[i] ?? 0 }))
    onComplete({
      unconditional: solo ?? 0,
      conditional,
      order,
      ms: Math.round(performance.now() - (started.current ?? performance.now())),
    })
  }

  const motionProps = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: -24 },
    transition: { duration: reduce ? 0.15 : 0.3, ease: 'easeOut' as const },
  }

  const key = step === 'cond' ? `cond-${condIdx}` : step

  return (
    <div className="flex flex-1 flex-col gap-4">
      {step !== 'rules' && <RuleStrip />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.section key={key} {...motionProps} className="flex flex-1 flex-col gap-4">
          {step === 'rules' && (
            <>
              <Card>
                <h2 className="text-xl font-semibold">{PLAY.rulesTitle}</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  <RuleRow icon={<Coffee size={22} strokeWidth={2} aria-hidden />} fill="var(--color-paper)">
                    <span>{PLAY.ruleKeep}</span>
                    <strong className="font-display">{PLAY.ruleKeepValue}</strong>
                  </RuleRow>
                  <RuleRow icon={<Users size={22} strokeWidth={2} aria-hidden />} fill={accent.mark}>
                    <span>{PLAY.ruleGroup}</span>
                    <strong className="font-display">{PLAY.ruleGroupValue}</strong>
                  </RuleRow>
                </ul>
                <div className="mt-4 rounded-xl p-3 text-sm leading-relaxed" style={{ background: accent.soft }}>
                  <p>{PLAY.exampleAll}</p>
                  <p>{PLAY.exampleNone}</p>
                </div>
              </Card>
              <div className="mt-auto">
                <Button full accent={accent.mark} onClick={() => setStep('solo')}>
                  {PLAY.rulesCta}
                </Button>
              </div>
            </>
          )}

          {step === 'solo' && (
            <>
              <Card>
                <h2 className="text-xl font-semibold">{PLAY.soloTitle}</h2>
                <p className="mt-1 text-muted">{PLAY.soloSub}</p>
                <div className="mt-4">
                  <HoursPicker value={solo} onChange={setSolo} fill={accent.mark} label={PLAY.soloTitle} />
                </div>
              </Card>
              <div className="mt-auto">
                <Button full disabled={solo === null} onClick={() => setStep('bridge')}>
                  {PLAY.soloCta}
                </Button>
              </div>
            </>
          )}

          {step === 'bridge' && (
            <>
              <Card>
                <h2 className="text-xl font-semibold">{PLAY.bridgeTitle}</h2>
                <p className="mt-2">{PLAY.bridgeBody}</p>
              </Card>
              <div className="flex items-center gap-3">
                <Mascot pose="sly" size={84} />
                <Bubble>{PLAY.bridgeMascot}</Bubble>
              </div>
              <div className="mt-auto">
                <Button full accent={accent.mark} onClick={() => setStep('cond')}>
                  {PLAY.bridgeCta}
                </Button>
              </div>
            </>
          )}

          {step === 'cond' && (
            <>
              <Card>
                <p className="text-sm font-semibold" style={{ color: accent.deep }}>
                  กรณีที่ {condIdx + 1} จาก {order.length}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{PLAY.condTitle(order[condIdx])}</h2>
                <Friends avg={order[condIdx]} fill={accent.mark} />
                <p className="mt-4 font-display font-semibold">{PLAY.condSub}</p>
                <div className="mt-2">
                  <HoursPicker
                    value={current}
                    onChange={setCurrent}
                    fill={accent.mark}
                    label={`${PLAY.condTitle(order[condIdx])} ${PLAY.condSub}`}
                  />
                </div>
              </Card>
              <div className="mt-auto">
                <Button full disabled={current === null} onClick={nextCond}>
                  {isLast ? PLAY.condDone : PLAY.condNext}
                </Button>
              </div>
            </>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-(--radius-card) border-2 border-ink bg-card p-4">{children}</div>
}

function RuleRow({ icon, fill, children }: { icon: ReactNode; fill: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ background: fill }}>
        {icon}
      </span>
      <span className="flex flex-col leading-snug">{children}</span>
    </li>
  )
}

/** Compact reminder of the payoff rule, pinned above every decision. */
function RuleStrip() {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-card px-3 py-1">
        <Coffee size={16} strokeWidth={2} aria-hidden /> เก็บ 1 ชม. = คุณ +1
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-card px-3 py-1">
        <Users size={16} strokeWidth={2} aria-hidden /> ใครลง 1 ชม. = ทุกคน +0.4
      </span>
    </div>
  )
}

/** The other three members, each shown with the same average hours. */
function Friends({ avg, fill }: { avg: number; fill: string }) {
  return (
    <ul className="mt-3 grid grid-cols-3 gap-2" aria-label={`เพื่อน 3 คน ลงคนละ ${avg} ชั่วโมงโดยเฉลี่ย`}>
      {[1, 2, 3].map((i) => (
        <li key={i} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-ink/15 p-2">
          <UserRound size={26} strokeWidth={2} aria-hidden />
          <span className="text-xs text-muted">{PLAY.friend(i)}</span>
          <span className="h-2.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
            <span className="block h-full rounded-full" style={{ width: `${(avg / ENDOWMENT) * 100}%`, background: fill }} />
          </span>
          <span className="flex items-center gap-1 font-display text-sm font-semibold">
            <Clock size={14} strokeWidth={2} aria-hidden /> {avg} ชม.
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * 0..10 hours picker: native range (keyboard + screen reader friendly) plus big −/+ buttons.
 * Starts "unset" (null) so no default anchors the answer; the next button stays disabled until
 * the player touches it.
 */
function HoursPicker({
  value,
  onChange,
  fill,
  label,
}: {
  value: number | null
  onChange: (v: number) => void
  fill: string
  label: string
}) {
  const unset = value === null
  const v = value ?? Math.round(ENDOWMENT / 2)
  const set = (x: number) => onChange(Math.min(ENDOWMENT, Math.max(0, x)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="ลดหนึ่งชั่วโมง"
          onClick={() => set(v - 1)}
          disabled={!unset && v <= 0}
          className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-card shadow-(--shadow-sticker) transition-transform duration-100 active:translate-y-[3px] active:shadow-(--shadow-sticker-pressed) disabled:opacity-40"
        >
          <Minus size={22} strokeWidth={2} aria-hidden />
        </button>
        <div className="text-center" aria-live="polite">
          <span className={`font-display text-4xl font-bold ${unset ? 'text-muted' : ''}`}>{unset ? '?' : v}</span>
          <span className="ml-1 text-muted">/ {ENDOWMENT} ชม.</span>
        </div>
        <button
          type="button"
          aria-label="เพิ่มหนึ่งชั่วโมง"
          onClick={() => set(v + 1)}
          disabled={!unset && v >= ENDOWMENT}
          className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-card shadow-(--shadow-sticker) transition-transform duration-100 active:translate-y-[3px] active:shadow-(--shadow-sticker-pressed) disabled:opacity-40"
        >
          <Plus size={22} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={ENDOWMENT}
        step={1}
        value={v}
        aria-label={label}
        aria-valuetext={unset ? 'ยังไม่ได้เลือก' : `${v} ชั่วโมง`}
        onChange={(e) => set(Number(e.currentTarget.value))}
        onPointerDown={(e) => unset && set(Number(e.currentTarget.value))}
        className={`h-11 w-full cursor-pointer accent-(--color-ink) ${unset ? 'opacity-50' : ''}`}
      />

      {/* 10 hour blocks: filled = group work, empty = kept */}
      <div className="grid grid-cols-10 gap-1" aria-hidden>
        {Array.from({ length: ENDOWMENT }, (_, i) => (
          <span
            key={i}
            className="h-5 rounded-md border-2 border-ink/70"
            style={{ background: !unset && i < v ? fill : 'var(--color-card)' }}
          />
        ))}
      </div>

      {unset ? (
        <p className="text-center text-sm text-muted">{PLAY.pickHint}</p>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="rounded-full px-3 py-1 font-semibold" style={{ background: fill }}>
            {PLAY.youPut} {v} ชม.
          </span>
          <span className="rounded-full border border-ink/20 px-3 py-1">
            {PLAY.youKeep} {ENDOWMENT - v} ชม.
          </span>
        </div>
      )}
    </div>
  )
}
