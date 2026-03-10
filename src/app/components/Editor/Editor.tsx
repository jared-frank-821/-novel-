"use client";
import { useEditor, EditorContent } from '@tiptap/react'; // 组件
import { BubbleMenu } from '@tiptap/react/menus'; // 气泡菜单组件
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'; // 气泡菜单扩展
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic } from "lucide-react";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenuExtension
    ],
    content: `<p>尝试选中我，测试 @apply 后的气泡菜单！</p>`,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      console.log("当前文档json:", editor.getJSON());
    },
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-sm bg-white">
      {/* 气泡菜单部分 */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-1 bg-black p-1 rounded-md shadow-xl border border-gray-700"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors text-white bg-transparent border-none cursor-pointer ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-700 transition-colors text-white bg-transparent border-none cursor-pointer ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
          >
            <Italic size={16} />
          </button>
        </BubbleMenu>
      )}

      {/* 编辑器内容区 */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none" 
      />
    </div>
  );
};

export default Editor;
