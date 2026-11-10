import { BACKGROUND_URL } from '@/lib/config'
import { CursorBlob } from './CursorBlob'

export function BackgroundLayer({ dim }: { dim: number }) {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
      />
      <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: dim / 100 }} />
      <CursorBlob />
    </div>
  )
}
