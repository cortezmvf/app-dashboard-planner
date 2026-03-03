export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}min ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export const CANVAS_PRESETS = [
  { name: 'Full HD Landscape', width: 1920, height: 1080 },
  { name: 'Full HD Wide',      width: 1920, height: 720  },
  { name: 'HD Landscape',      width: 1280, height: 720  },
  { name: 'Square',            width: 800,  height: 800  },
  { name: 'Portrait',          width: 720,  height: 1280 },
] as const

export const BG_COLORS: Record<string, string> = {
  'white':      '#ffffff',
  'light-gray': '#f3f4f6',
  'dark-gray':  '#374151',
  'black':      '#111827',
}
