import { useRef, useCallback } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ChartItemWrapper } from './ChartItemWrapper'
import { resolveBgColor } from '../../lib/utils'
import { snapToGrid, clampToBounds } from '../../lib/collision'
import { getChartDefaults } from '../../lib/chartDefaults'
import type { ChartType } from '../../types'

export function Canvas() {
  const store = useAppStore()
  const project = store.activeProject()
  const tab = store.activeTab()
  const canvasRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!canvasRef.current || !tab || !project) return

    const chartType = e.dataTransfer.getData('chartType') as ChartType
    if (!chartType) return

    const rect = canvasRef.current.getBoundingClientRect()
    const zoom = store.zoom
    const rawX = (e.clientX - rect.left) / zoom
    const rawY = (e.clientY - rect.top) / zoom

    const defaults = getChartDefaults(chartType, tab.canvasWidth)
    const centeredX = rawX - defaults.width / 2
    const centeredY = rawY - defaults.height / 2
    const gridSize = project.gridSize
    const snappedX = store.snapEnabled ? snapToGrid(centeredX, gridSize) : centeredX
    const snappedY = store.snapEnabled ? snapToGrid(centeredY, gridSize) : centeredY
    const clamped = clampToBounds(snappedX, snappedY, defaults.width, defaults.height, tab.canvasWidth, tab.canvasHeight)
    store.addChart(chartType, clamped.x, clamped.y)
  }, [tab, project, store])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      store.deselectAll()
    }
  }, [store])

  if (!project || !tab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
        No project open
      </div>
    )
  }

  const bgColor = resolveBgColor(tab.canvasBackground)
  const gridSize = project.gridSize
  const sortedCharts = [...tab.charts].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      ref={wrapperRef}
      className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-700 p-8"
      style={{ minHeight: 0 }}
    >
      {/* Canvas at actual size, scaled with CSS transform */}
      <div
        style={{
          transform: `scale(${store.zoom})`,
          transformOrigin: 'top left',
          width: tab.canvasWidth,
          height: tab.canvasHeight,
          marginBottom: `${(tab.canvasHeight * store.zoom) - tab.canvasHeight}px`,
          marginRight: `${(tab.canvasWidth * store.zoom) - tab.canvasWidth}px`,
        }}
      >
        <div
          ref={canvasRef}
          id="canvas-export"
          style={{
            width: tab.canvasWidth,
            height: tab.canvasHeight,
            backgroundColor: bgColor,
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {/* Grid */}
          {store.showGrid && (
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-dots"
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx={gridSize / 2}
                    cy={gridSize / 2}
                    r={0.7}
                    fill={['black','dark-gray'].includes(tab.canvasBackground) || bgColor < '#777777' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dots)" />
            </svg>
          )}

          {/* Chart items */}
          {sortedCharts.map(chart => (
            <ChartItemWrapper key={chart.id} chart={chart} />
          ))}
        </div>
      </div>
    </div>
  )
}
