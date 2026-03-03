import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

export function KpiCardPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const color = colors[0]

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" rx={6} />
      <rect width={4} height={H * 0.6} x={0} y={H * 0.2} fill={color} rx={2} />

      <text x={16} y={H * 0.35} fontSize={10} fill="#9ca3af">{chart.title || 'KPI'}</text>
      <text x={16} y={H * 0.62} fontSize={Math.min(28, H * 0.38)} fontWeight="700" fill="#111827">
        {chart.unit || ''}{chart.valueLabel || '1.234'}
      </text>
      {chart.subtitle && (
        <text x={16} y={H * 0.82} fontSize={9} fill="#6b7280">{chart.subtitle}</text>
      )}

      {/* Trend arrow */}
      <text x={W - 12} y={H * 0.55} fontSize={12} fill="#22c55e" textAnchor="end">↑ 12%</text>
    </svg>
  )
}
