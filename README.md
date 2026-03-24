# My Novel · 我的小说

> AI 辅助小说创作平台，基于 Next.js 16 + Tiptap 富文本编辑器 + DeepSeek 大模型构建。

[English](#english) | [中文](#中文)

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (Next.js 16)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Tiptap   │  │ Zustand  │  │ shadcn/ui + Tailwind  │  │
│  │ 编辑器    │  │ 状态管理   │  │ 组件库               │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│                          │                              │
│              ┌────────────┴────────────┐                 │
│              │     Vercel AI SDK       │                 │
│              │   @ai-sdk/deepseek      │                 │
│              └────────────┬────────────┘                 │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP
┌───────────────────────────┼─────────────────────────────┐
│                      DeepSeek API                       │
│              续写 · 润色 · 改写 · AI 对话                 │
└─────────────────────────────────────────────────────────┘
```

## 功能特性

| 模块 | 功能 |
|------|------|
| **智能编辑器** | Tiptap 富文本编辑器，支持 H1-H3、加粗、斜体、下划线、高亮、有序/无序列表；选中文字弹出气泡菜单；2 秒防抖自动保存 |
| **作品管理** | 创建/删除/切换小说，多章节管理，章节重命名，回收站（软删除） |
| **分类标签** | 题材/情节/情绪/时空四维标签体系，搜索式标签选择器 |
| **AI 辅助创作** | 续写正文、续写情节、AI 对话、润色/精简/扩展/改写（需要配置 DeepSeek API Key） |
| **阅读预览** | 章节阅读页面，含字数统计、阅读时间估算、上一章/下一章导航 |
| **数据备份** | JSON 格式导入/导出，IndexedDB 本地封面图存储 |

## 快速开始

### 环境要求

- Node.js 20+
- npm / pnpm / bun

### 安装

```bash
git clone <your-repo-url>
cd my-novel
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```bash
# DeepSeek API（必需，用于 AI 功能）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DeepSeek API 地址（可选，默认使用官方地址）
# BASE_URL=https://api.deepseek.com
```

> [!TIP]
> 没有 DeepSeek API Key 时，编辑器、润色、AI 对话功能不可用，但其他功能（创建小说、写作、保存）完全正常。

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 生产构建

```bash
npm run build
npm run start
```

## 测试

```bash
# 监听模式（文件变化自动重跑）
npm run test

# 单次运行 + 覆盖率报告
npm run coverage
```

测试覆盖范围：Zustand Store 逻辑、工具函数、UI 组件交互。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页
│   ├── layout.tsx            # 根布局（Navbar + Footer）
│   ├── editor/page.tsx       # 写作编辑器页面
│   ├── novels/page.tsx       # 作品列表页面
│   ├── read/page.tsx         # 阅读预览页面
│   └── api/                   # API 路由
│       ├── completion/route.ts   # 续写 API
│       ├── polish/route.ts        # 润色/改写 API
│       └── chat/route.ts          # AI 对话 API
├── components/
│   ├── ui/                   # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── drawer.tsx
│   │   └── select.tsx         # 标签选择器
│   ├── categories/           # 分类标签组件
│   └── information/          # 小说信息组件
├── store/
│   ├── useNovelListStore.ts  # Zustand 状态管理
│   └── useImageDB.ts         # IndexedDB 封面图存储
└── lib/
    └── utils.ts              # cn() 工具函数
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| UI | Tailwind CSS v4 + shadcn/ui |
| 编辑器 | Tiptap 3 (基于 ProseMirror) |
| 状态管理 | Zustand v5 (localStorage 持久化) |
| AI | Vercel AI SDK + @ai-sdk/deepseek |
| 图标 | Lucide React |
| 通知 | Sonner |

---

## English

AI-assisted novel writing platform built with Next.js 16, Tiptap rich-text editor, and DeepSeek LLM.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Editor**: Tiptap 3 with BubbleMenu
- **State**: Zustand v5 with localStorage persistence
- **AI**: Vercel AI SDK + DeepSeek
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Testing**: Vitest + React Testing Library

### Quick Start

```bash
npm install
cp .env.example .env.local  # Add your DEEPSEEK_API_KEY
npm run dev
```

### Test

```bash
npm test          # watch mode
npm run coverage  # single run + coverage report
```

---

## License

MIT
