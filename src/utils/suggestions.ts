import type { BodyData, WorkoutRecord } from '../types'
import { calcBMI, calcBodyFat } from '../types'
import { MUSCLE_GROUPS } from '../types'

export interface Suggestion {
  type: 'warning' | 'info' | 'success' | 'tip'
  title: string
  detail: string
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function getLatest<T extends { date: string }>(items: T[]): T | null {
  if (items.length === 0) return null
  return items.reduce((a, b) => (a.date > b.date ? a : b))
}

export function generateSuggestions(
  bodyDataList: BodyData[],
  workoutRecords: WorkoutRecord[]
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const sortedBody = [...bodyDataList].sort((a, b) => b.date.localeCompare(a.date))
  const sortedWorkouts = [...workoutRecords].sort((a, b) => b.date.localeCompare(a.date))

  // 规则1: 连续3天未训练
  const lastWorkout = getLatest(workoutRecords)
  if (lastWorkout) {
    const days = daysSince(lastWorkout.date)
    if (days >= 7) {
      suggestions.push({
        type: 'warning',
        title: '长时间未训练',
        detail: `已${days}天没有训练记录了，长期不训练会导致肌肉流失和体能下降，建议尽快恢复训练。`,
      })
    } else if (days >= 3) {
      suggestions.push({
        type: 'info',
        title: '该恢复训练了',
        detail: `距离上次训练已过${days}天，建议今天安排一次训练以保持状态。`,
      })
    }
  } else {
    suggestions.push({
      type: 'tip',
      title: '开始你的健身之旅',
      detail: '还没有训练记录，建议从全身适应性训练开始，选择较轻重量，注重动作标准。',
    })
  }

  // 规则2: 体重连续上升 + 训练频率低
  if (sortedBody.length >= 3) {
    const recent = sortedBody.slice(0, 3)
    const weights = recent.map(b => b.weight).filter(Boolean) as number[]
    if (weights.length >= 3 && weights[0] > weights[1] && weights[1] > weights[2]) {
      const recentWorkouts = sortedWorkouts.filter(w => {
        const d = daysSince(w.date)
        return d >= 0 && d <= 14
      })
      if (recentWorkouts.length < 4) {
        suggestions.push({
          type: 'warning',
          title: '体重持续上升',
          detail: '最近3次记录体重呈上升趋势且训练频率偏低，建议增加有氧运动和核心训练，同时控制饮食。',
        })
      }
    }
  }

  // 规则3: 某一部位超过7天未练
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const dateStr = sevenDaysAgo.toISOString().split('T')[0]

  const recentWorkoutsByGroup = new Map<string, WorkoutRecord[]>()
  for (const w of workoutRecords) {
    if (w.date >= dateStr) {
      const arr = recentWorkoutsByGroup.get(w.muscleGroup) || []
      arr.push(w)
      recentWorkoutsByGroup.set(w.muscleGroup, arr)
    }
  }

  const untrainedGroups: string[] = []
  for (const mg of MUSCLE_GROUPS) {
    if (mg.key === 'cardio') continue
    if (!recentWorkoutsByGroup.has(mg.key) || recentWorkoutsByGroup.get(mg.key)!.length === 0) {
      untrainedGroups.push(mg.label)
    }
  }

  if (untrainedGroups.length > 0 && workoutRecords.length > 3) {
    suggestions.push({
      type: 'tip',
      title: '建议轮换训练部位',
      detail: `以下部位超过7天未训练：${untrainedGroups.join('、')}。建议在下次训练中安排这些部位的动作。`,
    })
  }

  // 规则4: 体脂率上升提醒
  if (sortedBody.length >= 2) {
    const recent2 = sortedBody.slice(0, 2)
    const r0 = recent2[0], r1 = recent2[1]
    if (r0.weight && r0.height && r0.age && r1.weight && r1.height && r1.age) {
      const bmi0 = calcBMI(r0.weight, r0.height)
      const bmi1 = calcBMI(r1.weight, r1.height)
      const bf0 = calcBodyFat(bmi0, r0.age, r0.gender || 'male')
      const bf1 = calcBodyFat(bmi1, r1.age, r1.gender || 'male')
      if (bf0 > bf1 + 1) {
        suggestions.push({
          type: 'info',
          title: '体脂率有所上升',
          detail: `最近体脂率从${bf1}%升至${bf0}%，建议增加有氧训练并注意饮食控制。`,
        })
      } else if (bf0 < bf1 - 1) {
        suggestions.push({
          type: 'success',
          title: '体脂率在下降',
          detail: `最近体脂率从${bf1}%降至${bf0}%，继续保持当前的训练和饮食计划！`,
        })
      }
    }
  }

  // 补: cardio vs strength balance
  const strengthCount = sortedWorkouts.filter(w => w.category === 'strength').length
  const cardioCount = sortedWorkouts.filter(w => w.category === 'cardio').length
  if (strengthCount > 10 && cardioCount === 0) {
    suggestions.push({
      type: 'tip',
      title: '建议加入有氧训练',
      detail: '你目前全部是力量训练，建议每周加入1-2次有氧运动（慢跑、单车等），有助于心肺健康和体脂控制。',
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'success',
      title: '训练状态良好',
      detail: '你的训练节奏和数据记录都很不错，继续保持！可以考虑尝试新的训练动作来增加多样性。',
    })
  }

  return suggestions
}
