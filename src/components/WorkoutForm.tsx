import { useState } from 'react'
import type { Exercise, WorkoutRecord } from '../types'
import { addWorkoutRecord } from '../db/database'
import { useUser } from '../context/UserContext'
import ExerciseAnimation from './ExerciseAnimation'
import { Save } from 'lucide-react'

interface Props {
  exercise: Exercise
  onSaved: () => void
  onBack: () => void
}

export default function WorkoutForm({ exercise, onSaved, onBack }: Props) {
  const { currentUserId } = useUser()
  const isCardio = exercise.category === 'cardio'

  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState('3')
  const [distance, setDistance] = useState('')
  const [time, setTime] = useState('')
  const [floors, setFloors] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isCardio && !reps) return
    if (isCardio && !time) return

    setSaving(true)
    const record: WorkoutRecord = {
      userId: currentUserId,
      date: new Date().toISOString().split('T')[0],
      muscleGroup: exercise.muscleGroup,
      exerciseName: exercise.name,
      category: exercise.category,
      weight: weight ? Number(weight) : undefined,
      reps: reps ? Number(reps) : undefined,
      sets: sets ? Number(sets) : undefined,
      distance: distance ? Number(distance) : undefined,
      time: time ? Number(time) : undefined,
      floors: floors ? Number(floors) : undefined,
      notes: notes || undefined,
    }

    await addWorkoutRecord(record)
    setSaving(false)
    onSaved()
  }

  const inputClass = "w-full px-2 py-2 rounded-lg bg-surface-card border border-surface-muted text-center text-[14px] font-medium text-text-primary focus:outline-none focus:border-brand"

  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="self-start text-brand text-[13px] mb-1">
        ← 返回
      </button>

      {/* 1. 动作名称 */}
      <h3 className="font-bold text-[16px] text-text-primary">{exercise.name}</h3>
      {/* 2. 动作说明 */}
      <p className="text-[12px] text-text-tertiary mb-1">{exercise.description}</p>
      {/* 3. 起始帧和结束帧轮播图 */}
      <ExerciseAnimation exercise={exercise} size="lg" />

      {/* 4. 动作要领 */}
      {exercise.cues && (
        <div className="bg-surface-subtle rounded-lg p-2 mt-1">
          <p className="text-[11px] font-bold text-text-secondary">动作要领</p>
          <p className="text-[12px] text-text-primary leading-snug">{exercise.cues}</p>
        </div>
      )}
      {/* 5. 注意事项 */}
      {exercise.precautions && (
        <div className="bg-orange-50 rounded-lg p-2 mt-1 border border-orange-100">
          <p className="text-[11px] font-bold text-orange-600">注意事项</p>
          <p className="text-[12px] text-text-primary leading-snug">{exercise.precautions}</p>
        </div>
      )}

      {/* 6. 输入项 */}
      <form onSubmit={handleSubmit} className="mt-1.5 space-y-1.5 flex-1">
        {isCardio ? (
          exercise.id === 'cardio-rope' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">次数</label>
                <input type="number" value={reps} onChange={e => setReps(e.target.value)}
                  placeholder="0" className={inputClass} inputMode="numeric" />
              </div>
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">耗时 (分钟)</label>
                <input type="number" value={time} onChange={e => setTime(e.target.value)}
                  placeholder="0" required className={inputClass} inputMode="decimal" />
              </div>
            </div>
          ) : exercise.id === 'cardio-stairs' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">楼层数</label>
                <input type="number" value={floors} onChange={e => setFloors(e.target.value)}
                  placeholder="0" className={inputClass} inputMode="numeric" />
              </div>
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">耗时 (分钟)</label>
                <input type="number" value={time} onChange={e => setTime(e.target.value)}
                  placeholder="0" required className={inputClass} inputMode="decimal" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">公里数</label>
                <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
                  placeholder="0" className={inputClass} inputMode="decimal" />
              </div>
              <div>
                <label className="block text-[11px] text-text-tertiary mb-0.5">耗时 (分钟)</label>
                <input type="number" value={time} onChange={e => setTime(e.target.value)}
                  placeholder="0" required className={inputClass} inputMode="decimal" />
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-text-tertiary mb-0.5">重量 (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="0" className={inputClass} inputMode="decimal" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary mb-0.5">次数</label>
              <input type="number" value={reps} onChange={e => setReps(e.target.value)}
                placeholder="0" required className={inputClass} inputMode="numeric" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary mb-0.5">组数</label>
              <input type="number" value={sets} onChange={e => setSets(e.target.value)}
                placeholder="3" className={inputClass} inputMode="numeric" />
            </div>
          </div>
        )}

        {/* 7. 体感备注 */}
        <div>
          <label className="block text-[11px] text-text-tertiary mb-0.5">体感备注</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="感受、动作质量等..." className="w-full px-2 py-1.5 rounded-lg bg-surface-card border border-surface-muted text-text-primary text-[13px] focus:outline-none focus:border-brand" />
        </div>

        {/* 8. 记录打卡 */}
        <button type="submit" disabled={saving}
          className="w-full py-2 bg-brand text-white rounded-lg font-bold text-[14px] hover:bg-brand/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5">
          <Save size={16} />
          {saving ? '保存中...' : '记录打卡'}
        </button>
      </form>
    </div>
  )
}
