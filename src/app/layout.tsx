import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Novel - 小说创作平台",
  description: "一个功能强大的小说创作和编辑平台",
};

export default function RootLayout({
  children,//使用对象解构语法从传入的 props 中提取 children 属性
}: Readonly<{//表示传入的对象不可修改（只读），{ children: React.ReactNode; }: 定义参数对象的类型结构

  children: React.ReactNode;//这是 React 的特殊 prop，代表当前路由对应的页面组件
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-b from-blue-50 to-white min-h-screen`}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-blue-100">© 2026 My Novel - 小说创作平台</p>
            <p className="text-blue-200 text-sm mt-2">用技术赋能创作，让故事更精彩</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
