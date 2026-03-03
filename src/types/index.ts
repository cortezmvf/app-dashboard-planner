export type ChartType =
  | 'bar'
  | 'stacked-bar'
  | 'line'
  | 'area'
  | 'combo'
  | 'scatter'
  | 'pie'
  | 'donut'
  | 'kpi-card'
  | 'gauge'
  | 'bullet'
  | 'table'
  | 'text-box'
  | 'image-placeholder'
  | 'divider'
  | 'shape-rect'
  | 'shape-ellipse'
  | 'filled-map'
  | 'treemap'
  | 'heatmap'

export type CanvasBackground = string

export interface ChartItem {
  id: string
  type: ChartType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  locked: boolean
  // Common labels
  title: string
  subtitle: string
  xAxisLabel: string
  yAxisLabel: string
  showLegend: boolean
  valueLabel: string
  unit: string
  // Table
  columns: string
  // Text Box
  content: string
  fontSize: 'small' | 'medium' | 'large' | 'xlarge' | 'title'
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  textColor: string
  textBackground: 'transparent' | 'white' | 'light-gray' | 'schema-1' | 'schema-2' | 'schema-3'
  // Image placeholder
  altText: string
  // Border
  borderColor: string
  borderWidth: number
  borderStyle: 'solid' | 'dashed' | 'dotted'
  // Chart orientation
  orientation: 'vertical' | 'horizontal'
  // Number of data points to display
  dataCount: number
}

export interface Tab {
  id: string
  name: string
  canvasWidth: number
  canvasHeight: number
  canvasBackground: CanvasBackground
  charts: ChartItem[]
  // Undo/redo history
  undoStack: ChartItem[][]
  redoStack: ChartItem[][]
}

export interface Project {
  id: string
  name: string
  colorSchemaId: number
  gridSize: number
  createdAt: string
  updatedAt: string
  tabs: Tab[]
  activeTabId: string
}

export interface ColorSchema {
  id: number
  name: string
  colors: string[]
}

export interface ChartDefaults {
  width: number
  height: number
}

export type AlignAction =
  | 'align-left'
  | 'align-right'
  | 'align-top'
  | 'align-bottom'
  | 'center-h'
  | 'center-v'
  | 'distribute-h'
  | 'distribute-v'
