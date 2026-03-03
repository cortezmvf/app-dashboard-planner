import type { ChartItem } from '../../types'
import { BarChartPlaceholder } from './BarChart'
import { LineChartPlaceholder } from './LineChart'
import { HeatmapChartPlaceholder } from './HeatmapChart'
import { TreemapChartPlaceholder } from './TreemapChart'
import { FilledMapChartPlaceholder } from './FilledMapChart'
import { AreaChartPlaceholder } from './AreaChart'
import { ComboChartPlaceholder } from './ComboChart'
import { ScatterChartPlaceholder } from './ScatterChart'
import { DonutChartPlaceholder } from './DonutChart'
import { KpiCardPlaceholder } from './KpiCard'
import { BulletChartPlaceholder } from './BulletChart'
import { TableChartPlaceholder } from './TableChart'
import { TextBoxPlaceholder } from './TextBox'
import { DividerComp } from './Divider'
import { ShapePlaceholder } from './Shape'

interface Props {
  chart: ChartItem
  colors: string[]
}

export function ChartRenderer({ chart, colors }: Props) {
  const props = { chart, colors }

  switch (chart.type) {
    case 'bar':
    case 'stacked-bar':
      return <BarChartPlaceholder {...props} />
    case 'line':
      return <LineChartPlaceholder {...props} />
    case 'area':
      return <AreaChartPlaceholder {...props} />
    case 'combo':
      return <ComboChartPlaceholder {...props} />
    case 'scatter':
      return <ScatterChartPlaceholder {...props} />
    case 'pie':
    case 'donut':
      return <DonutChartPlaceholder {...props} />
    case 'kpi-card':
      return <KpiCardPlaceholder {...props} />
    case 'bullet':
      return <BulletChartPlaceholder {...props} />
    case 'table':
      return <TableChartPlaceholder {...props} />
    case 'text-box':
      return <TextBoxPlaceholder {...props} />
    case 'divider':
      return <DividerComp {...props} />
    case 'shape-rect':
    case 'shape-ellipse':
      return <ShapePlaceholder {...props} />
    case 'filled-map':
      return <FilledMapChartPlaceholder {...props} />
    case 'treemap':
      return <TreemapChartPlaceholder {...props} />
    case 'heatmap':
      return <HeatmapChartPlaceholder {...props} />
    default:
      return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">?</div>
  }
}
