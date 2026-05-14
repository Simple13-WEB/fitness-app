export interface UserProfile {
  id?: number
  nickname: string
  createdAt: string
}

export interface BodyData {
  id?: number
  userId: number
  date: string
  gender?: 'male' | 'female'
  age?: number
  height?: number
  weight?: number
  neck?: number
  shoulders?: number
  leftArm?: number
  rightArm?: number
  leftForearm?: number
  rightForearm?: number
  chest?: number
  waist?: number
  leftThigh?: number
  rightThigh?: number
  leftCalf?: number
  rightCalf?: number
  notes?: string
}

export interface WorkoutRecord {
  id?: number
  userId: number
  date: string
  muscleGroup: string
  exerciseName: string
  category: 'strength' | 'cardio'
  weight?: number
  reps?: number
  sets?: number
  distance?: number
  time?: number
  floors?: number
  notes?: string
}

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  category: 'strength' | 'cardio'
  description: string
  animationType: 'pulse' | 'raise' | 'squat' | 'crunch' | 'push' | 'pull' | 'hiphinge' | 'swim'
  icon: string
  gifUrl?: string
  gifUrlEnd?: string
  cues?: string
  precautions?: string
}

export type MuscleGroup = 'chest' | 'shoulder' | 'back' | 'abs' | 'legs' | 'glutes' | 'arms' | 'cardio'

export interface MuscleGroupInfo {
  key: MuscleGroup
  label: string
}

export const MUSCLE_GROUPS: MuscleGroupInfo[] = [
  { key: 'chest', label: '胸' },
  { key: 'shoulder', label: '肩' },
  { key: 'back', label: '背' },
  { key: 'abs', label: '腹' },
  { key: 'legs', label: '腿' },
  { key: 'glutes', label: '臀' },
  { key: 'arms', label: '手臂' },
  { key: 'cardio', label: '有氧' },
]

export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100
  return Math.round((weightKg / (h * h)) * 10) / 10
}

export function calcBodyFat(bmi: number, age: number, gender: 'male' | 'female'): number {
  const g = gender === 'male' ? 1 : 0
  const bf = 1.20 * bmi + 0.23 * age - 10.8 * g - 5.4
  return Math.round(Math.max(2, Math.min(50, bf)) * 10) / 10
}
