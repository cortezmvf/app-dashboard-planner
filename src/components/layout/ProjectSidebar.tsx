import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Trash2, Copy, Pencil, Check, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatRelativeDate } from '../../lib/utils'

interface ContextMenu {
  projectId: string
  x: number
  y: number
}

export function ProjectSidebar({ onNewProject }: { onNewProject: () => void }) {
  const store = useAppStore()
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  const sorted = [...store.projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  useEffect(() => {
    if (!contextMenu) return
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [contextMenu])

  useEffect(() => {
    if (renamingId) renameRef.current?.focus()
  }, [renamingId])

  function startRename(id: string) {
    const p = store.projects.find(p => p.id === id)
    if (!p) return
    setRenamingId(id)
    setRenameValue(p.name)
    setRenameError('')
    setContextMenu(null)
  }

  function commitRename() {
    if (!renamingId) return
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenameError('Name required'); return }
    const conflict = store.projects.some(p => p.id !== renamingId && p.name.toLowerCase() === trimmed.toLowerCase())
    if (conflict) { setRenameError('Name already exists'); return }
    store.renameProject(renamingId, trimmed)
    setRenamingId(null)
  }

  if (store.isSidebarCollapsed) return null

  return (
    <aside className="w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#005175] hover:bg-[#003d58] text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sorted.map(project => (
          <div key={project.id} className="relative group">
            {renamingId === project.id ? (
              <div className="p-2">
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => { setRenameValue(e.target.value); setRenameError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                  className="w-full text-sm border border-blue-400 rounded px-2 py-1 outline-none dark:bg-gray-800 dark:text-white"
                />
                {renameError && <p className="text-xs text-red-500 mt-1">{renameError}</p>}
                <div className="flex gap-1 mt-1.5">
                  <button onClick={commitRename} className="flex-1 flex justify-center py-1 text-green-600 hover:bg-green-50 rounded text-xs">
                    <Check size={12} />
                  </button>
                  <button onClick={() => setRenamingId(null)} className="flex-1 flex justify-center py-1 text-gray-500 hover:bg-gray-100 rounded text-xs">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => store.setActiveProject(project.id)}
                onContextMenu={e => { e.preventDefault(); setContextMenu({ projectId: project.id, x: e.clientX, y: e.clientY }) }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                  project.id === store.activeProjectId
                    ? 'bg-[#005175]/10 text-[#005175] dark:bg-[#005175]/20 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-sm font-medium truncate leading-tight">{project.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setContextMenu({ projectId: project.id, x: e.clientX, y: e.clientY }) }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0 mt-0.5"
                  >
                    <MoreHorizontal size={12} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatRelativeDate(project.updatedAt)}
                </p>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
        >
          <button
            onClick={() => startRename(contextMenu.projectId)}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Pencil size={14} /> Rename
          </button>
          <button
            onClick={() => { store.duplicateProject(contextMenu.projectId); setContextMenu(null) }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Copy size={14} /> Duplicate
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={() => {
              if (store.projects.length <= 1) { alert('Cannot delete the only project.'); return }
              if (confirm('Delete this project?')) store.deleteProject(contextMenu.projectId)
              setContextMenu(null)
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </aside>
  )
}
