import { createPortal } from 'react-dom'
import { X, AlertCircle } from 'lucide-react'
import { useAgentStore } from '../../store/useAgentStore'
import { IntakeForm } from './IntakeForm'
import { GeneratingBrief } from './GeneratingBrief'
import { SummaryReview } from './SummaryReview'
import { BuildProgress } from './BuildProgress'
import { DoneScreen } from './DoneScreen'

export function AgentModal() {
  const store = useAgentStore()

  if (store.phase === 'idle') return null

  const isGeneratingLayout = store.phase === 'generating-layout'

  function handleClose() {
    if (isGeneratingLayout) return // don't allow close while building
    store.closeAgentModal()
  }

  // Derive a project name from the form data for the done screen
  const projectName = store.formData.clientName
    ? `${store.formData.clientName} — Dashboard`
    : 'New Dashboard'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#005175]" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard Agent</span>
          </div>
          {!isGeneratingLayout && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Error banner */}
        {store.error && (
          <div className="mx-8 mt-4 shrink-0 flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-700 dark:text-red-300">{store.error}</p>
            </div>
            <button
              onClick={store.resetError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Phase content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {store.phase === 'form' && (
            <IntakeForm
              onSubmit={store.submitForm}
              onCancel={store.closeAgentModal}
            />
          )}

          {store.phase === 'generating-brief' && (
            <GeneratingBrief
              streamingText={store.streamingText}
              clientName={store.formData.clientName}
            />
          )}

          {(store.phase === 'review' || store.phase === 'adjusting') && store.marketingBrief && (
            <SummaryReview
              brief={store.marketingBrief}
              streamingText={store.streamingText}
              phase={store.phase}
              onBuild={(selectedViewNames) => store.buildDashboard(selectedViewNames)}
              onAdjust={store.submitAdjustment}
            />
          )}

          {store.phase === 'generating-layout' && (
            <BuildProgress viewCount={store.marketingBrief?.views.length ?? 0} />
          )}

          {store.phase === 'done' && (
            <DoneScreen
              projectName={projectName}
              onClose={store.closeAgentModal}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
