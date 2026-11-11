import { motion, useReducedMotion } from 'motion/react'
import type { Grade } from '../../core/transcript'

/** Round "stamped" grade, filled with the year's highlighter. */
export function GradeStamp({ grade, fill, size = 72, delay = 0.2 }: { grade: Grade | '–'; fill: string; size?: number; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      initial={reduce ? false : { scale: 1.6, rotate: -18, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 16, delay }}
      className="grid shrink-0 place-items-center rounded-full border-2 border-ink font-display font-bold shadow-(--shadow-sticker)"
      style={{ width: size, height: size, background: fill, fontSize: size * 0.42 }}
      aria-label={`เกรด ${grade}`}
    >
      {grade}
    </motion.span>
  )
}
