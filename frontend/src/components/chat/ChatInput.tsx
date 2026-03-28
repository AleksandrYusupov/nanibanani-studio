import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { FilePreview } from './FilePreview'
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string, files: File[]) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      setFiles((prev) => [...prev, ...imageFiles])
    }
  }, [])

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
    },
  })

  const handleSend = () => {
    if ((!text.trim() && files.length === 0) || disabled) return
    onSend(text, files)
    setText('')
    setFiles([])
    // Reset textarea height after clearing
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    })
  }

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div
      {...getRootProps()}
      className={`border-t border-border p-4 ${isDragActive ? 'bg-accent/10' : ''}`}
    >
      <input {...getInputProps()} />

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}

      {isDragActive && (
        <div className="flex items-center justify-center py-4 mb-3 border-2 border-dashed border-accent/50 rounded-lg">
          <div className="flex items-center gap-2 text-accent">
            <ImageIcon size={20} />
            <span className="text-sm">Drop images here</span>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={open}
          disabled={disabled}
          className="p-2.5 rounded-lg hover:bg-surface-light text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          title="Attach image"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder="Describe the image you want to generate..."
          rows={1}
          className="flex-1 bg-surface-light rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-500 disabled:opacity-50 overflow-y-auto"
          style={{ minHeight: '42px', maxHeight: '200px' }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && files.length === 0)}
          className="p-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
