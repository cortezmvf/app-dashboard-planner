import { Sparkles } from 'lucide-react'
import { useAgentStore } from '../../store/useAgentStore'

export function AgentButton() {
  const openAgentModal = useAgentStore(s => s.openAgentModal)

  return (
    <button
      onClick={openAgentModal}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors border border-white/20"
      title="AI Dashboard Agent"
    >
      <Sparkles size={14} />
      <span className="hidden sm:block">Agent</span>
    </button>
  )
}
