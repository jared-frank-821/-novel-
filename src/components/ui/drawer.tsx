"use client"

import * as React from "react"
import { X } from "lucide-react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  if (!open) return null

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      {/* 抽屉面板 */}
      <div className="fixed right-0 top-0 z-50 h-full w-[480px] max-w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title || "详情"}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        {/* 内容 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}