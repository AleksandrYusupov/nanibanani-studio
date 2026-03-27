import { Download } from 'lucide-react'

interface DownloadButtonProps {
  url: string
  filename: string
}

export function DownloadButton({ url, filename }: DownloadButtonProps) {
  const handleDownload = async () => {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 bg-surface-lighter rounded-md hover:bg-surface-lighter/80 transition-colors"
      title={`Download ${filename}`}
    >
      <Download size={12} />
      <span>Download</span>
    </button>
  )
}
