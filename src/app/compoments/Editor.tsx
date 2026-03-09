import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

 const Editor = () => {
 const editor=useEditor({
  extensions:[
    StarterKit,// 包含基础的加粗、斜体、标题等功能
  ],
  content:'<p>你好,这是我的ai编辑器,试着输入些文字</p>',
  immediatelyRender: false,
// Tiptap 尝试在组件挂载的一瞬间立即渲染。但在 Next.js 中，由于存在服务器预渲染，这种“抢跑”会导致浏览器发现“服务器给我的 HTML”和“Tiptap 刚生成的 HTML”有细微差别，从而报错。

 // 设置为 false：告诉 Tiptap 等 React 彻底在浏览器端接管页面（useEffect 阶段）后再开始渲染。这完美解决了警告。
  //关键：当内容变化时，我们在控制台打印json结构
  onUpdate:({editor})=>{
    console.log("当前文档json:",editor.getJSON())
  },
 }) ;
 return(
  <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-sm">
    <EditorContent editor={editor} className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none" />
  </div>
 );
};

export default Editor;

