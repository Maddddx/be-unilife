/** Flat illustration of a campus at sunrise — decorative. */
export function Campus({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 220" className={className} role="img" aria-label="ภาพตึกมหาวิทยาลัย">
      {/* sky glow + sun */}
      <circle cx="270" cy="70" r="34" fill="var(--color-y2)" opacity="0.9" />
      <circle cx="270" cy="70" r="52" fill="var(--color-y2)" opacity="0.15" />
      {/* clouds */}
      <g fill="#fff">
        <ellipse cx="70" cy="52" rx="30" ry="11" />
        <ellipse cx="92" cy="45" rx="20" ry="11" />
        <ellipse cx="210" cy="34" rx="22" ry="8" />
      </g>
      {/* ground */}
      <path d="M0 182 Q180 162 360 182 V220 H0 Z" fill="var(--color-y3-soft)" />
      <path d="M0 196 Q180 180 360 196 V220 H0 Z" fill="var(--color-y3)" opacity="0.35" />
      {/* main building */}
      <rect x="92" y="98" width="176" height="84" rx="4" fill="#fff" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M84 100 L180 62 L276 100 Z" fill="var(--color-y1)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      {/* clock tower */}
      <rect x="164" y="30" width="32" height="40" fill="#fff" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M158 32 L180 12 L202 32 Z" fill="var(--color-y4)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="180" cy="49" r="9" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" />
      <path d="M180 49 V43 M180 49 H185" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      {/* columns */}
      {[112, 140, 208, 236].map((x) => (
        <rect key={x} x={x} y="112" width="12" height="56" rx="2" fill="var(--color-y2-soft)" stroke="var(--color-ink)" strokeWidth="2.5" />
      ))}
      {/* door */}
      <path d="M166 182 V146 Q180 132 194 146 V182 Z" fill="var(--color-y4-soft)" stroke="var(--color-ink)" strokeWidth="3" />
      {/* trees */}
      {[
        [44, 160],
        [318, 158],
      ].map(([x, y]) => (
        <g key={x}>
          <rect x={x - 3} y={y} width="6" height="24" fill="var(--color-ink)" />
          <circle cx={x} cy={y - 6} r="20" fill="var(--color-y3)" stroke="var(--color-ink)" strokeWidth="3" />
        </g>
      ))}
    </svg>
  )
}
