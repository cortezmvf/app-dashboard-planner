import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const SEGMENTS = [0.32, 0.24, 0.20, 0.14, 0.10]
const LABELS = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, innerR: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const si = polarToCartesian(cx, cy, innerR, startDeg)
  const ei = polarToCartesian(cx, cy, innerR, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${s.x} ${s.y}`,
    `A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`,
    `L ${ei.x} ${ei.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${si.x} ${si.y}`,
    'Z',
  ].join(' ')
}

export function DonutChartPlaceholder({ chart, colors }: Props) {
  const isPie = chart.type === 'pie'
  const showLegend = chart.showLegend ?? false
  const W = chart.width, H = chart.height
  const titleH = chart.title ? (chart.subtitle ? 36 : 24) : 4
  const legendH = showLegend ? SEGMENTS.length * 13 + 4 : 0
  const cx = W / 2
  const cy = (H - titleH - legendH) / 2 + titleH
  const r = Math.min(W, H - titleH - legendH) * 0.34
  const innerR = isPie ? 0 : r * 0.55

  let current = 0
  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={16} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}
      {chart.subtitle && <text x={W / 2} y={28} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.subtitle}</text>}

      {SEGMENTS.map((seg, i) => {
        const startDeg = current * 360
        const endDeg = (current + seg) * 360 - 1
        current += seg
        const path = arcPath(cx, cy, r, innerR, startDeg, endDeg)
        return <path key={i} d={path} fill={colors[i % colors.length]} stroke="white" strokeWidth={2} />
      })}

      {/* Center label for donut */}
      {!isPie && (
        <>
          <text x={cx} y={cy - 4} fontSize={16} fontWeight="700" fill="#1f2937" textAnchor="middle">
            {chart.valueLabel || '100%'}
          </text>
          <text x={cx} y={cy + 12} fontSize={9} fill="#9ca3af" textAnchor="middle">
            Total
          </text>
        </>
      )}

      {/* Optional legend */}
      {showLegend && LABELS.map((l, i) => (
        <g key={i}>
          <rect x={8} y={H - legendH + i * 13} width={8} height={8} fill={colors[i % colors.length]} rx={2} />
          <text x={20} y={H - legendH + i * 13 + 7} fontSize={8} fill="#6b7280">{l} — {Math.round(SEGMENTS[i] * 100)}%</text>
        </g>
      ))}
    </svg>
  )
}
