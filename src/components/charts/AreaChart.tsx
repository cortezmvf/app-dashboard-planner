import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const DATA = [0.3, 0.5, 0.42, 0.68, 0.55, 0.8, 0.62]
const LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']

export function AreaChartPlaceholder({ chart, colors }: Props) {
  const pad = { t: 36, r: 12, b: 32, l: 36 }
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
      {chart.title && <text x={pad.l} y={16} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}

      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = pad.t + cH - pct * cH
        return <g key={i}>
          <line x1={pad.l} x2={pad.l + cW} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
          <text x={pad.l - 4} y={y + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{Math.round(pct * 100)}</text>
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
          <text x={p.x} y={H - pad.b + 12} fontSize={8} fill="#9ca3af" textAnchor="middle">{LABELS[i]}</text>
        </g>
      ))}

      {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - 2} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
      {chart.yAxisLabel && <text x={10} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,10,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}
    </svg>
  )
}
