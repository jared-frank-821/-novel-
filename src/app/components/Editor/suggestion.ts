// components/Editor/suggestion.ts
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandsList } from './commandsList';
import { Sparkles, Heading1, Heading2, TextQuote } from 'lucide-react';
import React from 'react';

const suggestion = {
  items: ({ query }: { query: string }) => {
    console.log('Suggestion items called with query:', query);
    const items = [
      {
        title: 'AI 续写故事',
        icon: React.createElement(Sparkles, { size: 16, className: "text-purple-500" }),
        command: async ({ editor, range }: any) => {
          console.log('AI 续写命令被调用', { editor, range });
          
          // 1.获取光标前的上下文（这里是最后500字）
          const fullText = editor.getText()
          const context = fullText.slice(-500)
          console.log('上下文:', context);
          
          // 2.插入一个占位符，提示用户AI正在思考
          editor.chain().focus().deleteRange(range).insertContent("AI 正在思考中...").run();
          
          try {
            console.log('正在调用 API...');
            // 3.请求我们刚刚写的后端API
            const response = await fetch('/api/chat', {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ prompt: context })
            })
            
            console.log('API 响应状态:', response.status);
            
            if (!response.ok) {
              throw new Error(`API 请求失败: ${response.status}`)
            }
            
            const res = await response.json()
            console.log('API 响应数据:', res);
            
            if (res.content) {
              // 删除占位符，插入AI生成的内容
              editor.chain().focus()
                .deleteRange({ from: range.from, to: range.from + "AI 正在思考中...".length })
                .insertContent("\n" + res.content)
                .run()
              console.log('AI 内容已插入');
            } else {
              throw new Error('API 返回格式错误')
            }

          } catch (error) {
            console.error('AI 续写失败:', error)
            // 删除占位符，显示错误信息
            editor.chain().focus()
              .deleteRange({ from: range.from, to: range.from + "AI 正在思考中...".length })
              .insertContent("\n[AI 续写失败，请稍后重试]")
              .run()
          }
        },
      },
      {
        title: '一级标题',
        icon: React.createElement(Heading1, { size: 16 }),
        command: ({ editor, range }: any) => {
          console.log('一级标题命令被调用');
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
      },
      {
        title: '二级标题',
        icon: React.createElement(Heading2, { size: 16 }),
        command: ({ editor, range }: any) => {
          console.log('二级标题命令被调用');
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        },
      },
      {
        title: '引用',
        icon: React.createElement(TextQuote, { size: 16 }),
        command: ({ editor, range }: any) => {
          console.log('引用命令被调用');
          editor.chain().focus().deleteRange(range).setBlockquote().run();
        },
      },
    ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    
    console.log('过滤后的 items:', items);
    return items;
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandsList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          theme: 'light',
        });
      },

      onUpdate: (props: any) => {
        component.updateProps(props);

        if (popup && popup[0]) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        }
      },

      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          if (popup && popup[0]) {
            popup[0].hide();
          }
          return true;
        }

        const ref = component.ref as any;
        if (ref && ref.onKeyDown) {
          return ref.onKeyDown(props);
        }

        return false;
      },

      onExit: () => {
        if (popup && popup[0]) {
          popup[0].destroy();
        }
        if (component) {
          component.destroy();
        }
      },
    };
  },
};

export default suggestion;
