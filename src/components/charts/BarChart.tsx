import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const ALL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Q1','Q2','Q3']
const ALL_VALUES = [0.6, 0.85, 0.45, 0.9, 0.7, 0.55, 0.8, 0.65, 0.75, 0.5, 0.88, 0.6, 0.72, 0.58, 0.68]
const LEGEND_LABELS = ['Category A', 'Category B', 'Category C']

export function BarChartPlaceholder({ chart, colors }: Props) {
  const isStacked = chart.type === 'stacked-bar'
  const isHorizontal = chart.orientation === 'horizontal'
  const showLegend = chart.showLegend ?? false
  const legendH = showLegend ? 20 : 0
  const n = Math.min(Math.max(chart.dataCount ?? 6, 1), ALL_VALUES.length)
  const BARS_DATA = ALL_VALUES.slice(0, n)
  const MONTHS = ALL_MONTHS.slice(0, n)

  if (isHorizontal) {
    const pad = { t: chart.subtitle ? 42 : 28, r: 24, b: 16 + legendH, l: 56 }
    const W = chart.width
    const H = chart.height
    const cW = W - pad.l - pad.r
    const cH = H - pad.t - pad.b
    const barH = (cH / BARS_DATA.length) * 0.6
    const gap = (cH / BARS_DATA.length) * 0.4

    return (
      <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
        <rect width={W} height={H} fill="white" />
        {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
        {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const x = pad.l + pct * cW
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={pad.t} y2={pad.t + cH} stroke="#e5e7eb" strokeWidth={1} />
              <text x={x} y={pad.t + cH + 12} fontSize={8} fill="#9ca3af" textAnchor="middle">{Math.round(pct * 100)}</text>
            </g>
          )
        })}

        {BARS_DATA.map((v, i) => {
          const y = pad.t + i * (cH / BARS_DATA.length) + gap / 2
          const color = colors[i % colors.length]
          if (isStacked) {
            const v1 = v * 0.6, v2 = v * 0.4
            return (
              <g key={i}>
                <rect y={y} x={pad.l} height={barH} width={v1 * cW} fill={colors[0]} rx={2} />
                <rect y={y} x={pad.l + v1 * cW} height={barH} width={v2 * cW} fill={colors[1]} rx={2} />
                <text y={y + barH / 2 + 3} x={pad.l - 5} fontSize={8} fill="#9ca3af" textAnchor="end">{MONTHS[i]}</text>
              </g>
            )
          }
          return (
            <g key={i}>
              <rect y={y} x={pad.l} height={barH} width={v * cW} fill={color} rx={2} opacity={0.85} />
              <text y={y + barH / 2 + 3} x={pad.l - 5} fontSize={8} fill="#9ca3af" textAnchor="end">{MONTHS[i]}</text>
            </g>
          )
        })}

        {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - 4} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
        {chart.yAxisLabel && <text x={12} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,12,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}

        {showLegend && (
          <g transform={`translate(${pad.l}, ${H - legendH + 4})`}>
            {(isStacked ? [colors[0], colors[1]] : colors.slice(0, 3)).map((c, i) => (
              <g key={i} transform={`translate(${i * 80}, 0)`}>
                <rect width={8} height={8} fill={c} rx={2} />
                <text x={11} y={8} fontSize={8} fill="#6b7280">{LEGEND_LABELS[i]}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    )
  }

  // Vertical (default)
  const pad = { t: chart.subtitle ? 42 : 28, r: 20, b: 38 + legendH, l: 44 }
  const W = chart.width
  const H = chart.height
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const barW = (cW / BARS_DATA.length) * 0.6
  const gap = (cW / BARS_DATA.length) * 0.4

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
      {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = pad.t + cH - pct * cH
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + cW} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={pad.l - 5} y={y + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{Math.round(pct * 100)}</text>
          </g>
        )
      })}

      {BARS_DATA.map((v, i) => {
        const x = pad.l + i * (cW / BARS_DATA.length) + gap / 2
        const color = colors[i % colors.length]
        if (isStacked) {
          const v1 = v * 0.6, v2 = v * 0.4
          return (
            <g key={i}>
              <rect x={x} y={pad.t + cH - v2 * cH - v1 * cH} width={barW} height={v1 * cH} fill={colors[0]} rx={2} />
              <rect x={x} y={pad.t + cH - v2 * cH} width={barW} height={v2 * cH} fill={colors[1]} rx={2} />
              <text x={x + barW / 2} y={pad.t + cH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{MONTHS[i]}</text>
            </g>
          )
        }
        return (
          <g key={i}>
            <rect x={x} y={pad.t + cH - v * cH} width={barW} height={v * cH} fill={color} rx={2} opacity={0.85} />
            <text x={x + barW / 2} y={pad.t + cH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{MONTHS[i]}</text>
          </g>
        )
      })}

      {chart.xAxisLabel && <text x={pad.l + cW / 2} y={H - legendH - 4} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.xAxisLabel}</text>}
      {chart.yAxisLabel && <text x={12} y={pad.t + cH / 2} fontSize={9} fill="#6b7280" textAnchor="middle" transform={`rotate(-90,12,${pad.t + cH / 2})`}>{chart.yAxisLabel}</text>}

      {showLegend && (
        <g transform={`translate(${pad.l}, ${H - legendH + 4})`}>
          {(isStacked ? [colors[0], colors[1]] : colors.slice(0, 3)).map((c, i) => (
            <g key={i} transform={`translate(${i * 80}, 0)`}>
              <rect width={8} height={8} fill={c} rx={2} />
              <text x={11} y={8} fontSize={8} fill="#6b7280">{LEGEND_LABELS[i]}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
