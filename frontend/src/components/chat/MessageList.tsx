import { useEffect, useRef } from 'react'
import type { Message } from '@/types'
import { MessageBubble } from './MessageBubble'
import { Loader2 } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isGenerating: boolean
  onImageClick: (src: string) => void
}

export function MessageList({ messages, isGenerating, onImageClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  if (messages.length === 0 && !isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Send a message to start generating images</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onImageClick={onImageClick} />
      ))}
      {isGenerating && (
        <div className="flex justify-start">
          <div className="bg-surface-light rounded-2xl px-5 py-4 max-w-[80%]">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Generating image...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
