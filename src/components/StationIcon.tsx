import type { CSSProperties } from 'react'
import { BookOpen, GraduationCap, ShoppingBag, Smartphone, Split, Users, type LucideIcon } from 'lucide-react'
import type { StationId } from '../core/types'

/**
 * Vector icon per station (replaces the emoji in StationDef.icon for rendering —
 * emoji render differently on every OS). Stroke is always ink, 2px-equivalent.
 */
const ICONS: Record<StationId | 'graduation', LucideIcon> = {
  scroll: Smartphone,
  paylater: ShoppingBag,
  sunkcost: Split,
  groupwork: Users,
  thesis: BookOpen,
  graduation: GraduationCap,
}

export function StationIcon({ id, size = 24 }: { id: StationId | 'graduation'; size?: number }) {
  const Icon = ICONS[id]
  return <Icon size={size} strokeWidth={2} absoluteStrokeWidth={size > 32} aria-hidden className="text-ink" />
}

const TILE = {
  sm: { box: 'size-10 rounded-xl', icon: 20 },
  md: { box: 'size-14 rounded-(--radius-tile)', icon: 28 },
  lg: { box: 'size-28 rounded-[1.75rem]', icon: 52 },
} as const

/** Rounded tile filled with a highlighter colour, ink outline, ink icon. */
export function IconTile({
  id,
  fill,
  size = 'md',
  sticker = false,
  style,
}: {
  id: StationId | 'graduation'
  fill: string
  size?: keyof typeof TILE
  /** add the hard ink offset used by buttons */
  sticker?: boolean
  style?: CSSProperties
}) {
  const t = TILE[size]
  return (
    <span
      className={`grid shrink-0 place-items-center border-2 border-ink ${t.box} ${sticker ? 'shadow-(--shadow-sticker)' : ''}`}
      style={{ background: fill, ...style }}
      aria-hidden
    >
      <StationIcon id={id} size={t.icon} />
    </span>
  )
}
