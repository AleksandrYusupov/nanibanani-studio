import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface FilePreviewProps {
  file: File
  onRemove: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="relative group">
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          className="h-16 w-16 object-cover rounded-lg border border-border"
        />
      ) : (
        <div className="h-16 w-16 rounded-lg border border-border bg-surface-lighter flex items-center justify-center">
          <span className="text-xs text-gray-400 truncate px-1">{file.name.split('.').pop()}</span>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={12} />
      </button>
    </div>
  )
}
