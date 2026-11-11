import { useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Backpack,
  CalendarClock,
  Footprints,
  Headphones,
  Keyboard,
  LampDesk,
  Shirt,
  ShoppingBag,
  Speaker,
  Wallet,
  Watch,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { Bubble, Mascot } from '../../components/Mascot'
import type { StationPlayProps } from '../../core/types'
import { YEAR_ACCENT } from '../../core/accent'
import { SHOP_NAME } from './content'
import type { OfferRecord, Raw } from './metrics'
import {
  ALLOWANCE,
  ESSENTIALS,
  MONTHS,
  balanceIn,
  baht,
  buildSchedule,
  canAfford,
  dueInMonth,
  remainingAfter,
  type ItemIcon,
  type MonthNo,
  type Offer,
} from './model'

/** read lazily: registry imports this module, so YEAR_ACCENT isn't ready at module-eval time */
const year1 = () => YEAR_ACCENT[1]

const ITEM_ICON: Record<ItemIcon, LucideIcon> = {
  headphones: Headphones,
  speaker: Speaker,
  shoe: Footprints,
  jacket: Shirt,
  watch: Watch,
  keyboard: Keyboard,
  backpack: Backpack,
  lamp: LampDesk,
}

type Step =
  | { kind: 'month'; m: MonthNo }
  | { kind: 'offer'; i: number }
  | { kind: 'ask' }
  | { kind: 'result' }

export function Play({ onComplete, rng }: StationPlayProps<Raw>) {
  const reduce = useReducedMotion()
  // schedule is fixed for the whole station (seeded → reproducible)
  const [schedule] = useState<Offer[]>(() => buildSchedule(rng))
  const [records, setRecords] = useState<OfferRecord[]>([])
  const [startBalances, setStartBalances] = useState<number[]>([])
  const [step, setStep] = useState<Step>({ kind: 'month', m: 1 })
  const [guess, setGuess] = useState('')
  const [perceived, setPerceived] = useState<number | null>(null)
  const [flash, setFlash] = useState<{ key: number; text: string } | null>(null)
  const done = useRef(false)

  const anyInstallment = records.some((r) => r.bought && r.framing === 'installment')
  const actualNext = dueInMonth(records, 4)
  const actualRemaining = remainingAfter(records, 3)

  function openMonth(m: MonthNo) {
    setStartBalances((b) => (b.length >= m ? b : [...b, balanceIn(records, m)]))
    setFlash(null)
    const first = schedule.findIndex((o) => o.month === m)
    setStep({ kind: 'offer', i: first })
  }

  function decide(i: number, buy: boolean) {
    const o = schedule[i]
    const balance = balanceIn(records, o.month)
    const affordable = canAfford(balance, o)
    const rec: OfferRecord = {
      id: o.id,
      pair: o.pair,
      month: o.month,
      framing: o.framing,
      price: o.price,
      months: o.months,
      affordable,
      bought: buy && affordable,
    }
    const nextRecords = [...records, rec]
    setRecords(nextRecords)
    if (rec.bought) {
      const cost = o.framing === 'full' ? o.price : o.monthly
      setFlash({ key: i, text: `−${baht(cost)}` })
    } else setFlash(null)

    const nextOffer = schedule[i + 1]
    if (nextOffer && nextOffer.month === o.month) setStep({ kind: 'offer', i: i + 1 })
    else if (nextOffer) setStep({ kind: 'month', m: nextOffer.month as MonthNo })
    else if (nextRecords.some((r) => r.bought && r.framing === 'installment')) setStep({ kind: 'ask' })
    else setStep({ kind: 'result' })
  }

  function submitGuess(e: FormEvent) {
    e.preventDefault()
    const n = Number(guess.replace(/[^\d]/g, ''))
    if (guess.trim() === '' || !Number.isFinite(n)) return
    setPerceived(n)
    setStep({ kind: 'result' })
  }

  function finish() {
    if (done.current) return
    done.current = true
    onComplete({
      offers: records,
      perceivedNextMonth: anyInstallment ? (perceived ?? 0) : null,
      actualNextMonth: actualNext,
      actualRemaining,
      startBalances,
    })
  }

  const motionProps = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.25, ease: 'easeOut' as const },
      }

  const stepKey =
    step.kind === 'month' ? `m${step.m}` : step.kind === 'offer' ? `o${step.i}` : step.kind

  return (
    <div className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">
        <motion.div key={stepKey} {...motionProps} className="flex flex-1 flex-col gap-4">
          {step.kind === 'month' && (
            <MonthCard m={step.m} due={dueInMonth(records, step.m)} balance={balanceIn(records, step.m)} onOpen={() => openMonth(step.m)} />
          )}
          {step.kind === 'offer' && (
            <OfferCard
              offer={schedule[step.i]}
              index={schedule.filter((o, j) => j < step.i && o.month === schedule[step.i].month).length}
              count={schedule.filter((o) => o.month === schedule[step.i].month).length}
              balance={balanceIn(records, schedule[step.i].month)}
              flash={flash}
              onDecide={(buy) => decide(step.i, buy)}
            />
          )}
          {step.kind === 'ask' && (
            <form onSubmit={submitGuess} className="flex flex-1 flex-col gap-4">
              <div className="rounded-(--radius-card) border-2 border-ink bg-card p-5">
                <CalendarClock size={28} strokeWidth={2} aria-hidden className="text-ink" />
                <h2 className="mt-3 text-xl font-semibold">จบเทอมสองแล้ว ก่อนขึ้นเดือนหน้า...</h2>
                <label htmlFor="guess" className="mt-2 block">
                  ตอนนี้คิดว่ามียอดผ่อนค้างเดือนหน้าเท่าไร?
                </label>
                <p className="text-sm text-muted">ตอบจากความรู้สึกเลย ไม่มีถูกผิด</p>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-ink bg-paper px-4 focus-within:ring-3 focus-within:ring-(--color-y4-deep)">
                  <input
                    id="guess"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.replace(/[^\d,]/g, '').slice(0, 9))}
                    className="min-h-13 w-full bg-transparent font-display text-2xl font-semibold outline-none"
                  />
                  <span className="font-display text-xl font-semibold">฿</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGuess('0')}
                  className="mt-3 min-h-11 rounded-xl border-2 border-ink/20 bg-card px-4 text-sm font-semibold hover:border-ink"
                >
                  น่าจะไม่มีนะ (0 ฿)
                </button>
              </div>
              <div className="mt-auto">
                <Button type="submit" full disabled={guess.trim() === ''}>
                  ดูยอดจริง
                </Button>
              </div>
            </form>
          )}
          {step.kind === 'result' && (
            <ResultCard
              perceived={anyInstallment ? perceived : null}
              actualNext={actualNext}
              remaining={actualRemaining}
              bought={records.filter((r) => r.bought).length}
              onDone={finish}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------- month start */

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${strong ? 'border-t-2 border-ink pt-3' : ''}`}>
      <span className={strong ? 'font-semibold' : 'text-muted'}>{label}</span>
      <span className={`font-display tabular-nums ${strong ? 'text-2xl font-bold' : 'font-semibold'}`}>{value}</span>
    </div>
  )
}

function MonthCard({ m, due, balance, onOpen }: { m: MonthNo; due: number; balance: number; onOpen: () => void }) {
  const accent = year1()
  return (
    <>
      <div className="rounded-(--radius-card) border-2 border-ink bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl border-2 border-ink" style={{ background: accent.mark }}>
            <Wallet size={22} strokeWidth={2} aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold" style={{ color: accent.deep }}>
              เดือนที่ {m} จาก {MONTHS.length}
            </p>
            <h2 className="text-xl font-semibold">{m === 1 ? 'ค่าขนมเข้าแล้ว!' : 'ต้นเดือนอีกแล้ว เงินเข้า'}</h2>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Row label="ค่าขนม" value={`+${baht(ALLOWANCE)}`} />
          <Row label="ค่าหอ ค่ากิน ค่ารถ" value={`−${baht(ESSENTIALS)}`} />
          {due > 0 && <Row label="ตัดค่างวดอัตโนมัติ" value={`−${baht(due)}`} />}
          <Row label="เหลือใช้เดือนนี้" value={baht(balance)} strong />
        </div>
      </div>
      {m === 3 && (
        <div className="flex items-center gap-3">
          <Mascot pose="sly" size={72} />
          <Bubble>เดือนสุดท้ายของเทอมแล้ว แอปยังเด้งโปรไม่พักเลยนะ</Bubble>
        </div>
      )}
      <div className="mt-auto">
        <Button full accent={accent.mark} onClick={onOpen}>
          <ShoppingBag size={20} strokeWidth={2} aria-hidden /> เปิดแอป {SHOP_NAME}
        </Button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ offer */

function OfferCard({
  offer,
  index,
  count,
  balance,
  flash,
  onDecide,
}: {
  offer: Offer
  index: number
  count: number
  balance: number
  flash: { key: number; text: string } | null
  onDecide: (buy: boolean) => void
}) {
  const accent = year1()
  const Icon = ITEM_ICON[offer.item.icon]
  const affordable = canAfford(balance, offer)
  const inst = offer.framing === 'installment'
  return (
    <>
      {/* app chrome: invented shop, ink + yellow highlighter */}
      <div className="overflow-hidden rounded-(--radius-card) border-2 border-ink bg-card">
        <div className="flex items-center justify-between gap-2 border-b-2 border-ink px-4 py-2.5" style={{ background: accent.soft }}>
          <span className="flex items-center gap-1.5 font-display font-bold">
            <span className="grid size-7 place-items-center rounded-lg border-2 border-ink" style={{ background: accent.mark }}>
              <ShoppingBag size={15} strokeWidth={2.25} aria-hidden />
            </span>
            {SHOP_NAME}
          </span>
          <span className="text-xs text-muted">
            เดือน {offer.month} ดีลที่ {index + 1}/{count}
          </span>
        </div>

        <div className="relative flex items-center justify-between gap-3 px-4 py-3">
          <div className="leading-tight">
            <p className="text-xs text-muted">เงินที่เหลือเดือนนี้</p>
            <p className="font-display text-xl font-bold tabular-nums" aria-live="polite">
              {baht(balance)}
            </p>
          </div>
          <AnimatePresence>
            {flash && (
              <motion.span
                key={flash.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="rounded-full border-2 border-ink px-2.5 py-0.5 text-sm font-semibold tabular-nums"
                style={{ background: accent.mark }}
              >
                {flash.text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-4 mb-4 rounded-2xl border-2 border-ink p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink" style={{ background: accent.soft }}>
              <Icon size={32} strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{offer.item.name}</h2>
              <p className="text-sm text-muted">{offer.item.blurb}</p>
            </div>
          </div>
          <div className="mt-4">
            {inst ? (
              <>
                <p className="font-display leading-none">
                  <span className="text-base font-semibold">เดือนละ </span>
                  <span className="text-4xl font-bold tabular-nums">{Math.round(offer.monthly).toLocaleString('en-US')}</span>
                  <span className="text-xl font-semibold"> ฿</span>
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-md border-2 border-ink px-1.5 font-semibold" style={{ background: accent.mark }}>
                    ผ่อน 0%
                  </span>
                  <span>× {offer.months} เดือน</span>
                  <span className="text-xs text-muted">(รวม {baht(offer.price)})</span>
                </p>
              </>
            ) : (
              <>
                <p className="font-display leading-none">
                  <span className="text-4xl font-bold tabular-nums">{offer.price.toLocaleString('en-US')}</span>
                  <span className="text-xl font-semibold"> ฿</span>
                </p>
                <p className="mt-2 text-sm text-muted">จ่ายครั้งเดียวจบ</p>
              </>
            )}
          </div>
        </div>
      </div>

      {!affordable && <p className="text-center text-sm text-muted">เดือนนี้เงินเหลือไม่พอสำหรับชิ้นนี้ ไว้ก่อนนะ</p>}

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={() => onDecide(false)}>
          ข้าม
        </Button>
        <Button accent={accent.mark} disabled={!affordable} onClick={() => onDecide(true)}>
          ซื้อ
        </Button>
      </div>
    </>
  )
}

/* ----------------------------------------------------------------- result */

function ResultCard({
  perceived,
  actualNext,
  remaining,
  bought,
  onDone,
}: {
  perceived: number | null
  actualNext: number
  remaining: number
  bought: number
  onDone: () => void
}) {
  const accent = year1()
  let note: string
  if (perceived === null)
    note = bought === 0 ? 'สามเดือนไม่ได้ของสักชิ้น แต่ก็ไม่มีบิลตามมาเหมือนกัน' : 'ซื้อแบบจ่ายจบทุกชิ้น เดือนหน้าไม่มีงวดตามมา'
  else if (actualNext > perceived) note = 'งวดละนิดเดียว รวม ๆ แล้วก็... ไม่นิดนะ ทุกคนก็เป็น'
  else if (actualNext === perceived) note = 'ตรงเป๊ะ จำงวดของตัวเองได้หมดเลย'
  else note = 'จริง ๆ น้อยกว่าที่คิดอีก เผื่อใจไว้ก่อนก็ดีนะ'

  return (
    <>
      <div className="rounded-(--radius-card) border-2 border-ink bg-card p-5">
        <h2 className="text-xl font-semibold">สรุปเทอมนี้</h2>
        <div className="mt-4 flex flex-col gap-2">
          <Row label="ของที่ได้มา" value={`${bought} ชิ้น`} />
          {perceived !== null && <Row label="ยอดผ่อนเดือนหน้าที่คิดไว้" value={baht(perceived)} />}
          <Row label="ยอดผ่อนเดือนหน้าจริง" value={baht(actualNext)} strong />
        </div>
        {remaining > 0 && (
          <p className="mt-3 text-sm text-muted">ยังมีงวดค้างรวมทั้งหมด {baht(remaining)} ทยอยตัดไปอีกหลายเดือน</p>
        )}
        <p className="mt-4 rounded-xl px-3 py-2" style={{ background: accent.soft }}>
          {note}
        </p>
      </div>
      <div className="mt-auto">
        <Button full onClick={onDone}>
          ปิดแอป ไปช่วงต่อไป
        </Button>
      </div>
    </>
  )
}
