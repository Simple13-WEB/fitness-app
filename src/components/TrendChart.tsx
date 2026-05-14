import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { BodyData } from '../types'

interface Props {
  data: BodyData[]
  dataKey: keyof BodyData
  label: string
  color: string
  unit: string
}

export default function TrendChart({ data, dataKey, label, color, unit }: Props) {
  const chartData = [...data]
    .filter(d => d[dataKey] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ date: d.date.slice(5), value: d[dataKey] }))

  if (chartData.length < 2) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h4 className="text-[12px] text-text-secondary uppercase tracking-[0.05em] mb-3">{label}趋势</h4>
        <p className="text-text-disabled text-[13px]">数据不足，至少需要2条记录</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h4 className="text-[12px] text-text-secondary uppercase tracking-[0.05em] mb-3">{label}趋势 ({unit})</h4>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9B9B9B" />
          <YAxis tick={{ fontSize: 10 }} stroke="#9B9B9B" width={40} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E6E1', fontSize: 13 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
            dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
