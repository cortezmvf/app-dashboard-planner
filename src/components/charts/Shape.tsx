import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

export function ShapePlaceholder({ chart, colors }: Props) {
  const isEllipse = chart.type === 'shape-ellipse'
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '90%',
          height: '90%',
          backgroundColor: colors[0] + '30',
          border: `2px solid ${colors[0]}`,
          borderRadius: isEllipse ? '50%' : '6px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
