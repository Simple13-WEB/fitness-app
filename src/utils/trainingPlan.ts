import type { BodyData } from '../types'

export interface PlannedExercise {
  name: string
  muscleGroup: string
  sets: number
  reps: string
  note?: string
}

export interface TrainingDay {
  dayName: string
  focus: string
  exercises: PlannedExercise[]
}

export interface TrainingPlan {
  type: '3day' | '5day'
  name: string
  days: TrainingDay[]
}

export function generatePlan(bodyData: BodyData | null, planType: '3day' | '5day'): TrainingPlan {
  const bmi = bodyData?.weight && bodyData?.height
    ? bodyData.weight / ((bodyData.height / 100) ** 2)
    : 22

  // Adjust reps based on BMI goals
  let repRange: string
  let volumeHint: string
  if (bmi < 18.5) {
    repRange = '6-8'
    volumeHint = '增肌：低次数、大重量，组间休息2-3分钟'
  } else if (bmi >= 25) {
    repRange = '12-15'
    volumeHint = '减脂：高次数、中重量，组间休息45-60秒'
  } else {
    repRange = '8-12'
    volumeHint = '塑形：中等次数，组间休息60-90秒'
  }

  const note = `基于BMI ${Math.round(bmi * 10) / 10} 生成 · ${volumeHint}`

  if (planType === '3day') {
    return { type: '3day', name: '三分化训练 (推/拉/腿)', days: get3DayPlan(repRange, note) }
  }
  return { type: '5day', name: '五分化训练 (胸/背/肩/腿/臂)', days: get5DayPlan(repRange, note) }
}

function get3DayPlan(repRange: string, note: string): TrainingDay[] {
  return [
    {
      dayName: '推 (Push)',
      focus: '胸 + 肩前中束 + 肱三头肌',
      exercises: [
        { name: '杠铃卧推', muscleGroup: 'chest', sets: 4, reps: repRange },
        { name: '上斜哑铃推举', muscleGroup: 'chest', sets: 3, reps: repRange },
        { name: '哑铃飞鸟', muscleGroup: 'chest', sets: 3, reps: repRange, note: '孤立胸肌' },
        { name: '哑铃推举', muscleGroup: 'shoulder', sets: 3, reps: repRange },
        { name: '侧平举', muscleGroup: 'shoulder', sets: 3, reps: '12-15', note: '小重量多次数' },
        { name: '绳索夹胸', muscleGroup: 'chest', sets: 2, reps: repRange, note: '收尾动作' },
      ],
    },
    {
      dayName: '拉 (Pull)',
      focus: '背 + 肩后束 + 肱二头肌',
      exercises: [
        { name: '引体向上', muscleGroup: 'back', sets: 4, reps: '力竭', note: '可借力或使用辅助' },
        { name: '杠铃划船', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '高位下拉', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '哑铃单臂划船', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '硬拉', muscleGroup: 'back', sets: 3, reps: '5-8', note: '大重量，注意核心收紧' },
        { name: '俯身飞鸟', muscleGroup: 'shoulder', sets: 3, reps: '12-15', note: '后束孤立' },
      ],
    },
    {
      dayName: '腿 (Legs)',
      focus: '股四头肌 + 腘绳肌 + 臀肌 + 小腿',
      exercises: [
        { name: '杠铃深蹲', muscleGroup: 'legs', sets: 4, reps: repRange, note: '核心动作' },
        { name: '罗马尼亚硬拉', muscleGroup: 'glutes', sets: 3, reps: repRange },
        { name: '腿举', muscleGroup: 'legs', sets: 3, reps: repRange },
        { name: '哑铃箭步蹲', muscleGroup: 'legs', sets: 3, reps: '10-12/腿' },
        { name: '臀推', muscleGroup: 'glutes', sets: 3, reps: repRange },
        { name: '站姿小腿提踵', muscleGroup: 'legs', sets: 4, reps: '15-20', note: '小腿耐受力强' },
      ],
    },
  ]
}

