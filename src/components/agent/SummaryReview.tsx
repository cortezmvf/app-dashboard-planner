import { useState } from 'react'
import { CheckCircle, Edit3, Loader2 } from 'lucide-react'
import type { MarketingBrief } from '../../store/useAgentStore'

interface Props {
  brief: MarketingBrief
  streamingText: string
  phase: 'review' | 'adjusting' | 'generating-layout'
  onBuild: () => void
  onAdjust: (text: string) => void
}

export function SummaryReview({ brief, streamingText, phase, onBuild, onAdjust }: Props) {
  const [adjustText, setAdjustText] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)

  const isAdjusting = phase === 'adjusting'
  const isBuilding = phase === 'generating-layout'
  const isBusy = isAdjusting || isBuilding

  function handleAdjust() {
    if (!adjustText.trim()) return
    onAdjust(adjustText.trim())
    setAdjustText('')
    setShowAdjust(false)
  }

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

        {/* Views list */}
        {!isAdjusting && (
          <div>
            <h3 className="text-xs font-semibold text-[#005175] uppercase tracking-wider mb-3">
              Views to Build ({brief.views.length})
            </h3>
            <div className="space-y-3">
              {brief.views.map((view, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-6 h-6 rounded-full bg-[#005175] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
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
                </div>
              ))}
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
              onClick={onBuild}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#005175] text-white rounded-lg text-sm font-medium hover:bg-[#003d58] transition-colors"
            >
              Build Dashboard
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
