import { useState } from 'react'
import { MUSCLE_GROUPS, type MuscleGroup } from '../types'
import { getExercisesByGroup } from '../data/exercises'
import type { Exercise } from '../types'
import MuscleHighlight from './MuscleHighlight'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
  defaultGroup?: MuscleGroup
}

export default function ExerciseSelector({ onSelect, onClose, defaultGroup }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(defaultGroup || null)

  // Step 1: Select muscle group
  if (!selectedGroup) {
    return (
      <div className="fixed inset-0 bg-black/20 z-50 flex items-start sm:items-center justify-center">
        <div className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col anim-slide-up shadow-[0_4px_12px_rgba(0,0,0,0.08)] mt-16 sm:mt-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-muted">
            <h3 className="text-[18px] font-bold text-text-primary">选择训练部位</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-surface-muted rounded-full">
              <X className="size-[18px] text-text-tertiary" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {MUSCLE_GROUPS.map(group => {
              const count = getExercisesByGroup(group.key).length
              return (
                <button
                  key={group.key}
                  onClick={() => setSelectedGroup(group.key)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[52px] h-[68px]">
                      <MuscleHighlight muscleGroup={group.key} size={52} />
                    </div>
                    <div className="text-left">
                      <span className="text-[16px] font-bold text-text-primary">{group.label}</span>
                      <p className="text-[11px] text-text-tertiary mt-0.5">{groupDescs[group.key] || `${count}个动作`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-text-tertiary">{count}个</span>
                    <ChevronRight size={16} className="text-text-disabled" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Exercise list for selected group
  const exercises = getExercisesByGroup(selectedGroup)
  const groupLabel = MUSCLE_GROUPS.find(g => g.key === selectedGroup)?.label || selectedGroup

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-start sm:items-center justify-center">
      <div className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col anim-slide-up shadow-[0_4px_12px_rgba(0,0,0,0.08)] mt-16 sm:mt-0">
        {/* Header with back button - sticky at top */}
        <div className="sticky top-0 z-10 bg-surface-card flex items-center gap-2 px-4 py-4 border-b border-surface-muted">
          <button
            onClick={() => setSelectedGroup(null)}
            className="p-1.5 hover:bg-surface-muted rounded-full flex-shrink-0"
          >
            <ChevronLeft size={18} className="text-text-primary" />
          </button>
          <h3 className="text-[16px] font-bold text-text-primary flex-1">{groupLabel} · {exercises.length}个动作</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-muted rounded-full">
            <X className="size-[18px] text-text-tertiary" />
          </button>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {exercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full bg-surface-subtle rounded-2xl p-3 flex items-center gap-3 hover:bg-surface-muted transition-colors"
            >
              <div className="text-left flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-primary">{ex.name}</p>
                <p className="text-[11px] text-text-tertiary line-clamp-1">{ex.description}</p>
              </div>
              <ChevronRight size={16} className="text-text-disabled flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const groupDescs: Record<string, string> = {
  chest: '卧推 · 飞鸟 · 夹胸',
  shoulder: '推举 · 侧平举 · 前平举',
  back: '引体 · 划船 · 下拉',
  abs: '卷腹 · 举腿 · 平板支撑',
  legs: '深蹲 · 腿举 · 箭步蹲',
  glutes: '臀推 · 硬拉 · 后踢腿',
  arms: '弯举 · 臂屈伸 · 下压',
  cardio: '慢跑 · 跳绳 · 游泳 · 爬楼',
}
