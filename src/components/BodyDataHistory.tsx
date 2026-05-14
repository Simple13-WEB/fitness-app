import { useEffect, useState } from 'react'
import type { BodyData } from '../types'
import { calcBMI, calcBodyFat } from '../types'
import { getBodyDataList, deleteBodyData } from '../db/database'
import { useUser } from '../context/UserContext'
import { Trash2, ClipboardList } from 'lucide-react'

interface Props {
  refreshKey: number
}

const fieldLabels: Record<string, string> = {
  weight: '体重', height: '身高', neck: '脖围', shoulders: '肩宽',
  leftArm: '左臂围', rightArm: '右臂围', leftForearm: '左小臂围', rightForearm: '右小臂围',
  chest: '胸围', waist: '腰围', leftThigh: '左腿围', rightThigh: '右腿围',
  leftCalf: '左小腿围', rightCalf: '右小腿围',
}

const fieldUnits: Record<string, string> = {
  weight: 'kg', height: 'cm', neck: 'cm', shoulders: 'cm',
  leftArm: 'cm', rightArm: 'cm', leftForearm: 'cm', rightForearm: 'cm',
  chest: 'cm', waist: 'cm', leftThigh: 'cm', rightThigh: 'cm',
  leftCalf: 'cm', rightCalf: 'cm',
}

export default function BodyDataHistory({ refreshKey }: Props) {
  const { currentUserId } = useUser()
  const [records, setRecords] = useState<BodyData[]>([])

  useEffect(() => {
    getBodyDataList(currentUserId, 30).then(setRecords)
  }, [refreshKey, currentUserId])

  async function handleDelete(id: number) {
    await deleteBodyData(id)
    getBodyDataList(currentUserId, 30).then(setRecords)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList size={48} className="mx-auto text-surface-muted mb-3" />
        <p className="text-text-secondary text-[14px]">还没有身体数据记录</p>
        <p className="text-text-disabled text-[13px]">记录你的身体指标以追踪变化</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[12px] text-text-secondary uppercase tracking-[0.05em] px-1">历史记录</h3>
      {records.map(record => {
        const bmi = record.weight && record.height ? calcBMI(record.weight, record.height) : null
        const bf = bmi && record.age ? calcBodyFat(bmi, record.age, record.gender || 'male') : null

        return (
          <div key={record.id} className="bg-surface-card rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-tertiary">{formatDate(record.date)}</span>
              <button
                onClick={() => record.id && handleDelete(record.id)}
                className="p-1 text-text-disabled hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {record.gender && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  {record.gender === 'male' ? '男' : '女'}
                </span>
              )}
              {record.age != null && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  {record.age}岁
                </span>
              )}
              {bmi != null && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  BMI {bmi}
                </span>
              )}
              {bf != null && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                  体脂 {bf}%
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(fieldLabels).map(([key, label]) => {
                const val = (record as any)[key]
                if (val == null) return null
                return (
                  <span key={key} className="text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary">
                    {label} {val}{fieldUnits[key] || ''}
                  </span>
                )
              })}
            </div>
            {record.notes && (
              <p className="text-[12px] text-text-tertiary mt-2">{record.notes}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
