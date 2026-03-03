import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const ALL_ROWS = [
  ['Product A', '1,234', '45%', '↑ 12%'],
  ['Product B', '987',   '32%', '↓ 3%'],
  ['Product C', '765',   '28%', '↑ 8%'],
  ['Product D', '543',   '19%', '↑ 2%'],
  ['Product E', '321',   '11%', '↓ 1%'],
  ['Product F', '210',   '8%',  '↑ 5%'],
  ['Product G', '189',   '7%',  '↓ 2%'],
  ['Product H', '145',   '5%',  '↑ 1%'],
  ['Product I', '120',   '4%',  '↑ 3%'],
  ['Product J', '98',    '3%',  '↓ 4%'],
  ['Product K', '78',    '3%',  '↑ 7%'],
  ['Product L', '62',    '2%',  '↓ 1%'],
  ['Product M', '55',    '2%',  '↑ 2%'],
  ['Product N', '44',    '1%',  '↑ 0%'],
  ['Product O', '38',    '1%',  '↓ 1%'],
]

export function TableChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const titleH = chart.title ? (chart.subtitle ? 36 : 24) : 8
  const cols = chart.columns.split(',').map(s => s.trim()).filter(Boolean)
  const headers = cols.length > 0 ? cols.slice(0, 4) : ['Category', 'Value', 'Share', 'Δ']
  const maxRows = Math.min(Math.max(chart.dataCount ?? 5, 1), ALL_ROWS.length)
  const rowH = Math.max(18, (H - titleH - 28) / Math.min(maxRows + 1, maxRows + 2))
  const colW = (W - 4) / headers.length
  const visibleRows = ALL_ROWS.slice(0, Math.min(maxRows, Math.floor((H - titleH - 28) / rowH)))

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={16} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}
      {chart.subtitle && <text x={W / 2} y={28} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.subtitle}</text>}

      {/* Header row */}
      <rect x={2} y={titleH} width={W - 4} height={rowH} fill={colors[0]} rx={2} />
      {headers.map((h, i) => (
        <text key={i} x={2 + colW * i + colW / 2} y={titleH + rowH * 0.65} fontSize={9} fontWeight="600" fill="white" textAnchor="middle">
          {h}
        </text>
      ))}

      {/* Data rows */}
      {visibleRows.map((row, ri) => (
        <g key={ri}>
          <rect x={2} y={titleH + rowH * (ri + 1)} width={W - 4} height={rowH} fill={ri % 2 === 0 ? '#f9fafb' : 'white'} />
          {headers.map((_h, ci) => (
            <text key={ci} x={2 + colW * ci + (ci === 0 ? 8 : colW / 2)} y={titleH + rowH * (ri + 1) + rowH * 0.65}
              fontSize={8} fill={ci === headers.length - 1 ? (row[ci]?.startsWith('↑') ? '#16a34a' : '#dc2626') : '#374151'}
              textAnchor={ci === 0 ? 'start' : 'middle'}>
              {row[ci] ?? '—'}
            </text>
          ))}
        </g>
      ))}

      {/* Column dividers */}
      {headers.map((_h, i) => i > 0 && (
        <line key={i} x1={2 + colW * i} y1={titleH} x2={2 + colW * i} y2={H} stroke="#e5e7eb" strokeWidth={0.5} />
      ))}
    </svg>
  )
}
