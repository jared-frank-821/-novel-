"use client"
import Image from "next/image";
import config from "../../tailwind.config";
import dynamic from 'next/dynamic';

const Editor=dynamic(()=>import('./components/Editor/Editor'),{ //dynamic会将editor打包成独立的js小文件，加快运行速度
  ssr:false,//tiptap是浏览器特有的库，它需要调用window,document以及浏览器的输入时间（Dom API）
  //如果不加这段代码，next.js会尝试在node.js服务器上预渲染，但是服务器没有window对象，会直接报错
  //加上了是明确告诉next.js在服务器渲染时直接跳过这个组件等到代码到了浏览器再运行，ssr的意思是服务端渲染
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
