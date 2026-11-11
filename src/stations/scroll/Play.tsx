import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  BatteryLow,
  BookOpen,
  Bookmark,
  Cat,
  ChevronsUp,
  Clapperboard,
  Dog,
  Gamepad2,
  Heart,
  Laugh,
  Lock,
  MessageCircle,
  Moon,
  Music,
  Plane,
  Repeat2,
  Shirt,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { Bubble, Mascot } from '../../components/Mascot'
import type { StationPlayProps } from '../../core/types'
import { YEAR_ACCENT } from '../registry'
import { makeCards, type FeedCard, type Topic } from './feed'
import {
  FEED_CAP_SEC,
  LIMIT_OPTIONS,
  PREDICT_MAX,
  PREDICT_MIN,
  PREDICT_STEP,
  formatDuration,
  type Raw,
} from './metrics'

const APP_NAME = 'วนวน'
/** Mascot tease appears once, this many seconds into the feed, for TEASE_FOR seconds. */
const TEASE_AT = 35
const TEASE_FOR = 5

const TOPIC_ICON: Record<Topic, LucideIcon> = {
  cat: Cat,
  food: Utensils,
  music: Music,
  game: Gamepad2,
  joke: Laugh,
  dog: Dog,
  travel: Plane,
  study: BookOpen,
  fashion: Shirt,
  drama: Clapperboard,
}

type Phase = 'predict' | 'feed' | 'commit'

export function Play({ onComplete, rng }: StationPlayProps<Raw>) {
  const [phase, setPhase] = useState<Phase>('predict')
  const [predictedSec, setPredictedSec] = useState(60)
  const feedResult = useRef<{ actualSec: number; capped: boolean; cardsSeen: number } | null>(null)
  const done = useRef(false)

  const finish = (commitment: Raw['commitment']) => {
    if (done.current || !feedResult.current) return
    done.current = true
    onComplete({ predictedSec, ...feedResult.current, commitment })
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'predict' && (
        <Step key="predict">
          <PredictStep value={predictedSec} onChange={setPredictedSec} onStart={() => setPhase('feed')} />
        </Step>
      )}
      {phase === 'feed' && (
        <Step key="feed">
          <FeedStep
            rng={rng}
            onEnd={(r) => {
              feedResult.current = r
              setPhase('commit')
            }}
          />
        </Step>
      )}
      {phase === 'commit' && (
        <Step key="commit">
          <CommitStep onChoose={finish} />
        </Step>
      )}
    </AnimatePresence>
  )
}

