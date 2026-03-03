import { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, Check, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

interface TabMenuState { tabId: string; x: number; y: number }

export function TabBar({ onNewTab }: { onNewTab: () => void }) {
  const store = useAppStore()
  const project = store.activeProject()
  const [tabMenu, setTabMenu] = useState<TabMenuState | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const dragTab = useRef<number | null>(null)

  useEffect(() => {
    if (!tabMenu) return
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTabMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [tabMenu])

  useEffect(() => {
    if (renamingId) setTimeout(() => renameRef.current?.focus(), 50)
  }, [renamingId])

  if (!project) return null

  function startRename(tabId: string) {
    const tab = project!.tabs.find(t => t.id === tabId)
    if (!tab) return
    setRenamingId(tabId)
    setRenameValue(tab.name)
    setRenameError('')
    setTabMenu(null)
  }

  function commitRename() {
    if (!renamingId || !project) return
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenameError('Name required'); return }
    const conflict = project.tabs.some(t => t.id !== renamingId && t.name.toLowerCase() === trimmed.toLowerCase())
    if (conflict) { setRenameError('Name already exists'); return }
    store.renameTab(renamingId, trimmed)
    setRenamingId(null)
  }

  return (
    <div className="flex items-stretch bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
      {project.tabs.map((tab, idx) => (
        <div
          key={tab.id}
          draggable
          onDragStart={() => { dragTab.current = idx }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => {
            if (dragTab.current !== null && dragTab.current !== idx) {
              store.reorderTabs(dragTab.current, idx)
            }
            dragTab.current = null
          }}
          className={`group relative flex items-center shrink-0 border-r border-gray-200 dark:border-gray-700 ${
            tab.id === project.activeTabId
              ? 'bg-white dark:bg-gray-700 border-b-2 border-b-[#005175]'
              : 'hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
        >
          {renamingId === tab.id ? (
            <div className="flex items-center gap-1 px-2 py-1">
              <input
                ref={renameRef}
                value={renameValue}
                onChange={e => { setRenameValue(e.target.value); setRenameError('') }}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                className="text-xs border border-blue-400 rounded px-1.5 py-0.5 w-28 outline-none dark:bg-gray-600 dark:text-white"
              />
              {renameError && <span className="text-xs text-red-500">{renameError}</span>}
              <button onClick={commitRename} className="text-green-600 hover:text-green-700"><Check size={12} /></button>
              <button onClick={() => setRenamingId(null)} className="text-gray-500 hover:text-gray-700"><X size={12} /></button>
            </div>
          ) : (
            <button
              onClick={() => store.setActiveTab(tab.id)}
              onDoubleClick={() => startRename(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                tab.id === project.activeTabId
                  ? 'text-[#005175] dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.name}
            </button>
          )}

          <button
            onClick={e => { e.stopPropagation(); setTabMenu({ tabId: tab.id, x: e.clientX, y: e.clientY }) }}
            className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity"
          >
            <MoreHorizontal size={12} className="text-gray-500" />
          </button>
        </div>
      ))}

      <button
        onClick={onNewTab}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shrink-0"
      >
        <Plus size={14} />
      </button>

      {/* Tab context menu */}
      {tabMenu && (
        <div
          ref={menuRef}
          style={{ top: tabMenu.y, left: tabMenu.x }}
          className="fixed z-50 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1"
        >
          <button
            onClick={() => startRename(tabMenu.tabId)}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Pencil size={14} /> Rename
          </button>
          <button
            onClick={() => { store.duplicateTab(tabMenu.tabId); setTabMenu(null) }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Copy size={14} /> Duplicate
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={() => {
              if (project!.tabs.length <= 1) { alert('Cannot delete the only dashboard.'); return }
              if (confirm('Delete this dashboard?')) store.deleteTab(tabMenu.tabId)
              setTabMenu(null)
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
