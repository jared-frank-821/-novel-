'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase 会自动处理 URL 中的 token
        // 等待一小段时间让 Supabase 处理
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 重定向到首页或 novels 页面
        router.push('/novels')
      } catch (err) {
        setError(err instanceof Error ? err.message : '认证失败')
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">认证失败</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a
            href="/auth/login"
            className="text-primary hover:underline"
          >
            返回登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">正在验证身份...</p>
      </div>
    </div>
  )
}
