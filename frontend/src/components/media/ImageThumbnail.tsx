import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ImageThumbnailProps {
  src: string
  fullSrc: string
  alt: string
  onClick: () => void
}

export function ImageThumbnail({ src, alt, onClick }: ImageThumbnailProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-lighter">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      )}
      {error ? (
        <div className="h-32 flex items-center justify-center bg-surface-lighter text-gray-500 text-sm">
          Failed to load
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-auto rounded-lg transition-transform group-hover:scale-105 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
    </div>
  )
}
