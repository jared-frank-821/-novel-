"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Edit, Home, List, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const Navbar = () => {
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()

  const publicNavItems = [
    { name: "首页", href: "/", icon: <Home size={20} />, id: "home" },
  ]

  const authNavItems = [
    { name: "编辑器", href: "/editor", icon: <Edit size={20} />, id: "editor" },
    { name: "小说列表", href: "/novels", icon: <List size={20} />, id: "novels" },
  ]

  return (
    <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90">
              <BookOpen size={24} />
              <span className="text-xl font-bold">My Novel</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 公开导航 */}
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  href={item.href}
                  key={item.id}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* 认证后导航 */}
            {!isLoading && user && (
              <>
                {authNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      href={item.href}
                      key={item.id}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-white/20"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}

            {/* 用户区域 */}
            <div className="flex items-center space-x-2 border-l border-white/30 pl-4">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
              ) : user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10">
                    <User size={20} />
                    <span className="text-sm max-w-24 truncate">
                      {user.email?.split('@')[0] || '用户'}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="退出登录"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/login?mode=register"
                    className="px-4 py-2 rounded-lg border border-white/50 hover:bg-white/10 transition-colors"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
