import { useState, useEffect, useCallback } from 'react'
import type { Exercise, BodyData } from '../types'
import { getAllBodyData } from '../db/database'
import { useUser } from '../context/UserContext'
import ExerciseSelector from '../components/ExerciseSelector'
import WorkoutForm from '../components/WorkoutForm'
import WorkoutHistory from '../components/WorkoutHistory'
import {
  generatePlan, loadPlanState, savePlanState, clearPlanState,
  toggleExerciseComplete, checkDayComplete, isPlanComplete,
  type TrainingPlan, type PlanState,
} from '../utils/trainingPlan'
import { Dumbbell, ClipboardList, CheckCircle2, Circle, RefreshCw } from 'lucide-react'

export default function WorkoutPage() {
  const { currentUserId } = useUser()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showSelector, setShowSelector] = useState(false)
  const [selectorGroup, setSelectorGroup] = useState<string | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'free' | 'plan'>('free')
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [planState, setPlanState] = useState<PlanState | null>(null)
  const [bodyData, setBodyData] = useState<BodyData | null>(null)

  useEffect(() => {
    getAllBodyData(currentUserId).then(data => {
      if (data.length > 0) {
        setBodyData(data.reduce((a, b) => a.date > b.date ? a : b))
      }
    })
    const saved = loadPlanState(currentUserId)
    if (saved) {
      setPlanState(saved)
      setPlan(generatePlan(null, saved.planType))
    }
  }, [currentUserId])

  function handleSelect(exercise: Exercise) {
    setSelectedExercise(exercise)
    setSelectorGroup(exercise.muscleGroup)
    setShowSelector(false)
  }

  function handleSaved() {
    setRefreshKey(k => k + 1)
    setSelectedExercise(null)
    setSelectorGroup(undefined)
    setShowSelector(true)
  }

  function handleBack() {
    setShowSelector(true)
  }

  function handleGeneratePlan(type: '3day' | '5day') {
    const newPlan = generatePlan(bodyData, type)
    const newState: PlanState = {
      planType: type,
      completedExercises: {},
      completedDays: {},
      generatedAt: new Date().toISOString().split('T')[0],
    }
    setPlan(newPlan)
    setPlanState(newState)
    savePlanState(currentUserId, newState)
  }

  function handleResetPlan() {
    setPlan(null)
    setPlanState(null)
    clearPlanState(currentUserId)
  }

  const toggleEx = useCallback((dayIndex: number, exIndex: number) => {
    if (!plan || !planState) return
    const updated = toggleExerciseComplete(planState, dayIndex, exIndex)
    setPlanState(updated)
    savePlanState(currentUserId, updated)
  }, [plan, planState, currentUserId])

  // === Full-screen Workout Form (hides header) ===
  if (selectedExercise && !showSelector) {
    return (
      <div className="min-h-screen bg-surface-page">
        <WorkoutForm exercise={selectedExercise} onSaved={handleSaved} onBack={handleBack} />
      </div>
    )
  }

  return (
    <div className="pb-24 min-h-screen bg-surface-page">
      <header className="bg-surface-card px-6 py-4">
        <h1 className="text-[18px] font-bold text-text-primary">健身打卡</h1>
        <p className="text-[13px] text-text-tertiary mt-0.5">选择动作，记录你的每一次训练</p>

        {/* Tab toggle */}
        <div className="flex gap-0 mt-4 bg-surface-muted p-1 rounded-full">
          <button
            onClick={() => setActiveTab('free')}
            className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all ${
              activeTab === 'free' ? 'bg-brand text-white' : 'text-text-disabled'
            }`}>
            自由训练
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all ${
              activeTab === 'plan' ? 'bg-brand text-white' : 'text-text-disabled'
            }`}>
            训练计划
          </button>
        </div>
      </header>

      {/* === Free Training Tab === */}
      {activeTab === 'free' && (
        <div className="px-6 mt-6">
          <button onClick={() => setShowSelector(true)}
            className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-[16px] hover:bg-brand/90 transition-all flex items-center justify-center gap-2">
            <Dumbbell size={22} />
            选择训练动作
          </button>
          <div className="mt-6">
            <WorkoutHistory refreshKey={refreshKey} />
          </div>
        </div>
      )}

      {/* === Training Plan Tab === */}
      {activeTab === 'plan' && (
        <div className="px-6 mt-6 space-y-6">
          {!plan ? (
            <div className="space-y-4">
              <div className="bg-surface-card rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList size={18} className="text-brand" />
                  <h3 className="text-[14px] font-bold text-text-primary">选择训练计划</h3>
                </div>
                <p className="text-[12px] text-text-secondary mb-4">
                  根据你的身体数据自动生成训练计划，包含推荐组数和次数。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleGeneratePlan('3day')}
                    className="w-full bg-surface-subtle rounded-2xl p-4 text-left hover:bg-surface-muted transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <p className="text-[14px] font-bold text-text-primary">三分化训练</p>
                    <p className="text-[12px] text-text-tertiary mt-1">推 / 拉 / 腿 · 循环训练 · 适合新手和中级</p>
                    <p className="text-[11px] text-text-secondary mt-1.5">每周3-6天，每个部位每周练2次</p>
                  </button>
                  <button
                    onClick={() => handleGeneratePlan('5day')}
                    className="w-full bg-surface-subtle rounded-2xl p-4 text-left hover:bg-surface-muted transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <p className="text-[14px] font-bold text-text-primary">五分化训练</p>
                    <p className="text-[12px] text-text-tertiary mt-1">胸 / 背 / 肩 / 腿 / 手臂 · 每日专攻一部位</p>
                    <p className="text-[11px] text-text-secondary mt-1.5">每周5天，每个部位每周练1次 · 适合进阶</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-surface-card rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-bold text-text-primary">{plan.name}</h3>
                  <button
                    onClick={handleResetPlan}
                    className="flex items-center gap-1 text-[11px] text-text-disabled hover:text-destructive transition-colors">
                    <RefreshCw size={13} />
                    重置
                  </button>
                </div>
                <p className="text-[12px] text-text-secondary">
                  生成日期: {planState?.generatedAt} · 逐项完成即可
                </p>
                {plan.days.map((day, dIdx) => {
                  const dayDone = checkDayComplete(plan, planState!, dIdx)
                  const doneCount = day.exercises.filter((_, eIdx) =>
                    planState?.completedExercises[`${dIdx}-${eIdx}`]
                  ).length
                  return (
                    <div key={dIdx} className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {dayDone
                          ? <CheckCircle2 size={16} className="text-success" />
                          : <Circle size={16} className="text-text-disabled" />
                        }
                        <span className="text-[13px] font-bold text-text-primary">{day.dayName}</span>
                        <span className="text-[11px] text-text-tertiary">{day.focus}</span>
                        <span className="ml-auto text-[11px] font-bold text-brand">
                          {doneCount}/{day.exercises.length}
                        </span>
                      </div>
                      <div className="ml-6 space-y-1.5">
                        {day.exercises.map((ex, eIdx) => {
                          const done = planState?.completedExercises[`${dIdx}-${eIdx}`]
                          return (
                            <button
                              key={eIdx}
                              onClick={() => toggleEx(dIdx, eIdx)}
                              className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl transition-colors ${
                                done ? 'bg-success/5' : 'bg-surface-subtle hover:bg-surface-muted'
                              }`}>
                              {done
                                ? <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                                : <Circle size={16} className="text-text-disabled flex-shrink-0" />
                              }
                              <span className={`text-[13px] font-medium flex-1 text-left ${
                                done ? 'text-text-tertiary line-through' : 'text-text-primary'
                              }`}>
                                {ex.name}
                              </span>
                              <span className="text-[11px] text-text-secondary flex-shrink-0">
                                {ex.sets}组 × {ex.reps}
                                {ex.note && <span className="text-text-disabled ml-1">· {ex.note}</span>}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {isPlanComplete(plan, planState!) && (
                  <div className="mt-6 bg-success/10 rounded-2xl p-4 text-center">
                    <CheckCircle2 size={24} className="text-success mx-auto mb-2" />
                    <p className="text-[14px] font-bold text-success">训练计划已完成！</p>
                    <p className="text-[12px] text-text-secondary mt-1">休息一天后可以重置并开始新一轮</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showSelector && (
        <ExerciseSelector
          onSelect={handleSelect}
          onClose={() => { setShowSelector(false); setSelectorGroup(undefined) }}
          defaultGroup={selectorGroup as any}
        />
      )}
    </div>
  )
}
