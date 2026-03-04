import { useState } from 'react'
import { Plus, X, ChevronRight, ChevronLeft } from 'lucide-react'
import type { IntakeFormData, DataSource, AudienceType } from '../../store/useAgentStore'

const INDUSTRIES = [
  'Retail', 'E-commerce', 'Automotive', 'Healthcare', 'Finance',
  'Hospitality', 'Real Estate', 'Education', 'Technology', 'Food & Beverage',
  'Entertainment', 'Nonprofit', 'Other',
]

const ALL_DATA_SOURCES: DataSource[] = [
  'Social', 'Paid Search', 'Display', 'Video', 'Traditional',
  'GA4', 'Sales', 'CRM', 'Competitor', 'Weather', 'Foot Traffic', 'Other',
]

const MEDIA_CHANNELS: DataSource[] = ['Social', 'Paid Search', 'Display', 'Video', 'Traditional']

function getAvailableViews(dataSources: DataSource[]): string[] {
  const views: string[] = ['Executive Summary']
  const hasMedia = dataSources.some(d => MEDIA_CHANNELS.includes(d))
  if (hasMedia) views.push('Media Summary')
  if (dataSources.includes('Social')) views.push('Social View')
  if (dataSources.includes('Paid Search')) views.push('Paid Search View')
  if (dataSources.includes('Display')) views.push('Display View')
  if (dataSources.includes('Video')) views.push('Video View')
  if (dataSources.includes('Traditional')) views.push('Traditional View')
  if (dataSources.includes('GA4')) views.push('GA4 View')
  if (dataSources.includes('Sales')) views.push('Sales View')
  if (dataSources.includes('CRM')) views.push('CRM View')
  if (dataSources.includes('Competitor')) views.push('Competitor View')
  if (dataSources.includes('Weather') || dataSources.includes('Foot Traffic')) views.push('Context & External Factors View')
  views.push('QA')
  views.push('Other')
  return views
}

// ── Reusable bubble selector ──────────────────────────────────────────────────

