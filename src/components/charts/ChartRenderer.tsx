import type { ChartItem } from '../../types'
import { BarChartPlaceholder } from './BarChart'
import { LineChartPlaceholder } from './LineChart'
import { AreaChartPlaceholder } from './AreaChart'
import { ComboChartPlaceholder } from './ComboChart'
import { ScatterChartPlaceholder } from './ScatterChart'
import { DonutChartPlaceholder } from './DonutChart'
import { KpiCardPlaceholder } from './KpiCard'
import { GaugeChartPlaceholder } from './GaugeChart'
import { BulletChartPlaceholder } from './BulletChart'
import { TableChartPlaceholder } from './TableChart'
import { TextBoxPlaceholder } from './TextBox'
import { ImagePlaceholderComp } from './ImagePlaceholder'
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
    case 'gauge':
      return <GaugeChartPlaceholder {...props} />
    case 'bullet':
      return <BulletChartPlaceholder {...props} />
    case 'table':
    case 'pivot':
      return <TableChartPlaceholder {...props} />
    case 'text-box':
      return <TextBoxPlaceholder {...props} />
    case 'image-placeholder':
      return <ImagePlaceholderComp {...props} />
    case 'divider':
      return <DividerComp {...props} />
    case 'shape-rect':
    case 'shape-ellipse':
      return <ShapePlaceholder {...props} />
    default:
      return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">?</div>
  }
}
