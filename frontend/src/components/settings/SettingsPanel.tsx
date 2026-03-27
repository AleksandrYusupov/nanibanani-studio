import { ModelSelector } from './ModelSelector'
import { QualitySelector } from './QualitySelector'
import { AspectRatioSelector } from './AspectRatioSelector'
import { ThinkingModeSelector } from './ThinkingModeSelector'

export function SettingsPanel() {
  return (
    <div className="border-b border-border bg-surface-light/50 px-4 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
        <ModelSelector />
        <QualitySelector />
        <AspectRatioSelector />
        <ThinkingModeSelector />
      </div>
    </div>
  )
}
