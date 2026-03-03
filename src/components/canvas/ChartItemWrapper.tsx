import { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { Lock, Unlock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ChartRenderer } from '../charts/ChartRenderer'
import { getSchema } from '../../lib/colorSchemas'
import type { ChartItem } from '../../types'

interface Props {
  chart: ChartItem
}

export function ChartItemWrapper({ chart }: Props) {
  const store = useAppStore()
  const project = store.activeProject()
  const tab = store.activeTab()
  const isSelected = store.selectedChartIds.includes(chart.id)
  const [collisionFlash, setCollisionFlash] = useState(false)
  const originalPos = useRef({ x: chart.x, y: chart.y, w: chart.width, h: chart.height })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const colors = getSchema(project?.colorSchemaId ?? 7).colors
  const gridSize = project?.gridSize ?? 10

  function flashCollision() {
    setCollisionFlash(true)
    setTimeout(() => setCollisionFlash(false), 400)
  }

  function handleDragStop(_: unknown, d: { x: number; y: number }) {
    if (chart.locked) return
    const success = store.moveChart(chart.id, d.x, d.y)
    if (!success) {
      flashCollision()
      // react-rnd will revert via controlled position
    }
  }

  function handleResizeStop(
    _e: unknown,
    _dir: unknown,
    ref: HTMLElement,
    _delta: unknown,
    pos: { x: number; y: number }
  ) {
    if (chart.locked) return
    const w = parseInt(ref.style.width)
    const h = parseInt(ref.style.height)
    const success = store.resizeChart(chart.id, pos.x, pos.y, w, h)
    if (!success) {
      flashCollision()
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    store.selectChart(chart.id, e.shiftKey)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    store.selectChart(chart.id)
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    store.selectChart(chart.id)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const canvasW = tab?.canvasWidth ?? 1280
  const canvasH = tab?.canvasHeight ?? 720
  const snapGrid: [number, number] = store.snapEnabled ? [gridSize, gridSize] : [1, 1]

  return (
    <>
      <Rnd
        position={{ x: chart.x, y: chart.y }}
        size={{ width: chart.width, height: chart.height }}
        onDragStart={() => { originalPos.current = { x: chart.x, y: chart.y, w: chart.width, h: chart.height } }}
        onDragStop={handleDragStop}
        onResizeStart={() => { originalPos.current = { x: chart.x, y: chart.y, w: chart.width, h: chart.height } }}
        onResizeStop={handleResizeStop}
        dragGrid={snapGrid}
        resizeGrid={snapGrid}
        minWidth={gridSize * 2}
        minHeight={gridSize * 2}
        maxWidth={canvasW}
        maxHeight={canvasH}
        bounds="parent"
        enableResizing={isSelected && !chart.locked}
        disableDragging={chart.locked}
        style={{ zIndex: chart.zIndex }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            outline: isSelected
              ? collisionFlash
                ? '2px solid #ef4444'
                : '2px solid #005175'
              : collisionFlash
              ? '2px solid #ef4444'
              : 'none',
            outlineOffset: '-1px',
            boxSizing: 'border-box',
            cursor: chart.locked ? 'default' : 'move',
            userSelect: 'none',
            position: 'relative',
          }}
        >
          <ChartRenderer chart={chart} colors={colors} />

          {/* Lock indicator */}
          {chart.locked && (
            <div className="absolute top-1 right-1 bg-white/80 rounded p-0.5 pointer-events-none">
              <Lock size={10} className="text-gray-500" />
            </div>
          )}
        </div>
      </Rnd>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-sm"
          onMouseLeave={() => setContextMenu(null)}
        >
          <button onClick={() => { store.duplicateChart(chart.id); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicar</button>
          <button onClick={() => { store.updateChart(chart.id, { locked: !chart.locked }); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            {chart.locked ? <><Unlock size={12} /> Desbloquear</> : <><Lock size={12} /> Bloquear</>}
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button onClick={() => { store.setChartZIndex(chart.id, 'front'); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Trazer à frente</button>
          <button onClick={() => { store.setChartZIndex(chart.id, 'back'); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Enviar para trás</button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button onClick={() => { store.deleteChart(chart.id); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Excluir</button>
        </div>
      )}
    </>
  )
}
