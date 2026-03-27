import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage } from '@/api/client'
import { useSettingsStore } from '@/stores/settingsStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { Lightbox } from '@/components/media/Lightbox'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'

interface ChatViewProps {
  conversationId: string
}

export function ChatView({ conversationId }: ChatViewProps) {
  const queryClient = useQueryClient()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { quality, aspectRatio, thinkingMode } = useSettingsStore()

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
  })

  const sendMutation = useMutation({
    mutationFn: async ({ text, files }: { text: string; files: File[] }) => {
      setIsGenerating(true)
      setError(null)
      return sendMessage(conversationId, text, files, {
        quality,
        aspect_ratio: aspectRatio,
        thinking_mode: thinkingMode,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setIsGenerating(false)
    },
    onError: (err: any) => {
      setIsGenerating(false)
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error'
      setError(detail)
    },
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {isGenerating && (
            <div className="flex items-center gap-2 text-accent text-sm">
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </div>
          )}
        </div>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`p-2 rounded-lg transition-colors ${
            settingsOpen ? 'bg-surface-lighter text-accent' : 'hover:bg-surface-light text-gray-400'
          }`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && <SettingsPanel />}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Generation failed</p>
            <p className="text-red-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 text-xs"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        onImageClick={setLightboxImage}
      />

      {/* Input */}
      <ChatInput
        onSend={(text, files) => sendMutation.mutate({ text, files })}
        disabled={isGenerating}
      />

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  )
}
