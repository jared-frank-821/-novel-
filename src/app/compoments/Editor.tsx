import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const Editor=()=>{
 const editor=useEditor({
  extensions:[
    StarterKit,// 包含基础的加粗、斜体、标题等功能
  ],
  content:'<p>你好,这是我的ai编辑器,试着输入些文字</p>',
  //关键：当内容变化时，我们在控制台打印json结构
  onUpdate:({editor})=>{
    console.log("当前文档json:",editor.getJSON())
  },
 }) ;
 return(
  <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-sm">
    <EditorContent editor={editor} className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none" />
  </div>
 )
}