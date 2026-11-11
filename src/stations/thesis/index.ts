import type { StationDef } from '../../core/types'
import { ICON, INTRO, REVEAL, TITLE } from './content'
import { memoryLine, score, type Raw } from './metrics'
import { Play } from './Play'

export const thesis: StationDef<Raw> = {
  id: 'thesis',
  year: 4,
  title: TITLE,
  intro: INTRO,
  icon: ICON,
  Play,
  score,
  memoryLine,
  reveal: REVEAL,
}
