import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'motion/react'
import { Dumbbell, GraduationCap, Lightbulb, Ticket, type LucideIcon } from 'lucide-react'
import { Button } from '../../components/Button'
import { Bubble, Mascot } from '../../components/Mascot'
import type { StationPlayProps } from '../../core/types'
import { YEAR_ACCENT } from '../../core/accent'
import type { Answer, Choice, Raw } from './metrics'
import { arrangeDeck, type PairId, type Scenario } from './scenarios'

// year 2 accent (core/accent has no import cycle, so a constant would also work)
const accent = () => YEAR_ACCENT[2]

const PAIR_ICON: Record<PairId, LucideIcon> = {
  concert: Ticket,
  track: GraduationCap,
  gym: Dumbbell,
  project: Lightbulb,
}

/** px of horizontal drag (or px/s of fling) that counts as a decision */
const SWIPE_DISTANCE = 110
const SWIPE_VELOCITY = 600
/** ignore extra taps while a card is leaving */
const LOCK_MS = 260

function SwipeCard({
  card,
  onChoose,
}: {
  card: Scenario
  onChoose: (c: Choice) => void
}) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], reduce ? [0, 0, 0] : [-10, 0, 10])
  const goOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1])
  const stopOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0])
  const Icon = PAIR_ICON[card.pairId]

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onChoose('go')
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onChoose('stop')
  }

  // exit direction comes from AnimatePresence `custom` (the latest choice), not from props,
  // because the leaving card never re-renders after the choice is made
  const variants = {
    enter: reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1 },
    leave: (d: Choice | null) =>
      reduce
        ? { opacity: 0, transition: { duration: 0.15 } }
        : { x: d === 'stop' ? -320 : 320, opacity: 0, transition: { duration: 0.22 } },
  }

  return (
    <motion.article
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col gap-4 rounded-(--radius-card) border-2 border-ink bg-card p-5 shadow-(--shadow-card) select-none active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      variants={variants}
      initial="enter"
      animate="show"
      exit="leave"
      transition={{ duration: reduce ? 0.15 : 0.25, ease: 'easeOut' }}
      aria-live="polite"
    >
      {/* drag feedback stamps */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 rotate-6 rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-semibold"
        style={{ opacity: goOpacity, background: accent().mark }}
      >
        ไปต่อ
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-4 left-4 -rotate-6 rounded-lg border-2 border-ink bg-paper px-2 py-0.5 font-display text-sm font-semibold"
        style={{ opacity: stopOpacity }}
      >
        พอแค่นี้
      </motion.span>

      <span
        className="grid size-12 place-items-center rounded-(--radius-tile) border-2 border-ink"
        style={{ background: accent().soft }}
        aria-hidden
      >
        <Icon size={24} strokeWidth={2} className="text-ink" />
      </span>
      <p className="text-base leading-relaxed">{card.text}</p>
      <p className="mt-auto font-display text-xl font-semibold">{card.ask}</p>
    </motion.article>
  )
}

export function Play({ onComplete, rng }: StationPlayProps<Raw>) {
  const [deck] = useState(() => arrangeDeck(rng))
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<Choice | null>(null)
  const answers = useRef<Answer[]>([])
  const shownAt = useRef(0)
  const locked = useRef(false)
  const done = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    shownAt.current = performance.now()
  }, [index])
  useEffect(() => () => clearTimeout(timer.current), [])

  const choose = useCallback(
    (choice: Choice) => {
      if (locked.current || done.current) return
      const card = deck[index]
      if (!card) return
      locked.current = true
      answers.current.push({
        scenarioId: card.id,
        pairId: card.pairId,
        sunk: card.sunk,
        choice,
        position: index,
        ms: Math.round(performance.now() - shownAt.current),
      })
      setDir(choice)
      if (index + 1 >= deck.length) {
        done.current = true
        onComplete({ answers: [...answers.current] })
        return
      }
      setIndex(index + 1)
      timer.current = setTimeout(() => {
        locked.current = false
      }, LOCK_MS)
    },
    [deck, index, onComplete],
  )

  // keyboard: ← พอแค่นี้ / → ไปต่อ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') choose('go')
      else if (e.key === 'ArrowLeft') choose('stop')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose])

  const card = deck[Math.min(index, deck.length - 1)]
  const showMascot = index === 4 || index === 5

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* progress */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">
          เรื่องที่ {Math.min(index + 1, deck.length)} จาก {deck.length}
        </p>
        <div className="flex gap-1" aria-hidden>
          {deck.map((d, i) => (
            <span
              key={d.id}
              className="h-2 w-4 rounded-full border border-ink"
              style={{ background: i < index ? accent().mark : 'var(--color-card)' }}
            />
          ))}
        </div>
      </div>

      {/* deck */}
      <div className="relative max-h-[400px] min-h-[300px] flex-1">
        {index < deck.length - 1 && (
          <div
            aria-hidden
            className="absolute inset-0 translate-x-1.5 translate-y-2 rotate-2 rounded-(--radius-card) border-2 border-ink/40 bg-card"
          />
        )}
        <AnimatePresence initial={false} custom={dir}>
          <SwipeCard key={card.id} card={card} onChoose={choose} />
        </AnimatePresence>
      </div>

      {showMascot ? (
        <div className="mt-auto flex items-center gap-3">
          <Mascot pose="sly" size={56} />
          <Bubble>ครึ่งทางแล้ว ตอบแบบที่จะทำจริง ๆ นะ ไม่มีใครแอบดู</Bubble>
        </div>
      ) : (
        <p className="mt-auto text-center text-sm text-muted">ปัดการ์ดซ้ายหรือขวาก็ได้ หรือกดปุ่มข้างล่าง</p>
      )}

      {/* choices — left = stop, right = go, same positions on every card */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={() => choose('stop')} className="flex-col gap-0 py-2 leading-tight">
          <span>พอแค่นี้</span>
          <span className="font-sans text-xs font-normal text-muted">{card.stop}</span>
        </Button>
        <Button accent={accent().mark} onClick={() => choose('go')} className="flex-col gap-0 py-2 leading-tight">
          <span>ไปต่อ</span>
          <span className="font-sans text-xs font-normal">{card.go}</span>
        </Button>
      </div>
    </div>
  )
}
