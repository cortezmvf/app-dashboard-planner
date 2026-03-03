import type { ChartItem, ChartType } from '../types'

const BASE: Omit<ChartItem, 'id' | 'type' | 'x' | 'y' | 'width' | 'height' | 'zIndex'> = {
  locked: false,
  title: '',
  subtitle: '',
  xAxisLabel: '',
  yAxisLabel: '',
  showLegend: false,
  valueLabel: '',
  unit: '',
  columns: 'Column A, Column B, Column C',
  content: 'Text',
  fontSize: 'medium',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  textColor: '#1a1a1a',
  textBackground: 'transparent',
  altText: 'Image',
  borderColor: '#e5e7eb',
  borderWidth: 0,
  borderStyle: 'solid',
  orientation: 'vertical',
  dataCount: 6,
  borderRadius: 0,
}

const SIZES: Record<ChartType, { width: number; height: number }> = {
  'bar':               { width: 400, height: 300 },
  'stacked-bar':       { width: 400, height: 300 },
  'line':              { width: 400, height: 300 },
  'area':              { width: 400, height: 300 },
  'combo':             { width: 400, height: 300 },
  'scatter':           { width: 400, height: 300 },
  'pie':               { width: 300, height: 300 },
  'donut':             { width: 300, height: 300 },
  'kpi-card':          { width: 200, height: 120 },
  'bullet':            { width: 320, height: 100 },
  'table':             { width: 400, height: 280 },
  'text-box':          { width: 300, height: 60 },
  'divider':           { width: 400, height: 20 },
  'shape-rect':        { width: 200, height: 200 },
  'shape-ellipse':     { width: 200, height: 200 },
  'filled-map':        { width: 500, height: 340 },
  'treemap':           { width: 400, height: 300 },
  'heatmap':           { width: 400, height: 280 },
}

export function getChartDefaults(
  type: ChartType,
  canvasWidth?: number
): Omit<ChartItem, 'id' | 'x' | 'y' | 'zIndex'> {
  const size = { ...SIZES[type] }
  // Title banner defaults to full canvas width
  if (type === 'text-box' && canvasWidth) {
    size.width = canvasWidth
    size.height = 80
  }
  return { ...BASE, type, ...size }
}

export function getDefaultTitle(type: ChartType): string {
  const titles: Partial<Record<ChartType, string>> = {
    'bar':               'Bar Chart',
    'stacked-bar':       'Stacked Bar Chart',
    'line':              'Line Chart',
    'area':              'Area Chart',
    'combo':             'Combo Chart',
    'scatter':           'Scatter Plot',
    'pie':               'Pie Chart',
    'donut':             'Donut Chart',
    'kpi-card':          'KPI',
    'bullet':            'Bullet Chart',
    'table':             'Table',
    'text-box':          'Title',
    'divider':           '',
    'shape-rect':        '',
    'shape-ellipse':     '',
    'filled-map':        'US Map',
    'treemap':           'Treemap',
    'heatmap':           'Heatmap',
  }
  return titles[type] ?? ''
}
