import { Eye, EyeOff, Grid3x3 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export function StatusBar() {
  const store = useAppStore()
  const project = store.activeProject()
  const tab = store.activeTab()
  const zoomPct = Math.round(store.zoom * 100)
  const chartCount = tab?.charts.length ?? 0

  function fitToScreen() {
    if (!tab) return
    // Account for sidebar, right panel, top bar, tab bar, status bar
    const sidebarW = store.isSidebarCollapsed ? 48 : 192
    const viewportW = window.innerWidth - sidebarW - 224 - 32
    const viewportH = window.innerHeight - 110
    const scaleW = viewportW / tab.canvasWidth
    const scaleH = viewportH / tab.canvasHeight
    store.setZoom(Math.min(scaleW, scaleH))
  }

  return (
    <footer className="h-9 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 px-4 shrink-0 text-xs text-gray-500 dark:text-gray-400">
      {/* Zoom */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => store.setZoom(store.zoom - 0.1)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
        >−</button>
        <button
          onClick={() => store.setZoom(1)}
          className="w-12 text-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
          title="Click for 100%"
        >
          {zoomPct}%
        </button>
        <button
          onClick={() => store.setZoom(store.zoom + 0.1)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors"
        >+</button>
        <button
          onClick={fitToScreen}
          className="px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Fit to screen"
        >
          Fit
        </button>
      </div>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

      {/* Grid size */}
      <div className="flex items-center gap-1.5">
        <Grid3x3 size={12} />
        <select
          value={project?.gridSize ?? 10}
          onChange={e => project && store.updateProject(project.id, { gridSize: Number(e.target.value) })}
          className="bg-transparent text-xs cursor-pointer outline-none hover:text-gray-700 dark:hover:text-gray-200"
        >
          {[5, 10, 15, 20, 25, 30, 40, 50].map(v => (
            <option key={v} value={v}>{v}px</option>
          ))}
        </select>
      </div>

      {/* Show grid toggle */}
      <button
        onClick={() => store.setShowGrid(!store.showGrid)}
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        title="Show/hide grid"
      >
        {store.showGrid ? <Eye size={12} /> : <EyeOff size={12} />}
        <span>Grid</span>
      </button>

      {/* Snap toggle */}
      <button
        onClick={() => store.setSnapEnabled(!store.snapEnabled)}
        className={`flex items-center gap-1 transition-colors ${store.snapEnabled ? 'text-[#005175] dark:text-blue-400 font-medium' : 'hover:text-gray-700 dark:hover:text-gray-200'}`}
        title="Snap to grid"
      >
        <span>Snap {store.snapEnabled ? 'On' : 'Off'}</span>
      </button>

      <div className="flex-1" />

      {/* Canvas info */}
      {tab && (
        <span className="text-gray-400 dark:text-gray-500">
          {tab.canvasWidth} × {tab.canvasHeight}px &nbsp;·&nbsp; {chartCount} {chartCount === 1 ? 'element' : 'elements'}
        </span>
      )}
    </footer>
  )
}
