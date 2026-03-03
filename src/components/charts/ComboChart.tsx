import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const BAR_DATA = [0.6, 0.75, 0.5, 0.88, 0.65, 0.72]
const LINE_DATA = [0.45, 0.6, 0.55, 0.7, 0.62, 0.8]
const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export function ComboChartPlaceholder({ chart, colors }: Props) {
  const pad = { t: chart.subtitle ? 42 : 28, r: 20, b: 38, l: 44 }
  const W = chart.width, H = chart.height
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const barW = (cW / BAR_DATA.length) * 0.55

  const linePoints = LINE_DATA.map((v, i) => ({
    x: pad.l + (i / (LINE_DATA.length - 1)) * cW,
    y: pad.t + cH - v * cH,
  }))
  const lineD = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

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

      {BAR_DATA.map((v, i) => {
        const x = pad.l + i * (cW / BAR_DATA.length) + (cW / BAR_DATA.length - barW) / 2
        return <g key={i}>
          <rect x={x} y={pad.t + cH - v * cH} width={barW} height={v * cH} fill={colors[0]} rx={2} opacity={0.7} />
          <text x={x + barW / 2} y={pad.t + cH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{LABELS[i]}</text>
        </g>
      })}

      <path d={lineD} fill="none" stroke={colors[1] ?? '#f97316'} strokeWidth={2.5} strokeLinejoin="round" />
      {linePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors[1] ?? '#f97316'} />
      ))}

      {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - 5} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
      {chart.yAxisLabel && <text x={12} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,12,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}
    </svg>
  )
}
