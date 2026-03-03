import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const ALL_POINTS = [
  [0.2, 0.3], [0.35, 0.55], [0.5, 0.4], [0.65, 0.75], [0.8, 0.65],
  [0.25, 0.7], [0.55, 0.2], [0.75, 0.5], [0.4, 0.85], [0.6, 0.6],
  [0.15, 0.45], [0.9, 0.3], [0.45, 0.15], [0.7, 0.9], [0.3, 0.8],
  [0.85, 0.55], [0.1, 0.65], [0.58, 0.48], [0.42, 0.62], [0.78, 0.22],
  [0.22, 0.88], [0.68, 0.38], [0.33, 0.28], [0.52, 0.72], [0.88, 0.78],
  [0.12, 0.18], [0.62, 0.82], [0.48, 0.52], [0.72, 0.12], [0.38, 0.42],
]

export function ScatterChartPlaceholder({ chart, colors }: Props) {
  const pad = { t: chart.subtitle ? 42 : 28, r: 20, b: 40, l: 44 }
  const W = chart.width, H = chart.height
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b
  const n = Math.min(Math.max(chart.dataCount ?? 10, 1), ALL_POINTS.length)
  const POINTS = ALL_POINTS.slice(0, n)

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
      {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = pad.t + cH - pct * cH
        return <g key={i}>
          <line x1={pad.l} x2={pad.l + cW} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
          <text x={pad.l - 5} y={y + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{Math.round(pct * 100)}</text>
        </g>
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const x = pad.l + pct * cW
        return <g key={i}>
          <line x1={x} x2={x} y1={pad.t} y2={pad.t + cH} stroke="#e5e7eb" strokeWidth={1} />
          <text x={x} y={pad.t + cH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{Math.round(pct * 100)}</text>
        </g>
      })}

      {POINTS.map(([px, py], i) => (
        <circle key={i} cx={pad.l + px * cW} cy={pad.t + cH - py * cH} r={4} fill={colors[i % colors.length]} opacity={0.75} />
      ))}

      {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - 5} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
      {chart.yAxisLabel && <text x={12} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,12,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}
    </svg>
  )
}
