import type { Message } from '@/types'
import { ImageThumbnail } from '@/components/media/ImageThumbnail'
import { DownloadButton } from '@/components/media/DownloadButton'
import { getFileUrl, getThumbnailUrl } from '@/api/client'
import { User, Bot, Clock } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  onImageClick: (src: string) => void
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const images = message.attachments.filter((a) => a.mime_type.startsWith('image/'))

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <Bot size={16} className="text-accent" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-accent/20 text-gray-100' : 'bg-surface-light text-gray-100'
        }`}
      >
        {/* Text */}
        {message.text_content && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text_content}</p>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={`grid gap-2 ${message.text_content ? 'mt-3' : ''} ${
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {images.map((att) => (
              <ImageThumbnail
                key={att.id}
                src={getThumbnailUrl(att.id)}
                fullSrc={getFileUrl(att.id)}
                alt={att.filename}
                onClick={() => onImageClick(getFileUrl(att.id))}
              />
            ))}
          </div>
        )}

        {/* Download buttons for generated images */}
        {!isUser && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((att) => (
              <DownloadButton
                key={att.id}
                url={getFileUrl(att.id)}
                filename={att.filename}
              />
            ))}
          </div>
        )}

        {/* Generation metadata */}
        {!isUser && message.generation_time_ms && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{(message.generation_time_ms / 1000).toFixed(1)}s</span>
            {message.quality && <span>· {message.quality}</span>}
            {message.aspect_ratio && <span>· {message.aspect_ratio}</span>}
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  )
}
