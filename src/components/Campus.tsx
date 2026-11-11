/**
 * Campus in the CI's "ink + highlighter" style: navy line-work with highlighter
 * fills printed slightly off-register (offset down-right), like marker on a sketch.
 * All four year colours + graduation orange appear once. Decorative.
 */
const INK = 'var(--color-ink)'
const W = 2.5

/** draws `d` twice: highlighter fill shifted by (dx, dy), then ink outline on top */
function Marked({ d, fill, dx = 5, dy = 4 }: { d: string; fill: string; dx?: number; dy?: number }) {
  return (
    <g>
      <path d={d} fill={fill} transform={`translate(${dx} ${dy})`} />
      <path d={d} fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  )
}

export function Campus({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 210" className={className} role="img" aria-label="ภาพตึกมหาวิทยาลัย">
      {/* sun */}
      <Marked d="M300 58 a22 22 0 1 0 -44 0 a22 22 0 1 0 44 0 Z" fill="var(--color-y1)" />
      {/* clouds: outline only */}
      <path
        d="M44 64 h46 a12 12 0 0 0 -16 -14 a15 15 0 0 0 -27 4 a10 10 0 0 0 -3 10 Z"
        fill="var(--color-card)"
        stroke={INK}
        strokeWidth={W}
        strokeLinejoin="round"
      />
      <path d="M212 36 h28 a8 8 0 0 0 -10 -9 a10 10 0 0 0 -18 9 Z" fill="var(--color-card)" stroke={INK} strokeWidth={W} strokeLinejoin="round" />

      {/* trees */}
      <Marked d="M50 186 V160 M50 160 a20 20 0 1 1 0.1 0 Z" fill="var(--color-y3)" />
      <path d="M50 186 V156" stroke={INK} strokeWidth={W} strokeLinecap="round" />
      <Marked d="M316 186 V164 M316 164 a16 16 0 1 1 0.1 0 Z" fill="var(--color-y3)" />
      <path d="M316 186 V160" stroke={INK} strokeWidth={W} strokeLinecap="round" />

      {/* building body (paper-white, outline) */}
      <rect x="96" y="100" width="168" height="86" rx="3" fill="var(--color-card)" stroke={INK} strokeWidth={W} />
      {/* roof */}
      <Marked d="M86 102 L180 66 L274 102 Z" fill="var(--color-y2)" />
      {/* tower */}
      <rect x="164" y="34" width="32" height="38" fill="var(--color-card)" stroke={INK} strokeWidth={W} />
      <Marked d="M158 36 L180 16 L202 36 Z" fill="var(--color-y2)" dx={4} dy={3} />
      <circle cx="180" cy="52" r="8" fill="none" stroke={INK} strokeWidth={W} />
      <path d="M180 52 V47 M180 52 H184" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* flag */}
      <path d="M180 16 V2" stroke={INK} strokeWidth={W} strokeLinecap="round" />
      <Marked d="M180 3 L198 7 L180 11 Z" fill="var(--color-grad)" dx={3} dy={2} />
      {/* windows */}
      {[114, 138, 210, 234].map((x) => (
        <Marked key={x} d={`M${x} 116 h14 v22 h-14 Z`} fill="var(--color-y4)" dx={3} dy={3} />
      ))}
      {/* door */}
      <Marked d="M166 186 V152 Q180 138 194 152 V186" fill="var(--color-y4)" />
      {/* steps + ground */}
      <path d="M156 186 H204" stroke={INK} strokeWidth={W} strokeLinecap="round" />
      <path d="M14 187 C120 183 240 191 346 186" fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" />
    </svg>
  )
}
