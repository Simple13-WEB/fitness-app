import type { Suggestion } from '../utils/suggestions'
import { AlertTriangle, Info, CheckCircle2, Lightbulb } from 'lucide-react'

interface Props {
  suggestion: Suggestion
}

const iconMap = { warning: AlertTriangle, info: Info, success: CheckCircle2, tip: Lightbulb }

const borderMap = {
  warning: 'border-l-warning bg-warning/5',
  info: 'border-l-info bg-info/5',
  success: 'border-l-success bg-success/5',
  tip: 'border-l-brand bg-brand/5',
}

const iconColorMap = {
  warning: 'text-warning',
  info: 'text-info',
  success: 'text-success',
  tip: 'text-brand',
}

export default function SuggestionCard({ suggestion }: Props) {
  const Icon = iconMap[suggestion.type]

  return (
    <div className={`border-l-2 rounded-2xl p-4 ${borderMap[suggestion.type]} bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${iconColorMap[suggestion.type]} flex-shrink-0 mt-0.5`} />
        <div>
          <p className="text-[14px] font-bold text-text-primary">{suggestion.title}</p>
          <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">{suggestion.detail}</p>
        </div>
      </div>
    </div>
  )
}
