# 用户认证系统开发指南

## 已完成的功能

### 1. 登录/注册页面
- **路由**: `/auth/login`
- **支持方式**:
  - 邮箱/密码登录和注册
  - GitHub OAuth 登录
  - Google OAuth 登录

### 2. 路由保护
- `/novels` 和 `/editor` 页面需要登录才能访问
- 未登录用户访问会自动重定向到登录页
- 已登录用户访问登录页会自动重定向到 `/novels`

## 后续步骤

### 步骤 1: 配置 Supabase Auth

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 左侧菜单选择 **Authentication** > **Providers**
4. 启用以下 providers:
   - **Email**: 默认已启用，配置好 SMTP 设置用于发送验证邮件
   - **GitHub**: 需要配置 GitHub OAuth App
   - **Google**: 需要配置 Google OAuth App

### 步骤 2: 配置 GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. 填写信息:
   - **Application name**: My Novel
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: 复制 Supabase 提供的回调 URL
4. 创建后获取 **Client ID** 和 **Client Secret**
5. 回到 Supabase Authentication > GitHub Provider，粘贴凭证

### 步骤 3: 配置 Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. APIs & Services > Credentials
4. 创建 OAuth Client ID
5. 配置 OAuth consent screen
6. 应用类型选择 Web application
7. Authorized redirect URI: 复制 Supabase 提供的回调 URL
8. 获取 **Client ID** 和 **Client Secret**
9. 回到 Supabase，配置 Google Provider

### 步骤 4: 配置环境变量

确保 `.env.local` 文件包含以下变量:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 步骤 5: 执行数据库迁移

在 Supabase SQL Editor 中执行 `supabase/schema.sql` 文件中的所有 SQL 语句。

### 步骤 6: 测试功能

1. 启动开发服务器: `npm run dev`
2. 访问 `/auth/login`
3. 测试邮箱注册和登录
4. 测试 GitHub/Google OAuth 登录

## 文件结构

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── page.tsx          # OAuth 回调处理
│   │   └── login/
│   │       └── page.tsx          # 登录/注册页面
│   ├── api/
│   │   └── auth/
│   │       └── logout/
│   │           └── route.ts      # 退出登录 API
│   └── _components/
│       └── Navbar.tsx            # 导航栏（含用户状态）
├── components/
│   ├── auth/
│   │   └── AuthForm.tsx          # 认证表单组件
│   └── ui/
│       ├── input.tsx             # 输入框组件
│       └── label.tsx             # 标签组件
├── contexts/
│   └── AuthContext.tsx           # 认证上下文
└── middleware.ts                 # 路由保护中间件
```

## API 路由

### POST /api/auth/logout
退出当前登录。

**响应**:
- 成功: `{ "success": true }`
- 失败: `{ "error": "error message" }`

## 使用的 Hooks

### useAuth()
在客户端组件中使用:

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, session, isLoading, signOut } = useAuth()

  if (isLoading) return <div>加载中...</div>

  if (user) {
    return (
      <div>
        <p>欢迎, {user.email}</p>
        <button onClick={signOut}>退出</button>
      </div>
    )
  }

  return <div>请登录</div>
}
```

## 下一步建议

1. **邮箱验证**: 在 Supabase Authentication 设置中启用邮箱确认
2. **密码重置**: 实现忘记密码功能
3. **用户资料页**: 创建用户个人资料页面
4. **用户设置**: 允许用户修改密码、邮箱等
5. **社交账号绑定**: 允许用户绑定多个 OAuth 账号
