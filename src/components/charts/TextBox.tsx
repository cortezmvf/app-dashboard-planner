import type { ChartItem } from '../../types'
import { getSchema } from '../../lib/colorSchemas'
import { useAppStore } from '../../store/useAppStore'

interface Props { chart: ChartItem; colors: string[] }

const FONT_SIZES: Record<string, number> = {
  small: 12, medium: 16, large: 24, xlarge: 36, title: 48,
}

const TEXT_BG_MAP: Record<string, string> = {
  'transparent': 'transparent',
  'white': '#ffffff',
  'light-gray': '#f3f4f6',
  'schema-1': '',
  'schema-2': '',
  'schema-3': '',
}

export function TextBoxPlaceholder({ chart }: Props) {
  const project = useAppStore(s => s.activeProject())
  const schema = getSchema(project?.colorSchemaId ?? 7)

  TEXT_BG_MAP['schema-1'] = schema.colors[0]
  TEXT_BG_MAP['schema-2'] = schema.colors[1]
  TEXT_BG_MAP['schema-3'] = schema.colors[2]

  const bg = TEXT_BG_MAP[chart.textBackground] ?? 'transparent'
  const fontSize = FONT_SIZES[chart.fontSize] ?? 16
  const textColor = chart.textColor || '#1a1a1a'

  const isLightBg = bg === 'transparent' || bg === '#ffffff' || bg === '#f3f4f6'
  const effectiveTextColor = bg !== 'transparent' && !isLightBg && textColor === '#1a1a1a' ? '#ffffff' : textColor

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        padding: '6px 10px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: chart.fontWeight === 'bold' ? 700 : 400,
          fontStyle: chart.fontStyle === 'italic' ? 'italic' : 'normal',
          textAlign: chart.textAlign,
          color: effectiveTextColor,
          lineHeight: 1.25,
          width: '100%',
          display: 'block',
          whiteSpace: 'pre-wrap',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {chart.content || chart.title || 'Texto'}
      </span>
    </div>
  )
}
