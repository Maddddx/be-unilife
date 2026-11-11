import type { StationDef } from '../../core/types'
import { ICON, INTRO, REVEAL, TITLE } from './content'
import { memoryLine, score, type Raw } from './metrics'
import { Play } from './Play'

export const scroll: StationDef<Raw> = {
  id: 'scroll',
  year: 1,
  term: 1,
  title: TITLE,
  intro: INTRO,
  icon: ICON,
  Play,
  score,
  memoryLine,
  reveal: REVEAL,
}
