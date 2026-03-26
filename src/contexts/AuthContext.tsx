'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
  migrateLegacyNovelListToUser,
  setNovelListPersistUserId,
} from '@/store/novelListPersistUser'
import useNovelListStore from '@/store/useNovelListStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const lastPersistUid = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // 监听 auth 状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 登录用户变化时切换 novelList 的 localStorage 分区（rehydrate 在 initSync 里执行）
  useEffect(() => {
    if (isLoading) return
    const uid = session?.user?.id ?? null
    const prev = lastPersistUid.current
    if (prev === uid) return
    lastPersistUid.current = uid

    // 切换账号时先清空内存态，避免短暂显示上一用户的小说
    if (prev !== undefined && prev !== uid) {
      useNovelListStore.setState({
        novels: [],
        currentNovelId: null,
        currentChapterIndex: 0,
        trashList: [],
        isInitialized: false,
        syncState: {
          status: 'idle',
          lastSyncTime: null,
          error: null,
          pendingChanges: 0,
        },
      })
    }

    if (uid) migrateLegacyNovelListToUser(uid)
    setNovelListPersistUserId(uid)
  }, [session?.user?.id, isLoading])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
