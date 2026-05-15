import { useState, useEffect, useCallback } from 'react'
import { MUSCLE_GROUPS, type MuscleGroup } from '../types'
import { getExercisesByGroup } from '../data/exercises'
import type { Exercise } from '../types'
import MuscleHighlight from './MuscleHighlight'
import ExerciseAnimation from './ExerciseAnimation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
  defaultGroup?: MuscleGroup
}

const POSTERIOR_GROUPS: MuscleGroup[] = ['back', 'glutes']

const anteriorZones: Array<{ key: MuscleGroup; label: string; top: number; left: number; w: number; h: number }> = [
  { key: 'chest',    label: '胸',    top: 22, left: 20, w: 60, h: 20 },
  { key: 'abs',      label: '腹',    top: 40, left: 22, w: 56, h: 20 },
  { key: 'legs',     label: '腿',    top: 60, left: 16, w: 68, h: 36 },
  { key: 'shoulder', label: '肩',   top: 18, left: 6,  w: 24, h: 18 },
  { key: 'arms',     label: '手臂',  top: 28, left: 2,  w: 20, h: 26 },
]
const posteriorZones: Array<{ key: MuscleGroup; label: string; top: number; left: number; w: number; h: number }> = [
  { key: 'back',    label: '背',   top: 22, left: 18, w: 64, h: 24 },
  { key: 'glutes',  label: '臀',   top: 44, left: 20, w: 60, h: 16 },
  { key: 'shoulder', label: '肩',  top: 16, left: 8,  w: 24, h: 18 },
  { key: 'arms',    label: '手臂',  top: 28, left: 2,  w: 20, h: 26 },
]

// ── Single card navigator ─────────────────────────────────────────────
function ExerciseCarousel({ exercises, onSelect }: { exercises: Exercise[]; onSelect: (ex: Exercise) => void }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const prev = useCallback(() => {
    setActiveIdx(i => Math.max(0, i - 1))
  }, [])

  const next = useCallback(() => {
    setActiveIdx(i => Math.min(exercises.length - 1, i + 1))
  }, [exercises.length])

  const ex = exercises[activeIdx]

  return (
    <div className="flex items-center gap-3 px-4 py-2 h-full">
      {/* Prev button */}
      <button
        onClick={prev}
        disabled={activeIdx === 0}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center disabled:opacity-30"
      >
        <ChevronLeft size={20} className="text-text-primary" />
      </button>

      {/* Center card */}
      <button
        onClick={() => onSelect(ex)}
        className="flex-1 flex flex-col items-center h-full py-2"
      >
        <div className="text-center px-2 pb-1.5">
          <p className="text-[13px] font-bold text-text-primary leading-tight">{ex.name}</p>
        </div>
        <div className="flex-1 w-full rounded-2xl overflow-hidden bg-surface-subtle">
          <ExerciseAnimation exercise={ex} size="lg" />
        </div>
      </button>

      {/* Next button */}
      <button
        onClick={next}
        disabled={activeIdx === exercises.length - 1}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center disabled:opacity-30"
      >
        <ChevronRight size={20} className="text-text-primary" />
      </button>
    </div>
  )
}

// ── Main selector ──────────────────────────────────────────────────
export default function ExerciseSelector({ onSelect, onClose, defaultGroup }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(defaultGroup || null)
  const [hoveredGroup, setHoveredGroup] = useState<MuscleGroup | null>(null)
  const [pendingGroup, setPendingGroup] = useState<MuscleGroup | null>(null)

  // Reset pending group when navigating back to step 1
  useEffect(() => {
    if (selectedGroup) setPendingGroup(null)
  }, [selectedGroup])

  const activeGroup = pendingGroup || hoveredGroup
  const isPosterior = activeGroup ? POSTERIOR_GROUPS.includes(activeGroup) : false
  const showZones = isPosterior ? posteriorZones : anteriorZones
  const diagramHighlight = activeGroup

  // Step 1: body diagram
  if (!selectedGroup) {
    return (
      <div className="fixed inset-0 bg-black/20 z-50 flex items-stretch sm:items-center justify-center">
        <div className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-[430px] min-h-screen flex flex-col anim-slide-up shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-muted">
            <h3 className="text-[18px] font-bold text-text-primary">选择训练部位</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-muted rounded-full">
              <X className="size-[18px] text-text-tertiary" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

            {/* Quick-select buttons ABOVE the body diagram */}
            <div className="flex flex-wrap gap-2 justify-center">
              {MUSCLE_GROUPS.map(group => (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => {
                    setPendingGroup(group.key)
                    setTimeout(() => setSelectedGroup(group.key), 200)
                  }}
                  onMouseEnter={() => { setHoveredGroup(group.key); setPendingGroup(group.key) }}
                  onMouseLeave={() => { setHoveredGroup(null); setPendingGroup(null) }}
                  style={{ outline: 'none' }}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all focus:outline-none ${
                    (pendingGroup || hoveredGroup) === group.key
                      ? 'bg-brand text-white shadow-md scale-105'
                      : 'bg-surface-subtle text-text-primary hover:bg-surface-muted'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Single body diagram — switches anterior/posterior based on hovered group */}
            <div className="flex flex-col items-center">
              <div className="relative" onMouseLeave={() => setHoveredGroup(null)}>
                <MuscleHighlight
                  muscleGroup={diagramHighlight as any}
                  size={140}
                />
                {showZones.map(z => (
                  <div
                    key={z.key}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => { setHoveredGroup(z.key); setPendingGroup(z.key) }}
                    onMouseLeave={() => { setHoveredGroup(null); setPendingGroup(null) }}
                    onClick={() => {
                      setPendingGroup(z.key)
                      setTimeout(() => setSelectedGroup(z.key), 200)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedGroup(z.key)}
                    style={{
                      top: `${z.top}%`, left: `${z.left}%`,
                      width: `${z.w}%`, height: `${z.h}%`,
                      transform: 'translate(-50%, -50%)',
                      background: 'transparent',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-text-disabled mt-1">
                {isPosterior ? '背面' : '正面'}
              </span>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // Step 2: Horizontal carousel — modal constrained to app width
  const exercises = getExercisesByGroup(selectedGroup)
  const groupLabel = MUSCLE_GROUPS.find(g => g.key === selectedGroup)?.label || selectedGroup

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/20">
      <div className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-[430px] min-h-screen flex flex-col anim-slide-up shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-surface-muted">
          <button onClick={() => setSelectedGroup(null)} className="p-1.5 hover:bg-surface-muted rounded-full flex-shrink-0">
            <ChevronLeft size={18} className="text-text-primary" />
          </button>
          <h3 className="text-[16px] font-bold text-text-primary flex-1">{groupLabel} · {exercises.length}个动作</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-muted rounded-full">
            <X className="size-[18px] text-text-tertiary" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <ExerciseCarousel exercises={exercises} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}
