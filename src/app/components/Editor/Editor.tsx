"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Sparkles, Loader2, Underline as UnderlineIcon, Highlighter } from "lucide-react";
import Suggestion from '@tiptap/suggestion';
import suggestionConfig from './suggestion';
import { Extension } from '@tiptap/core';
import { useState } from 'react';
import { toast } from 'sonner';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
// 导入 tippy.js 样式
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

// 自定义一个 SlashCommand 扩展
const SlashCommand = Extension.create({//创建 Tiptap 扩展的工厂方法
  name: 'slashCommand',//扩展名称，必须唯一
  addOptions() {//配置扩展选项，返回 suggestion 配置对象
    return {
      suggestion: {//配置建议列表（触发字符是 /，项目列表和渲染器来自 suggestionConfig）
        char: '/',//定义触发命令的字符
        items: suggestionConfig.items,//定义命令列表
        render: suggestionConfig.render,//定义命令渲染函数
      },
    };
  },//添加选项
  addProseMirrorPlugins() {//Tiptap 核心方法，返回 ProseMirror 插件数组
    return [//返回一个数组，数组中包含一个 Suggestion 插件
      Suggestion({//创建 Suggestion 插件
        editor: this.editor,//指定编辑器实例
        ...this.options.suggestion,//指定扩展的选项
      }),
    ];
  },//添加 ProseMirror 插件
});

const Editor = () => {//定义 Editor 组件函数
  const [isPolishing, setIsPolishing] = useState(false);//创建一个 isPolishing 状态，用于控制 AI 润色按钮的加载状态

  const editor = useEditor({//Tiptap 核心 Hook，创建编辑器实例
    extensions: [
      StarterKit,//StarterKit：基础功能
      SlashCommand,//自定义命令菜单
      // 添加高亮和下划线扩展
      Highlight.configure({ multicolor: true }),
      Underline,
    ],
    content: `<p>尝试输入 "/" 调出命令菜单，或选中文本测试工具栏！</p>`,
    immediatelyRender: false,//设置为 false，避免在组件初始化时立即渲染编辑器内容。
    onUpdate: ({ editor }) => {
      console.log("当前文档json:", editor.getJSON());
    },
    onTransaction: ({ transaction, editor }) => {
      if (transaction.docChanged) {
        console.log("文档变化，当前文本:", editor?.getText());
      }
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
    const selectedText = editor.state.doc.textBetween(from, to, ' ');//提取两个位置之间的纯文本内容
    
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

  // 高亮颜色选项
  const highlightColors = [
    { name: '黄色', class: 'bg-yellow-200' },
    { name: '绿色', class: 'bg-green-200' },
    { name: '蓝色', class: 'bg-blue-200' },
    { name: '粉色', class: 'bg-pink-200' },
    { name: '紫色', class: 'bg-purple-200' },
    { name: '取消', class: 'bg-gray-200' },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-sm bg-white">
      {/* 气泡菜单 - 选中文本时显示 */}
      {editor && (
        <BubbleMenu //气泡菜单根元素，接收 editor 实例和样式类名
          editor={editor} 
          className="flex items-center gap-1 p-1 bg-gray-900 text-white rounded-lg shadow-xl"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}//点击执行 toggleBold()，根据 isActive('bold') 判断是否高亮
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
            title="加粗 (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
            title="斜体 (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('underline') ? 'bg-gray-700' : ''}`}
            title="下划线 (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </button>
          
          <div className="w-px h-5 bg-gray-600 mx-1"></div>

          {/* 高亮颜色选择器 */}
          <div className="relative group">
            <button
              className={`p-1.5 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 ${editor.isActive('highlight') ? 'bg-gray-700' : ''}`}
              title="高亮"
            >
              <Highlighter size={16} />
            </button>
            {/* 颜色选择下拉 */}
            <div className="absolute top-full left-0 mt-1 hidden group-hover:flex gap-1 p-1 bg-white rounded-lg shadow-lg border z-50">
              {highlightColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (color.name === '取消') {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().toggleHighlight({ color: color.class }).run();
                    }
                  }}
                  className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform border border-gray-200`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1"></div>

          {/* AI 润色按钮组 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAIPolish('polish')}
              disabled={isPolishing}
              className="px-2 py-1 text-xs rounded hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-1"
              title="润色"
            >
              {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              润色
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* 固定工具栏 - 只有选中文字时显示 (可选保留，或隐藏) */}
      {/* {editor && hasSelection && (
        <div className="flex items-center gap-1 mb-2 p-2 bg-gray-100 rounded-md border">
           ... (原有的工具栏代码)
        </div>
      )} */}

      {/* 编辑器内容区 */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none" 
      />
    </div>
  );
};


export default Editor;
