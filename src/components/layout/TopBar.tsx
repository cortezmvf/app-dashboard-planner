import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Plus, ChevronDown, Download, Undo2, Redo2, Moon, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export function TopBar({ onNewProject }: { onNewProject: () => void }) {
  const store = useAppStore()
  const project = store.activeProject()
  const tab = store.activeTab()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const sortedProjects = [...store.projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  function exportJSON() {
    if (!project || !tab) return
    const data = JSON.stringify({ project: project.name, tab: tab.name, charts: tab.charts }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}_${tab.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  const undoAvailable = (tab?.undoStack.length ?? 0) > 0
  const redoAvailable = (tab?.redoStack.length ?? 0) > 0

  return (
    <header className="h-12 bg-[#005175] text-white flex items-center gap-2 px-3 shrink-0 z-50 shadow-md">
      {/* Sidebar toggle */}
      <button
        onClick={store.toggleSidebar}
        className="p-1.5 rounded hover:bg-white/10 transition-colors"
        title="Toggle sidebar"
      >
        {store.isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>

      {/* Logo */}
      <LayoutDashboard size={18} className="shrink-0" />
      <span className="font-semibold text-sm hidden sm:block">Dashboard Planner</span>

      <div className="w-px h-5 bg-white/20 mx-1" />

      {/* Project dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors max-w-[220px]"
        >
          <span className="truncate">{project?.name ?? 'Sem projeto'}</span>
          <ChevronDown size={14} className="shrink-0" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-medium">PROJETOS</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sortedProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { store.setActiveProject(p.id); setDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    p.id === store.activeProjectId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span className="truncate flex-1">{p.name}</span>
                  {p.id === store.activeProjectId && <span className="text-xs text-blue-500">ativo</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New project */}
      <button
        onClick={onNewProject}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
      >
        <Plus size={14} />
        <span className="hidden md:block">Novo</span>
      </button>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <button
        onClick={store.undo}
        disabled={!undoAvailable}
        title="Desfazer (Ctrl+Z)"
        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={store.redo}
        disabled={!redoAvailable}
        title="Refazer (Ctrl+Y)"
        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Redo2 size={16} />
      </button>

      <div className="w-px h-5 bg-white/20 mx-1" />

      {/* Save status */}
      <span className="text-xs text-white/60 hidden md:block">
        {store.saveStatus === 'saved' ? 'Salvo' : store.saveStatus === 'saving' ? 'Salvando…' : '●'}
      </span>

      {/* Export */}
      <div ref={exportRef} className="relative">
        <button
          onClick={() => setExportOpen(v => !v)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
        >
          <Download size={14} />
          <span className="hidden md:block">Exportar</span>
          <ChevronDown size={12} />
        </button>
        {exportOpen && (
          <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <button
              onClick={exportJSON}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Exportar JSON
            </button>
          </div>
        )}
      </div>

      {/* Dark mode */}
      <button
        onClick={() => store.setDarkMode(!store.isDarkMode)}
        className="p-1.5 rounded hover:bg-white/10 transition-colors"
        title="Alternar tema"
      >
        {store.isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  )
}
