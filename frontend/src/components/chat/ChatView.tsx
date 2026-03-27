import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage } from '@/api/client'
import { useSettingsStore } from '@/stores/settingsStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { Lightbox } from '@/components/media/Lightbox'
import { Settings, Loader2 } from 'lucide-react'

interface ChatViewProps {
  conversationId: string
}

export function ChatView({ conversationId }: ChatViewProps) {
  const queryClient = useQueryClient()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { quality, aspectRatio, thinkingMode } = useSettingsStore()

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
  })

  const sendMutation = useMutation({
    mutationFn: async ({ text, files }: { text: string; files: File[] }) => {
      setIsGenerating(true)
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
    onError: () => {
      setIsGenerating(false)
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
