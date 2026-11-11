import type { ComponentType } from 'react'

export type StationId = 'scroll' | 'paylater' | 'sunkcost' | 'groupwork' | 'thesis'

export type Year = 1 | 2 | 3 | 4

export type Level = 'low' | 'mid' | 'high'

/** One row of "what you actually did" shown on the reveal card. */
export interface Fact {
  label: string
  value: string
}

/**
 * The measured result of a station, expressed as distance from a rational benchmark.
 * score = 0 means the player behaved exactly like the rational benchmark.
 */
export interface TraitScore {
  /** 0..100, 0 = rational benchmark */
  score: number
  level: Level
  /** Thai, shown on the reveal only (may name the bias), e.g. "คุณไถนานกว่าที่ตั้งใจ 2.3 เท่า" */
  headline: string
  facts: Fact[]
}

export interface ResearchNote {
  /** id in src/core/sources.ts */
  sourceId: string
  /** Thai sentence. Only include numbers if the source is verified. */
  claim: string
  /** sample / limitation, Thai */
  caveat?: string
}

/** Static reveal content for a station (Thai). Bias names are allowed here. */
export interface RevealContent {
  /** English BE term(s), e.g. "Present bias · Naivete" */
  biasName: string
  /** short Thai name for the radar axis, e.g. "คุมใจตัวเอง" */
  axisLabel: string
  /** why the brain does this — shown first (mechanism-first) */
  mechanism: string
  research: ResearchNote[]
  /** where students meet this in real life */
  inLife: string
  /** practical coping / nudge / commitment idea */
  howToCope: string
  /** link to EC416 course chapter, e.g. "บท 6 Time Preference" */
  courseLink?: string
}

export interface StationPlayProps<Raw> {
  /** call exactly once when the player finishes the station */
  onComplete: (raw: Raw) => void
  /** seeded RNG in [0, 1). Use for all randomisation / counterbalancing. */
  rng: () => number
}

export interface StationDef<Raw = unknown> {
  id: StationId
  year: Year
  /** term within the year, if relevant */
  term?: 1 | 2
  /** neutral moment title — must NOT name a bias, e.g. "คืนแรกในหอ" */
  title: string
  /** neutral 1–3 sentence narrative shown before play */
  intro: string
  /** emoji kept as a text fallback only — UI renders the vector icon from components/StationIcon */
  icon: string
  Play: ComponentType<StationPlayProps<Raw>>
  score: (raw: Raw) => TraitScore
  /** neutral one-liner for the memory card — must NOT name a bias */
  memoryLine: (raw: Raw) => string
  reveal: RevealContent
}

export interface StationResult {
  id: StationId
  raw: unknown
  trait: TraitScore
  memoryLine: string
}
