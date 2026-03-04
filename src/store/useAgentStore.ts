import { create } from 'zustand'
import { streamChat, chatJSON, type ChatMessage } from '../lib/openai'
import { buildDashboardFromSpec, type AgentDashboardSpec } from '../lib/dashboardBuilder'
import marketingPromptRaw from '../agents/agent-marketing.md?raw'
import datavizPromptRaw from '../agents/agent-dataviz.md?raw'

// ── Intake form data ──────────────────────────────────────────────────────────

export type DataSource =
  | 'Social' | 'Paid Search' | 'Display' | 'Video' | 'Traditional'
  | 'GA4' | 'Sales' | 'CRM' | 'Competitor' | 'Weather' | 'Foot Traffic' | 'Other'

export type AudienceType = 'Client' | 'Agency'

export interface IntakeFormData {
  clientName: string
  clientIndustry: string
  agencyName: string
  audiences: AudienceType[]
  dataSources: DataSource[]
  otherDataSource: string
  selectedViews: string[]
  otherView: string
  businessQuestions: string[]
  clientContext: string
}

// ── Marketing brief (output of Call 1) ───────────────────────────────────────

export interface MarketingView {
  name: string
  question: string
  purpose: string
  keyMetrics: string[]
  dimensions: string[]
  suggestedChartTypes: string[]
  filters: string[]
}

export interface MarketingBrief {
  clientSummary: string
  views: MarketingView[]
}

// ── Agent phases ──────────────────────────────────────────────────────────────

export type AgentPhase =
  | 'idle'
  | 'form'
  | 'generating-brief'
  | 'review'
  | 'adjusting'
  | 'generating-layout'
  | 'done'

// ── Store ─────────────────────────────────────────────────────────────────────

interface AgentStore {
  phase: AgentPhase
  formData: IntakeFormData
  conversationHistory: ChatMessage[]
  marketingBrief: MarketingBrief | null
  streamingText: string
  error: string | null

  openAgentModal: () => void
  closeAgentModal: () => void
  setFormData: (data: IntakeFormData) => void
  submitForm: (data: IntakeFormData) => Promise<void>
  submitAdjustment: (text: string) => Promise<void>
  buildDashboard: () => Promise<void>
  resetError: () => void
}

const emptyForm: IntakeFormData = {
  clientName: '',
  clientIndustry: '',
  agencyName: '',
  audiences: [],
  dataSources: [],
  otherDataSource: '',
  selectedViews: [],
  otherView: '',
  businessQuestions: [''],
  clientContext: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formDataToUserMessage(data: IntakeFormData): string {
  const lines: string[] = [
    `Client Name: ${data.clientName}`,
    `Industry: ${data.clientIndustry}`,
  ]
  if (data.agencyName) lines.push(`Agency: ${data.agencyName}`)
  lines.push(`Dashboard Audience: ${data.audiences.join(', ')}`)

  const sources: string[] = [...data.dataSources]
  if (data.otherDataSource) sources.push(`Other: ${data.otherDataSource}`)
  lines.push(`Available Data Sources: ${sources.join(', ')}`)

  const views = [...data.selectedViews]
  if (data.otherView) views.push(`Other: ${data.otherView}`)
  lines.push(`Requested Views: ${views.join(', ')}`)

  const questions = data.businessQuestions.filter(q => q.trim())
  if (questions.length > 0) {
    lines.push(`Business Questions to Answer:`)
    questions.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`))
  }

  if (data.clientContext.trim()) {
    lines.push(`Additional Context:\n${data.clientContext}`)
  }

  return lines.join('\n')
}

function tryParseBrief(text: string): MarketingBrief | null {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0]) as MarketingBrief
    if (!parsed.clientSummary || !Array.isArray(parsed.views)) return null
    return parsed
  } catch {
    return null
  }
}

// ── Store implementation ──────────────────────────────────────────────────────

export const useAgentStore = create<AgentStore>((set, get) => ({
  phase: 'idle',
  formData: emptyForm,
  conversationHistory: [],
  marketingBrief: null,
  streamingText: '',
  error: null,

  openAgentModal: () => set({ phase: 'form', formData: emptyForm, conversationHistory: [], marketingBrief: null, streamingText: '', error: null }),

  closeAgentModal: () => set({ phase: 'idle', streamingText: '', error: null }),

  setFormData: (data) => set({ formData: data }),

  submitForm: async (data) => {
    set({ formData: data, phase: 'generating-brief', streamingText: '', error: null })

    const userMessage = formDataToUserMessage(data)
    const history: ChatMessage[] = [
      { role: 'system', content: marketingPromptRaw },
      { role: 'user', content: userMessage },
    ]

    try {
      const fullResponse = await streamChat(history, (_delta, accumulated) => {
        set({ streamingText: accumulated })
      })

      const brief = tryParseBrief(fullResponse)
      if (!brief) {
        set({ error: 'Could not parse the marketing brief. Please try again.', phase: 'form' })
        return
      }

      history.push({ role: 'assistant', content: fullResponse })

      set({
        conversationHistory: history,
        marketingBrief: brief,
        streamingText: '',
        phase: 'review',
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', phase: 'form' })
    }
  },

  submitAdjustment: async (text) => {
    const { conversationHistory } = get()
    set({ phase: 'adjusting', streamingText: '', error: null })

    const updatedHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: text },
    ]

    try {
      const fullResponse = await streamChat(updatedHistory, (_delta, accumulated) => {
        set({ streamingText: accumulated })
      })

      const brief = tryParseBrief(fullResponse)
      if (!brief) {
        set({ error: 'Could not parse the updated brief. Please try again.', phase: 'review' })
        return
      }

      updatedHistory.push({ role: 'assistant', content: fullResponse })

      set({
        conversationHistory: updatedHistory,
        marketingBrief: brief,
        streamingText: '',
        phase: 'review',
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', phase: 'review' })
    }
  },

  buildDashboard: async () => {
    const { marketingBrief, formData } = get()
    if (!marketingBrief) return

    set({ phase: 'generating-layout', error: null })

    const briefJson = JSON.stringify(marketingBrief, null, 2)
    const messages: ChatMessage[] = [
      { role: 'system', content: datavizPromptRaw },
      {
        role: 'user',
        content: `Here is the marketing brief for ${formData.clientName}. Please generate the full dashboard layout JSON.\n\n${briefJson}`,
      },
    ]

    try {
      const spec = await chatJSON<AgentDashboardSpec>(messages)
      if (!spec.projectName || !Array.isArray(spec.tabs) || spec.tabs.length === 0) {
        set({ error: 'The layout generation returned an invalid response. Please try again.', phase: 'review' })
        return
      }

      buildDashboardFromSpec(spec)
      set({ phase: 'done' })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', phase: 'review' })
    }
  },

  resetError: () => set({ error: null }),
}))
