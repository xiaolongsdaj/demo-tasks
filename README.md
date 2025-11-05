# Next.js 全栈任务管理器

一个基于 Next.js 14 的全栈任务管理应用，使用 TypeScript、Tailwind CSS 和 SQLite 构建。

## 功能特性

- ✅ **任务管理**：添加、更新、删除任务
- ✅ **任务状态**：标记任务为完成/未完成
- ✅ **任务过滤**：按状态（全部/进行中/已完成）筛选任务
- ✅ **任务统计**：查看总任务数、已完成任务数和完成百分比
- ✅ **响应式设计**：支持桌面和移动设备
- ✅ **用户体验优化**：加载状态、错误处理、空状态提示
- ✅ **表单验证**：输入验证和友好的错误提示
- ✅ **实时反馈**：操作成功/失败通知

## 技术栈

- **前端**：
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - React Hooks

- **后端**：
  - Next.js API Routes
  - SQLite 数据库
  - Node.js fs/promises

## 项目结构

```
├── app/
│   ├── api/
│   │   └── tasks/           # API 路由
│   ├── components/          # React 组件
│   ├── page.tsx             # 主页面
│   └── globals.css          # 全局样式
├── lib/
│   ├── data/
│   │   └── db.ts           # 数据库操作
│   └── types.ts            # TypeScript 类型定义
├── public/                  # 静态资源
└── data/                    # SQLite 数据库文件
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run start
```

## API 接口说明

### 任务集合 API

#### GET /api/tasks
获取所有任务，按创建时间降序排列

#### POST /api/tasks
创建新任务

**请求体**：
```json
{
  "title": "任务标题"
}
```

### 单个任务 API

#### PATCH /api/tasks/[id]
更新任务状态或标题

**请求体**：
```json
{
  "title": "新标题",
  "completed": true
}
```

#### DELETE /api/tasks/[id]
删除指定任务

## 组件说明

### TaskCard
展示单个任务的卡片组件，包含标题、状态切换和删除功能

### TaskForm
添加新任务的表单组件

### FilterTabs
任务过滤选项卡，支持按状态筛选

### TaskStats
任务统计组件，显示任务总数、已完成任务数和完成进度

### LoadingSpinner
加载状态指示器组件

### EmptyState
无任务时的友好提示组件

### Notification
操作反馈通知组件

## 错误处理

- 表单验证错误
- API 请求错误
- 数据库操作错误
- 加载状态和空状态处理

## 响应式设计

- 移动端优先设计
- 适配不同屏幕尺寸
- 触摸友好的交互元素
