import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useKeyboardShortcuts() {
  const store = useAppStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); store.redo(); return }
      if (ctrl && e.key === 'd') { e.preventDefault(); store.selectedChartIds.forEach(id => store.duplicateChart(id)); return }
      if (ctrl && e.key === 'a') { e.preventDefault(); store.selectAll(); return }
      if (ctrl && e.key === 's') { e.preventDefault(); store.persistNow(); store.setSaveStatus('saved'); return }
      if (ctrl && e.key === '=') { e.preventDefault(); store.setZoom(store.zoom + 0.1); return }
      if (ctrl && e.key === '-') { e.preventDefault(); store.setZoom(store.zoom - 0.1); return }
      if (ctrl && e.key === '0') { e.preventDefault(); store.setZoom(1); return }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); store.deleteSelectedCharts(); return }
      if (e.key === 'Escape') { e.preventDefault(); store.deselectAll(); return }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store])
}
