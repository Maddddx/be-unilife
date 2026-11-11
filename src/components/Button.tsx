import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /**
   * Highlighter fill (CSS colour or var(), e.g. accent.mark). Text stays ink.
   * Omit for a solid ink button with white text.
   */
  accent?: string
  full?: boolean
}

/**
 * "Sticker" button: ink outline + hard ink offset that presses down on tap.
 * Height 52px keeps it a comfortable touch target.
 */
export function Button({ variant = 'primary', accent, full, className = '', style, ...rest }: Props) {
  const base =
    'inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border-2 border-ink px-6 font-display text-base font-semibold transition-[transform,box-shadow,background-color] duration-100 ease-out select-none disabled:cursor-not-allowed disabled:opacity-40'
  const press =
    'shadow-(--shadow-sticker) active:translate-y-[3px] active:shadow-(--shadow-sticker-pressed) disabled:translate-y-0'
  const look =
    variant === 'ghost'
      ? 'bg-card text-ink hover:bg-paper'
      : accent
        ? 'bg-(--btn) text-ink hover:brightness-[1.03]'
        : 'bg-ink text-white hover:bg-ink/90'
  return (
    <button
      {...rest}
      className={`${base} ${press} ${look} ${full ? 'w-full' : ''} ${className}`}
      style={accent ? { ['--btn' as string]: accent, ...style } : style}
    />
  )
}
