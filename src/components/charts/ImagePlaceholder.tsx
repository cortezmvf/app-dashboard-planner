import type { ChartItem } from '../../types'
import { Image } from 'lucide-react'

interface Props { chart: ChartItem; colors: string[] }

export function ImagePlaceholderComp({ chart, colors }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' }}>
      <Image size={24} color={colors[0]} strokeWidth={1.5} />
      <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui, sans-serif' }}>
        {chart.altText || 'Imagem'}
      </span>
    </div>
  )
}
