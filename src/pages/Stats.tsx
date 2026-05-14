import { useEffect, useState } from 'react'
import type { BodyData, WorkoutRecord } from '../types'
import { getAllBodyData, getAllWorkoutRecords } from '../db/database'
import { useUser } from '../context/UserContext'
import { generateSuggestions, type Suggestion } from '../utils/suggestions'
import SuggestionCard from '../components/SuggestionCard'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Trophy, Dumbbell, Timer, TrendingUp } from 'lucide-react'

const MUSCLE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#06b6d4']

export default function StatsPage() {
  const { currentUserId } = useUser()
  const [bodyData, setBodyData] = useState<BodyData[]>([])
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    (async () => {
      const [bd, wr] = await Promise.all([getAllBodyData(currentUserId), getAllWorkoutRecords(currentUserId)])
      setBodyData(bd)
      setWorkouts(wr)
      setSuggestions(generateSuggestions(bd, wr))
    })()
  }, [currentUserId])

  const strengthRecords = workouts.filter(w => w.category === 'strength' && w.weight != null)
  const topWeight = [...strengthRecords].sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 3)
  const topReps = [...strengthRecords].filter(r => r.reps != null).sort((a, b) => (b.reps || 0) - (a.reps || 0)).slice(0, 3)

  const cardioRecords = workouts.filter(w => w.category === 'cardio')
  const cardioWithKm = cardioRecords.map(r => {
    let totalKm = r.distance || 0
    if (r.floors) totalKm += r.floors / 40
    return { ...r, totalKm }
  })
  const topCardioDist = [...cardioWithKm].sort((a, b) => b.totalKm - a.totalKm).slice(0, 3)
  const totalCardioKm = cardioWithKm.reduce((sum, r) => sum + r.totalKm, 0)
  const totalCardioMin = cardioRecords.reduce((sum, r) => sum + (r.time || 0), 0)

  const groups = new Map<string, number>()
  for (const w of workouts) {
    groups.set(w.muscleGroup, (groups.get(w.muscleGroup) || 0) + (w.sets || 1))
  }
  const groupLabels: Record<string, string> = {
    chest: '胸', shoulder: '肩', back: '背', abs: '腹',
    legs: '腿', glutes: '臀', cardio: '有氧',
  }
  const pieData = Array.from(groups.entries()).map(([key, value], i) => ({
    name: groupLabels[key] || key, value,
    color: MUSCLE_COLORS[i % MUSCLE_COLORS.length],
  }))

  const weightTrend = [...bodyData]
    .filter(b => b.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(b => ({ date: b.date!.slice(5), weight: b.weight }))

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">数据分析</h1>
        <p className="text-sm text-gray-400 mt-0.5">训练统计与智能建议</p>
      </header>

      <div className="px-4 mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="总训练次数" value={workouts.length} unit="次" />
          <StatCard label="力量训练" value={strengthRecords.length} unit="次" />
          <StatCard label="有氧训练" value={cardioRecords.length} unit="次" />
        </div>

        {(totalCardioKm > 0 || totalCardioMin > 0) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 mb-1">有氧总里程</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(totalCardioKm * 10) / 10}<span className="text-sm text-gray-400 ml-1">km</span></p>
              <p className="text-xs text-gray-300 mt-1">40层楼 = 1km</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-400 mb-1">有氧总时长</p>
              <p className="text-2xl font-bold text-gray-900">{totalCardioMin}<span className="text-sm text-gray-400 ml-1">min</span></p>
            </div>
          </div>
        )}

        {topWeight.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> 最大重量 Top 3
            </h3>
            <div className="space-y-2">
              {topWeight.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>#{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-900 truncate">{r.exerciseName}</span>
                  <span className="text-sm font-bold text-primary-500">{r.weight}kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topReps.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <Dumbbell size={16} className="text-primary-500" /> 最多次数 Top 3
            </h3>
            <div className="space-y-2">
              {topReps.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>#{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-900 truncate">{r.exerciseName}</span>
                  <span className="text-sm font-bold text-primary-500">{r.reps}次</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topCardioDist.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <Timer size={16} className="text-green-500" /> 有氧里程 Top 3
            </h3>
            <div className="space-y-2">
              {topCardioDist.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>#{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-900 truncate">{r.exerciseName}</span>
                  <span className="text-sm font-bold text-green-500">{Math.round(r.totalKm * 10) / 10}km</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {weightTrend.length >= 2 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-500" /> 体重变化趋势
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#ccc" />
                <YAxis tick={{ fontSize: 10 }} stroke="#ccc" width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 13 }} />
                <Bar dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} name="体重 (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-3">训练部位分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map(d => (
                <span key={d.name} className="text-xs flex items-center gap-1 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                  {d.name} {d.value}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-bold text-sm text-gray-400">训练建议</h3>
          {suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
      <p className="text-2xl font-bold text-primary-500">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{unit}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
