import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

const ROWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLS = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']

// Pre-generated intensity values [0..1]
const DATA: number[][] = [
  [0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.5, 0.3, 0.1],
  [0.3, 0.6, 0.85, 0.95, 0.9, 0.75, 0.6, 0.4, 0.2],
  [0.15, 0.45, 0.75, 0.88, 0.82, 0.65, 0.55, 0.35, 0.15],
  [0.25, 0.5, 0.8, 0.92, 0.85, 0.7, 0.58, 0.38, 0.18],
  [0.35, 0.55, 0.72, 0.88, 0.78, 0.62, 0.48, 0.28, 0.1],
  [0.1, 0.2, 0.3, 0.4, 0.35, 0.28, 0.22, 0.15, 0.08],
  [0.05, 0.12, 0.2, 0.28, 0.22, 0.18, 0.12, 0.08, 0.04],
]

function lerpColor(color: string, intensity: number): string {
  // Blend from white (#ffffff) to color based on intensity
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const rr = Math.round(255 + (r - 255) * intensity)
  const gg = Math.round(255 + (g - 255) * intensity)
  const bb = Math.round(255 + (b - 255) * intensity)
  return `rgb(${rr},${gg},${bb})`
}

export function HeatmapChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const pad = { t: chart.subtitle ? 42 : 28, r: 16, b: 28, l: 36 }
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const cellW = cW / COLS.length
  const cellH = cH / ROWS.length
  const baseColor = colors[0] ?? '#005175'

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={pad.l} y={18} fontSize={11} fontWeight="600" fill="#374151">{chart.title}</text>}
      {chart.subtitle && <text x={pad.l} y={30} fontSize={9} fill="#6b7280">{chart.subtitle}</text>}

      {DATA.map((row, ri) =>
        row.map((val, ci) => {
          const x = pad.l + ci * cellW
          const y = pad.t + ri * cellH
          const fill = baseColor.startsWith('#') && baseColor.length === 7
            ? lerpColor(baseColor, val)
            : `rgba(0,81,117,${val})`
          return (
            <rect key={`${ri}-${ci}`}
              x={x + 1} y={y + 1}
              width={cellW - 2} height={cellH - 2}
              fill={fill} rx={2}
            />
          )
        })
      )}

      {/* Row labels */}
      {ROWS.map((label, ri) => (
        <text key={ri} x={pad.l - 4} y={pad.t + ri * cellH + cellH * 0.62}
          fontSize={7} fill="#6b7280" textAnchor="end">
          {label}
        </text>
      ))}

      {/* Column labels */}
      {COLS.map((label, ci) => (
        <text key={ci} x={pad.l + ci * cellW + cellW / 2} y={H - 6}
          fontSize={7} fill="#6b7280" textAnchor="middle">
          {label}
        </text>
      ))}
    </svg>
  )
}
