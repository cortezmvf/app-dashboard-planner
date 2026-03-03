import { useAppStore } from '../../store/useAppStore'
import type { ChartType } from '../../types'

interface PaletteItem {
  type: ChartType
  label: string
  icon: string
}

const PALETTE: { category: string; items: PaletteItem[] }[] = [
  {
    category: 'Text & Annotation',
    items: [
      { type: 'text-box', label: 'Text Box', icon: 'T' },
      { type: 'divider', label: 'Divider', icon: '—' },
    ],
  },
  {
    category: 'Charts',
    items: [
      { type: 'bar', label: 'Bar Chart', icon: '▊' },
      { type: 'stacked-bar', label: 'Stacked Bar', icon: '▤' },
      { type: 'line', label: 'Line Chart', icon: '〜' },
      { type: 'area', label: 'Area Chart', icon: '◭' },
      { type: 'combo', label: 'Combo Chart', icon: '⊞' },
      { type: 'scatter', label: 'Scatter Plot', icon: '⁙' },
      { type: 'pie', label: 'Pie Chart', icon: '◔' },
      { type: 'donut', label: 'Donut Chart', icon: '◎' },
    ],
  },
  {
    category: 'Indicators',
    items: [
      { type: 'kpi-card', label: 'KPI Card', icon: '#' },
      { type: 'gauge', label: 'Gauge', icon: '◑' },
      { type: 'bullet', label: 'Bullet Chart', icon: '▷' },
    ],
  },
  {
    category: 'Data',
    items: [
      { type: 'table', label: 'Table', icon: '⊟' },
    ],
  },
  {
    category: 'Layout',
    items: [
      { type: 'image-placeholder', label: 'Image', icon: '🖼' },
      { type: 'shape-rect', label: 'Rectangle', icon: '▭' },
      { type: 'shape-ellipse', label: 'Ellipse', icon: '⬭' },
    ],
  },
]

export function ChartPalette() {
  const store = useAppStore()
  const tab = store.activeTab()

  function handleDragStart(e: React.DragEvent, type: ChartType) {
    e.dataTransfer.setData('chartType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  function handleClick(type: ChartType) {
    // Cascade offset so multiple click-adds don't stack exactly
    const count = tab?.charts.length ?? 0
    const offset = (count % 8) * 20
    store.addChart(type, 20 + offset, 20 + offset)
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">Elements</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 px-1 -mt-2">Click or drag to canvas</p>

      {PALETTE.map(({ category, items }) => (
        <div key={category}>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">{category}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map(({ type, label, icon }) => (
              <div
                key={type}
                draggable
                onDragStart={e => handleDragStart(e, type)}
                onClick={() => handleClick(type)}
                className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#005175] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all select-none"
                title={`Click or drag to add "${label}"`}
              >
                <span className="text-xl leading-none text-gray-600 dark:text-gray-300">{icon}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
