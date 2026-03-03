import type { ChartItem } from '../../types'

interface Props { chart: ChartItem; colors: string[] }

export function DividerComp({ colors }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 2, backgroundColor: colors[0], opacity: 0.5 }} />
    </div>
  )
}
