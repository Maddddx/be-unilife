import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { useGame, type Phase } from './core/store'
import { STATIONS } from './stations/registry'
import { Landing } from './scenes/Landing'
import { YearIntro } from './scenes/YearIntro'
import { StationRunner } from './scenes/StationRunner'
import { Memory } from './scenes/Memory'
import { Graduation } from './scenes/Graduation'

// The reveal pulls in recharts + html-to-image; load it only near the end of the game.
const loadReveal = () => import('./scenes/Reveal')
const Reveal = lazy(() => loadReveal().then((m) => ({ default: m.Reveal })))

/**
 * Dev shortcut (dev server only): ?dev=<stationId> opens that station's play screen,
 * ?dev=reveal opens the reveal, ?dev=graduation opens graduation.
 */
function useDevJump() {
  const jump = useGame((s) => s.jump)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const target = new URLSearchParams(window.location.search).get('dev')
    if (!target) return
    const i = STATIONS.findIndex((s) => s.id === target)
    if (i >= 0) jump('play', i)
    else if (target === 'reveal' || target === 'graduation') {
      jump(target as Phase, STATIONS.length - 1)
      // preview the reveal with sample results unless the player already has some
      if (target === 'reveal' && Object.keys(useGame.getState().results).length === 0)
        import('./core/demo').then((m) => useGame.getState().setResults(m.DEMO_RESULTS))
    }
  }, [jump])
}

export default function App() {
  const phase = useGame((s) => s.phase)
  const index = useGame((s) => s.index)
  useDevJump()

  // start fetching the reveal chunk during graduation so it opens instantly
  useEffect(() => {
    if (phase === 'graduation' || phase === 'reveal') void loadReveal()
  }, [phase])

  return (
    <AnimatePresence mode="wait">
      {phase === 'landing' && <Landing key="landing" />}
      {phase === 'intro' && <YearIntro key={`intro-${index}`} />}
      {phase === 'play' && <StationRunner key={`play-${index}`} />}
      {phase === 'memory' && <Memory key={`memory-${index}`} />}
      {phase === 'graduation' && <Graduation key="graduation" />}
      {phase === 'reveal' && (
        <Suspense key="reveal" fallback={null}>
          <Reveal />
        </Suspense>
      )}
    </AnimatePresence>
  )
}
