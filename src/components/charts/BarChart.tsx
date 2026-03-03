import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const BARS_DATA = [0.6, 0.85, 0.45, 0.9, 0.7, 0.55]
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

export function BarChartPlaceholder({ chart, colors }: Props) {
  const isStacked = chart.type === 'stacked-bar'
  const pad = { t: 36, r: 12, b: 32, l: 36 }
  const W = chart.width
  const H = chart.height
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const barW = (cW / BARS_DATA.length) * 0.6
  const gap = (cW / BARS_DATA.length) * 0.4

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      {/* Background */}
      <rect width={W} height={H} fill="white" />

      {/* Title */}
      {chart.title && (
        <text x={pad.l} y={16} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>
      )}

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = pad.t + cH - pct * cH
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + cW} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={pad.l - 4} y={y + 3} fontSize={8} fill="#9ca3af" textAnchor="end">
              {Math.round(pct * 100)}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {BARS_DATA.map((v, i) => {
        const x = pad.l + i * (cW / BARS_DATA.length) + gap / 2
        const color = colors[i % colors.length]
        if (isStacked) {
          const v1 = v * 0.6, v2 = v * 0.4
          return (
            <g key={i}>
              <rect x={x} y={pad.t + cH - v2 * cH - v1 * cH} width={barW} height={v1 * cH} fill={colors[0]} rx={2} />
              <rect x={x} y={pad.t + cH - v2 * cH} width={barW} height={v2 * cH} fill={colors[1]} rx={2} />
              <text x={x + barW / 2} y={H - pad.b + 12} fontSize={8} fill="#9ca3af" textAnchor="middle">{MONTHS[i]}</text>
            </g>
          )
        }
        return (
          <g key={i}>
            <rect x={x} y={pad.t + cH - v * cH} width={barW} height={v * cH} fill={color} rx={2} opacity={0.85} />
            <text x={x + barW / 2} y={H - pad.b + 12} fontSize={8} fill="#9ca3af" textAnchor="middle">{MONTHS[i]}</text>
          </g>
        )
      })}

      {/* Axis labels */}
      {chart.xAxisLabel && (
        <text x={pad.l + cW / 2} y={H - 2} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>
      )}
      {chart.yAxisLabel && (
        <text x={10} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,10,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>
      )}
    </svg>
  )
}
