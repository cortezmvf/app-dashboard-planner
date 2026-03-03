import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Trash2, Copy, Lock, Unlock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { COLOR_SCHEMAS } from '../../lib/colorSchemas'
import type { ChartItem, AlignAction, CanvasBackground } from '../../types'

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (12px)' },
  { value: 'medium', label: 'Medium (16px)' },
  { value: 'large', label: 'Large (24px)' },
  { value: 'xlarge', label: 'X-Large (36px)' },
  { value: 'title', label: 'Title (48px)' },
]

const BG_OPTIONS = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'white', label: 'White' },
  { value: 'light-gray', label: 'Light Gray' },
  { value: 'schema-1', label: 'Theme color 1' },
  { value: 'schema-2', label: 'Theme color 2' },
  { value: 'schema-3', label: 'Theme color 3' },
]

const CANVAS_BG_OPTIONS: { value: CanvasBackground; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'light-gray', label: 'Light Gray' },
  { value: 'dark-gray', label: 'Dark Gray' },
  { value: 'black', label: 'Black' },
]

interface FieldProps { label: string; children: React.ReactNode }
function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]"
    />
  )
}

export function PropertiesPanel() {
  const store = useAppStore()
  const project = store.activeProject()
  const tab = store.activeTab()
  const selectedIds = store.selectedChartIds
  const charts = store.currentCharts()

  // Color schema section (always shown)
  const schemaSection = (
    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Color Schema</p>
      <div className="grid grid-cols-4 gap-1.5">
        {COLOR_SCHEMAS.map(schema => (
          <button
            key={schema.id}
            onClick={() => project && store.updateProject(project.id, { colorSchemaId: schema.id })}
            title={schema.name}
            className={`rounded overflow-hidden h-6 border-2 transition-all ${
              project?.colorSchemaId === schema.id
                ? 'border-[#005175] scale-105'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex h-full">
              {schema.colors.slice(0, 4).map((c, i) => (
                <div key={i} style={{ backgroundColor: c, flex: 1 }} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // No selection — show schema + canvas size editor
  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col">
        {schemaSection}

        {tab && (
          <div className="p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Canvas Size</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Width (px)">
                <input
                  type="number"
                  value={tab.canvasWidth}
                  onChange={e => store.updateTabCanvas(tab.id, Number(e.target.value) || tab.canvasWidth, tab.canvasHeight, tab.canvasBackground)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]"
                />
              </Field>
              <Field label="Height (px)">
                <input
                  type="number"
                  value={tab.canvasHeight}
                  onChange={e => store.updateTabCanvas(tab.id, tab.canvasWidth, Number(e.target.value) || tab.canvasHeight, tab.canvasBackground)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { w: 1280, h: 720, label: '16:9' },
                { w: 1920, h: 1080, label: 'FHD' },
                { w: 1440, h: 900, label: '16:10' },
                { w: 1024, h: 768, label: '4:3' },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => store.updateTabCanvas(tab.id, p.w, p.h, tab.canvasBackground)}
                  className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {p.label} ({p.w}×{p.h})
                </button>
              ))}
            </div>
            <Field label="Background">
              <select
                value={tab.canvasBackground}
                onChange={e => store.updateTabCanvas(tab.id, tab.canvasWidth, tab.canvasHeight, e.target.value as CanvasBackground)}
                className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {CANVAS_BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        )}

        <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
          Select an element on the canvas to edit its properties
        </div>
      </div>
    )
  }

  // Multi-select — show alignment tools only
  if (selectedIds.length > 1) {
    const alignBtns: { action: AlignAction; label: string }[] = [
      { action: 'align-left', label: '⊢ Left' },
      { action: 'align-right', label: '⊣ Right' },
      { action: 'align-top', label: '⊤ Top' },
      { action: 'align-bottom', label: '⊥ Bottom' },
      { action: 'center-h', label: '↔ Center H' },
      { action: 'center-v', label: '↕ Center V' },
      { action: 'distribute-h', label: '⇔ Distribute H' },
      { action: 'distribute-v', label: '⇕ Distribute V' },
    ]

    return (
      <div className="flex flex-col">
        {schemaSection}
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {selectedIds.length} selected
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {alignBtns.map(b => (
              <button
                key={b.action}
                onClick={() => store.alignCharts(b.action)}
                className="text-xs px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 transition-colors"
              >
                {b.label}
              </button>
            ))}
          </div>
          <button
            onClick={store.deleteSelectedCharts}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> Delete selected
          </button>
        </div>
      </div>
    )
  }

  // Single chart selected
  const chart = charts.find(c => c.id === selectedIds[0])
  if (!chart) return null

  const update = (updates: Partial<ChartItem>) => store.updateChart(chart.id, updates)
  const isTextBox = chart.type === 'text-box'
  const isBarChart = ['bar', 'stacked-bar'].includes(chart.type)
  const isChart = ['bar', 'stacked-bar', 'line', 'area', 'combo', 'scatter'].includes(chart.type)
  const isPieDonut = ['pie', 'donut'].includes(chart.type)
  const isKpiGauge = ['kpi-card', 'gauge', 'bullet'].includes(chart.type)
  const isTable = chart.type === 'table'
  const isImage = chart.type === 'image-placeholder'
  const showsBorder = !['divider'].includes(chart.type)

  return (
    <div className="flex flex-col">
      {schemaSection}

      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Properties</p>
          <div className="flex gap-1">
            <button onClick={() => store.duplicateChart(chart.id)} title="Duplicate" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Copy size={12} />
            </button>
            <button onClick={() => update({ locked: !chart.locked })} title={chart.locked ? 'Unlock' : 'Lock'} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              {chart.locked ? <Unlock size={12} /> : <Lock size={12} />}
            </button>
            <button onClick={() => store.deleteChart(chart.id)} title="Delete" className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Position and size */}
        <div className="grid grid-cols-2 gap-2">
          <Field label="X (px)">
            <input type="number" value={chart.x} onChange={e => update({ x: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
          <Field label="Y (px)">
            <input type="number" value={chart.y} onChange={e => update({ y: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
          <Field label="Width (px)">
            <input type="number" value={chart.width} onChange={e => update({ width: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
          <Field label="Height (px)">
            <input type="number" value={chart.height} onChange={e => update({ height: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2.5">
          {/* Text box specific */}
          {isTextBox && (
            <>
              <Field label="Content">
                <textarea
                  value={chart.content}
                  onChange={e => update({ content: e.target.value })}
                  rows={2}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175] resize-none"
                />
              </Field>
              <Field label="Font size">
                <select value={chart.fontSize} onChange={e => update({ fontSize: e.target.value as ChartItem['fontSize'] })}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none">
                  {FONT_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Style">
                <div className="flex gap-1.5">
                  <button onClick={() => update({ fontWeight: chart.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`flex-1 flex justify-center py-1.5 rounded border text-xs transition-colors ${chart.fontWeight === 'bold' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                    <Bold size={12} />
                  </button>
                  <button onClick={() => update({ fontStyle: chart.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`flex-1 flex justify-center py-1.5 rounded border text-xs transition-colors ${chart.fontStyle === 'italic' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                    <Italic size={12} />
                  </button>
                  <button onClick={() => update({ textAlign: 'left' })}
                    className={`flex-1 flex justify-center py-1.5 rounded border text-xs transition-colors ${chart.textAlign === 'left' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                    <AlignLeft size={12} />
                  </button>
                  <button onClick={() => update({ textAlign: 'center' })}
                    className={`flex-1 flex justify-center py-1.5 rounded border text-xs transition-colors ${chart.textAlign === 'center' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                    <AlignCenter size={12} />
                  </button>
                  <button onClick={() => update({ textAlign: 'right' })}
                    className={`flex-1 flex justify-center py-1.5 rounded border text-xs transition-colors ${chart.textAlign === 'right' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                    <AlignRight size={12} />
                  </button>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Text color">
                  <input type="color" value={chart.textColor || '#1a1a1a'} onChange={e => update({ textColor: e.target.value })}
                    className="w-full h-8 border border-gray-200 dark:border-gray-600 rounded cursor-pointer bg-white" />
                </Field>
                <Field label="Background">
                  <select value={chart.textBackground} onChange={e => update({ textBackground: e.target.value as ChartItem['textBackground'] })}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none">
                    {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* Common labels */}
          {!isTextBox && (
            <>
              <Field label="Title">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="Chart title" />
              </Field>
              <Field label="Subtitle">
                <Input value={chart.subtitle} onChange={v => update({ subtitle: v })} placeholder="Subtitle" />
              </Field>
            </>
          )}

          {/* Orientation for bar charts */}
          {isBarChart && (
            <Field label="Orientation">
              <div className="flex gap-1.5">
                <button
                  onClick={() => update({ orientation: 'vertical' })}
                  className={`flex-1 text-xs py-1.5 rounded border transition-colors ${(chart.orientation ?? 'vertical') === 'vertical' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}
                >
                  Vertical
                </button>
                <button
                  onClick={() => update({ orientation: 'horizontal' })}
                  className={`flex-1 text-xs py-1.5 rounded border transition-colors ${chart.orientation === 'horizontal' ? 'border-[#005175] bg-blue-50 text-[#005175]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}
                >
                  Horizontal
                </button>
              </div>
            </Field>
          )}

          {/* Chart-specific axis labels + legend checkbox */}
          {isChart && (
            <>
              <Field label="X Axis">
                <Input value={chart.xAxisLabel} onChange={v => update({ xAxisLabel: v })} placeholder="X axis label" />
              </Field>
              <Field label="Y Axis">
                <Input value={chart.yAxisLabel} onChange={v => update({ yAxisLabel: v })} placeholder="Y axis label" />
              </Field>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-legend-chart"
                  checked={chart.showLegend ?? false}
                  onChange={e => update({ showLegend: e.target.checked })}
                  className="w-3 h-3 accent-[#005175]"
                />
                <label htmlFor="show-legend-chart" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                  Show legend
                </label>
              </div>
            </>
          )}

          {isPieDonut && (
            <>
              {chart.type === 'donut' && (
                <Field label="Center value">
                  <Input value={chart.valueLabel} onChange={v => update({ valueLabel: v })} placeholder="e.g. 68%" />
                </Field>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-legend-pie"
                  checked={chart.showLegend ?? false}
                  onChange={e => update({ showLegend: e.target.checked })}
                  className="w-3 h-3 accent-[#005175]"
                />
                <label htmlFor="show-legend-pie" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                  Show legend
                </label>
              </div>
            </>
          )}

          {isKpiGauge && (
            <>
              <Field label="Title">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="KPI name" />
              </Field>
              <Field label="Value">
                <Input value={chart.valueLabel} onChange={v => update({ valueLabel: v })} placeholder="e.g. 1,234" />
              </Field>
              <Field label="Unit">
                <Input value={chart.unit} onChange={v => update({ unit: v })} placeholder="e.g. $, %, pts" />
              </Field>
              <Field label="Subtitle">
                <Input value={chart.subtitle} onChange={v => update({ subtitle: v })} placeholder="Context / period" />
              </Field>
            </>
          )}

          {isTable && (
            <>
              <Field label="Title">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="Table title" />
              </Field>
              <Field label="Columns (comma-separated)">
                <Input value={chart.columns} onChange={v => update({ columns: v })} placeholder="Col A, Col B, Col C" />
              </Field>
            </>
          )}

          {isImage && (
            <Field label="Alt text">
              <Input value={chart.altText} onChange={v => update({ altText: v })} placeholder="Image description" />
            </Field>
          )}

          {/* Border options */}
          {showsBorder && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 space-y-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Border</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Color">
                  <input
                    type="color"
                    value={chart.borderColor || '#e5e7eb'}
                    onChange={e => update({ borderColor: e.target.value })}
                    className="w-full h-8 border border-gray-200 dark:border-gray-600 rounded cursor-pointer bg-white"
                  />
                </Field>
                <Field label="Width (px)">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={chart.borderWidth ?? 0}
                    onChange={e => update({ borderWidth: Number(e.target.value) })}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]"
                  />
                </Field>
              </div>
              <Field label="Style">
                <select
                  value={chart.borderStyle ?? 'solid'}
                  onChange={e => update({ borderStyle: e.target.value as ChartItem['borderStyle'] })}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
