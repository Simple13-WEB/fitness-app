import { useState, useMemo } from 'react'
import type { BodyData } from '../types'
import { calcBMI, calcBodyFat } from '../types'
import { addBodyData } from '../db/database'
import { useUser } from '../context/UserContext'
import { Save, X, Ruler } from 'lucide-react'

interface Props {
  onSaved: () => void
}

interface MeasurePoint {
  key: string
  label: string
  unit: string
  cx: number
  cy: number
  r?: number
  rx?: number
  ry?: number
  x?: number
  y?: number
  w?: number
  h?: number
}

const measurePoints: MeasurePoint[] = [
  { key: 'neck', label: '脖围', unit: 'cm', cx: 140, cy: 42, r: 12 },
  { key: 'shoulders', label: '肩宽', unit: 'cm', cx: 140, cy: 82, r: 14 },
  { key: 'leftArm', label: '左臂围', unit: 'cm', cx: 72, cy: 150, r: 13 },
  { key: 'rightArm', label: '右臂围', unit: 'cm', cx: 208, cy: 150, r: 13 },
  { key: 'leftForearm', label: '左小臂围', unit: 'cm', cx: 64, cy: 195, r: 11 },
  { key: 'rightForearm', label: '右小臂围', unit: 'cm', cx: 216, cy: 195, r: 11 },
  { key: 'chest', label: '胸围', unit: 'cm', cx: 140, cy: 120, r: 15 },
  { key: 'waist', label: '腰围', unit: 'cm', cx: 140, cy: 170, r: 13 },
  { key: 'leftThigh', label: '左腿围', unit: 'cm', cx: 104, cy: 250, r: 13 },
  { key: 'rightThigh', label: '右腿围', unit: 'cm', cx: 176, cy: 250, r: 13 },
  { key: 'leftCalf', label: '左小腿围', unit: 'cm', cx: 100, cy: 310, r: 11 },
  { key: 'rightCalf', label: '右小腿围', unit: 'cm', cx: 180, cy: 310, r: 11 },
]

