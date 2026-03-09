"use client"
import Image from "next/image";
import config from "../../tailwind.config";
import dynamic from 'next/dynamic';

const Editor=dynamic(()=>import('./compoments/Editor'),{
  ssr:false,
  loading:()=><p>编辑器正在加载中</p>
})
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          My AI Novel Editor
        </h1>
        {/* 这里就是连接点：把我们写的编辑器组件放进来 */}
        <Editor />
      </div>
    </main>
  );
}