function BubbleSelect<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: T[]
  selected: T[]
  onChange: (next: T[]) => void
}) {
  function toggle(opt: T) {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
              active
                ? 'bg-[#005175] border-[#005175] text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#005175] hover:text-[#005175]'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ── Step components ───────────────────────────────────────────────────────────

function StepClientInfo({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.clientName}
          onChange={e => onChange({ clientName: e.target.value })}
          placeholder="e.g. Acme Corp"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Industry <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              type="button"
              onClick={() => onChange({ clientIndustry: ind === data.clientIndustry ? '' : ind })}
              className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                data.clientIndustry === ind
                  ? 'bg-[#005175] border-[#005175] text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#005175]'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
        {data.clientIndustry === 'Other' && (
          <input
            type="text"
            placeholder="Specify industry..."
            className="mt-2 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100"
            onChange={e => onChange({ clientIndustry: e.target.value || 'Other' })}
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Agency Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={data.agencyName}
          onChange={e => onChange({ agencyName: e.target.value })}
          placeholder="e.g. Media Agency Partners"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175]"
        />
      </div>
    </div>
  )
}

function StepAudience({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Who will be the primary audience for this dashboard? Select all that apply.
      </p>
      <BubbleSelect<AudienceType>
        options={['Client', 'Agency']}
        selected={data.audiences}
        onChange={audiences => onChange({ audiences })}
      />
    </div>
  )
}

function StepDataSources({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        What data sources will be available for this dashboard? Select all that apply.
      </p>
      <BubbleSelect<DataSource>
        options={ALL_DATA_SOURCES}
        selected={data.dataSources}
        onChange={dataSources => onChange({ dataSources })}
      />
      {data.dataSources.includes('Other') && (
        <input
          type="text"
          value={data.otherDataSource}
          onChange={e => onChange({ otherDataSource: e.target.value })}
          placeholder="Describe other data source..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100"
        />
      )}
    </div>
  )
}

function StepViews({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  const availableViews = getAvailableViews(data.dataSources)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Which views should this dashboard include? Options shown are based on your available data.
      </p>
      <BubbleSelect<string>
        options={availableViews.filter(v => v !== 'Other')}
        selected={data.selectedViews}
        onChange={selectedViews => onChange({ selectedViews })}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const hasOther = data.selectedViews.includes('Other')
            onChange({
              selectedViews: hasOther
                ? data.selectedViews.filter(v => v !== 'Other')
                : [...data.selectedViews, 'Other'],
            })
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
            data.selectedViews.includes('Other')
              ? 'bg-[#005175] border-[#005175] text-white'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#005175]'
          }`}
        >
          Other
        </button>
        {data.selectedViews.includes('Other') && (
          <input
            type="text"
            value={data.otherView}
            onChange={e => onChange({ otherView: e.target.value })}
            placeholder="Describe the view..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100"
          />
        )}
      </div>
    </div>
  )
}

function StepQuestions({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  function addQuestion() {
    onChange({ businessQuestions: [...data.businessQuestions, ''] })
  }

  function updateQuestion(idx: number, value: string) {
    const updated = [...data.businessQuestions]
    updated[idx] = value
    onChange({ businessQuestions: updated })
  }

  function removeQuestion(idx: number) {
    if (data.businessQuestions.length === 1) return
    onChange({ businessQuestions: data.businessQuestions.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        What specific questions should this dashboard answer? Each question will guide the agent in building the right views.
      </p>
      <div className="space-y-2">
        {data.businessQuestions.map((q, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-5 shrink-0 text-right">{idx + 1}.</span>
            <input
              type="text"
              value={q}
              onChange={e => updateQuestion(idx, e.target.value)}
              placeholder="e.g. Which channel is driving the most conversions at the lowest CPA?"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              disabled={data.businessQuestions.length === 1}
              className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-1.5 text-sm text-[#005175] hover:text-[#003d58] transition-colors font-medium"
      >
        <Plus size={15} />
        Add another question
      </button>
    </div>
  )
}

function StepContext({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (partial: Partial<IntakeFormData>) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Share anything important about this client that the options above couldn't capture — strategy, goals, seasonal patterns, KPI targets, attribution models, specific nuances.
      </p>
      <textarea
        value={data.clientContext}
        onChange={e => onChange({ clientContext: e.target.value })}
        placeholder="e.g. This client runs heavy promotional periods in Q4. Their primary KPI is in-store visits, not online conversions. They have a strong loyalty program that affects attribution..."
        rows={7}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#005175] dark:text-gray-100 resize-none"
      />
      <p className="text-xs text-gray-400">Optional — but the more context you provide, the better the dashboard will be.</p>
    </div>
  )
}

// ── Step config ───────────────────────────────────────────────────────────────

interface Step {
  title: string
  description: string
  validate: (data: IntakeFormData) => boolean
}

const STEPS: Step[] = [
  {
    title: 'Client Information',
    description: 'Basic details about the client and project.',
    validate: d => d.clientName.trim().length > 0 && d.clientIndustry.trim().length > 0,
  },
  {
    title: 'Dashboard Audience',
    description: 'Who will be consuming this dashboard?',
    validate: d => d.audiences.length > 0,
  },
  {
    title: 'Available Data',
    description: 'What data sources do you have access to?',
    validate: d => d.dataSources.length > 0,
  },
  {
    title: 'Dashboard Views',
    description: 'Which views should the dashboard include?',
    validate: d => d.selectedViews.length > 0,
  },
  {
    title: 'Business Questions',
    description: 'What questions should the dashboard answer?',
    validate: d => d.businessQuestions.some(q => q.trim().length > 0),
  },
  {
    title: 'Client Context',
    description: 'Additional strategy and nuance.',
    validate: () => true,
  },
]

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onSubmit: (data: IntakeFormData) => void
  onCancel: () => void
}

export function IntakeForm({ onSubmit, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<IntakeFormData>({
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
  })

  function update(partial: Partial<IntakeFormData>) {
    setData(prev => ({ ...prev, ...partial }))
  }

  const currentStep = STEPS[step]
  const canProceed = currentStep.validate(data)
  const isLast = step === STEPS.length - 1

  function handleNext() {
    if (!canProceed) return
    if (isLast) {
      onSubmit(data)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((_step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  i < step
                    ? 'bg-[#005175] text-white'
                    : i === step
                    ? 'bg-[#005175] text-white ring-4 ring-[#005175]/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${i < step ? 'bg-[#005175]' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentStep.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentStep.description}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-8 py-2">
        {step === 0 && <StepClientInfo data={data} onChange={update} />}
        {step === 1 && <StepAudience data={data} onChange={update} />}
        {step === 2 && <StepDataSources data={data} onChange={update} />}
        {step === 3 && <StepViews data={data} onChange={update} />}
        {step === 4 && <StepQuestions data={data} onChange={update} />}
        {step === 5 && <StepContext data={data} onChange={update} />}
      </div>

      {/* Navigation */}
      <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-between">
        <button
          type="button"
          onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-[#005175] text-white rounded-lg text-sm font-medium hover:bg-[#003d58] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLast ? 'Analyze & Build Brief' : 'Continue'}
          {!isLast && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  )
}
