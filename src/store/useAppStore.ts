import { create } from 'zustand'
import type { Project, Tab, ChartItem, ChartType, AlignAction, CanvasBackground } from '../types'
import { generateId } from '../lib/utils'
import { getChartDefaults, getDefaultTitle } from '../lib/chartDefaults'
import { snapToGrid, clampToBounds } from '../lib/collision'

const STORAGE_KEY = 'dashboard-planner-v1'
const MAX_HISTORY = 50

function makeTab(name: string, canvasWidth: number, canvasHeight: number): Tab {
  return {
    id: generateId(),
    name,
    canvasWidth,
    canvasHeight,
    canvasBackground: 'white',
    charts: [],
    undoStack: [],
    redoStack: [],
  }
}

function makeProject(name: string, canvasWidth = 1280, canvasHeight = 720): Project {
  const tab = makeTab('Dashboard 1', canvasWidth, canvasHeight)
  return {
    id: generateId(),
    name,
    colorSchemaId: 7,
    gridSize: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tabs: [tab],
    activeTabId: tab.id,
  }
}

function loadFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

function saveToStorage(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch { /* ignore */ }
}

// ────────────────────────────────────────────────────────────────
// Store interface
// ────────────────────────────────────────────────────────────────

interface UIState {
  selectedChartIds: string[]
  zoom: number
  showGrid: boolean
  snapEnabled: boolean
  isDarkMode: boolean
  isSidebarCollapsed: boolean
  saveStatus: 'saved' | 'saving' | 'unsaved'
}

interface AppStore extends UIState {
  projects: Project[]
  activeProjectId: string | null

  // Computed
  activeProject: () => Project | null
  activeTab: () => Tab | null
  currentCharts: () => ChartItem[]

  // Projects
  createProject: (name: string, canvasWidth: number, canvasHeight: number) => void
  renameProject: (id: string, name: string) => void
  duplicateProject: (id: string) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string) => void
  updateProject: (id: string, updates: Partial<Pick<Project, 'colorSchemaId' | 'gridSize'>>) => void

  // Tabs
  createTab: (name: string, canvasWidth: number, canvasHeight: number) => void
  renameTab: (tabId: string, name: string) => void
  duplicateTab: (tabId: string) => void
  deleteTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabCanvas: (tabId: string, width: number, height: number, bg: CanvasBackground) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void

  // Charts
  addChart: (type: ChartType, x: number, y: number) => void
  updateChart: (id: string, updates: Partial<ChartItem>) => void
  moveChart: (id: string, x: number, y: number) => boolean
  resizeChart: (id: string, x: number, y: number, width: number, height: number) => boolean
  deleteChart: (id: string) => void
  deleteSelectedCharts: () => void
  duplicateChart: (id: string) => void
  setChartZIndex: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void

  // Selection
  selectChart: (id: string, multi?: boolean) => void
  deselectAll: () => void
  selectAll: () => void
  alignCharts: (action: AlignAction) => void

  // Undo/Redo
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // UI
  setZoom: (zoom: number) => void
  setShowGrid: (show: boolean) => void
  setSnapEnabled: (snap: boolean) => void
  setDarkMode: (dark: boolean) => void
  toggleSidebar: () => void
  setSaveStatus: (status: UIState['saveStatus']) => void

  // Persistence
  persistNow: () => void
}

// ────────────────────────────────────────────────────────────────
// Store implementation
// ────────────────────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave(get: () => AppStore) {
  if (saveTimer) clearTimeout(saveTimer)
  get().setSaveStatus('unsaved')
  saveTimer = setTimeout(() => {
    const { projects, setSaveStatus, persistNow } = get()
    saveToStorage(projects)
    persistNow()
    setSaveStatus('saved')
  }, 500)
}

