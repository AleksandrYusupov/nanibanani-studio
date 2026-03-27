import { useSettingsStore } from '@/stores/settingsStore'
import type { ThinkingMode } from '@/types'

const MODES: { value: ThinkingMode | null; label: string }[] = [
  { value: null, label: 'Off' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'long', label: 'Long' },
]

export function ThinkingModeSelector() {
  const { model, thinkingMode, setThinkingMode } = useSettingsStore()

  if (model !== 'nanibanani-2') return null

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Thinking Mode</label>
      <div className="flex gap-1">
        {MODES.map((m) => (
          <button
            key={m.label}
            onClick={() => setThinkingMode(m.value)}
            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              thinkingMode === m.value
                ? 'bg-accent text-white'
                : 'bg-surface-lighter text-gray-300 hover:bg-surface-lighter/80'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
