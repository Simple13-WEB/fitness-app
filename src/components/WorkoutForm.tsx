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
      sets: isCardio ? undefined : (sets ? Number(sets) : undefined),
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
      <button onClick={onBack} className="self-start py-2 px-4 bg-brand text-white rounded-lg font-bold text-[14px] mb-2">
        &lt; 重新选择动作
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

        {/* 7. 体感备注（弹窗输入） */}
        <div>
          <label className="block text-[11px] text-text-tertiary mb-0.5">体感备注</label>
          <button
            type="button"
            onClick={() => {
              const dialog = document.getElementById('notes-dialog') as HTMLDialogElement | null
              dialog?.showModal()
            }}
            className="w-full px-2 py-1.5 rounded-lg bg-surface-card border border-surface-muted text-text-primary text-[13px] text-left min-h-[38px] flex items-center">
            {notes || <span className="text-text-disabled">点击添加备注...</span>}
          </button>
        </div>

        {/* 体感备注弹窗 */}
        <dialog id="notes-dialog"
          className="rounded-2xl p-0 m-auto bg-surface-card text-text-primary backdrop:bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              (e.currentTarget as HTMLDialogElement).close()
            }
          }}>
          <div className="p-5 w-[90vw] max-w-sm">
            <h4 className="text-[15px] font-bold mb-3">体感备注</h4>
            <textarea
              id="notes-textarea"
              defaultValue={notes}
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-muted text-[14px] text-text-primary focus:outline-none focus:border-brand resize-none"
              placeholder="感受、动作质量等..."
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  const dialog = document.getElementById('notes-dialog') as HTMLDialogElement | null
                  dialog?.close()
                }}
                className="flex-1 py-2.5 rounded-xl bg-surface-muted text-text-secondary text-[14px] font-bold">
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement | null
                  if (textarea) setNotes(textarea.value)
                  const dialog = document.getElementById('notes-dialog') as HTMLDialogElement | null
                  dialog?.close()
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-[14px] font-bold">
                确定
              </button>
            </div>
          </div>
        </dialog>

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