export default function BodyDataForm({ onSaved }: Props) {
  const { currentUserId } = useUser()
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [activePoint, setActivePoint] = useState<string | null>(null)

  function setField(key: string, value: string) {
    setMeasurements(prev => ({ ...prev, [key]: value }))
  }

  function getVal(key: string): string {
    return measurements[key] || ''
  }

  const bmi = useMemo(() => {
    const w = weight ? Number(weight) : 0
    const h = height ? Number(height) : 0
    if (w > 0 && h > 0) return calcBMI(w, h)
    return null
  }, [weight, height])

  const bodyFat = useMemo(() => {
    const a = age ? Number(age) : 0
    if (bmi != null && a > 0) return calcBodyFat(bmi, a, gender)
    return null
  }, [bmi, age, gender])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasData = [age, height, weight, ...Object.values(measurements)].some(v => v !== '')
    if (!hasData) return

    setSaving(true)
    const data: BodyData = {
      userId: currentUserId,
      date: new Date().toISOString().split('T')[0],
      gender,
      age: age ? Number(age) : undefined,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      neck: measurements.neck ? Number(measurements.neck) : undefined,
      shoulders: measurements.shoulders ? Number(measurements.shoulders) : undefined,
      leftArm: measurements.leftArm ? Number(measurements.leftArm) : undefined,
      rightArm: measurements.rightArm ? Number(measurements.rightArm) : undefined,
      leftForearm: measurements.leftForearm ? Number(measurements.leftForearm) : undefined,
      rightForearm: measurements.rightForearm ? Number(measurements.rightForearm) : undefined,
      chest: measurements.chest ? Number(measurements.chest) : undefined,
      waist: measurements.waist ? Number(measurements.waist) : undefined,
      leftThigh: measurements.leftThigh ? Number(measurements.leftThigh) : undefined,
      rightThigh: measurements.rightThigh ? Number(measurements.rightThigh) : undefined,
      leftCalf: measurements.leftCalf ? Number(measurements.leftCalf) : undefined,
      rightCalf: measurements.rightCalf ? Number(measurements.rightCalf) : undefined,
      notes: notes || undefined,
    }

    await addBodyData(data)
    setSaving(false)
    setMeasurements({})
    setNotes('')
    setActivePoint(null)
    onSaved()
  }

  const inputClass = "w-full px-3 py-2 rounded-xl bg-surface-card border border-surface-muted text-center text-[14px] font-medium text-text-primary focus:outline-none focus:border-brand"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic info */}
      <div>
        <label className="block text-[11px] text-text-tertiary mb-1.5">性别</label>
        <div className="flex gap-2">
          {(['male', 'female'] as const).map(g => (
            <button key={g} type="button" onClick={() => setGender(g)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                gender === g ? 'bg-brand text-white' : 'bg-surface-muted text-text-disabled'
              }`}>
              {g === 'male' ? '男' : '女'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-text-tertiary mb-1.5">年龄</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className={inputClass} inputMode="numeric" />
        </div>
        <div>
          <label className="block text-[11px] text-text-tertiary mb-1.5">身高 (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className={inputClass} inputMode="decimal" />
        </div>
        <div>
          <label className="block text-[11px] text-text-tertiary mb-1.5">体重 (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className={inputClass} inputMode="decimal" />
        </div>
      </div>

      {/* BMI / BodyFat */}
      <div className="grid grid-cols-2 gap-3 bg-brand/5 rounded-2xl p-3">
        <div className="text-center">
          <p className="text-[11px] text-brand/70">BMI</p>
          <p className="text-[18px] font-bold text-text-primary">{bmi ?? '—'}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-brand/70">体脂率</p>
          <p className="text-[18px] font-bold text-text-primary">{bodyFat != null ? `${bodyFat}%` : '—'}</p>
        </div>
      </div>

      {/* Body Model */}
      <div className="bg-surface-card rounded-2xl p-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 px-2 py-2">
          <Ruler size={14} className="text-brand" />
          <span className="text-[12px] text-text-tertiary">点击身体部位输入围度数据</span>
        </div>

        <div className="relative flex justify-center">
          <svg viewBox="0 0 280 380" className="w-full max-w-[280px] h-auto">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Head */}
            <ellipse cx="140" cy="22" rx="14" ry="18" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
            <line x1="140" y1="40" x2="140" y2="52" stroke="#d1d5db" strokeWidth="1.5" />
            {/* Body */}
            <rect x="90" y="52" width="100" height="95" rx="12" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
            {/* Arms */}
            <path d="M90 65 Q60 100 60 160 L56 200" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M190 65 Q220 100 220 160 L224 200" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M56 200 L52 230" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M224 200 L228 230" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="52" cy="235" r="5" fill="none" stroke="#d1d5db" strokeWidth="1" />
            <circle cx="228" cy="235" r="5" fill="none" stroke="#d1d5db" strokeWidth="1" />
            {/* Legs */}
            <path d="M110 147 L105 210 L100 280 L96 340" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M170 147 L175 210 L180 280 L184 340" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="96" cy="348" rx="14" ry="5" fill="none" stroke="#d1d5db" strokeWidth="1" />
            <ellipse cx="184" cy="348" rx="14" ry="5" fill="none" stroke="#d1d5db" strokeWidth="1" />

            {/* Measurement dots */}
            {measurePoints.map(pt => {
              const hasValue = getVal(pt.key) !== ''
              const isActive = activePoint === pt.key
              const color = hasValue ? '#3b82f6' : isActive ? '#6366f1' : '#d1d5db'
              const fill = hasValue ? '#3b82f6' : isActive ? '#6366f1' : '#ffffff'
              const size = hasValue ? (pt.r || 12) + 2 : (pt.r || 12)

              return (
                <g key={pt.key} className="cursor-pointer" onClick={() => setActivePoint(activePoint === pt.key ? null : pt.key)}>
                  <circle cx={pt.cx} cy={pt.cy} r={size + 8} fill="transparent" />
                  <circle cx={pt.cx} cy={pt.cy} r={size} fill={fill} stroke={color} strokeWidth="2"
                    className="transition-all duration-200" filter={isActive ? 'url(#glow)' : undefined} />
                  <text x={pt.cx} y={pt.cy + 1} textAnchor="middle" dominantBaseline="central"
                    fill={hasValue || isActive ? '#ffffff' : '#9ca3af'} fontSize="8" fontWeight="bold"
                    className="pointer-events-none select-none">
                    {pt.label.slice(0, 2)}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Active point input popup */}
          {activePoint && (() => {
            const pt = measurePoints.find(p => p.key === activePoint)!
            return (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-surface-card rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-3 z-10 flex items-center gap-2 anim-slide-up">
                <span className="text-[14px] font-medium text-text-primary whitespace-nowrap">{pt.label}</span>
                <input
                  type="number"
                  value={getVal(activePoint)}
                  onChange={e => setField(activePoint, e.target.value)}
                  placeholder="0"
                  className="w-20 px-2 py-1.5 rounded-xl border border-surface-muted text-center text-[14px] focus:outline-none focus:border-brand"
                  inputMode="decimal"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setActivePoint(null) } }}
                />
                <span className="text-[11px] text-text-tertiary">cm</span>
                <button type="button" onClick={() => setActivePoint(null)}
                  className="p-1 hover:bg-surface-muted rounded-full">
                  <X size={14} className="text-text-tertiary" />
                </button>
              </div>
            )
          })()}
        </div>

        {/* Measurement summary bar */}
        {Object.keys(measurements).some(k => measurements[k] !== '') && (
          <div className="flex flex-wrap gap-1.5 px-2 py-2 mt-1">
            {measurePoints.filter(pt => getVal(pt.key) !== '').map(pt => (
              <span key={pt.key}
                onClick={() => setActivePoint(pt.key)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-brand/10 text-brand cursor-pointer hover:bg-brand/20 transition-colors">
                {pt.label} {getVal(pt.key)}cm
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[11px] text-text-tertiary mb-1.5">备注</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="心情、身体感受等..."
          className="w-full px-3 py-2.5 rounded-xl bg-surface-card border border-surface-muted text-text-primary text-[14px] focus:outline-none focus:border-brand" />
      </div>

      <button type="submit" disabled={saving}
        className="w-full py-3 bg-brand text-white rounded-xl font-bold text-[16px] hover:bg-brand/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
        <Save size={20} />
        {saving ? '保存中...' : '记录身体数据'}
      </button>
    </form>
  )
}