function get5DayPlan(repRange: string, note: string): TrainingDay[] {
  return [
    {
      dayName: '胸部',
      focus: '胸大肌整体',
      exercises: [
        { name: '杠铃卧推', muscleGroup: 'chest', sets: 4, reps: repRange },
        { name: '上斜哑铃推举', muscleGroup: 'chest', sets: 3, reps: repRange },
        { name: '哑铃飞鸟', muscleGroup: 'chest', sets: 3, reps: repRange },
        { name: '绳索夹胸', muscleGroup: 'chest', sets: 3, reps: '12-15' },
        { name: '俯卧撑', muscleGroup: 'chest', sets: 3, reps: '力竭', note: '收尾动作' },
      ],
    },
    {
      dayName: '背部',
      focus: '背阔肌 + 中下斜方肌',
      exercises: [
        { name: '引体向上', muscleGroup: 'back', sets: 4, reps: '力竭' },
        { name: '杠铃划船', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '高位下拉', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '哑铃单臂划船', muscleGroup: 'back', sets: 3, reps: repRange },
        { name: '硬拉', muscleGroup: 'back', sets: 3, reps: '5-8', note: '大重量核心动作' },
      ],
    },
    {
      dayName: '肩部',
      focus: '三角肌前中后束',
      exercises: [
        { name: '哑铃推举', muscleGroup: 'shoulder', sets: 4, reps: repRange },
        { name: '侧平举', muscleGroup: 'shoulder', sets: 4, reps: '12-15' },
        { name: '前平举', muscleGroup: 'shoulder', sets: 3, reps: repRange },
        { name: '俯身飞鸟', muscleGroup: 'shoulder', sets: 3, reps: '12-15', note: '后束' },
        { name: '上斜哑铃推举', muscleGroup: 'chest', sets: 2, reps: '12', note: '上斜，刺激前束' },
      ],
    },
    {
      dayName: '腿部',
      focus: '股四头肌 + 腘绳肌 + 臀肌 + 小腿',
      exercises: [
        { name: '杠铃深蹲', muscleGroup: 'legs', sets: 4, reps: repRange },
        { name: '罗马尼亚硬拉', muscleGroup: 'glutes', sets: 3, reps: repRange },
        { name: '腿举', muscleGroup: 'legs', sets: 3, reps: repRange },
        { name: '腿弯举', muscleGroup: 'legs', sets: 3, reps: repRange },
        { name: '臀推', muscleGroup: 'glutes', sets: 3, reps: repRange },
        { name: '站姿小腿提踵', muscleGroup: 'legs', sets: 4, reps: '15-20' },
      ],
    },
    {
      dayName: '手臂',
      focus: '肱二头肌 + 肱三头肌 + 前臂',
      exercises: [
        { name: '杠铃弯举', muscleGroup: 'arms', sets: 4, reps: repRange },
        { name: '哑铃弯举', muscleGroup: 'arms', sets: 3, reps: repRange },
        { name: '窄握杠铃卧推', muscleGroup: 'arms', sets: 3, reps: repRange, note: '窄握，侧重三头' },
        { name: '绳索下压', muscleGroup: 'arms', sets: 3, reps: repRange, note: '三头下压' },
        { name: '锤式弯举', muscleGroup: 'arms', sets: 3, reps: repRange },
        { name: '仰卧臂屈伸', muscleGroup: 'arms', sets: 3, reps: '12-15', note: '三头孤立' },
      ],
    },
  ]
}

function getStorageKey(userId: number): string {
  return `fitness_training_plan_${userId}`
}

export interface PlanState {
  planType: '3day' | '5day'
  completedExercises: Record<string, boolean> // "dayIndex-exerciseIndex" → completed
  completedDays: Record<number, boolean> // dayIndex → day completed
  generatedAt: string
}

export function loadPlanState(userId: number): PlanState | null {
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function savePlanState(userId: number, state: PlanState) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
}

export function clearPlanState(userId: number) {
  localStorage.removeItem(getStorageKey(userId))
}

export function toggleExerciseComplete(state: PlanState, dayIndex: number, exIndex: number): PlanState {
  const key = `${dayIndex}-${exIndex}`
  const updated = { ...state.completedExercises }
  updated[key] = !updated[key]
  return { ...state, completedExercises: updated }
}

export function checkDayComplete(plan: TrainingPlan, state: PlanState, dayIndex: number): boolean {
  const day = plan.days[dayIndex]
  return day.exercises.every((_, exIndex) => state.completedExercises[`${dayIndex}-${exIndex}`])
}

export function isPlanComplete(plan: TrainingPlan, state: PlanState): boolean {
  return plan.days.every((_, i) => checkDayComplete(plan, state, i))
}