export const useAppStore = create<AppStore>((set, get) => {
  // Bootstrap
  let projects = loadFromStorage()
  if (projects.length === 0) {
    projects = [makeProject('My First Project')]
    saveToStorage(projects)
  }
  const activeProjectId = projects[0].id

  return {
    projects,
    activeProjectId,

    // UI defaults
    selectedChartIds: [],
    zoom: 1,
    showGrid: true,
    snapEnabled: true,
    isDarkMode: false,
    isSidebarCollapsed: false,
    saveStatus: 'saved',

    // ── Computed ──────────────────────────────────────────────

    activeProject: () => get().projects.find(p => p.id === get().activeProjectId) ?? null,

    activeTab: () => {
      const project = get().activeProject()
      if (!project) return null
      return project.tabs.find(t => t.id === project.activeTabId) ?? project.tabs[0] ?? null
    },

    currentCharts: () => get().activeTab()?.charts ?? [],

    // ── Projects ──────────────────────────────────────────────

    createProject: (name, canvasWidth, canvasHeight) => {
      const project = makeProject(name, canvasWidth, canvasHeight)
      set(s => ({ projects: [project, ...s.projects], activeProjectId: project.id, selectedChartIds: [] }))
      scheduleSave(get)
    },

    renameProject: (id, name) => {
      set(s => ({
        projects: s.projects.map(p =>
          p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
        ),
      }))
      scheduleSave(get)
    },

    duplicateProject: (id) => {
      const src = get().projects.find(p => p.id === id)
      if (!src) return
      const newProject: Project = {
        ...JSON.parse(JSON.stringify(src)) as Project,
        id: generateId(),
        name: `${src.name} (copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tabs: (JSON.parse(JSON.stringify(src)) as Project).tabs.map(t => ({
          ...t, id: generateId(), undoStack: [], redoStack: [],
        })),
      }
      newProject.activeTabId = newProject.tabs[0].id
      set(s => ({ projects: [newProject, ...s.projects], activeProjectId: newProject.id, selectedChartIds: [] }))
      scheduleSave(get)
    },

    deleteProject: (id) => {
      const { projects } = get()
      if (projects.length === 1) return
      const remaining = projects.filter(p => p.id !== id)
      set({ projects: remaining, activeProjectId: remaining[0].id, selectedChartIds: [] })
      scheduleSave(get)
    },

    setActiveProject: (id) => {
      set({ activeProjectId: id, selectedChartIds: [] })
    },

    updateProject: (id, updates) => {
      set(s => ({
        projects: s.projects.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      }))
      scheduleSave(get)
    },

    // ── Tabs ──────────────────────────────────────────────────

    createTab: (name, canvasWidth, canvasHeight) => {
      const project = get().activeProject()
      if (!project) return
      const tab = makeTab(name, canvasWidth, canvasHeight)
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? { ...p, tabs: [...p.tabs, tab], activeTabId: tab.id, updatedAt: new Date().toISOString() }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    renameTab: (tabId, name) => {
      const project = get().activeProject()
      if (!project) return
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t => (t.id === tabId ? { ...t, name } : t)),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }))
      scheduleSave(get)
    },

    duplicateTab: (tabId) => {
      const project = get().activeProject()
      if (!project) return
      const src = project.tabs.find(t => t.id === tabId)
      if (!src) return
      const newTab: Tab = {
        ...JSON.parse(JSON.stringify(src)) as Tab,
        id: generateId(),
        name: `${src.name} (copy)`,
        undoStack: [],
        redoStack: [],
        charts: (JSON.parse(JSON.stringify(src)) as Tab).charts.map(c => ({ ...c, id: generateId() })),
      }
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? { ...p, tabs: [...p.tabs, newTab], activeTabId: newTab.id, updatedAt: new Date().toISOString() }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    deleteTab: (tabId) => {
      const project = get().activeProject()
      if (!project || project.tabs.length <= 1) return
      const remaining = project.tabs.filter(t => t.id !== tabId)
      const newActive = project.activeTabId === tabId ? remaining[0].id : project.activeTabId
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? { ...p, tabs: remaining, activeTabId: newActive, updatedAt: new Date().toISOString() }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    setActiveTab: (tabId) => {
      const project = get().activeProject()
      if (!project) return
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id ? { ...p, activeTabId: tabId } : p
        ),
        selectedChartIds: [],
      }))
    },

    updateTabCanvas: (tabId, width, height, bg) => {
      const project = get().activeProject()
      if (!project) return
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tabId
                    ? {
                        ...t,
                        canvasWidth: width,
                        canvasHeight: height,
                        canvasBackground: bg,
                        charts: t.charts.map(c => ({
                          ...c,
                          ...clampToBounds(c.x, c.y, c.width, c.height, width, height),
                        })),
                      }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }))
      scheduleSave(get)
    },

    reorderTabs: (fromIndex, toIndex) => {
      const project = get().activeProject()
      if (!project) return
      const tabs = [...project.tabs]
      const [moved] = tabs.splice(fromIndex, 1)
      tabs.splice(toIndex, 0, moved)
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id ? { ...p, tabs, updatedAt: new Date().toISOString() } : p
        ),
      }))
      scheduleSave(get)
    },

    // ── Charts ────────────────────────────────────────────────

    addChart: (type, x, y) => {
      const { activeProject, activeTab, snapEnabled, pushHistory } = get()
      const project = activeProject()
      const tab = activeTab()
      if (!project || !tab) return

      const gridSize = project.gridSize
      const snappedX = snapEnabled ? snapToGrid(x, gridSize) : x
      const snappedY = snapEnabled ? snapToGrid(y, gridSize) : y

      const defaults = getChartDefaults(type, tab.canvasWidth)
      const clamped = clampToBounds(snappedX, snappedY, defaults.width, defaults.height, tab.canvasWidth, tab.canvasHeight)

      const maxZ = tab.charts.reduce((m, c) => Math.max(m, c.zIndex), 0)
      const chart: ChartItem = {
        ...defaults,
        id: generateId(),
        x: clamped.x,
        y: clamped.y,
        zIndex: maxZ + 1,
        title: getDefaultTitle(type),
      }

      pushHistory()

      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id ? { ...t, charts: [...t.charts, chart] } : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        selectedChartIds: [chart.id],
      }))
      scheduleSave(get)
    },

    updateChart: (id, updates) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? { ...t, charts: t.charts.map(c => (c.id === id ? { ...c, ...updates } : c)) }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }))
      scheduleSave(get)
    },

    moveChart: (id, x, y) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return false

      const chart = tab.charts.find(c => c.id === id)
      if (!chart) return false

      const gridSize = project.gridSize
      const { snapEnabled } = get()
      const snappedX = snapEnabled ? snapToGrid(x, gridSize) : x
      const snappedY = snapEnabled ? snapToGrid(y, gridSize) : y
      const clamped = clampToBounds(snappedX, snappedY, chart.width, chart.height, tab.canvasWidth, tab.canvasHeight)

      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? { ...t, charts: t.charts.map(c => c.id === id ? { ...c, x: clamped.x, y: clamped.y } : c) }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }))
      scheduleSave(get)
      return true
    },

    resizeChart: (id, x, y, width, height) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return false

      const gridSize = project.gridSize
      const { snapEnabled } = get()
      const snappedW = Math.max(gridSize * 2, snapEnabled ? snapToGrid(width, gridSize) : width)
      const snappedH = Math.max(gridSize * 2, snapEnabled ? snapToGrid(height, gridSize) : height)
      const snappedX = snapEnabled ? snapToGrid(x, gridSize) : x
      const snappedY = snapEnabled ? snapToGrid(y, gridSize) : y
      const clamped = clampToBounds(snappedX, snappedY, snappedW, snappedH, tab.canvasWidth, tab.canvasHeight)

      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? {
                        ...t,
                        charts: t.charts.map(c =>
                          c.id === id ? { ...c, x: clamped.x, y: clamped.y, width: clamped.width, height: clamped.height } : c
                        ),
                      }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }))
      scheduleSave(get)
      return true
    },

    deleteChart: (id) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id ? { ...t, charts: t.charts.filter(c => c.id !== id) } : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        selectedChartIds: s.selectedChartIds.filter(sid => sid !== id),
      }))
      scheduleSave(get)
    },

    deleteSelectedCharts: () => {
      const { selectedChartIds } = get()
      if (selectedChartIds.length === 0) return
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? { ...t, charts: t.charts.filter(c => !selectedChartIds.includes(c.id)) }
                    : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    duplicateChart: (id) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      const src = tab.charts.find(c => c.id === id)
      if (!src) return

      const gridSize = project.gridSize
      const offsetX = src.x + gridSize * 2
      const offsetY = src.y + gridSize * 2
      const clamped = clampToBounds(offsetX, offsetY, src.width, src.height, tab.canvasWidth, tab.canvasHeight)

      const maxZ = tab.charts.reduce((m, c) => Math.max(m, c.zIndex), 0)
      const newChart: ChartItem = { ...src, id: generateId(), x: clamped.x, y: clamped.y, zIndex: maxZ + 1 }

      get().pushHistory()
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id ? { ...t, charts: [...t.charts, newChart] } : t
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        selectedChartIds: [newChart.id],
      }))
      scheduleSave(get)
    },

    setChartZIndex: (id, action) => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      const charts = [...tab.charts]
      const idx = charts.findIndex(c => c.id === id)
      if (idx === -1) return
      const maxZ = charts.reduce((m, c) => Math.max(m, c.zIndex), 0)
      const minZ = charts.reduce((m, c) => Math.min(m, c.zIndex), Infinity)
      let newZ = charts[idx].zIndex
      if (action === 'front') newZ = maxZ + 1
      else if (action === 'back') newZ = minZ - 1
      else if (action === 'forward') newZ = charts[idx].zIndex + 1
      else if (action === 'backward') newZ = charts[idx].zIndex - 1
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? { ...t, charts: t.charts.map(c => c.id === id ? { ...c, zIndex: newZ } : c) }
                    : t
                ),
              }
            : p
        ),
      }))
      scheduleSave(get)
    },

    // ── Selection ─────────────────────────────────────────────

    selectChart: (id, multi = false) => {
      set(s => ({
        selectedChartIds: multi
          ? s.selectedChartIds.includes(id)
            ? s.selectedChartIds.filter(sid => sid !== id)
            : [...s.selectedChartIds, id]
          : [id],
      }))
    },

    deselectAll: () => set({ selectedChartIds: [] }),

    selectAll: () => {
      const charts = get().currentCharts()
      set({ selectedChartIds: charts.map(c => c.id) })
    },

    alignCharts: (action) => {
      const { selectedChartIds, activeTab, activeProject } = get()
      const tab = activeTab()
      const project = activeProject()
      if (!tab || !project || selectedChartIds.length < 2) return

      const selected = tab.charts.filter(c => selectedChartIds.includes(c.id))
      const minX = Math.min(...selected.map(c => c.x))
      const maxX = Math.max(...selected.map(c => c.x + c.width))
      const minY = Math.min(...selected.map(c => c.y))
      const maxY = Math.max(...selected.map(c => c.y + c.height))

      get().pushHistory()

      const updated = tab.charts.map(c => {
        if (!selectedChartIds.includes(c.id)) return c
        switch (action) {
          case 'align-left':    return { ...c, x: minX }
          case 'align-right':   return { ...c, x: maxX - c.width }
          case 'align-top':     return { ...c, y: minY }
          case 'align-bottom':  return { ...c, y: maxY - c.height }
          case 'center-h':      return { ...c, x: Math.round((minX + maxX - c.width) / 2) }
          case 'center-v':      return { ...c, y: Math.round((minY + maxY - c.height) / 2) }
          case 'distribute-h': {
            const sorted = [...selected].sort((a, b) => a.x - b.x)
            const totalWidth = sorted.reduce((s, c) => s + c.width, 0)
            const gap = (maxX - minX - totalWidth) / (sorted.length - 1)
            let cursor = minX
            const positions: Record<string, number> = {}
            for (const s of sorted) { positions[s.id] = cursor; cursor += s.width + gap }
            return { ...c, x: positions[c.id] ?? c.x }
          }
          case 'distribute-v': {
            const sorted = [...selected].sort((a, b) => a.y - b.y)
            const totalHeight = sorted.reduce((s, c) => s + c.height, 0)
            const gap = (maxY - minY - totalHeight) / (sorted.length - 1)
            let cursor = minY
            const positions: Record<string, number> = {}
            for (const s of sorted) { positions[s.id] = cursor; cursor += s.height + gap }
            return { ...c, y: positions[c.id] ?? c.y }
          }
          default: return c
        }
      })

      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? { ...p, tabs: p.tabs.map(t => t.id === tab.id ? { ...t, charts: updated } : t) }
            : p
        ),
      }))
      scheduleSave(get)
    },

    // ── Undo / Redo ───────────────────────────────────────────

    pushHistory: () => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab) return
      const snapshot = JSON.parse(JSON.stringify(tab.charts)) as ChartItem[]
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? {
                        ...t,
                        undoStack: [...t.undoStack.slice(-MAX_HISTORY + 1), snapshot],
                        redoStack: [],
                      }
                    : t
                ),
              }
            : p
        ),
      }))
    },

    undo: () => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab || tab.undoStack.length === 0) return
      const prev = tab.undoStack[tab.undoStack.length - 1]
      const current = JSON.parse(JSON.stringify(tab.charts)) as ChartItem[]
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? {
                        ...t,
                        charts: prev,
                        undoStack: t.undoStack.slice(0, -1),
                        redoStack: [...t.redoStack, current],
                      }
                    : t
                ),
              }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    redo: () => {
      const project = get().activeProject()
      const tab = get().activeTab()
      if (!project || !tab || tab.redoStack.length === 0) return
      const next = tab.redoStack[tab.redoStack.length - 1]
      const current = JSON.parse(JSON.stringify(tab.charts)) as ChartItem[]
      set(s => ({
        projects: s.projects.map(p =>
          p.id === project.id
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tab.id
                    ? {
                        ...t,
                        charts: next,
                        undoStack: [...t.undoStack, current],
                        redoStack: t.redoStack.slice(0, -1),
                      }
                    : t
                ),
              }
            : p
        ),
        selectedChartIds: [],
      }))
      scheduleSave(get)
    },

    // ── UI ────────────────────────────────────────────────────

    setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
    setShowGrid: (showGrid) => set({ showGrid }),
    setSnapEnabled: (snapEnabled) => set({ snapEnabled }),
    setDarkMode: (isDarkMode) => set({ isDarkMode }),
    toggleSidebar: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
    setSaveStatus: (saveStatus) => set({ saveStatus }),

    persistNow: () => {
      saveToStorage(get().projects)
    },
  }
})
