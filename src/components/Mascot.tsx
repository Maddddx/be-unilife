import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * "ต่อม" — the trickster brain (brand archetype: Jester). Same ink + off-register
 * highlighter style as the campus illustration. See docs/DESIGN.md §3.
 * During play it may tease but must never name a bias; on the reveal it confesses.
 */
export type MascotPose = 'idle' | 'sly' | 'confess' | 'celebrate'

const INK = 'var(--color-ink)'
const W = 2.5
const BODY =
  'M30 70 C14 70 10 50 22 44 C18 28 36 18 48 24 C54 12 76 12 80 24 C94 18 110 32 102 46 C114 54 108 74 92 72 C88 82 70 84 62 76 C52 84 34 82 30 70 Z'

const stroke = { stroke: INK, strokeWidth: W, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

function Face({ pose }: { pose: MascotPose }) {
  switch (pose) {
    case 'sly':
      return (
        <g {...stroke}>
          <path d="M44 56 h9 M67 56 h9" />
          <path d="M43 49 l9 2 M68 50 l9 -3" />
          <path d="M52 66 q10 5 18 -3" />
        </g>
      )
    case 'confess':
      return (
        <g>
          <circle cx="50" cy="56" r="3" fill={INK} />
          <circle cx="72" cy="56" r="3" fill={INK} />
          <path d="M50 66 q11 7 22 0" {...stroke} />
          <path d="M53 66 h16" {...stroke} />
          {/* sweat drop */}
          <path d="M92 36 q5 7 0 10 q-5 -3 0 -10 Z" fill="var(--color-y4)" stroke={INK} strokeWidth={2} />
        </g>
      )
    case 'celebrate':
      return (
        <g>
          <path d="M45 57 q5 -6 10 0 M67 57 q5 -6 10 0" {...stroke} />
          <path d="M51 64 q10 12 20 0 Z" fill={INK} />
        </g>
      )
    default:
      return (
        <g>
          <circle cx="50" cy="56" r="3" fill={INK} />
          <circle cx="72" cy="56" r="3" fill={INK} />
          <path d="M53 65 q8 6 16 0" {...stroke} />
        </g>
      )
  }
}

function Arms({ pose }: { pose: MascotPose }) {
  if (pose === 'celebrate')
    return (
      <g {...stroke}>
        <path d="M22 50 L8 34" />
        <path d="M102 50 L114 34" />
      </g>
    )
  if (pose === 'confess')
    return (
      <g {...stroke}>
        <path d="M24 62 L12 70" />
        <path d="M104 54 L114 38" />
        <path d="M110 34 l4 4 l4 -4" />
      </g>
    )
  return (
    <g {...stroke}>
      <path d="M24 62 L12 70" />
      <path d="M104 60 L114 68" />
    </g>
  )
}

export function Mascot({
  pose = 'idle',
  size = 96,
  bob = true,
  className = '',
}: {
  pose?: MascotPose
  size?: number
  /** gentle idle float; disabled automatically for reduced motion */
  bob?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.svg
      viewBox="0 0 124 104"
      width={size}
      height={(size * 104) / 124}
      className={className}
      role="img"
      aria-label="ต่อม สมองจอมป่วน"
      animate={bob && !reduce ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* legs */}
      <g {...stroke}>
        <path d="M50 80 v14 h-6 M72 80 v14 h6" />
      </g>
      <Arms pose={pose} />
      {/* body: highlighter fill off-register, then ink outline */}
      <path d={BODY} fill="var(--color-y2)" transform="translate(4 4)" />
      <path d={BODY} {...stroke} />
      {/* folds */}
      <g {...stroke} strokeWidth={2}>
        <path d="M34 40 q8 -8 14 0" />
        <path d="M60 28 q8 -6 14 2" />
        <path d="M84 42 q6 -6 11 2" />
      </g>
      <Face pose={pose} />
      {pose === 'celebrate' && (
        <g>
          <path d="M40 22 L62 11 L84 22 L62 31 Z" fill={INK} />
          <path d="M84 22 v12" {...stroke} stroke="var(--color-grad)" strokeWidth={3} />
        </g>
      )}
    </motion.svg>
  )
}

/** Speech bubble for ต่อม. The tail points at the mascot (left by default). */
export function Bubble({ children, tail = 'left' }: { children: ReactNode; tail?: 'left' | 'bottom' }) {
  return (
    <div className="relative rounded-2xl border-2 border-ink bg-card px-4 py-2.5 text-base leading-snug">
      {children}
      <span
        aria-hidden
        className={`absolute size-3.5 rotate-45 border-ink bg-card ${
          tail === 'left' ? 'top-1/2 -left-[9px] -translate-y-1/2 border-b-2 border-l-2' : '-bottom-[9px] left-8 border-r-2 border-b-2'
        }`}
      />
    </div>
  )
}
