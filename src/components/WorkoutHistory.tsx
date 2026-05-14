import { useEffect, useState } from 'react'
import type { WorkoutRecord } from '../types'
import { getWorkoutRecords, deleteWorkoutRecord } from '../db/database'
import { useUser } from '../context/UserContext'
import { MUSCLE_GROUPS } from '../types'
import { Trash2, Dumbbell } from 'lucide-react'

interface Props {
  refreshKey: number
}

export default function WorkoutHistory({ refreshKey }: Props) {
  const { currentUserId } = useUser()
  const [records, setRecords] = useState<WorkoutRecord[]>([])

  useEffect(() => {
    getWorkoutRecords(currentUserId, 30).then(setRecords)
  }, [refreshKey, currentUserId])

  async function handleDelete(id: number) {
    await deleteWorkoutRecord(id)
    getWorkoutRecords(currentUserId, 30).then(setRecords)
  }

  function getGroupLabel(key: string) {
    return MUSCLE_GROUPS.find(g => g.key === key)?.label || key
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={48} className="mx-auto text-surface-muted mb-3" />
        <p className="text-text-secondary text-[14px]">还没有训练记录</p>
        <p className="text-text-disabled text-[13px]">开始你的第一次打卡吧</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[12px] text-text-secondary uppercase tracking-[0.05em] px-1">最近训练记录</h3>
      {records.map(record => (
        <div key={record.id} className="bg-surface-card rounded-2xl p-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${
            record.category === 'cardio' ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand'
          }`}>
            {formatDate(record.date)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-text-primary truncate">{record.exerciseName}</p>
            <p className="text-[12px] text-text-tertiary">
              <span className="inline-block bg-surface-muted rounded px-1.5 py-0.5 mr-1 text-text-secondary">
                {getGroupLabel(record.muscleGroup)}
              </span>
              {record.category === 'cardio' ? (
                <>
                  {record.distance != null && <span className="mr-2">{record.distance}km</span>}
                  {record.floors != null && <span className="mr-2">{record.floors}层</span>}
                  {record.time != null && <span>{record.time}min</span>}
                </>
              ) : (
                <>
                  {record.weight != null && <span className="mr-2">{record.weight}kg</span>}
                  <span className="mr-2">{record.reps}次</span>
                  {record.sets != null && <span>{record.sets}组</span>}
                </>
              )}
            </p>
          </div>
          <button onClick={() => record.id && handleDelete(record.id)}
            className="p-2 text-text-disabled hover:text-destructive transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
