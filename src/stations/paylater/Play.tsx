import { StubPlay } from '../../components/StubPlay'
import type { StationPlayProps } from '../../core/types'
import type { Raw } from './metrics'
import { TITLE } from './content'

// TODO(Phase 1): replace stub with the real interactive station.
export function Play({ onComplete }: StationPlayProps<Raw>) {
  return <StubPlay label={TITLE} onDone={() => onComplete({ stub: true })} />
}
