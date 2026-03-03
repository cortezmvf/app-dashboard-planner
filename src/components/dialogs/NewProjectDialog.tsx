import { useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { CANVAS_PRESETS } from '../../lib/utils'

interface Props {
  onClose: () => void
  mode?: 'project' | 'tab'
}

export function NewProjectDialog({ onClose, mode = 'project' }: Props) {
  const store = useAppStore()
  const isTab = mode === 'tab'
  const project = store.activeProject()

  const [name, setName] = useState(isTab ? `Dashboard ${(project?.tabs.length ?? 0) + 1}` : `Project ${store.projects.length + 1}`)
  const [preset, setPreset] = useState(0)
  const [customW, setCustomW] = useState('1280')
  const [customH, setCustomH] = useState('720')
  const [error, setError] = useState('')

  const isCustom = preset === CANVAS_PRESETS.length
  const canvasW = isCustom ? parseInt(customW) || 1280 : CANVAS_PRESETS[preset].width
  const canvasH = isCustom ? parseInt(customH) || 720 : CANVAS_PRESETS[preset].height

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Name required'); return }

    if (isTab) {
      const conflict = project?.tabs.some(t => t.name.toLowerCase() === trimmed.toLowerCase())
      if (conflict) { setError('Dashboard name already exists in this project'); return }
      store.createTab(trimmed, canvasW, canvasH)
    } else {
      const conflict = store.projects.some(p => p.name.toLowerCase() === trimmed.toLowerCase())
      if (conflict) { setError('Project name already exists'); return }
      store.createProject(trimmed, canvasW, canvasH)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {isTab ? 'New Dashboard' : 'New Project'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">
              {isTab ? 'Dashboard name' : 'Project name'}
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={isTab ? 'e.g. Overview' : 'e.g. Analytics Q4'}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Canvas size</label>
            <div className="grid grid-cols-2 gap-2">
              {CANVAS_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPreset(i)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    preset === i
                      ? 'border-[#005175] bg-blue-50 dark:bg-blue-900/20 text-[#005175] dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium text-xs">{p.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{p.width} × {p.height}</div>
                </button>
              ))}
              <button
                onClick={() => setPreset(CANVAS_PRESETS.length)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isCustom
                    ? 'border-[#005175] bg-blue-50 dark:bg-blue-900/20 text-[#005175] dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="font-medium text-xs">Custom</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Set manually</div>
              </button>
            </div>

            {isCustom && (
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Width (px)</label>
                  <input type="number" value={customW} onChange={e => setCustomW(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005175]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Height (px)</label>
                  <input type="number" value={customH} onChange={e => setCustomH(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005175]" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-[#005175] hover:bg-[#003d58] text-white rounded-lg transition-colors font-medium">
            {isTab ? 'Create Dashboard' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
