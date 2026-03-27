import { useSettingsStore } from '@/stores/settingsStore'
import { ASPECT_RATIOS } from '@/types'
import type { AspectRatio } from '@/types'

export function AspectRatioSelector() {
  const { aspectRatio, setAspectRatio } = useSettingsStore()

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Aspect Ratio</label>
      <div className="grid grid-cols-5 gap-1">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio}
            onClick={() => setAspectRatio(ratio as AspectRatio)}
            className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
              aspectRatio === ratio
                ? 'bg-accent text-white'
                : 'bg-surface-lighter text-gray-300 hover:bg-surface-lighter/80'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  )
}
