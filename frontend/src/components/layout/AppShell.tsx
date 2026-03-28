import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ChatView } from '@/components/chat/ChatView'
import { useSettingsStore } from '@/stores/settingsStore'
import { Menu } from 'lucide-react'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const activeId = useSettingsStore((s) => s.activeConversationId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-30 h-full w-72 bg-surface-light border-r border-border
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar — visible when sidebar is closed */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-light"
              title="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-gray-400">NaniBanani Studio</span>
          </div>
        )}

        {activeId ? (
          <ChatView conversationId={activeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">NaniBanani Studio</h2>
              <p className="text-gray-400">Select a chat or create a new one to start generating images</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
