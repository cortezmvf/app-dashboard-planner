import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'
import { Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const colors = getSchema(project?.colorSchemaId ?? 7).colors
  const gridSize = project?.gridSize ?? 10

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function close() { setContextMenu(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [contextMenu])

  function handleDragStop(_: unknown, d: { x: number; y: number }) {
    if (chart.locked) return
    store.moveChart(chart.id, d.x, d.y)
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
    store.resizeChart(chart.id, pos.x, pos.y, w, h)
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
    // Use viewport coordinates so portal renders at correct position
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const canvasW = tab?.canvasWidth ?? 1280
  const canvasH = tab?.canvasHeight ?? 720
  const snapGrid: [number, number] = store.snapEnabled ? [gridSize, gridSize] : [1, 1]

  // Border style from chart properties
  const borderStyle = chart.borderWidth > 0
    ? `${chart.borderWidth}px ${chart.borderStyle ?? 'solid'} ${chart.borderColor ?? '#e5e7eb'}`
    : undefined

  return (
    <>
      <Rnd
        position={{ x: chart.x, y: chart.y }}
        size={{ width: chart.width, height: chart.height }}
        onDragStop={handleDragStop}
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
            outline: isSelected ? '2px solid #005175' : 'none',
            outlineOffset: '-1px',
            border: borderStyle,
            boxSizing: 'border-box',
            cursor: chart.locked ? 'default' : 'move',
            userSelect: 'none',
            position: 'relative',
          }}
        >
          <ChartRenderer chart={chart} colors={colors} />

          {/* Lock indicator */}
          {chart.locked && (
            <div className="absolute top-1 left-1 bg-white/80 rounded p-0.5 pointer-events-none">
              <Lock size={10} className="text-gray-500" />
            </div>
          )}

          {/* Floating action icons — top-right when selected */}
          {isSelected && (
            <div
              className="absolute -top-7 right-0 flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-md px-1 py-0.5"
              style={{ zIndex: 9998 }}
              onMouseDown={e => e.stopPropagation()}
            >
              <button
                title="Duplicate"
                onClick={e => { e.stopPropagation(); store.duplicateChart(chart.id) }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <Copy size={11} />
              </button>
              <button
                title={chart.locked ? 'Unlock' : 'Lock'}
                onClick={e => { e.stopPropagation(); store.updateChart(chart.id, { locked: !chart.locked }) }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                {chart.locked ? <Unlock size={11} /> : <Lock size={11} />}
              </button>
              <button
                title="Bring to Front"
                onClick={e => { e.stopPropagation(); store.setChartZIndex(chart.id, 'front') }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <ChevronUp size={11} />
              </button>
              <button
                title="Send to Back"
                onClick={e => { e.stopPropagation(); store.setChartZIndex(chart.id, 'back') }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <ChevronDown size={11} />
              </button>
              <button
                title="Delete"
                onClick={e => { e.stopPropagation(); store.deleteChart(chart.id) }}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>
      </Rnd>

      {/* Context menu rendered via portal at viewport level to avoid CSS transform offset bug */}
      {contextMenu && createPortal(
        <div
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-sm"
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            onClick={() => { store.duplicateChart(chart.id); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Duplicate
          </button>
          <button
            onClick={() => { store.updateChart(chart.id, { locked: !chart.locked }); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            {chart.locked ? <><Unlock size={12} /> Unlock</> : <><Lock size={12} /> Lock</>}
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={() => { store.setChartZIndex(chart.id, 'front'); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Bring to Front
          </button>
          <button
            onClick={() => { store.setChartZIndex(chart.id, 'back'); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Send to Back
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={() => { store.deleteChart(chart.id); setContextMenu(null) }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
