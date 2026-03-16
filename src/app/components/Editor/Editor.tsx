"use client";
import { useEditor, EditorContent } from '@tiptap/react'; // 组件
import { BubbleMenu } from '@tiptap/react/menus'; // 气泡菜单组件
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'; // 气泡菜单扩展
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic } from "lucide-react";
import Suggestion from '@tiptap/suggestion';
import suggestionConfig from './suggestion';
import { Extension } from '@tiptap/core'; // 确保引入核心库

// 导入 tippy.js 样式
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

// 自定义一个 SlashCommand 扩展
const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: suggestionConfig.items,
        render: suggestionConfig.render,
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenuExtension,
      SlashCommand
    ],
    content: `<p>尝试输入 "/" 调出命令菜单，或选中文本测试气泡菜单！</p>`,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      console.log("当前文档json:", editor.getJSON());
    },
    onTransaction: ({ transaction }) => {
      // 调试：监听事务变化
      if (transaction.docChanged) {
        console.log("文档变化，当前文本:", editor?.getText());
      }
    },
  });

  // 调试：检查编辑器是否初始化
  if (editor) {
    console.log("编辑器已初始化，扩展:", editor.extensionManager.extensions.map(ext => ext.name));
  }

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
