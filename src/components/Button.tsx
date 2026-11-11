import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** accent colour (CSS colour or var()); defaults to ink */
  accent?: string
  full?: boolean
}

export function Button({ variant = 'primary', accent, full, className = '', style, ...rest }: Props) {
  const base =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-display text-base font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40'
  const look =
    variant === 'primary'
      ? 'bg-(--btn) text-white shadow-(--shadow-card) hover:brightness-110'
      : 'bg-transparent text-(--btn) ring-2 ring-(--btn) ring-inset hover:bg-(--btn)/10'
  return (
    <button
      {...rest}
      className={`${base} ${look} ${full ? 'w-full' : ''} ${className}`}
      style={{ ['--btn' as string]: accent ?? 'var(--color-ink)', ...style }}
    />
  )
}
