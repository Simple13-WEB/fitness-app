import type { WorkoutRecord } from '../types'
import { Trophy } from 'lucide-react'

interface Props {
  workouts: WorkoutRecord[]
}

interface TopItem {
  exerciseName: string
  weight?: number
  reps?: number
  distance?: number
  floors?: number
  time?: number
  date: string
}

function getStrengthTop1(workouts: WorkoutRecord[]): TopItem | null {
  let best: WorkoutRecord | null = null
  for (const w of workouts) {
    if (w.category !== 'strength' || w.weight == null) continue
    if (!best || (w.weight || 0) > (best.weight || 0)) {
      best = w
    }
  }
  if (!best) return null
  return {
    exerciseName: best.exerciseName,
    weight: best.weight,
    reps: best.reps,
    date: best.date,
  }
}

function getCardioTop1(workouts: WorkoutRecord[]): TopItem | null {
  let best: WorkoutRecord | null = null
  let bestKm = 0
  for (const w of workouts) {
    if (w.category !== 'cardio') continue
    const wKm = (w.distance || 0) + (w.floors || 0) / 40
    if (!best || wKm > bestKm) {
      best = w
      bestKm = wKm
    }
  }
  if (!best) return null
  return {
    exerciseName: best.exerciseName,
    distance: best.distance,
    floors: best.floors,
    time: best.time,
    date: best.date,
  }
}

function formatDate(dateStr: string) {
  return dateStr.slice(5)
}

export default function TopRecords({ workouts }: Props) {
  const strengthTop = getStrengthTop1(workouts)
  const cardioTop = getCardioTop1(workouts)

  return (
    <div className="bg-surface-card rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-subtle">
        <Trophy size={16} className="text-brand" />
        <h3 className="text-[14px] font-bold text-text-primary">TOP 记录</h3>
        <span className="text-[11px] text-text-tertiary">各项目最佳成绩</span>
      </div>

      {/* 抗阻TOP */}
      <div className="px-4 py-3">
        <p className="text-[11px] font-medium text-text-secondary mb-2">抗阻 TOP</p>
        {strengthTop ? (
          <table className="w-full text-[13px] table-fixed">
            <thead>
              <tr className="text-[11px] text-text-tertiary">
                <th className="text-left pb-1.5 font-medium w-[40%]">动作</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">重量 (kg)</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">次数</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">日期</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 text-text-primary font-medium truncate">{strengthTop.exerciseName}</td>
                <td className="py-1.5 font-bold text-brand">{strengthTop.weight}</td>
                <td className="py-1.5 text-text-secondary">{strengthTop.reps ?? '-'}</td>
                <td className="py-1.5 text-text-tertiary text-[11px]">{formatDate(strengthTop.date)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-[11px] text-text-disabled py-2">完成力量训练后将展示最佳成绩</p>
        )}
      </div>

      {/* 有氧TOP */}
      <div className="px-4 py-3">
        <p className="text-[11px] font-medium text-text-secondary mb-2">有氧 TOP</p>
        {cardioTop ? (
          <table className="w-full text-[13px] table-fixed">
            <thead>
              <tr className="text-[11px] text-text-tertiary">
                <th className="text-left pb-1.5 font-medium w-[40%]">动作</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">里程</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">耗时 (min)</th>
                <th className="text-left pb-1.5 font-medium w-[20%]">日期</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 text-text-primary font-medium truncate">{cardioTop.exerciseName}</td>
                <td className="py-1.5 font-bold text-brand">
                  {cardioTop.floors ? `${cardioTop.floors}层` : `${cardioTop.distance}km`}
                </td>
                <td className="py-1.5 text-text-secondary">{cardioTop.time ?? '-'}</td>
                <td className="py-1.5 text-text-tertiary text-[11px]">{formatDate(cardioTop.date)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-[11px] text-text-disabled py-2">完成有氧运动后将展示最佳成绩</p>
        )}
      </div>
    </div>
  )
}
