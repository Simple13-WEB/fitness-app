import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { BodyData, WorkoutRecord, UserProfile } from '../types'

class FitnessDB extends Dexie {
  bodyData!: Table<BodyData, number>
  workoutRecords!: Table<WorkoutRecord, number>
  users!: Table<UserProfile, number>

  constructor() {
    super('FitnessAppDB')

    this.version(2).stores({
      bodyData: '++id, date',
      workoutRecords: '++id, date, muscleGroup, category',
    })

    this.version(3).stores({
      bodyData: '++id, userId, date',
      workoutRecords: '++id, userId, date, muscleGroup, category',
      users: '++id, nickname',
    }).upgrade(async tx => {
      const userId = await tx.table('users').add({ nickname: '用户1', createdAt: new Date().toISOString().split('T')[0] })
      await tx.table('bodyData').toCollection().modify(record => { record.userId = userId })
      await tx.table('workoutRecords').toCollection().modify(record => { record.userId = userId })
    })
  }
}

export const db = new FitnessDB()

const CURRENT_USER_KEY = 'fitness_current_user_id'

// --- User management ---

export async function getUserList(): Promise<UserProfile[]> {
  return db.users.orderBy('id').toArray()
}

export async function addUser(nickname: string): Promise<number> {
  const count = await db.users.count()
  if (count >= 5) throw new Error('最多只能创建5个用户')
  const existing = await db.users.where('nickname').equals(nickname).count()
  if (existing > 0) throw new Error('昵称已存在')
  return db.users.add({ nickname, createdAt: new Date().toISOString().split('T')[0] })
}

export async function deleteUser(userId: number): Promise<void> {
  await db.bodyData.where('userId').equals(userId).delete()
  await db.workoutRecords.where('userId').equals(userId).delete()
  await db.users.delete(userId)
  localStorage.removeItem(`fitness_training_plan_${userId}`)
  if (getCurrentUserId() === userId) {
    const remaining = await db.users.orderBy('id').first()
    if (remaining) {
      setCurrentUserId(remaining.id!)
    } else {
      await ensureDefaultUser()
    }
  }
}

export function getCurrentUserId(): number {
  const val = localStorage.getItem(CURRENT_USER_KEY)
  return val ? Number(val) : 0
}

export function setCurrentUserId(userId: number): void {
  localStorage.setItem(CURRENT_USER_KEY, String(userId))
}

export async function ensureDefaultUser(): Promise<number> {
  const count = await db.users.count()
  if (count === 0) {
    const id = await db.users.add({ nickname: '用户1', createdAt: new Date().toISOString().split('T')[0] })
    setCurrentUserId(id)
    return id
  }
  const currentId = getCurrentUserId()
  if (!currentId || currentId === 0) {
    const first = await db.users.orderBy('id').first()
    if (first) {
      setCurrentUserId(first.id!)
      return first.id!
    }
  }
  return currentId
}

// --- Body data ---

export async function addBodyData(data: BodyData): Promise<number> {
  return db.bodyData.add(data)
}

export async function deleteBodyData(id: number): Promise<void> {
  return db.bodyData.delete(id)
}

export async function getBodyDataList(userId: number, limit = 30): Promise<BodyData[]> {
  const arr = await db.bodyData.where('userId').equals(userId).toArray()
  arr.sort((a, b) => b.date.localeCompare(a.date))
  return arr.slice(0, limit)
}

export async function getAllBodyData(userId: number): Promise<BodyData[]> {
  const arr = await db.bodyData.where('userId').equals(userId).toArray()
  arr.sort((a, b) => a.date.localeCompare(b.date))
  return arr
}

// --- Workout records ---

export async function addWorkoutRecord(record: WorkoutRecord): Promise<number> {
  return db.workoutRecords.add(record)
}

export async function deleteWorkoutRecord(id: number): Promise<void> {
  return db.workoutRecords.delete(id)
}

export async function getWorkoutRecords(userId: number, limit = 50): Promise<WorkoutRecord[]> {
  const arr = await db.workoutRecords.where('userId').equals(userId).toArray()
  arr.sort((a, b) => b.date.localeCompare(a.date))
  return arr.slice(0, limit)
}

export async function getAllWorkoutRecords(userId: number): Promise<WorkoutRecord[]> {
  const arr = await db.workoutRecords.where('userId').equals(userId).toArray()
  arr.sort((a, b) => a.date.localeCompare(b.date))
  return arr
}

export async function getRecentWorkoutDate(userId: number): Promise<string | null> {
  const arr = await db.workoutRecords.where('userId').equals(userId).toArray()
  if (arr.length === 0) return null
  arr.sort((a, b) => b.date.localeCompare(a.date))
  return arr[0].date
}

export async function getWorkoutCountByGroup(userId: number): Promise<Record<string, number>> {
  const records = await db.workoutRecords.where('userId').equals(userId).toArray()
  const counts: Record<string, number> = {}
  for (const r of records) {
    counts[r.muscleGroup] = (counts[r.muscleGroup] || 0) + (r.sets || 1)
  }
  return counts
}
