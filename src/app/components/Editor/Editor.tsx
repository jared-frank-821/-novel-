"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Sparkles, Loader2 } from "lucide-react";
import Suggestion from '@tiptap/suggestion';
import suggestionConfig from './suggestion';
import { Extension } from '@tiptap/core';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
  const [isPolishing, setIsPolishing] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      SlashCommand
    ],
    content: `<p>尝试输入 "/" 调出命令菜单，或选中文本测试工具栏！</p>`,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      console.log("当前文档json:", editor.getJSON());
    },
    onTransaction: ({ transaction, editor }) => {
      if (transaction.docChanged) {
        console.log("文档变化，当前文本:", editor?.getText());
      }
      // 检测选区变化
      const { from, to } = editor.state.selection;
      setHasSelection(from !== to);
    },
  });
  
  // 调试：检查编辑器是否初始化
  if (editor) {
    console.log("编辑器已初始化，扩展:", editor.extensionManager.extensions.map(ext => ext.name));
  }

  // AI 润色/改写函数
  const handleAIPolish = async (mode: 'polish' | 'simplify' | 'expand' | 'rewrite') => {
    if (!editor) return;
    
    // 获取选中的文本
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    if (!selectedText || selectedText.trim() === '') {
      toast.warning('请先选中需要润色的文字');
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode })
      });

      const data = await response.json();
      
      if (data.result) {
        // 替换选中文本
        editor.chain().focus().deleteSelection().insertContent(data.result).run();
        toast.success('润色完成');
      } else if (data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('润色失败:', error);
      toast.error('润色失败，请稍后重试');
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-sm bg-white">
      {/* 固定工具栏 - 只有选中文字时显示 */}
      {editor && hasSelection && (
        <div className="flex items-center gap-1 mb-2 p-2 bg-gray-100 rounded-md border">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
            title="加粗"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
            title="斜体"
          >
            <Italic size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* AI 润色按钮组 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">AI:</span>
            <button
              onClick={() => handleAIPolish('polish')}
              disabled={isPolishing}
              className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center gap-1"
              title="润色"
            >
              {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              润色
            </button>
            <button
              onClick={() => handleAIPolish('simplify')}
              disabled={isPolishing}
              className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
              title="精简"
            >
              精简
            </button>
            <button
              onClick={() => handleAIPolish('expand')}
              disabled={isPolishing}
              className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
              title="扩展"
            >
              扩展
            </button>
            <button
              onClick={() => handleAIPolish('rewrite')}
              disabled={isPolishing}
              className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
              title="改写"
            >
              改写
            </button>
          </div>
        </div>
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
