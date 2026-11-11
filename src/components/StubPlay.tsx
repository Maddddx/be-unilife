import { Button } from './Button'

/**
 * Placeholder used until a station's real Play.tsx is built.
 * Lets the whole flow be played end-to-end during Phase 0.
 */
export function StubPlay({ label, onDone }: { label: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-(--radius-card) border-2 border-dashed border-line bg-card p-8 text-center">
      <p className="text-muted">🚧 ฉาก "{label}" กำลังสร้าง</p>
      <Button onClick={onDone}>ข้ามไปก่อน</Button>
    </div>
  )
}
