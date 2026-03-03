import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const DATA = [0.3, 0.5, 0.42, 0.68, 0.55, 0.8, 0.62]
const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const LEGEND_LABELS = ['Series A', 'Series B', 'Series C']

export function AreaChartPlaceholder({ chart, colors }: Props) {
  const showLegend = chart.showLegend ?? false
  const legendH = showLegend ? 20 : 0
  const pad = { t: chart.subtitle ? 42 : 28, r: 20, b: 38 + legendH, l: 44 }
  const W = chart.width, H = chart.height
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const baseY = pad.t + cH

  const pts = DATA.map((v, i) => ({ x: pad.l + (i / (DATA.length - 1)) * cW, y: pad.t + cH - v * cH }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`

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

      <defs>
        <linearGradient id={`area-grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} stopOpacity={0.35} />
          <stop offset="100%" stopColor={colors[0]} stopOpacity={0.04} />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#area-grad-${chart.id})`} />
      <path d={linePath} fill="none" stroke={colors[0]} strokeWidth={2.5} strokeLinejoin="round" />

      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={colors[0]} />
          <text x={p.x} y={pad.t + cH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{LABELS[i]}</text>
        </g>
      ))}

      {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - legendH - 4} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
      {chart.yAxisLabel && <text x={12} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,12,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}

      {showLegend && (
        <g transform={`translate(${pad.l}, ${H - legendH + 4})`}>
          {colors.slice(0, 3).map((c, i) => (
            <g key={i} transform={`translate(${i * 80}, 0)`}>
              <rect width={8} height={8} fill={c} rx={2} opacity={0.7} />
              <text x={11} y={8} fontSize={8} fill="#6b7280">{LEGEND_LABELS[i]}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
