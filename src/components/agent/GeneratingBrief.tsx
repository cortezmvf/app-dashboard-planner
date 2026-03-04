import { Loader2 } from 'lucide-react'

interface Props {
  streamingText: string
  clientName: string
}

export function GeneratingBrief({ streamingText, clientName }: Props) {
  return (
    <div className="flex flex-col h-full px-8 py-6 gap-6">
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Loader2 size={16} className="animate-spin text-[#005175]" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing your brief…</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Building a marketing strategy for {clientName || 'your client'}.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
        {streamingText ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {streamingText}
            <span className="inline-block w-1.5 h-4 bg-[#005175] animate-pulse ml-0.5 align-text-bottom" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Thinking…
          </div>
        )}
      </div>
    </div>
  )
}
