import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/** Mobile-first page container with a soft enter/exit transition. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.main
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${className}`}
    >
      {children}
    </motion.main>
  )
}
