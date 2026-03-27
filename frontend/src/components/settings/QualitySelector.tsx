import { useSettingsStore } from '@/stores/settingsStore'
import type { Quality } from '@/types'

const QUALITIES: Quality[] = ['1K', '2K', '4K']

export function QualitySelector() {
  const { quality, setQuality } = useSettingsStore()

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Quality</label>
      <div className="flex gap-1">
        {QUALITIES.map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              quality === q
                ? 'bg-accent text-white'
                : 'bg-surface-lighter text-gray-300 hover:bg-surface-lighter/80'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
