import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, createConversation, deleteConversation } from '@/api/client'
import { useSettingsStore } from '@/stores/settingsStore'
import { MODEL_LABELS } from '@/types'
import type { ModelKey } from '@/types'
import { Plus, Trash2, MessageSquare, PanelLeftClose } from 'lucide-react'

interface SidebarProps {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const queryClient = useQueryClient()
  const { model, activeConversationId, setActiveConversation } = useSettingsStore()

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  })

  const createMutation = useMutation({
    mutationFn: () => createConversation(model),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setActiveConversation(conv.id)
      // Close sidebar only on mobile
      if (window.innerWidth < 1024) onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      if (activeConversationId === deletedId) {
        setActiveConversation(null)
      }
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex gap-2">
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          New Chat
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-lg hover:bg-surface-lighter text-gray-400 hover:text-gray-200 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`
              group flex items-center gap-2 px-3 py-2.5 mx-1 mb-1 rounded-lg cursor-pointer transition-colors
              ${activeConversationId === conv.id ? 'bg-surface-lighter' : 'hover:bg-surface-lighter/50'}
            `}
            onClick={() => {
              setActiveConversation(conv.id)
              // Close sidebar only on mobile
              if (window.innerWidth < 1024) onClose()
            }}
          >
            <MessageSquare size={16} className="shrink-0 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{conv.title}</p>
              <p className="text-xs text-gray-500">
                {MODEL_LABELS[conv.model as ModelKey] ?? conv.model}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteMutation.mutate(conv.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-gray-500 text-center">NaniBanani Studio v1.0</p>
      </div>
    </div>
  )
}
