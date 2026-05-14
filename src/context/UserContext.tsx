import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getUserList, getCurrentUserId, setCurrentUserId, ensureDefaultUser, addUser, deleteUser } from '../db/database'
import type { UserProfile } from '../types'

interface UserContextValue {
  currentUserId: number
  currentUserNickname: string
  userList: UserProfile[]
  switchUser: (userId: number) => Promise<void>
  addUser: (nickname: string) => Promise<number>
  deleteUser: (userId: number) => Promise<void>
  refreshUsers: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentId] = useState<number>(0)
  const [currentUserNickname, setNickname] = useState<string>('')
  const [userList, setUserList] = useState<UserProfile[]>([])

  useEffect(() => {
    init()
  }, [])

  async function init() {
    await ensureDefaultUser()
    const id = getCurrentUserId()
    setCurrentId(id)
    const users = await getUserList()
    setUserList(users)
    const current = users.find(u => u.id === id)
    setNickname(current?.nickname ?? '')
  }

  const switchUser = useCallback(async (userId: number) => {
    setCurrentUserId(userId)
    setCurrentId(userId)
    const users = await getUserList()
    setUserList(users)
    const current = users.find(u => u.id === userId)
    setNickname(current?.nickname ?? '')
  }, [])

  const handleAddUser = useCallback(async (nickname: string): Promise<number> => {
    const newId = await addUser(nickname)
    const users = await getUserList()
    setUserList(users)
    return newId
  }, [])

  const handleDeleteUser = useCallback(async (userId: number) => {
    await deleteUser(userId)
    const newCurrentId = getCurrentUserId()
    setCurrentId(newCurrentId)
    const users = await getUserList()
    setUserList(users)
    const current = users.find(u => u.id === newCurrentId)
    setNickname(current?.nickname ?? '')
  }, [])

  const refreshUsers = useCallback(async () => {
    const users = await getUserList()
    setUserList(users)
  }, [])

  return (
    <UserContext.Provider value={{
      currentUserId,
      currentUserNickname,
      userList,
      switchUser,
      addUser: handleAddUser,
      deleteUser: handleDeleteUser,
      refreshUsers,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
