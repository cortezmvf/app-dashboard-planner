import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function GaugeChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const cx = W / 2
  const cy = H * 0.6
  const r = Math.min(W * 0.38, H * 0.5)
  const trackW = r * 0.22

  // 180-degree arc from -180 to 0 (left to right, bottom half up)
  const startDeg = 180, endDeg = 360
  const progress = 0.68 // 68%

  function arcD(startD: number, endD: number, rr: number) {
    const s = polar(cx, cy, rr, startD)
    const e = polar(cx, cy, rr, endD)
    return `M ${s.x} ${s.y} A ${rr} ${rr} 0 1 1 ${e.x} ${e.y}`
  }

  const progressEnd = startDeg + progress * (endDeg - startDeg)
  const needleEnd = polar(cx, cy, r * 0.7, startDeg + progress * (endDeg - startDeg))

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={16} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}

      {/* Track */}
      <path d={arcD(startDeg, endDeg, r)} fill="none" stroke="#e5e7eb" strokeWidth={trackW} strokeLinecap="round" />
      {/* Progress */}
      <path d={arcD(startDeg, progressEnd, r)} fill="none" stroke={colors[0]} strokeWidth={trackW} strokeLinecap="round" />

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#374151" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#374151" />

      {/* Value */}
      <text x={cx} y={cy + r * 0.28} fontSize={18} fontWeight="700" fill="#111827" textAnchor="middle">
        {chart.valueLabel || '68'}
        <tspan fontSize={10} fill="#9ca3af">{chart.unit || '%'}</tspan>
      </text>

      {/* Min / Max */}
      <text x={cx - r + trackW / 2} y={cy + 16} fontSize={8} fill="#9ca3af" textAnchor="middle">0</text>
      <text x={cx + r - trackW / 2} y={cy + 16} fontSize={8} fill="#9ca3af" textAnchor="middle">100</text>
    </svg>
  )
}
