'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  return <AuthForm mode={mode} />
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  )
}
