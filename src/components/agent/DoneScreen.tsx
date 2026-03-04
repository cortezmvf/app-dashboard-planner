import { CheckCircle2 } from 'lucide-react'

interface Props {
  projectName: string
  onClose: () => void
}

export function DoneScreen({ projectName, onClose }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 size={40} className="text-green-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard ready!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          <span className="font-medium text-gray-700 dark:text-gray-300">{projectName}</span> has been created with all views and charts. You can now explore, edit, and refine it.
        </p>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-2.5 bg-[#005175] text-white rounded-lg text-sm font-medium hover:bg-[#003d58] transition-colors"
      >
        View Dashboard
      </button>
    </div>
  )
}
