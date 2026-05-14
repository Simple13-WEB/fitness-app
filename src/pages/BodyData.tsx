import { useState, useEffect } from 'react'
import { getAllBodyData } from '../db/database'
import { useUser } from '../context/UserContext'
import type { BodyData } from '../types'
import BodyDataForm from '../components/BodyDataForm'
import BodyDataHistory from '../components/BodyDataHistory'
import TrendChart from '../components/TrendChart'
import { Plus, History, TrendingUp } from 'lucide-react'

type Tab = 'form' | 'history' | 'trends'

export default function BodyDataPage() {
  const { currentUserId } = useUser()
  const [tab, setTab] = useState<Tab>('form')
  const [refreshKey, setRefreshKey] = useState(0)
  const [allData, setAllData] = useState<BodyData[]>([])

  useEffect(() => {
    getAllBodyData(currentUserId).then(setAllData)
  }, [refreshKey, currentUserId])

  function handleSaved() {
    setRefreshKey(k => k + 1)
    setTab('history')
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">身体数据</h1>
        <p className="text-sm text-gray-400 mt-0.5">记录追踪你的身体指标变化</p>
      </header>

      <div className="flex border-b border-gray-100 bg-white">
        {[
          { key: 'form' as Tab, label: '记录', icon: Plus },
          { key: 'history' as Tab, label: '历史', icon: History },
          { key: 'trends' as Tab, label: '趋势', icon: TrendingUp },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === t.key ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        {tab === 'form' && <BodyDataForm onSaved={handleSaved} />}
        {tab === 'history' && <BodyDataHistory refreshKey={refreshKey} />}
        {tab === 'trends' && (
          <div className="space-y-4">
            <TrendChart data={allData} dataKey="weight" label="体重" color="#3b82f6" unit="kg" />
            <TrendChart data={allData} dataKey="waist" label="腰围" color="#f59e0b" unit="cm" />
            <TrendChart data={allData} dataKey="chest" label="胸围" color="#3b82f6" unit="cm" />
            <TrendChart data={allData} dataKey="leftArm" label="左臂围" color="#6366f1" unit="cm" />
            <TrendChart data={allData} dataKey="leftThigh" label="左腿围" color="#8b5cf6" unit="cm" />
          </div>
        )}
      </div>
    </div>
  )
}
