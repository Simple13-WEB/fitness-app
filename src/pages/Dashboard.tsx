import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BodyData, WorkoutRecord } from '../types'
import { calcBMI, calcBodyFat } from '../types'
import {
  getAllBodyData, getAllWorkoutRecords, getRecentWorkoutDate, getWorkoutCountByGroup,
} from '../db/database'
import { useUser } from '../context/UserContext'
import { generateSuggestions, type Suggestion } from '../utils/suggestions'
import SuggestionCard from '../components/SuggestionCard'
import TopRecords from '../components/TopRecords'
import { Dumbbell, ClipboardList, Flame, TrendingUp, Activity, CalendarDays } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUserId } = useUser()
  const [bodyData, setBodyData] = useState<BodyData[]>([])
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({})

  useEffect(() => { loadData() }, [currentUserId])

  async function loadData() {
    const [bd, wr, lwd, gc] = await Promise.all([
      getAllBodyData(currentUserId), getAllWorkoutRecords(currentUserId), getRecentWorkoutDate(currentUserId), getWorkoutCountByGroup(currentUserId),
    ])
    setBodyData(bd); setWorkouts(wr); setLastWorkoutDate(lwd); setGroupCounts(gc)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setWeeklyCount(new Set(wr.filter(w => w.date >= weekAgo).map(w => w.date)).size)
    setSuggestions(generateSuggestions(bd, wr))
  }

  const latestBody = bodyData.length > 0 ? bodyData.reduce((a, b) => a.date > b.date ? a : b) : null
  const trainedToday = lastWorkoutDate === new Date().toISOString().split('T')[0]
  const bodyFatVal = (() => {
    if (!latestBody?.weight || !latestBody?.height || !latestBody?.age) return null
    return calcBodyFat(calcBMI(latestBody.weight, latestBody.height), latestBody.age, latestBody.gender || 'male')
  })()

  return (
    <div className="pb-24 min-h-screen">
      {/* Hero — Type A card: greeting + quick stats */}
      <div className="mx-6 mt-6 bg-surface-card rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <Activity size={18} className="text-brand" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-text-primary">健身助手</h1>
            <p className="text-[12px] text-text-tertiary">
              {trainedToday ? '今天已打卡，太棒了！' : '今天也要加油哦！'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <QuickStat icon={<CalendarDays size={15} />} value={weeklyCount} unit="天/周" label="训练天数" />
          <QuickStat icon={<Flame size={15} />} value={workouts.length} unit="次" label="总打卡" />
          <QuickStat icon={<Activity size={15} />} value={latestBody?.weight ?? '-'} unit="kg" label="体重" />
          <QuickStat icon={<TrendingUp size={15} />} value={bodyFatVal != null ? `${bodyFatVal}%` : '-'} unit="" label="体脂率" />
        </div>
      </div>

      {/* Theme Row — Type B grid (px-6) */}
      <div className="px-6 mt-6">
        <div className="flex gap-3">
          <button onClick={() => navigate('/my')}
            className="flex-1 bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-shadow flex items-center gap-3">
            <div className="size-7 rounded-lg bg-brand/10 flex items-center justify-center">
              <ClipboardList className="size-4 text-brand" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold text-text-primary">记录身体数据</p>
              <p className="text-[11px] text-text-tertiary">体重、围度等</p>
            </div>
          </button>
          <button onClick={() => navigate('/workout')}
            className="flex-1 bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-shadow flex items-center gap-3">
            <div className="size-7 rounded-lg bg-brand/10 flex items-center justify-center">
              <Dumbbell className="size-4 text-brand" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold text-text-primary">开始健身打卡</p>
              <p className="text-[11px] text-text-tertiary">选择动作记录</p>
            </div>
          </button>
        </div>
      </div>

      {/* Latest body — Type A card (mx-6) */}
      {latestBody && (
        <div className="mx-6 mt-6 bg-surface-card rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-brand" />
            <h3 className="text-[14px] font-bold text-text-primary">最新身体数据</h3>
            <span className="text-[11px] text-text-tertiary ml-auto">{latestBody.date}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {latestBody.weight != null && <Chip label="体重" value={`${latestBody.weight}kg`} />}
            {latestBody.waist != null && <Chip label="腰围" value={`${latestBody.waist}cm`} />}
            {latestBody.chest != null && <Chip label="胸围" value={`${latestBody.chest}cm`} />}
            {bodyFatVal != null && <Chip label="体脂" value={`${bodyFatVal}%`} />}
          </div>
        </div>
      )}

      {/* Training distribution — Type A card (mx-6) */}
      {Object.keys(groupCounts).length > 0 && (
        <div className="mx-6 mt-6 bg-surface-card rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-[14px] font-bold text-text-primary mb-3">训练部位分布</h3>
          <div className="space-y-2.5">
            {Object.entries(groupCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([group, count]) => (
              <div key={group} className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold w-7 text-text-secondary">{groupLabels[group] || group}</span>
                <div className="flex-1 bg-surface-muted rounded-full h-4 overflow-hidden">
                  <div className="h-full bg-brand rounded-full"
                    style={{ width: `${Math.min(100, (count / Math.max(...Object.values(groupCounts))) * 100)}%` }} />
                </div>
                <span className="text-[11px] font-bold text-text-primary w-8 text-right">{count}组</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Records — Type A card (mx-6, handled by component) */}
      <div className="mx-6 mt-6">
        <TopRecords workouts={workouts} />
      </div>

      {/* Suggestions — labels outside cards */}
      <div className="px-6 mt-6 space-y-2 pb-4">
        <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-[0.05em]">训练建议</h3>
        {suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
      </div>
    </div>
  )
}

function QuickStat({ icon, value, unit, label }: {
  icon: React.ReactNode; value: string | number; unit: string; label: string
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1 text-brand">{icon}</div>
      <p className="text-[17px] font-bold text-text-primary">{value}<span className="text-[11px] text-text-tertiary ml-0.5">{unit}</span></p>
      <p className="text-[11px] text-text-tertiary">{label}</p>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-subtle text-[12px] font-medium">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-bold">{value}</span>
    </span>
  )
}

const groupLabels: Record<string, string> = {
  chest: '胸', shoulder: '肩', back: '背', abs: '腹',
  legs: '腿', glutes: '臀', cardio: '有氧',
}
