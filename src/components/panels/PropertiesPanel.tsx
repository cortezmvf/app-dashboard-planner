import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Trash2, Copy, Lock, Unlock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { COLOR_SCHEMAS } from '../../lib/colorSchemas'
import type { ChartItem, AlignAction } from '../../types'

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Pequeno (12px)' },
  { value: 'medium', label: 'Médio (16px)' },
  { value: 'large', label: 'Grande (24px)' },
  { value: 'xlarge', label: 'XGrande (36px)' },
  { value: 'title', label: 'Título (48px)' },
]

const BG_OPTIONS = [
  { value: 'transparent', label: 'Transparente' },
  { value: 'white', label: 'Branco' },
  { value: 'light-gray', label: 'Cinza Claro' },
  { value: 'schema-1', label: 'Cor 1 do tema' },
  { value: 'schema-2', label: 'Cor 2 do tema' },
  { value: 'schema-3', label: 'Cor 3 do tema' },
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
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Esquema de Cores</p>
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

  // No selection — show schema only + palette hint
  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col">
        {schemaSection}
        <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Selecione um elemento no canvas para editar suas propriedades
        </div>
      </div>
    )
  }

  // Multi-select — show alignment tools only
  if (selectedIds.length > 1) {
    const alignBtns: { action: AlignAction; label: string }[] = [
      { action: 'align-left', label: '⊢ Esquerda' },
      { action: 'align-right', label: '⊣ Direita' },
      { action: 'align-top', label: '⊤ Topo' },
      { action: 'align-bottom', label: '⊥ Base' },
      { action: 'center-h', label: '↔ Centro H' },
      { action: 'center-v', label: '↕ Centro V' },
      { action: 'distribute-h', label: '⇔ Distrib. H' },
      { action: 'distribute-v', label: '⇕ Distrib. V' },
    ]

    return (
      <div className="flex flex-col">
        {schemaSection}
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {selectedIds.length} selecionados
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
            <Trash2 size={12} /> Excluir selecionados
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
  const isChart = ['bar','stacked-bar','line','area','combo','scatter'].includes(chart.type)
  const isPieDonut = ['pie','donut'].includes(chart.type)
  const isKpiGauge = ['kpi-card','gauge','bullet'].includes(chart.type)
  const isTable = ['table','pivot'].includes(chart.type)
  const isImage = chart.type === 'image-placeholder'

  return (
    <div className="flex flex-col">
      {schemaSection}

      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Propriedades</p>
          <div className="flex gap-1">
            <button onClick={() => store.duplicateChart(chart.id)} title="Duplicar" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Copy size={12} />
            </button>
            <button onClick={() => update({ locked: !chart.locked })} title={chart.locked ? 'Desbloquear' : 'Bloquear'} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              {chart.locked ? <Unlock size={12} /> : <Lock size={12} />}
            </button>
            <button onClick={() => store.deleteChart(chart.id)} title="Excluir" className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <Field label="Largura (px)">
            <input type="number" value={chart.width} onChange={e => update({ width: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
          <Field label="Altura (px)">
            <input type="number" value={chart.height} onChange={e => update({ height: Number(e.target.value) })}
              className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175]" />
          </Field>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2.5">
          {/* Text box specific */}
          {isTextBox && (
            <>
              <Field label="Conteúdo">
                <textarea
                  value={chart.content}
                  onChange={e => update({ content: e.target.value })}
                  rows={2}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#005175] resize-none"
                />
              </Field>
              <Field label="Tamanho da fonte">
                <select value={chart.fontSize} onChange={e => update({ fontSize: e.target.value as ChartItem['fontSize'] })}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none">
                  {FONT_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Estilo">
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
                <Field label="Cor do texto">
                  <input type="color" value={chart.textColor || '#1a1a1a'} onChange={e => update({ textColor: e.target.value })}
                    className="w-full h-8 border border-gray-200 dark:border-gray-600 rounded cursor-pointer bg-white" />
                </Field>
                <Field label="Fundo">
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
              <Field label="Título">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="Título do gráfico" />
              </Field>
              <Field label="Subtítulo">
                <Input value={chart.subtitle} onChange={v => update({ subtitle: v })} placeholder="Subtítulo" />
              </Field>
            </>
          )}

          {/* Chart-specific axis labels */}
          {isChart && (
            <>
              <Field label="Eixo X">
                <Input value={chart.xAxisLabel} onChange={v => update({ xAxisLabel: v })} placeholder="Label do eixo X" />
              </Field>
              <Field label="Eixo Y">
                <Input value={chart.yAxisLabel} onChange={v => update({ yAxisLabel: v })} placeholder="Label do eixo Y" />
              </Field>
              <Field label="Legenda">
                <Input value={chart.legendLabel} onChange={v => update({ legendLabel: v })} placeholder="Legenda" />
              </Field>
            </>
          )}

          {isPieDonut && (
            <>
              <Field label="Legenda">
                <Input value={chart.legendLabel} onChange={v => update({ legendLabel: v })} placeholder="Legenda central" />
              </Field>
              {chart.type === 'donut' && (
                <Field label="Valor central">
                  <Input value={chart.valueLabel} onChange={v => update({ valueLabel: v })} placeholder="ex: 68%" />
                </Field>
              )}
            </>
          )}

          {isKpiGauge && (
            <>
              <Field label="Título">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="Nome do KPI" />
              </Field>
              <Field label="Valor">
                <Input value={chart.valueLabel} onChange={v => update({ valueLabel: v })} placeholder="ex: 1.234" />
              </Field>
              <Field label="Unidade">
                <Input value={chart.unit} onChange={v => update({ unit: v })} placeholder="ex: R$, %, pts" />
              </Field>
              <Field label="Subtítulo">
                <Input value={chart.subtitle} onChange={v => update({ subtitle: v })} placeholder="Contexto / período" />
              </Field>
            </>
          )}

          {isTable && (
            <>
              <Field label="Título">
                <Input value={chart.title} onChange={v => update({ title: v })} placeholder="Título da tabela" />
              </Field>
              <Field label="Colunas (separadas por vírgula)">
                <Input value={chart.columns} onChange={v => update({ columns: v })} placeholder="Col A, Col B, Col C" />
              </Field>
            </>
          )}

          {isImage && (
            <Field label="Texto alternativo">
              <Input value={chart.altText} onChange={v => update({ altText: v })} placeholder="Descrição da imagem" />
            </Field>
          )}
        </div>

        {/* Canvas size info */}
        {tab && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Canvas: {tab.canvasWidth} × {tab.canvasHeight}px
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
