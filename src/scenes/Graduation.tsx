import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../components/Button'
import { Highlight } from '../components/Highlight'
import { Screen } from '../components/Screen'
import { Mascot } from '../components/Mascot'
import { useGame } from '../core/store'
import { GRAD_ACCENT } from '../stations/registry'

const CONFETTI = ['var(--color-y1)', 'var(--color-y2)', 'var(--color-y3)', 'var(--color-y4)', 'var(--color-grad)']

export function Graduation() {
  const toReveal = useGame((s) => s.toReveal)
  const reduce = useReducedMotion()

  return (
    <Screen className="relative gap-8 overflow-hidden">
      {!reduce &&
        Array.from({ length: 22 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute top-0 border-[1.5px] border-ink ${i % 3 ? 'h-2 w-3.5 rounded-[2px]' : 'size-2.5 rounded-full'}`}
            style={{ left: `${(i * 47) % 100}%`, background: CONFETTI[i % CONFETTI.length] }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ y: 760, rotate: 360 * (i % 2 ? 1 : -1), opacity: 0 }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay: (i % 6) * 0.15, ease: 'easeIn' }}
          />
        ))}

      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <motion.div
          initial={reduce ? false : { y: 40, rotate: -20, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          <Mascot pose="celebrate" size={150} />
        </motion.div>
        <h1 className="text-3xl leading-snug font-bold">
          ยินดีด้วย
          <br />
          <Highlight color={GRAD_ACCENT.mark} delay={0.5}>
            คุณเรียนจบแล้ว!
          </Highlight>
        </h1>
        <p className="max-w-xs text-lg text-ink/85">
          ตลอด 4 ปี สมองคุณตัดสินใจไปหลายเรื่องแบบที่คุณอาจไม่ทันสังเกต ใบ transcript ของคุณออกแล้ว
        </p>
      </div>

      <Button full accent={GRAD_ACCENT.mark} onClick={toReveal}>
        เปิดดู Behavioral Transcript
      </Button>
    </Screen>
  )
}
