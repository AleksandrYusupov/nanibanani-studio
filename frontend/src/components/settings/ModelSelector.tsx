import { useSettingsStore } from '@/stores/settingsStore'
import { MODEL_LABELS } from '@/types'
import type { ModelKey } from '@/types'
import { ChevronDown } from 'lucide-react'

export function ModelSelector() {
  const { model, setModel } = useSettingsStore()

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">Model</label>
      <div className="relative">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelKey)}
          className="w-full appearance-none bg-surface-lighter border border-border rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          {(Object.entries(MODEL_LABELS) as [ModelKey, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
