import { useState, useEffect } from 'react'
import { CheckCircle, Edit3, Loader2 } from 'lucide-react'
import type { MarketingBrief } from '../../store/useAgentStore'

interface Props {
  brief: MarketingBrief
  streamingText: string
  phase: 'review' | 'adjusting' | 'generating-layout'
  onBuild: (selectedViewNames: string[]) => void
  onAdjust: (text: string) => void
}

export function SummaryReview({ brief, streamingText, phase, onBuild, onAdjust }: Props) {
  const [adjustText, setAdjustText] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)
  const [selectedViews, setSelectedViews] = useState<Set<string>>(
    () => new Set(brief.views.map(v => v.name))
  )

  // Re-select all when brief changes (after an adjustment)
  useEffect(() => {
    setSelectedViews(new Set(brief.views.map(v => v.name)))
  }, [brief])

  const isAdjusting = phase === 'adjusting'
  const isBuilding = phase === 'generating-layout'
  const isBusy = isAdjusting || isBuilding

  function toggleView(name: string) {
    setSelectedViews(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function handleAdjust() {
    if (!adjustText.trim()) return
    onAdjust(adjustText.trim())
    setAdjustText('')
    setShowAdjust(false)
  }

  const selectedCount = selectedViews.size

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle size={20} className="text-[#005175]" />
          Dashboard Brief
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review the agent's understanding before generating the dashboard.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-2 space-y-6">
        {/* Client summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-[#005175] uppercase tracking-wider mb-3">Strategic Overview</h3>
          {isAdjusting && streamingText ? (
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {streamingText}
              <span className="inline-block w-1.5 h-4 bg-[#005175] animate-pulse ml-0.5 align-text-bottom" />
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {brief.clientSummary}
            </p>
          )}
        </div>

        {/* Views list with checkboxes */}
        {!isAdjusting && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#005175] uppercase tracking-wider">
                Views to Build ({selectedCount} of {brief.views.length} selected)
              </h3>
              <button
                onClick={() => {
                  if (selectedCount === brief.views.length) {
                    setSelectedViews(new Set())
                  } else {
                    setSelectedViews(new Set(brief.views.map(v => v.name)))
                  }
                }}
                className="text-xs text-[#005175] hover:underline"
              >
                {selectedCount === brief.views.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-2">
              {brief.views.map((view, i) => {
                const isSelected = selectedViews.has(view.name)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleView(view.name)}
                    className={`w-full flex gap-3 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-[#005175]/40 dark:border-[#005175]/40'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors ${
                      isSelected
                        ? 'bg-[#005175] border-[#005175]'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{view.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">"{view.question}"</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{view.purpose}</div>
                      {view.keyMetrics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {view.keyMetrics.slice(0, 5).map(m => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 bg-[#005175]/10 text-[#005175] dark:text-blue-300 rounded text-[11px] font-medium"
                            >
                              {m}
                            </span>
                          ))}
                          {view.keyMetrics.length > 5 && (
                            <span className="text-[11px] text-gray-400 self-center">+{view.keyMetrics.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Adjust area */}
        {showAdjust && !isBusy && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">What did we miss or get wrong?</p>
            <textarea
              value={adjustText}
              onChange={e => setAdjustText(e.target.value)}
              placeholder="e.g. Please also include a view focused on Brand Awareness metrics. The executive summary should focus more on ROAS and less on impressions."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100 resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowAdjust(false); setAdjustText('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={!adjustText.trim()}
                className="px-4 py-2 bg-[#005175] text-white rounded-lg text-sm font-medium hover:bg-[#003d58] disabled:opacity-40 transition-colors"
              >
                Update Brief
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-between gap-3">
        {!showAdjust && !isBusy ? (
          <>
            <button
              onClick={() => setShowAdjust(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#005175] hover:text-[#005175] transition-colors"
            >
              <Edit3 size={15} />
              Adjust Brief
            </button>
            <button
              onClick={() => onBuild(Array.from(selectedViews))}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#005175] text-white rounded-lg text-sm font-medium hover:bg-[#003d58] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Build Dashboard
              {selectedCount > 0 && (
                <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs">{selectedCount}</span>
              )}
            </button>
          </>
        ) : isBusy ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mx-auto">
            <Loader2 size={16} className="animate-spin" />
            {isBuilding ? 'Building your dashboard…' : 'Updating brief…'}
          </div>
        ) : null}
      </div>
    </div>
  )
}