function Step({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────────────── 1. predict ───────────────────────── */

function PredictStep({
  value,
  onChange,
  onStart,
}: {
  value: number
  onChange: (v: number) => void
  onStart: () => void
}) {
  const accent = YEAR_ACCENT[1]
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted">ห้าทุ่มครึ่ง ปิดไฟแล้ว แต่มือยังถือมือถืออยู่</p>
        <h2 className="text-2xl font-bold">แป๊บเดียวน่า ว่าแต่จะไถกี่นาที?</h2>
      </div>

      <div className="flex flex-col gap-4 rounded-(--radius-card) border-2 border-ink bg-card p-5">
        <p className="text-center font-display text-4xl font-bold" aria-live="polite">
          <span className="rounded-lg px-2" style={{ background: accent.mark }}>
            {formatDuration(value)}
          </span>
        </p>
        <label className="flex flex-col gap-2">
          <span className="sr-only">เวลาที่คิดว่าจะไถ</span>
          <input
            type="range"
            min={PREDICT_MIN}
            max={PREDICT_MAX}
            step={PREDICT_STEP}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-valuetext={formatDuration(value)}
            className="h-11 w-full cursor-pointer accent-(--color-ink)"
          />
          <span className="flex justify-between text-sm text-muted">
            <span>{formatDuration(PREDICT_MIN)}</span>
            <span>{formatDuration(PREDICT_MAX)}</span>
          </span>
        </label>
        <p className="text-sm text-muted">นับเป็นเวลาจริงที่แกเล่นอยู่ตอนนี้เลยนะ</p>
      </div>

      <div className="mt-auto">
        <Button full onClick={onStart}>
          <Repeat2 size={20} aria-hidden /> เปิดแอป {APP_NAME}
        </Button>
      </div>
    </div>
  )
}

/* ───────────────────────── 2. feed ───────────────────────── */

/** 23:30 + one in-app minute per real second → the cap lands exactly on 02:00. */
function clockLabel(elapsedSec: number): string {
  const total = (23 * 60 + 30 + Math.floor(elapsedSec)) % (24 * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function FeedStep({
  rng,
  onEnd,
}: {
  rng: () => number
  onEnd: (r: { actualSec: number; capped: boolean; cardsSeen: number }) => void
}) {
  const reduce = useReducedMotion()
  const [cards, setCards] = useState<FeedCard[]>(() => makeCards(rng, 0, 8))
  /** cards.length we already appended for, so a burst of scroll events appends once */
  const appendedAt = useRef(0)
  const [elapsed, setElapsed] = useState(0)
  const [capped, setCapped] = useState(false)
  const start = useRef(0)
  const seen = useRef(1)
  const ended = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  // Real-time clock (performance.now). Ticks 4×/s only to drive the small status-bar clock.
  useEffect(() => {
    start.current = performance.now()
    const id = window.setInterval(() => {
      const s = (performance.now() - start.current) / 1000
      if (s >= FEED_CAP_SEC) {
        setElapsed(FEED_CAP_SEC)
        setCapped(true)
        window.clearInterval(id)
      } else {
        setElapsed(s)
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [])

  const end = useCallback(
    (byCap: boolean) => {
      if (ended.current) return
      ended.current = true
      const s = byCap ? FEED_CAP_SEC : Math.min(FEED_CAP_SEC, (performance.now() - start.current) / 1000)
      onEnd({ actualSec: Math.round(s * 10) / 10, capped: byCap, cardsSeen: seen.current })
    },
    [onEnd],
  )

  const onScroll = () => {
    const el = scroller.current
    if (!el || capped) return
    const h = el.clientHeight || 1
    seen.current = Math.max(seen.current, Math.round(el.scrollTop / h) + 1)
    // infinite: keep ~3 screens of content ahead
    if (el.scrollTop + h * 3 >= el.scrollHeight) {
      if (appendedAt.current === cards.length) return
      appendedAt.current = cards.length
      const extra = makeCards(rng, cards.length, 6, cards[cards.length - 1])
      setCards((cs) => [...cs, ...extra])
    }
  }

  const tease = elapsed >= TEASE_AT && elapsed < TEASE_AT + TEASE_FOR && !capped

  return (
    <div className="flex flex-1 flex-col gap-4">
      <style>{`@keyframes wonwon-play { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
      {/* phone */}
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card shadow-(--shadow-sticker)">
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2 text-sm">
          <span className="font-display font-semibold tabular-nums">{clockLabel(elapsed)}</span>
          <span className="flex items-center gap-1.5 font-display font-bold">
            <Repeat2 size={16} aria-hidden /> {APP_NAME}
          </span>
          <span className="flex items-center gap-1 text-muted" aria-hidden>
            <Wifi size={16} />
            <BatteryLow size={18} />
          </span>
        </div>

        <div
          ref={scroller}
          onScroll={onScroll}
          className="h-[min(60dvh,540px)] snap-y snap-mandatory overflow-y-auto overscroll-contain"
          aria-label={`ฟีด ${APP_NAME} เลื่อนดูได้เรื่อย ๆ`}
          tabIndex={0}
        >
          {cards.map((c, i) => (
            <Card key={c.id} card={c} first={i === 0} reduce={!!reduce} />
          ))}
        </div>

        <AnimatePresence>
          {tease && (
            <motion.div
              className="pointer-events-none absolute right-2 bottom-3 left-2 flex items-end gap-1"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Mascot pose="sly" size={64} bob={false} />
              <div className="mb-6">
                <Bubble>อีกคลิปเดียวเนอะ... คลิปเดียวจริง ๆ</Bubble>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {capped && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/95 p-6 text-center text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              role="alertdialog"
              aria-label="ตีสองแล้ว"
            >
              <Moon size={44} aria-hidden />
              <p className="font-display text-2xl font-bold">ตีสองแล้ว...</p>
              <p className="text-white/80">แบตเหลือ 4% แอปก็ยังมีคลิปให้ดูต่อไม่หมด</p>
              <Button accent={YEAR_ACCENT[1].mark} onClick={() => end(true)} autoFocus>
                วางมือถือ
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!capped && (
        <Button full onClick={() => end(false)}>
          <Moon size={20} aria-hidden /> พอแล้ว นอนดีกว่า
        </Button>
      )}
    </div>
  )
}

function Card({ card, first, reduce }: { card: FeedCard; first: boolean; reduce: boolean }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const Icon = TOPIC_ICON[card.topic]
  const tint = `var(--color-${card.tint})`
  const soft = `var(--color-${card.tint}-soft)`

  return (
    <article className="flex h-full snap-start snap-always flex-col gap-3 p-4" style={{ background: soft }}>
      {/* "clip": ink frame with an off-register highlighter block behind it */}
      <div className="relative flex-1">
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl" style={{ background: tint }} />
        <div className="relative grid h-full place-items-center rounded-2xl border-2 border-ink bg-card">
          <Icon size={88} strokeWidth={1.75} className="text-ink" aria-hidden />
          {/* fake playback progress */}
          <div className="absolute right-4 bottom-3 left-4 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink"
              style={
                reduce
                  ? { width: '40%' }
                  : { width: '100%', transformOrigin: 'left', animation: 'wonwon-play 9s linear infinite' }
              }
            />
          </div>
          {first && (
            <p className="absolute top-3 flex items-center gap-1 rounded-full border-2 border-ink bg-card px-3 py-0.5 text-sm font-medium">
              <ChevronsUp size={16} aria-hidden className={reduce ? '' : 'animate-bounce'} /> ปัดขึ้นดูคลิปต่อไป
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted">@{card.handle}</p>
        <p className="leading-snug">{card.caption}</p>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <IconToggle on={liked} onClick={() => setLiked((v) => !v)} label="ถูกใจ">
          <Heart size={20} aria-hidden fill={liked ? 'var(--color-y2)' : 'none'} /> {card.likes}
        </IconToggle>
        <span className="inline-flex min-h-11 items-center gap-1.5 px-2 text-muted">
          <MessageCircle size={20} aria-hidden /> {card.comments}
        </span>
        <span className="flex-1" />
        <IconToggle on={saved} onClick={() => setSaved((v) => !v)} label="บันทึก">
          <Bookmark size={20} aria-hidden fill={saved ? 'var(--color-y1)' : 'none'} />
        </IconToggle>
      </div>
    </article>
  )
}

function IconToggle({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2 transition-transform duration-100 active:scale-90"
    >
      {children}
    </button>
  )
}

/* ───────────────────────── 3. commit ───────────────────────── */

function CommitStep({ onChoose }: { onChoose: (c: Raw['commitment']) => void }) {
  const accent = YEAR_ACCENT[1]
  const [limit, setLimit] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted">ก่อนปิดจอ แอปเด้งถามขึ้นมา</p>
        <h2 className="text-2xl font-bold">พรุ่งนี้ให้ {APP_NAME} ล็อกตัวเองไหม?</h2>
      </div>

      <div className="flex flex-col gap-4 rounded-(--radius-card) border-2 border-ink bg-card p-5">
        <p className="flex items-center gap-2">
          <Lock size={20} aria-hidden /> ไถครบเวลาที่ตั้ง แอปจะปิดให้เอง
        </p>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="ลิมิตพรุ่งนี้">
          {LIMIT_OPTIONS.map((s) => {
            const on = limit === s
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setLimit(s)}
                className="min-h-12 rounded-xl border-2 border-ink font-display font-semibold transition-[transform,background-color] duration-100 active:translate-y-0.5"
                style={{ background: on ? accent.mark : 'var(--color-card)' }}
              >
                {formatDuration(s)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Button
          full
          accent={accent.mark}
          disabled={limit === null}
          onClick={() => onChoose({ chosen: true, limitSec: limit })}
        >
          <Lock size={18} aria-hidden /> ตั้งลิมิต{limit !== null ? ` ${formatDuration(limit)}` : ''}
        </Button>
        <Button full variant="ghost" onClick={() => onChoose({ chosen: false, limitSec: null })}>
          ไม่ต้องตั้ง
        </Button>
      </div>
    </div>
  )
}
