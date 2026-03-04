import type { ChartType } from '../types'
import { useAppStore } from '../store/useAppStore'

// ── Types matching the DataViz agent output schema ────────────────────────────

export interface AgentChartSpec {
  type: ChartType
  x: number
  y: number
  width: number
  height: number
  title?: string
  subtitle?: string
  xAxisLabel?: string
  yAxisLabel?: string
  valueLabel?: string
  unit?: string
  columns?: string
  content?: string
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge' | 'title'
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right'
  textBackground?: 'transparent' | 'white' | 'light-gray' | 'schema-1' | 'schema-2' | 'schema-3'
  borderRadius?: number
  showLegend?: boolean
}

export interface AgentTabSpec {
  name: string
  charts: AgentChartSpec[]
}

export interface AgentDashboardSpec {
  projectName: string
  tabs: AgentTabSpec[]
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Takes the DataViz agent's JSON output and materializes it into the store:
 * creates a new project, creates tabs, and adds all charts with their properties.
 */
export function buildDashboardFromSpec(spec: AgentDashboardSpec): void {
  const store = useAppStore.getState()

  // Create a new project (this also sets it as active)
  store.createProject(spec.projectName, 1280, 720)

  // After createProject, the new project is active and has one default tab
  const project = store.activeProject()
  if (!project) return

  for (let i = 0; i < spec.tabs.length; i++) {
    const tabSpec = spec.tabs[i]

    let tabId: string

    if (i === 0) {
      // Rename the default first tab
      const firstTab = store.activeProject()?.tabs[0]
      if (!firstTab) continue
      tabId = firstTab.id
      store.renameTab(tabId, tabSpec.name)
    } else {
      // Create additional tabs
      store.createTab(tabSpec.name, 1280, 720)
      const updatedProject = store.activeProject()
      if (!updatedProject) continue
      const newTab = updatedProject.tabs[updatedProject.tabs.length - 1]
      tabId = newTab.id
    }

    // Switch to this tab before adding charts
    store.setActiveTab(tabId)

    for (const chartSpec of tabSpec.charts) {
      // Clamp position to canvas bounds to be safe
      const x = Math.max(0, Math.min(chartSpec.x, 1280 - chartSpec.width))
      const y = Math.max(0, Math.min(chartSpec.y, 720 - chartSpec.height))

      store.addChart(chartSpec.type, x, y)

      // Get the chart that was just added (last in array)
      const charts = store.currentCharts()
      const added = charts[charts.length - 1]
      if (!added) continue

      // Build the update object from the spec, excluding position/type (already set)
      const updates: Record<string, unknown> = {
        width: chartSpec.width,
        height: chartSpec.height,
      }

      if (chartSpec.title !== undefined) updates.title = chartSpec.title
      if (chartSpec.subtitle !== undefined) updates.subtitle = chartSpec.subtitle
      if (chartSpec.xAxisLabel !== undefined) updates.xAxisLabel = chartSpec.xAxisLabel
      if (chartSpec.yAxisLabel !== undefined) updates.yAxisLabel = chartSpec.yAxisLabel
      if (chartSpec.valueLabel !== undefined) updates.valueLabel = chartSpec.valueLabel
      if (chartSpec.unit !== undefined) updates.unit = chartSpec.unit
      if (chartSpec.columns !== undefined) updates.columns = chartSpec.columns
      if (chartSpec.content !== undefined) updates.content = chartSpec.content
      if (chartSpec.fontSize !== undefined) updates.fontSize = chartSpec.fontSize
      if (chartSpec.fontWeight !== undefined) updates.fontWeight = chartSpec.fontWeight
      if (chartSpec.fontStyle !== undefined) updates.fontStyle = chartSpec.fontStyle
      if (chartSpec.textAlign !== undefined) updates.textAlign = chartSpec.textAlign
      if (chartSpec.textBackground !== undefined) updates.textBackground = chartSpec.textBackground
      if (chartSpec.borderRadius !== undefined) updates.borderRadius = chartSpec.borderRadius
      if (chartSpec.showLegend !== undefined) updates.showLegend = chartSpec.showLegend

      store.updateChart(added.id, updates)
    }
  }

  // Return to the first tab
  const finalProject = store.activeProject()
  if (finalProject && finalProject.tabs.length > 0) {
    store.setActiveTab(finalProject.tabs[0].id)
  }
}
