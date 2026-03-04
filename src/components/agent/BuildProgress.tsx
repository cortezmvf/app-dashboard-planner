import { Loader2, LayoutDashboard } from 'lucide-react'

const STEPS = [
  'Analyzing marketing brief…',
  'Designing view layouts…',
  'Selecting chart types…',
  'Positioning elements…',
  'Finalizing dashboard…',
]

interface Props {
  viewCount: number
}

export function BuildProgress({ viewCount }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-[#005175]/10 flex items-center justify-center">
          <LayoutDashboard size={36} className="text-[#005175]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-[#005175]/20 flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-[#005175]" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Building your dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generating {viewCount} view{viewCount !== 1 ? 's' : ''} with charts, titles, and layout…
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#005175]/30 shrink-0" />
            <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600">
        This may take 20–40 seconds. Please don't close this window.
      </p>
    </div>
  )
}
