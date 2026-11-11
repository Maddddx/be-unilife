import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { Screen } from '../components/Screen'
import { useGame } from '../core/store'

const CONFETTI = ['var(--color-y1)', 'var(--color-y2)', 'var(--color-y3)', 'var(--color-y4)']

export function Graduation() {
  const toReveal = useGame((s) => s.toReveal)
  const reduce = useReducedMotion()

  return (
    <Screen className="relative gap-8 overflow-hidden">
      {!reduce &&
        Array.from({ length: 18 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute top-0 size-2.5 rounded-sm"
            style={{ left: `${(i * 53) % 100}%`, background: CONFETTI[i % 4] }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ y: 700, rotate: 360 * (i % 2 ? 1 : -1), opacity: 0 }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay: (i % 6) * 0.15, ease: 'easeIn' }}
          />
        ))}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={reduce ? false : { y: 40, rotate: -20, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="text-8xl"
          aria-hidden
        >
          🎓
        </motion.div>
        <h1 className="text-3xl font-bold">ยินดีด้วย คุณเรียนจบแล้ว!</h1>
        <p className="max-w-xs text-lg text-ink/85">
          ตลอด 4 ปี สมองคุณตัดสินใจไปหลายเรื่องแบบที่คุณอาจไม่ทันสังเกต ใบ transcript ของคุณออกแล้ว
        </p>
      </div>

      <Button full accent="var(--color-grad)" onClick={toReveal}>
        เปิดดู Behavioral Transcript
      </Button>
    </Screen>
  )
}
