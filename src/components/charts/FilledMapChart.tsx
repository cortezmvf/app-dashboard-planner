import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

// US tile map: [col, row, abbr, intensity 0-1]
const US_TILES: [number, number, string, number][] = [
  [0,0,'AK',0.3], [11,0,'ME',0.7],
  [10,1,'VT',0.4], [11,1,'NH',0.6],
  [0,2,'WA',0.8], [1,2,'MT',0.5], [2,2,'ND',0.3], [3,2,'MN',0.7], [4,2,'WI',0.6],
  [5,2,'MI',0.4], [6,2,'NY',0.9], [7,2,'MA',0.8], [8,2,'RI',0.55],
  [0,3,'OR',0.6], [1,3,'ID',0.4], [2,3,'SD',0.25], [3,3,'NE',0.5], [4,3,'IA',0.65],
  [5,3,'IL',0.8], [6,3,'IN',0.5], [7,3,'OH',0.72], [8,3,'PA',0.6], [9,3,'NJ',0.85],
  [10,3,'CT',0.9], [11,3,'RI',0.55],
  [0,4,'CA',0.95], [1,4,'NV',0.3], [2,4,'WY',0.2], [3,4,'KS',0.4], [4,4,'MO',0.6],
  [5,4,'KY',0.5], [6,4,'WV',0.35], [7,4,'VA',0.7], [8,4,'MD',0.8], [9,4,'DE',0.65],
  [1,5,'UT',0.4], [2,5,'CO',0.7], [3,5,'NM',0.3], [4,5,'OK',0.45], [5,5,'TN',0.62],
  [6,5,'NC',0.75], [7,5,'SC',0.55], [8,5,'DC',0.9],
  [2,6,'AZ',0.5], [3,6,'TX',0.85], [4,6,'AR',0.38], [5,6,'MS',0.28],
  [6,6,'AL',0.42], [7,6,'GA',0.65],
  [4,7,'LA',0.48], [7,7,'FL',0.82],
  [0,6,'HI',0.6],
]

const COLS = 12, MAP_ROWS = 8

export function FilledMapChartPlaceholder({ chart, colors }: Props) {
  const W = chart.width, H = chart.height
  const pad = { t: chart.subtitle ? 42 : 28, r: 16, b: 28, l: 16 }
  const cW = W - pad.l - pad.r
  const cH = H - pad.t - pad.b
  const tileW = cW / COLS
  const tileH = cH / MAP_ROWS
  const gap = 2
  const baseColor = colors[0] ?? '#005175'

  function tileColor(intensity: number): string {
    if (!baseColor.startsWith('#') || baseColor.length !== 7) {
      return `rgba(0,81,117,${0.15 + intensity * 0.85})`
    }
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    const t = 0.12 + intensity * 0.88
    const rr = Math.round(255 + (r - 255) * t)
    const gg = Math.round(255 + (g - 255) * t)
    const bb = Math.round(255 + (b - 255) * t)
    return `rgb(${rr},${gg},${bb})`
  }

  const fontSize = Math.min(9, tileW * 0.38, tileH * 0.38)

  return (
    <svg width={W} height={H} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      <rect width={W} height={H} fill="white" />
      {chart.title && <text x={W / 2} y={18} fontSize={11} fontWeight="600" fill="#374151" textAnchor="middle">{chart.title}</text>}
      {chart.subtitle && <text x={W / 2} y={30} fontSize={9} fill="#6b7280" textAnchor="middle">{chart.subtitle}</text>}

      {US_TILES.map(([col, row, abbr, intensity]) => {
        const x = pad.l + col * tileW + gap / 2
        const y = pad.t + row * tileH + gap / 2
        const tw = tileW - gap
        const th = tileH - gap
        return (
          <g key={abbr}>
            <rect x={x} y={y} width={tw} height={th} fill={tileColor(intensity)} rx={2} />
            {tw > 14 && th > 12 && (
              <text x={x + tw / 2} y={y + th / 2 + fontSize * 0.38}
                fontSize={fontSize} fontWeight="600"
                fill={intensity > 0.55 ? 'white' : '#374151'}
                textAnchor="middle">
                {abbr}
              </text>
            )}
          </g>
        )
      })}

      {/* Legend: Low → High */}
      {(() => {
        const lx = pad.l, ly = H - 18, lw = Math.min(120, cW * 0.4)
        const steps = 5
        const stepW = lw / steps
        return (
          <g>
            {Array.from({ length: steps }, (_, i) => (
              <rect key={i} x={lx + i * stepW} y={ly} width={stepW} height={8}
                fill={tileColor((i + 0.5) / steps)} />
            ))}
            <text x={lx} y={ly + 16} fontSize={7} fill="#9ca3af">Low</text>
            <text x={lx + lw} y={ly + 16} fontSize={7} fill="#9ca3af" textAnchor="end">High</text>
          </g>
        )
      })()}
    </svg>
  )
}
