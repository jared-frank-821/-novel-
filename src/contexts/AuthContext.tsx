'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
  migrateLegacyNovelListToUser,
  setNovelListPersistUserId,
} from '@/store/novelListPersistUser'
import { setCoverStorageUserId } from '@/lib/supabase/coverStorage'
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

  // 清空内存态（切换账号时必须同步执行，防止短暂显示上一用户数据）
  const clearStoreState = () => {
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

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      // 初始化 persistUserId，确保首次加载时 localStorage 键就正确
      const uid = session?.user?.id ?? null
      lastPersistUid.current = uid
      setNovelListPersistUserId(uid)
      setCoverStorageUserId(uid)
      if (uid) migrateLegacyNovelListToUser(uid)
      setIsLoading(false)
    })

    // 监听 auth 状态变化 — 必须在这里同步更新 persistUserId，
    // 否则在 OAuth 回调等场景下，supabaseSync.userId 已变但 localStorage 键仍是旧用户的。
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      const prev = lastPersistUid.current
      if (prev === uid) return
      lastPersistUid.current = uid

      // 切换账号时必须立即清空内存态并切换 localStorage 键
      if (prev !== undefined && prev !== uid) {
        clearStoreState()
      }

      setNovelListPersistUserId(uid)
      setCoverStorageUserId(uid)
      if (uid) migrateLegacyNovelListToUser(uid)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
