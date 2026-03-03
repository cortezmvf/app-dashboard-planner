import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

export function GaugeChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const cx = W / 2
  const titleH = chart.title ? (chart.subtitle ? 36 : 22) : 4
  // Place arc center at ~65% of remaining height
  const cy = titleH + (H - titleH) * 0.62
  const r = Math.min((W - 32) / 2, (H - titleH - 20) * 0.72)
  const trackW = Math.max(8, r * 0.2)
  const progress = 0.68

  // Gauge is a top semicircle: left (cx-r, cy) through top to right (cx+r, cy)
  // SVG: M (cx-r) cy  A r r 0 0 0 (cx+r) cy  → large-arc=0, sweep=0 (CCW) = goes UP
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`

  // Progress arc: angle θ from left (0) to right (π), going CCW
  // Point at progress p: x = cx - r*cos(p*π), y = cy - r*sin(p*π)
  const θ = progress * Math.PI
  const px = cx - r * Math.cos(θ)
  const py = cy - r * Math.sin(θ)
  const largeArc = progress > 0.5 ? 1 : 0
  const progressPath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${px} ${py}`

  // Needle
  const needleR = r * 0.72
  const nx = cx - needleR * Math.cos(θ)
  const ny = cy - needleR * Math.sin(θ)

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={16} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}
      {chart.subtitle && <text x={W / 2} y={28} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.subtitle}</text>}

      {/* Track */}
      <path d={trackPath} fill="none" stroke="#e5e7eb" strokeWidth={trackW} strokeLinecap="round" />
      {/* Progress */}
      <path d={progressPath} fill="none" stroke={colors[0]} strokeWidth={trackW} strokeLinecap="round" />

      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#374151" />

      {/* Value */}
      <text x={cx} y={cy + r * 0.22 + 14} fontSize={20} fontWeight="700" fill="#111827" textAnchor="middle">
        {chart.valueLabel || '68'}
        <tspan fontSize={10} fill="#9ca3af">{chart.unit || '%'}</tspan>
      </text>

      {/* Min / Max */}
      <text x={cx - r - trackW / 2} y={cy + 16} fontSize={8} fill="#9ca3af" textAnchor="middle">0</text>
      <text x={cx + r + trackW / 2} y={cy + 16} fontSize={8} fill="#9ca3af" textAnchor="middle">100</text>
    </svg>
  )
}
