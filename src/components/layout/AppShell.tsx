import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { TopBar } from './TopBar'
import { ProjectSidebar } from './ProjectSidebar'
import { TabBar } from './TabBar'
import { StatusBar } from './StatusBar'
import { Canvas } from '../canvas/Canvas'
import { ChartPalette } from '../panels/ChartPalette'
import { PropertiesPanel } from '../panels/PropertiesPanel'
import { NewProjectDialog } from '../dialogs/NewProjectDialog'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export function AppShell() {
  const store = useAppStore()
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectMode, setNewProjectMode] = useState<'project' | 'tab'>('project')
  const [rightTab, setRightTab] = useState<'palette' | 'properties'>('palette')
  const selectedCount = store.selectedChartIds.length

  useKeyboardShortcuts()

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', store.isDarkMode)
  }, [store.isDarkMode])

  // Auto-switch right panel tab on selection change
  useEffect(() => {
    if (selectedCount > 0) setRightTab('properties')
  }, [selectedCount])

  function handleNewProject() {
    setNewProjectMode('project')
    setShowNewProject(true)
  }

  function handleNewTab() {
    setNewProjectMode('tab')
    setShowNewProject(true)
  }

  // Ctrl+Scroll zoom
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey) return
      e.preventDefault()
      store.setZoom(store.zoom + (e.deltaY < 0 ? 0.1 : -0.1))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [store])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <TopBar onNewProject={handleNewProject} />

      <div className="flex flex-1 min-h-0">
        {/* Left: project sidebar */}
        <ProjectSidebar onNewProject={handleNewProject} />

        {/* Center: canvas area */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <TabBar onNewTab={handleNewTab} />
          <Canvas />
          <StatusBar />
        </div>

        {/* Right: palette / properties with tab switcher */}
        <aside className="w-56 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => setRightTab('palette')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                rightTab === 'palette'
                  ? 'text-[#005175] border-b-2 border-[#005175] dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Elementos
            </button>
            <button
              onClick={() => setRightTab('properties')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                rightTab === 'properties'
                  ? 'text-[#005175] border-b-2 border-[#005175] dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Propriedades
              {selectedCount > 0 && (
                <span className="ml-1 bg-[#005175] text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[9px]">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightTab === 'palette' ? <ChartPalette /> : <PropertiesPanel />}
          </div>
        </aside>
      </div>

      {showNewProject && (
        <NewProjectDialog
          mode={newProjectMode}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </div>
  )
}
