import { useState, useEffect } from 'react'
import type { BodyData, WorkoutRecord } from '../types'
import { getAllBodyData, getAllWorkoutRecords } from '../db/database'
import { useUser } from '../context/UserContext'
import BodyDataForm from '../components/BodyDataForm'
import BodyDataHistory from '../components/BodyDataHistory'
import TrendChart from '../components/TrendChart'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  Plus, History, TrendingUp, Trophy, Dumbbell, Timer, User, X, Trash2, Settings,
} from 'lucide-react'

const MUSCLE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#06b6d4']

type BodyTab = 'form' | 'history' | 'trends'

export default function MyPage() {
  const { currentUserId, currentUserNickname, userList, switchUser, addUser, deleteUser } = useUser()
  const [panelOpen, setPanelOpen] = useState(false)
  const [bodyTab, setBodyTab] = useState<BodyTab>('form')
  const [refreshKey, setRefreshKey] = useState(0)
  const [bodyData, setBodyData] = useState<BodyData[]>([])
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [refreshKey, currentUserId])

  async function loadAllData() {
    const [bd, wr] = await Promise.all([getAllBodyData(currentUserId), getAllWorkoutRecords(currentUserId)])
    setBodyData(bd)
    setWorkouts(wr)
  }

  function handleBodySaved() {
    setRefreshKey(k => k + 1)
    setBodyTab('history')
  }

  function openPanel(tab: BodyTab) {
    setBodyTab(tab)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
  }

  async function confirmAddUser() {
    if (!newNickname.trim()) return
    try {
      const newId = await addUser(newNickname.trim())
      await switchUser(newId)
      setNewNickname('')
      setShowAddUser(false)
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function confirmDeleteUser() {
    setShowDeleteModal(false)
    await deleteUser(currentUserId)
    setRefreshKey(k => k + 1)
  }

  const latestBody = bodyData.length > 0 ? bodyData.reduce((a, b) => a.date > b.date ? a : b) : null

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
    <div className="pb-24 min-h-screen bg-surface-page">
      {/* ===== User Profile Card (replaces the old header) ===== */}
      <div className="bg-surface-card px-6 pt-5 pb-4">
        {/* Avatar + Name + Menu */}
        <div className="flex items-center gap-3.5">
          <div className="size-14 rounded-2xl bg-brand/10 flex items-center justify-center text-[22px] font-bold text-brand flex-shrink-0">
            {currentUserNickname.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-text-primary truncate leading-tight">{currentUserNickname}</p>
            <p className="text-[12px] text-text-tertiary mt-0.5">{userList.length}/5 用户</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="p-2 rounded-xl hover:bg-surface-muted transition-colors"
            >
              <Settings size={18} className="text-text-secondary" />
            </button>
            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-surface-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-surface-muted py-2 min-w-[140px]">
                  {userList.length > 1 && (
                    <button
                      onClick={() => { setShowUserMenu(false); setShowDeleteModal(true) }}
                      className="w-full px-4 py-2.5 text-left text-[13px] text-destructive hover:bg-destructive/5 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> 删除当前用户
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Switcher — pill buttons */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {userList.map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id!)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                u.id === currentUserId
                  ? 'bg-brand text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              {u.nickname}
            </button>
          ))}
          <button
            onClick={() => setShowAddUser(true)}
            disabled={userList.length >= 5}
            className="flex-shrink-0 size-8 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center hover:bg-surface-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="添加用户"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Body Data Header + 记录 button */}
      <div className="bg-surface-card px-6 py-3 flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <User size={16} className="text-brand" />
          <span className="text-[14px] font-bold text-text-primary">身体数据</span>
          {latestBody && <span className="text-[11px] text-text-tertiary">最近: {latestBody.date}</span>}
        </div>
        {!panelOpen ? (
          <button onClick={() => openPanel('form')}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-xl text-[14px] font-medium hover:bg-brand/90 transition-colors">
            <Plus size={15} />
            记录
          </button>
        ) : (
          <button onClick={closePanel}
            className="flex items-center gap-1 px-2 py-1.5 text-text-tertiary hover:text-text-secondary rounded-xl text-[14px]">
            <X size={15} />
            收起
          </button>
        )}
      </div>

      {/* Expandable Body Data Panel */}
      {panelOpen && (
        <div className="bg-surface-card">
          <div className="flex gap-0">
            {/* Main content area */}
            <div className="flex-1 px-4 py-4 min-w-0">
              {bodyTab === 'form' && <BodyDataForm onSaved={handleBodySaved} />}
              {bodyTab === 'history' && <BodyDataHistory refreshKey={refreshKey} />}
              {bodyTab === 'trends' && (
                <div className="space-y-3">
                  <TrendChart data={bodyData} dataKey="weight" label="体重" color="#3b82f6" unit="kg" />
                  <TrendChart data={bodyData} dataKey="waist" label="腰围" color="#f59e0b" unit="cm" />
                  <TrendChart data={bodyData} dataKey="chest" label="胸围" color="#3b82f6" unit="cm" />
                  <TrendChart data={bodyData} dataKey="leftArm" label="左臂围" color="#6366f1" unit="cm" />
                  <TrendChart data={bodyData} dataKey="leftThigh" label="左腿围" color="#8b5cf6" unit="cm" />
                </div>
              )}
            </div>

            {/* Right side tab buttons */}
            <div className="w-14 flex-shrink-0 border-l border-surface-muted flex flex-col py-4 px-2 gap-2">
              <button onClick={() => setBodyTab('form')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] transition-colors ${
                  bodyTab === 'form' ? 'bg-brand/10 text-brand' : 'text-text-disabled hover:bg-surface-muted'
                }`}>
                <Plus size={18} />
                记录
              </button>
              <button onClick={() => setBodyTab('history')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] transition-colors ${
                  bodyTab === 'history' ? 'bg-brand/10 text-brand' : 'text-text-disabled hover:bg-surface-muted'
                }`}>
                <History size={18} />
                历史
              </button>
              <button onClick={() => setBodyTab('trends')}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] transition-colors ${
                  bodyTab === 'trends' ? 'bg-brand/10 text-brand' : 'text-text-disabled hover:bg-surface-muted'
                }`}>
                <TrendingUp size={18} />
                趋势
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training Stats Section */}
      <div className="px-6 mt-6 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-brand" />
          <h2 className="text-[14px] font-bold text-text-primary">训练统计</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="总训练次数" value={workouts.length} unit="次" />
          <StatCard label="力量训练" value={strengthRecords.length} unit="次" />
          <StatCard label="有氧训练" value={cardioRecords.length} unit="次" />
        </div>

        {(totalCardioKm > 0 || totalCardioMin > 0) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
              <p className="text-[11px] text-text-tertiary mb-1">有氧总里程</p>
              <p className="text-[20px] font-bold text-text-primary">{Math.round(totalCardioKm * 10) / 10}<span className="text-[13px] text-text-tertiary ml-1">km</span></p>
              <p className="text-[10px] text-text-disabled mt-1">40层楼 = 1km</p>
            </div>
            <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
              <p className="text-[11px] text-text-tertiary mb-1">有氧总时长</p>
              <p className="text-[20px] font-bold text-text-primary">{totalCardioMin}<span className="text-[13px] text-text-tertiary ml-1">min</span></p>
            </div>
          </div>
        )}

        {topWeight.length > 0 && (
          <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-brand" /> 最大重量 Top 3
            </h3>
            {topWeight.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 py-1.5">
                <span className={`text-[14px] font-bold w-6 ${i === 0 ? 'text-brand' : 'text-text-disabled'}`}>#{i + 1}</span>
                <span className="flex-1 text-[14px] text-text-primary truncate">{r.exerciseName}</span>
                <span className="text-[14px] font-bold text-brand">{r.weight}kg</span>
              </div>
            ))}
          </div>
        )}

        {topReps.length > 0 && (
          <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <Dumbbell size={16} className="text-brand" /> 最多次数 Top 3
            </h3>
            {topReps.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 py-1.5">
                <span className={`text-[14px] font-bold w-6 ${i === 0 ? 'text-brand' : 'text-text-disabled'}`}>#{i + 1}</span>
                <span className="flex-1 text-[14px] text-text-primary truncate">{r.exerciseName}</span>
                <span className="text-[14px] font-bold text-brand">{r.reps}次</span>
              </div>
            ))}
          </div>
        )}

        {topCardioDist.length > 0 && (
          <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <Timer size={16} className="text-brand" /> 有氧里程 Top 3
            </h3>
            {topCardioDist.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 py-1.5">
                <span className={`text-[14px] font-bold w-6 ${i === 0 ? 'text-brand' : 'text-text-disabled'}`}>#{i + 1}</span>
                <span className="flex-1 text-[14px] text-text-primary truncate">{r.exerciseName}</span>
                <span className="text-[14px] font-bold text-brand">{Math.round(r.totalKm * 10) / 10}km</span>
              </div>
            ))}
          </div>
        )}

        {weightTrend.length >= 2 && (
          <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand" /> 体重变化趋势
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9B9B9B" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9B9B9B" width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E6E1', fontSize: 13 }} />
                <Bar dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} name="体重 (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[14px] font-bold text-text-primary mb-3">训练部位分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E6E1', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map(d => (
                <span key={d.name} className="text-[11px] flex items-center gap-1 text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                  {d.name} {d.value}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ===== Add User Modal ===== */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => { setShowAddUser(false); setNewNickname('') }}>
          <div className="bg-surface-card rounded-2xl p-6 w-full max-w-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            onClick={e => e.stopPropagation()}>
            <p className="text-[18px] font-bold text-text-primary mb-1">添加用户</p>
            <p className="text-[13px] text-text-tertiary mb-5">创建一个新的用户档案，数据互相独立</p>

            <label className="block text-[12px] text-text-secondary mb-1.5">用户昵称</label>
            <input
              type="text"
              value={newNickname}
              onChange={e => setNewNickname(e.target.value)}
              placeholder="请输入昵称"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-surface-muted text-[16px] text-text-primary focus:outline-none focus:border-brand"
              autoFocus
            />
            <p className="text-[11px] text-text-tertiary mt-1.5">最多 10 个字符，不可与其他用户重名</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddUser(false); setNewNickname('') }}
                className="flex-1 py-3 bg-surface-muted text-text-secondary rounded-xl text-[15px] font-medium">
                取消
              </button>
              <button
                onClick={confirmAddUser}
                disabled={!newNickname.trim()}
                className="flex-1 py-3 bg-brand text-white rounded-xl text-[15px] font-medium disabled:opacity-40">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete User Modal ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowDeleteModal(false)}>
          <div className="bg-surface-card rounded-2xl p-6 w-full max-w-[320px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            onClick={e => e.stopPropagation()}>
            <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-destructive" />
            </div>
            <p className="text-[17px] font-bold text-text-primary text-center mb-1">删除用户</p>
            <p className="text-[13px] text-text-secondary text-center mb-6">
              确定删除 "{currentUserNickname}" 及其所有数据？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-surface-muted text-text-secondary rounded-xl text-[14px] font-medium">
                取消返回
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-2.5 bg-destructive text-white rounded-xl text-[14px] font-medium">
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
      <p className="text-[20px] font-bold text-brand">{value}</p>
      <p className="text-[11px] text-text-tertiary mt-1">{unit}</p>
      <p className="text-[11px] text-text-tertiary">{label}</p>
    </div>
  )
}
