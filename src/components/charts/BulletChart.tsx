import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

export function BulletChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const pad = { t: chart.subtitle ? 38 : 26, r: 24, b: 16, l: 24 }
  const cW = W - pad.l - pad.r
  const trackH = Math.max(8, H * 0.25)
  const trackY = (H - pad.t - pad.b) / 2 + pad.t - trackH / 2

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
      {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

      {/* Qualitative ranges */}
      <rect x={pad.l} y={trackY} width={cW} height={trackH} fill="#e5e7eb" rx={2} />
      <rect x={pad.l} y={trackY} width={cW * 0.75} height={trackH} fill={colors[2] ?? '#d1d5db'} rx={2} />
      <rect x={pad.l} y={trackY} width={cW * 0.5} height={trackH} fill={colors[1] ?? '#9ca3af'} rx={2} />

      {/* Actual value bar */}
      <rect x={pad.l} y={trackY + trackH * 0.25} width={cW * 0.62} height={trackH * 0.5} fill={colors[0]} rx={2} />

      {/* Target marker */}
      <line x1={pad.l + cW * 0.8} y1={trackY - 2} x2={pad.l + cW * 0.8} y2={trackY + trackH + 2} stroke="#374151" strokeWidth={3} />

      {/* Value label */}
      <text x={pad.l + cW * 0.62 + 6} y={trackY + trackH * 0.65} fontSize={9} fill="#374151">
        {chart.valueLabel || '62'}{chart.unit || '%'}
      </text>
    </svg>
  )
}
