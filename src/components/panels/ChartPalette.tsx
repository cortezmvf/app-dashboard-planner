import type { ChartType } from '../../types'

interface PaletteItem {
  type: ChartType
  label: string
  icon: string
}

const PALETTE: { category: string; items: PaletteItem[] }[] = [
  {
    category: 'Texto e Anotação',
    items: [
      { type: 'text-box', label: 'Caixa de Texto', icon: 'T' },
      { type: 'divider', label: 'Divisor', icon: '—' },
    ],
  },
  {
    category: 'Gráficos',
    items: [
      { type: 'bar', label: 'Barras', icon: '▊' },
      { type: 'stacked-bar', label: 'Barras Empilhadas', icon: '▤' },
      { type: 'line', label: 'Linhas', icon: '〜' },
      { type: 'area', label: 'Área', icon: '◭' },
      { type: 'combo', label: 'Combo', icon: '⊞' },
      { type: 'scatter', label: 'Dispersão', icon: '⁙' },
      { type: 'pie', label: 'Pizza', icon: '◔' },
      { type: 'donut', label: 'Rosca', icon: '◎' },
    ],
  },
  {
    category: 'Indicadores',
    items: [
      { type: 'kpi-card', label: 'Card KPI', icon: '#' },
      { type: 'gauge', label: 'Gauge', icon: '◑' },
      { type: 'bullet', label: 'Bullet', icon: '▷' },
    ],
  },
  {
    category: 'Dados',
    items: [
      { type: 'table', label: 'Tabela', icon: '⊟' },
      { type: 'pivot', label: 'Tabela Pivot', icon: '⊞' },
    ],
  },
  {
    category: 'Layout',
    items: [
      { type: 'image-placeholder', label: 'Imagem', icon: '🖼' },
      { type: 'shape-rect', label: 'Retângulo', icon: '▭' },
      { type: 'shape-ellipse', label: 'Elipse', icon: '⬭' },
    ],
  },
]

export function ChartPalette() {
  function handleDragStart(e: React.DragEvent, type: ChartType) {
    e.dataTransfer.setData('chartType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">Elementos</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 px-1 -mt-2">Arraste para o canvas</p>

      {PALETTE.map(({ category, items }) => (
        <div key={category}>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1.5">{category}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map(({ type, label, icon }) => (
              <div
                key={type}
                draggable
                onDragStart={e => handleDragStart(e, type)}
                className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-[#005175] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all select-none"
                title={`Arraste "${label}" para o canvas`}
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
