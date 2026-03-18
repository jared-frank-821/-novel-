# 如何创建一个调用 AI 润色的后端接口

> 本笔记基于 `my-novel` 项目，详细讲解如何从零创建一个调用 DeepSeek AI 进行文字润色的后端接口。

---

## 目录

1. [整体架构概览](#1-整体架构概览)
2. [技术栈介绍](#2-技术栈介绍)
3. [后端接口开发](#3-后端接口开发)
4. [关键知识点详解](#4-关键知识点详解)
5. [前端如何调用接口](#5-前端如何调用接口)
6. [完整流程图](#6-完整流程图)
7. [常见问题与最佳实践](#7-常见问题与最佳实践)

---

## 1. 整体架构概览

```
用户选中文本 → 前端检测选区 → 显示AI按钮 → 用户点击 → 调用API → 
AI处理文本 → 返回结果 → 前端替换文本
```

在我们的项目中：
- **前端**：`/src/app/try/page.tsx` - 一个小说写作页面，使用 Tiptap 编辑器
- **后端**：`/src/app/api/polish/route.ts` - 处理 AI 润色的 API 接口
- **AI 服务**：DeepSeek（通过 Vercel AI SDK 调用）

---

## 2. 技术栈介绍

### 2.1 Next.js App Router

Next.js 13+ 采用了 App Router 架构，API 接口写在 `app/api/` 目录下：

```
src/app/
  ├── api/
  │   └── polish/
  │       └── route.ts    # API 接口文件
```

这种写法自动创建一个 `/api/polish` 的接口。

### 2.2 Vercel AI SDK

这是 Vercel 官方提供的 AI 开发工具包，让我们可以轻松调用各种大语言模型。

**核心函数**：
- `generateText` - 生成文本（用于一次性的文字处理，如润色）
- `streamText` - 流式生成（用于聊天机器人，边说边输出）

### 2.3 DeepSeek

DeepSeek 是国产的大语言模型，价格便宜，效果不错。

- **模型名**：deepseek-chat
- **官网**：https://platform.deepseek.com/

---

## 3. 后端接口开发

### 3.1 创建 API 文件

在 `src/app/api/polish/route.ts` 创建文件：

```typescript
// src/app/api/polish/route.ts

// 1. 导入依赖
import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// 2. 设置超时时间
export const maxDuration = 30;

// 3. 初始化 DeepSeek 模型
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});

// 4. 处理 POST 请求
export async function POST(req: Request) {
  try {
    // 4.1 解析请求参数
    const { text, mode }: { text: string; mode: string } = await req.json();

    // 4.2 参数校验
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ message: '文本不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4.3 定义 Prompt 字典
    const systemPrompts: Record<string, string> = {
      polish: '你是一个文字润色助手，请对用户提供的文字进行润色，使其更加通顺、优美、自然。只返回润色后的内容，不要有任何解释。',
      simplify: '你是一个文字精简助手，请对用户提供的文字进行精简，去除冗余内容，只保留核心信息。只返回精简后的内容，不要有任何解释。',
      expand: '你是一个文字扩展助手，请对用户提供的文字进行适当扩展，使内容更加丰富详细。只返回扩展后的内容，不要有任何解释。',
      rewrite: '你是一个文字改写助手，请用不同的表达方式重新改写用户提供的文字，保持相同的意思但改变句式。只返回改写后的内容，不要有任何解释。'
    };

    // 4.4 选择 Prompt
    const prompt = systemPrompts[mode] || systemPrompts.polish;

    // 4.5 调用 AI 生成文本
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
    });

    // 4.6 返回结果
    return new Response(JSON.stringify({ 
      result: result.text 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    // 4.7 错误处理
    console.error('API Error:', error);
    return new Response(JSON.stringify({ message: error.message || '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### 3.2 代码逐行解析

#### 导入依赖

```typescript
import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
```

- `generateText` - AI SDK 的核心函数，用于调用大模型生成文本
- `createDeepSeek` - DeepSeek 官方 SDK，用于创建模型实例

#### 设置超时

```typescript
export const maxDuration = 30;
```

- Next.js 默认请求超时较短
- AI 生成需要时间，设置为 30 秒避免超时

#### 初始化模型

```typescript
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.BASE_URL || 'https://api.deepseek.com'
});
```

- 创建 DeepSeek 模型实例
- `apiKey` - 从环境变量读取 API 密钥
- `baseURL` - API 地址（国内可能需要代理）

#### 接收请求

```typescript
export async function POST(req: Request) {
```

- 导出 POST 函数，处理 POST 请求
- 前端调用时触发这个函数

#### 解析参数

```typescript
const { text, mode }: { text: string; mode: string } = await req.json();
```

- 从请求体解析 JSON 数据
- `text` - 要润色的文本
- `mode` - 润色模式（polish/simplify/expand/rewrite）

#### 参数校验

```typescript
if (!text || text.trim() === '') {
  return new Response(JSON.stringify({ message: '文本不能为空' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

- 检查 text 是否为空
- 为空返回 400 错误

#### 定义 Prompt

```typescript
const systemPrompts: Record<string, string> = {
  polish: '...',
  simplify: '...',
  expand: '...',
  rewrite: '...'
};
```

- 定义不同模式的提示词
- 告诉 AI 应该如何处理文本

#### 调用 AI

```typescript
const result = await generateText({
  model: deepseek('deepseek-chat'),
  messages: [
    { role: 'system', content: prompt },
    { role: 'user', content: text }
  ],
});
```

- 调用 AI 生成文本
- `model` - 使用 deepseek-chat 模型
- `messages` - 对话消息，包含 system 提示词和 user 要处理的文本

#### 返回结果

```typescript
return new Response(JSON.stringify({ 
  result: result.text 
}), {
  headers: { 'Content-Type': 'application/json' }
});
```

- 成功返回 200
- 包含 AI 生成的内容

---

## 4. 关键知识点详解

### 4.1 Content-Type: application/json

**问题**：为什么需要这个 header？

**解释**：告诉浏览器返回的数据是什么格式。

就像寄快递的标签：
- 贴了 "JSON" 标签 → 前端知道用 `JSON.parse()` 解析
- 没贴标签 → 前端不知道怎么处理

```typescript
headers: { 'Content-Type': 'application/json' }
```

### 4.2 Record<string, string>

**问题**：这个类型是什么意思？

**解释**：表示一个"字符串到字符串"的字典。

```typescript
// 完整写法
const systemPrompts: Record<string, string> = { ... }

// 相当于
const systemPrompts: { [key: string]: string } = { ... }

// 访问方式
systemPrompts['polish']  // 获取润色提示词
```

### 4.3 环境变量

API 密钥不能硬编码在代码中，要使用环境变量：

```typescript
// 读取环境变量
process.env.DEEPSEEK_API_KEY

// .env.local 文件示例
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
BASE_URL=https://api.deepseek.com
```

### 4.4 system 和 user 消息

和 AI 对话需要指定角色：

```typescript
messages: [
  { role: 'system', content: '你是一个作家...' },  // 系统设定
  { role: 'user', content: '帮我润色这段话...' }    // 用户输入
]
```

- **system** - 定义 AI 的身份和行为
- **user** - 用户的问题或请求

---

## 5. 前端如何调用接口

### 5.1 调用代码

```typescript
const handleAIPolish = async (mode: string) => {
  if (!editor) return;
  
  // 1. 获取选中的文字
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, ' ');
  
  if (!selectedText) {
    toast.warning('请先选中需要润色的文字');
    return;
  }

  // 2. 调用 API
  const response = await fetch('/api/polish', {
    method: 'POST',//作用：指定请求方法,这里用 POST 是因为：要发送数据（用户选中的文本）给服务器
    headers: { 'Content-Type': 'application/json' },//告诉服务器发送的数据是什么格式
    body: JSON.stringify({ text: selectedText, mode })//要发送给服务器的数据
  });

  const data = await response.json();//接收服务器的返回值：
  
  // 3. 替换文本
  if (data.result) {
    editor.chain().focus().deleteSelection().insertContent(data.result).run();
  }
};
```

### 5.2 调用流程

1. **获取选区** - 使用 `editor.state.selection` 获取 `from` 和 `to`
2. **提取文本** - 使用 `textBetween(from, to)` 获取选中的文字
3. **发送请求** - `fetch('/api/polish', ...)` 发送 POST 请求
4. **处理响应** - 解析返回的 JSON，获取 AI 生成的结果
5. **替换文本** - 使用 `deleteSelection().insertContent()` 替换选中的文字

---

## 6. 完整流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户操作                                 │
│                                                                  │
│  1. 用户在编辑器中选中文本                                        │
│         ↓                                                       │
│  2. 前端监听 selectionUpdate 事件                                │
│         ↓                                                       │
│  3. hasSelection = true，显示 AI 按钮                            │
│         ↓                                                       │
│  4. 用户点击"润色"按钮                                            │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       前端处理 (try/page.tsx)                    │
│                                                                  │
│  5. 获取选中文字: textBetween(from, to)                          │
│         ↓                                                       │
│  6. 调用 fetch('/api/polish', { body: { text, mode } })         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                     后端处理 (api/polish/route.ts)               │
│                                                                  │
│  7. POST 函数接收请求                                            │
│         ↓                                                       │
│  8. 解析 JSON: { text, mode }                                   │
│         ↓                                                       │
│  9. 根据 mode 选择 system prompt                                 │
│         ↓                                                       │
│  10. generateText() 调用 DeepSeek API                           │
│         ↓                                                       │
│  11. 返回 AI 生成的结果                                          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       前端处理 (接收到响应后)                      │
│                                                                  │
│  12. 解析 JSON: { result }                                      │
│         ↓                                                       │
│  13. editor.chain().deleteSelection().insertContent(result)     │
│         ↓                                                       │
│  14. 替换选中的文字，AI 润色完成！                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 常见问题与最佳实践

### 7.1 常见错误

1. **429 错误** - API 请求频率限制
   - 解决：添加 loading 状态，禁止重复点击

2. **401 错误** - API 密钥错误
   - 解决：检查 `.env.local` 中的 `DEEEPSEEK_API_KEY`

3. **500 错误** - 服务器内部错误
   - 解决：查看服务端日志

### 7.2 最佳实践

1. **添加 loading 状态**
   ```typescript
   const [isPolishing, setIsPolishing] = useState(false);
   // 按钮添加 disabled={isPolishing}
   ```

2. **校验输入**
   - 前端：检查是否选中文字
   - 后端：检查 text 是否为空

3. **错误处理**
   - 捕获 try/catch
   - 返回友好的错误信息

4. **环境变量管理**
   - 不要把密钥提交到 Git
   - 使用 `.env.local` 文件

---

## 8. 扩展练习

学完这个接口后，你可以尝试：

1. **添加新模式** - 比如"翻译成英文"、"生成标题"等
2. **流式输出** - 使用 `streamText` 实现打字机效果
3. **保存历史** - 记录用户的润色历史，支持撤销

---

## 9. 参考资料

- [Vercel AI SDK 文档](https://sdk.vercel.ai/)
- [DeepSeek API 文档](https://platform.deepseek.com/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)

---

> 本笔记由 AI 辅助编写，仅供学习参考。
