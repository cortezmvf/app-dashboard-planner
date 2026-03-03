import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const ROWS = [
  ['Produto A', '1.234', '45%', '↑ 12%'],
  ['Produto B', '987',   '32%', '↓ 3%'],
  ['Produto C', '765',   '28%', '↑ 8%'],
  ['Produto D', '543',   '19%', '↑ 2%'],
  ['Produto E', '321',   '11%', '↓ 1%'],
]

export function TableChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const titleH = chart.title ? 24 : 4
  const cols = chart.columns.split(',').map(s => s.trim()).filter(Boolean)
  const headers = cols.length > 0 ? cols.slice(0, 4) : ['Categoria', 'Valor', 'Share', 'Δ']
  const rowH = Math.max(18, (H - titleH - 28) / Math.min(ROWS.length + 1, 6))
  const colW = (W - 2) / headers.length

  const isPivot = chart.type === 'pivot'

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={16} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}

      {/* Header row */}
      <rect x={1} y={titleH} width={W - 2} height={rowH} fill={colors[0]} rx={2} />
      {headers.map((h, i) => (
        <text key={i} x={1 + colW * i + colW / 2} y={titleH + rowH * 0.65} fontSize={9} fontWeight="600" fill="white" textAnchor="middle">
          {h}
        </text>
      ))}

      {/* Data rows */}
      {ROWS.slice(0, Math.floor((H - titleH - 28) / rowH)).map((row, ri) => (
        <g key={ri}>
          <rect x={1} y={titleH + rowH * (ri + 1)} width={W - 2} height={rowH} fill={ri % 2 === 0 ? '#f9fafb' : 'white'} />
          {headers.map((_h, ci) => (
            <text key={ci} x={1 + colW * ci + (ci === 0 ? 6 : colW / 2)} y={titleH + rowH * (ri + 1) + rowH * 0.65}
              fontSize={8} fill={ci === headers.length - 1 ? (row[ci]?.startsWith('↑') ? '#16a34a' : '#dc2626') : '#374151'}
              textAnchor={ci === 0 ? 'start' : 'middle'} fontWeight={isPivot && ci === 0 ? '600' : 'normal'}>
              {row[ci] ?? '—'}
            </text>
          ))}
        </g>
      ))}

      {/* Border lines */}
      {headers.map((_h, i) => i > 0 && (
        <line key={i} x1={1 + colW * i} y1={titleH} x2={1 + colW * i} y2={H} stroke="#e5e7eb" strokeWidth={0.5} />
      ))}
    </svg>
  )
}
