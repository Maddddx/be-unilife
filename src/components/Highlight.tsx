import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * A hand-drawn highlighter stroke behind its text, swiped in once on mount.
 * The one signature motion of the CI — use sparingly (main titles only).
 */
export function Highlight({
  children,
  color = 'var(--color-y1)',
  delay = 0.25,
}: {
  children: ReactNode
  color?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <span className="relative isolate inline-block px-[0.12em] whitespace-nowrap">
      <motion.svg
        aria-hidden
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute -inset-x-[0.06em] top-[38%] -z-10 h-[62%] w-[calc(100%+0.12em)]"
        style={{ originX: 0 }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.55, delay, ease: [0.65, 0, 0.35, 1] }}
      >
        <path
          d="M4 9 C40 4 90 6 140 4 S190 5 197 7 L195 33 C150 37 100 34 60 36 S10 35 3 32 Z"
          fill={color}
        />
      </motion.svg>
      <span className="relative">{children}</span>
    </span>
  )
}
