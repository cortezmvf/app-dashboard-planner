import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

interface Cell { label: string; value: number; x: number; y: number; w: number; h: number }

const ITEMS = [
  { label: 'Category A', value: 32 },
  { label: 'Category B', value: 24 },
  { label: 'Category C', value: 18 },
  { label: 'Category D', value: 12 },
  { label: 'Category E', value: 8 },
  { label: 'Category F', value: 6 },
]

/** Simple row-based treemap layout */
function layoutTreemap(items: { label: string; value: number }[], x: number, y: number, w: number, h: number): Cell[] {
  const total = items.reduce((s, i) => s + i.value, 0)
  const cells: Cell[] = []
  let remaining = [...items]
  let rx = x, ry = y, rw = w, rh = h

  while (remaining.length > 0) {
    const isRow = rw >= rh
    const rowSize = remaining.slice(0, Math.ceil(remaining.length / 2))
    const rowTotal = rowSize.reduce((s, i) => s + i.value, 0)
    const fraction = rowTotal / (items.reduce((s, i) => s + i.value, 0) || 1)

    if (isRow) {
      const rowW = rw * (rowTotal / (remaining.reduce((s, i) => s + i.value, 0) || 1))
      let cy = ry
      for (const item of rowSize) {
        const h2 = rh * (item.value / rowTotal)
        cells.push({ label: item.label, value: item.value, x: rx, y: cy, w: rowW, h: h2 })
        cy += h2
      }
      rx += rowW; rw -= rowW
    } else {
      const rowH = rh * (rowTotal / (remaining.reduce((s, i) => s + i.value, 0) || 1))
      let cx = rx
      for (const item of rowSize) {
        const w2 = rw * (item.value / rowTotal)
        cells.push({ label: item.label, value: item.value, x: cx, y: ry, w: w2, h: rowH })
        cx += w2
      }
      ry += rowH; rh -= rowH
    }
    remaining = remaining.slice(rowSize.length)
    void total; void fraction
  }
  return cells
}

export function TreemapChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const pad = { t: chart.subtitle ? 42 : 28, r: 16, b: 16, l: 16 }
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b

  const cells = layoutTreemap(ITEMS, pad.l, pad.t, cW, cH)

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
      {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

      {cells.map((cell, i) => {
        const color = colors[i % colors.length]
        const showText = cell.w > 40 && cell.h > 22
        return (
          <g key={i}>
            <rect
              x={cell.x + 1} y={cell.y + 1}
              width={Math.max(0, cell.w - 2)} height={Math.max(0, cell.h - 2)}
              fill={color} rx={3} opacity={0.85}
            />
            {showText && (
              <>
                <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 - (cell.h > 36 ? 5 : 0)}
                  fontSize={Math.min(11, cell.w / 8, cell.h / 3)}
                  fontWeight="600" fill="white" textAnchor="middle"
                  style={{ pointerEvents: 'none' }}>
                  {cell.label.length > 12 ? cell.label.slice(0, 10) + '…' : cell.label}
                </text>
                {cell.h > 36 && (
                  <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 10}
                    fontSize={9} fill="white" fillOpacity={0.8} textAnchor="middle">
                    {cell.value}%
                  </text>
                )}
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
