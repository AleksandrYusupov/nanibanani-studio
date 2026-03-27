import { create } from 'zustand'
import type { ModelKey, Quality, AspectRatio, ThinkingMode } from '@/types'

interface SettingsState {
  model: ModelKey
  quality: Quality
  aspectRatio: AspectRatio
  thinkingMode: ThinkingMode | null
  activeConversationId: string | null

  setModel: (model: ModelKey) => void
  setQuality: (quality: Quality) => void
  setAspectRatio: (ratio: AspectRatio) => void
  setThinkingMode: (mode: ThinkingMode | null) => void
  setActiveConversation: (id: string | null) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  model: 'nanibanani-pro',
  quality: '1K',
  aspectRatio: '1:1',
  thinkingMode: null,
  activeConversationId: null,

  setModel: (model) =>
    set({
      model,
      thinkingMode: model === 'nanibanani-pro' ? null : undefined,
    }),
  setQuality: (quality) => set({ quality }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setThinkingMode: (thinkingMode) => set({ thinkingMode }),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
}))
