# 开发指南（Developer Guide）

本文档面向项目开发者，涵盖环境搭建、项目结构、开发规范、常用命令与扩展机制，帮助你快速上手并高效参与开发。

---

## 1. 环境准备

### 1.1 必备工具

| 工具 | 版本要求 | 说明 |
| --- | --- | --- |
| Node.js | >= 20.19.0（推荐 22+） | 见 `package.json` 的 `engines` |
| pnpm | 9.x | 推荐通过 `corepack enable` 启用 |
| IDE | - | 推荐 Cursor / VSCode |
| 浏览器 | 现代浏览器 | Chrome 79+ / Firefox 78+ / Safari 14+ |

### 1.2 推荐 VSCode 插件

- ESLint
- stylelint
- TypeScript Importer
- Ant Design Snippets

### 1.3 克隆与安装

```bash
git clone https://github.com/gvray/gvray-vite.git
cd gvray-vite
pnpm install
```

---

## 2. 环境变量与多环境配置

### 2.1 环境文件

项目根目录下按环境维护 `.env` 文件：

| 文件 | 环境 | 说明 |
| --- | --- | --- |
| `.env.dev` | 开发 | 默认使用 Mock，端口 9527 |
| `.env.staging` | 测试 | 连接后端 gvray-admin，端口 9528 |
| `.env.prod` | 生产 | 生产环境配置，端口 9529 |
| `.env` | 本地覆盖 | 最高优先级，覆盖 `.env.{mode}`（不提交） |
| `.env.example` | 模板 | 环境变量模板，用于缺失检查 |

### 2.2 环境变量说明

| 变量名 | 类型 | 说明 |
| --- | --- | --- |
| `APP_ENV` | string | 当前环境标识：dev / staging / prod |
| `APP_API_URL` | string | API 请求前缀，如 `/api` |
| `APP_API_ORIGIN` | string | API 源地址 |
| `APP_API_TOKEN_KEY` | string | Token 存储 key |
| `APP_API_TIMEOUT` | number | 请求超时时间（ms） |
| `APP_MOCK_ENABLED` | boolean | 是否启用 Mock 数据 |
| `APP_LOGGING_ENABLED` | boolean | 请求日志开关 |
| `APP_DEFAULT_LANGUAGE` | string | 默认语言 |
| `APP_DEFAULT_AVATAR_URL` | string | 默认头像 URL |
| `APP_VERSION` | string | 应用版本号 |
| `APP_BUILD_TIME` | string | 构建时间 |
| `APP_CDN_URL` | string | CDN 地址（可选） |
| `APP_SENTRY_DSN` | string | Sentry DSN（可选） |
| `APP_TRACKING_ID` | string | 统计追踪 ID（可选） |

### 2.3 加载机制

环境变量加载链路：

1. `scripts/load-env.ts`：`loadEnvFiles(mode)` 用 `dotenv` 读取 `.env.{mode}`，再用 `.env` 覆盖（override，最高优先级）
2. `vite/plugins/env.ts`：`createAppDefines(mode)` 遍历 `APP_DEFAULTS`，按类型（number / boolean / string）转换
3. 映射为全局常量 `__APP_<NAME>__`（去掉 `APP_` 前缀），经 Vite `define` 注入
4. `APP_DEFAULTS` 是默认值的单一来源，**同时决定类型转换方式**

> 注意：只有 `APP_` 前缀的变量才会被加载并映射为 `__APP_*__`。

---

## 3. 常用命令

### 3.1 开发

```bash
pnpm dev              # 默认开发（无 mode 参数，读取 .env）
pnpm start:dev        # 开发环境，端口 9527（Mock 模式）
pnpm start:staging    # 测试环境，端口 9528（连接后端）
pnpm start:prod       # 生产环境配置，端口 9529
```

底层调用 `tsx scripts/dev.ts --mode <env> --port <port> [--mock true]`，支持参数：

- `--mode`：环境名称，对应 `.env.{mode}`
- `--port`：开发服务器端口
- `--mock`：手动覆盖 Mock 开关

### 3.2 构建

```bash
pnpm build            # 构建生产环境（tsc -b && vite build --mode prod）
pnpm build:dev        # 仅构建 dev
pnpm build:staging    # 仅构建 staging
pnpm build:prod       # 仅构建 prod
```

产物输出到 `dist/` 目录。

### 3.3 代码质量

```bash
pnpm lint             # 运行 ESLint 检查
npx eslint . --fix    # ESLint 自动修复
npx tsc -b --noEmit   # TypeScript 类型检查
```

### 3.4 代码生成

```bash
pnpm gen:api            # 从 OpenAPI 文档生成 TypeScript 类型
pnpm gen:theme-tokens   # 重新生成主题 CSS 变量参考表（_theme-tokens.scss）
```

- `gen:api`：从后端 Swagger/OpenAPI JSON 自动生成 `src/types/api.d.ts`
- `gen:theme-tokens`：antd 升级或主色调整后重跑，更新 `_theme-tokens.scss`

---

## 4. 项目结构

```
gvray-vite/
├── docker/                    # Docker 配置（nginx.conf / default.conf / scripts/ / error-pages）
├── mock/                       # Mock 数据（vite-plugin-mock）
├── public/                    # 静态资源
├── scripts/                   # 构建 & 工具脚本
│   ├── dev.ts                 # 开发服务器启动
│   ├── load-env.ts            # 环境变量加载器
│   ├── gen-api-types.ts       # OpenAPI 类型生成器
│   ├── gen-theme-tokens.ts    # 主题 CSS 变量参考表生成器
│   ├── docker-build.ts        # Docker 构建
│   └── docker-deploy.ts       # Docker 部署
├── src/
│   ├── app/                   # 应用入口与组装
│   │   ├── App.tsx            # 组装根：AppProviders + RouterProvider
│   │   ├── bootstrap.ts       # 启动期异步初始化
│   │   ├── request.ts         # 网络请求客户端初始化
│   │   └── httpConfig.ts     # 请求 / 响应拦截器与错误处理
│   ├── components/            # 全局公共组件（index.ts 统一导出）
│   ├── constants/            # 全局常量
│   ├── hocs/                 # 高阶组件（withErrorBoundary 等）
│   ├── hooks/                # 自定义 Hooks（index.ts 统一导出）
│   ├── layouts/
│   │   ├── BasicLayout/      # 路由根（认证守卫 / 标题 / RouteMeta）
│   │   └── Layout/           # 视觉壳（Sider / Header / Content）
│   ├── locales/              # 国际化资源（zh-CN / en-US）
│   ├── pages/                # 页面组件
│   ├── providers/            # Provider 组合（AppProviders / Intl / RouteMeta / StyledTheme）
│   ├── router/               # 路由
│   │   ├── routes.ts         # 路由配置（AppRouteObject[]）
│   │   └── index.tsx         # 路由解析（componentMap + createBrowserRouter）
│   ├── services/             # API 服务层
│   ├── stores/               # Zustand 状态管理
│   │   ├── useAuthStore.ts   # 认证状态
│   │   ├── useDictStore.ts   # 字典缓存
│   │   ├── useSettingStore.ts# 全局设置（主题、侧边栏等）
│   │   └── index.ts          # 统一导出
│   ├── styles/               # 全局样式
│   │   ├── variables.scss    # 编译期常量（断点）
│   │   ├── mixins.scss       # SCSS Mixins
│   │   ├── global.scss       # 全局样式 + 自定义运行时变量
│   │   └── _theme-tokens.scss# antd CSS 变量参考表（自动生成）
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数（含 runtime-config）
├── vite/                     # Vite 插件
│   └── plugins/              # env / mock / index
├── vite.config.ts
└── package.json
```

> `vite.config.ts` 通过 `css.preprocessorOptions.scss.additionalData` 自动向每个 SCSS 文件注入 `variables.scss` + `mixins.scss`，无需手动 `@use`。

---

## 5. 路由与权限

### 5.1 路由配置

路由定义在 [src/router/routes.ts](../src/router/routes.ts)，采用 React Router 8 配置式：

```ts
{
  path: '/system/user',
  component: 'pages/System/User',
  meta: {
    title: '用户管理',
    permissions: ['system:user:list'],
  },
}
```

- **`component`**：组件路径标识，由 `src/router/index.tsx` 的 `componentMap` 解析为懒加载组件
- **`meta.title`**：页面标题，`BasicLayout` 通过 `useRouteMeta()` 读取并经 Helmet 设置 `<title>`
- **`meta.permissions`**：页面所需权限码，`BasicLayout` 校验
- **`meta.auth`**：`false` 表示免登录（登录 / 注册 / 404）

### 5.2 路由解析

`src/router/index.tsx`：

1. `componentMap`：字符串标识 → `lazyProgress(() => import(...))`
2. `normalizeRoutes`：解析 `component` 为 `element`，外层套 `Suspense`（`PageLoading` 兜底）
3. `createBrowserRouter(normalizedRoutes)` 创建路由实例
4. `lazyProgress` 同时驱动 `NavigationProgress`（NProgress 路由进度条）

### 5.3 路由分层

```
BasicLayout (path: '/')          ← 非视觉根：认证守卫 / 权限 / 标题 / RouteMeta
├── /login, /register, /404       ← 各自渲染自己的壳
├── Layout                        ← 视觉壳：Sider / Header / Content
│   ├── / (Dashboard)
│   ├── /system/*
│   └── /monitor/*
└── * (404)
```

### 5.4 权限控制

- **页面级**：`BasicLayout` 校验 `meta.permissions`（超管 `*:*:*` 直接放行，否则要求全部命中，否则跳 `/403`）
- **按钮级**：`<AuthButton>` 组件根据权限码控制渲染
- **菜单级**：动态菜单根据用户权限过滤

---

## 6. 网络请求

### 6.1 请求客户端

基于 `@gvray/request`（axios 封装）初始化，配置在 `src/app/request.ts`：

- `baseURL`：由 `__APP_API_URL__` 全局常量控制
- `timeout`：由 `__APP_API_TIMEOUT__` 控制
- 拦截器：在 `src/app/httpConfig.ts` 中配置请求 / 响应拦截与统一错误处理

### 6.2 服务层

`src/services/` 按业务模块组织 API 调用：

| 文件 | 模块 |
| --- | --- |
| `auth.ts` | 登录鉴权 |
| `user.ts` | 用户管理 |
| `role.ts` | 角色管理 |
| `permission.ts` | 权限管理 |
| `menu.ts` | 菜单管理 |
| `department.ts` | 部门管理 |
| `position.ts` | 岗位管理 |
| `dictionary.ts` | 字典管理 |
| `config.ts` | 系统配置 |
| `notice.ts` | 通知公告 |
| `dashboard.ts` | 仪表盘 |
| `monitor.ts` | 服务监控 |
| `onlineUser.ts` | 在线用户 |
| `cacheMonitor.ts` | 缓存监控 |
| `loginLog.ts` | 登录日志 |
| `operationLog.ts` | 操作日志 |
| `profile.ts` | 个人资料 |

---

## 7. Mock 数据

### 7.1 使用方式

基于 `vite-plugin-mock`，Mock 文件位于 `mock/` 目录，采用 Express 风格定义：

```ts
export default {
  'POST /api/auth/login': async (req, res) => {
    await sleep(800);
    res.json({ success: true, code: 200, data: { ... } });
  },
};
```

### 7.2 开关控制

- `.env.dev` 中 `APP_MOCK_ENABLED=true` 启用 Mock
- `.env.staging` 中 `APP_MOCK_ENABLED=false` 关闭 Mock，连接真实后端
- Mock 文件运行在 Node.js 环境，如遇 `@/` 别名不解析，改用相对路径（如 `../src/constants`）

### 7.3 覆盖范围

当前 Mock 覆盖：auth、dashboard、dictionary、notices 等模块。如需全量真实数据，请启动后端 [gvray-admin](https://github.com/gvray/gvray-admin)。

---

## 8. 状态管理

项目使用 **Zustand 5** 作为轻量状态管理方案，Store 位于 `src/stores/`：

| Store | 职责 |
| --- | --- |
| `useAuthStore.ts` | 登录态、token、用户信息、权限列表 |
| `useSettingStore.ts` | 全局设置（主题模式、`colorPrimary`、语言、侧边栏、色弱 等，`persist` → localStorage） |
| `useDictStore.ts` | 字典数据缓存 |

均配合 `persist`（持久化）与 `immer`（不可变更新）中间件。

---

## 9. 主题与样式

### 9.1 主题定制

- 主题配置入口：`src/providers/AppProviders.tsx` 的 `ConfigProvider`
- antd 6 原生 `cssVar: { prefix: 'gvray', key: 'gvray' }` 把 token 注入为 `--gvray-*` CSS 变量
- 主题算法（亮色 / 暗色）由 `useAppTheme()` 返回的 `themeAlgorithm` 控制
- 主色、主题模式等由 `useSettingStore` 管理，支持实时切换

### 9.2 样式方案

- **全局样式**：`src/styles/global.scss`
- **页面样式**：SCSS（`.scss` 文件）
- **组件样式**：`styled-components`（CSS-in-JS）
- **主题变量**：antd 6 原生 cssVar 注入的 `--gvray-*` CSS 变量，统一管理
- **编译期常量**：`src/styles/variables.scss`（响应式断点 `$bp-*`）

> 详细规范见 [theme-guidelines.md](./theme-guidelines.md)。

---

## 10. 国际化

国际化资源位于 `src/locales/`：

```
src/locales/
├── zh-CN/       # 中文子模块
└── en-US/       # 英文子模块
```

通过自建 `IntlProvider`（基于 react-intl）实现，默认语言为 `zh-CN`。使用 `useIntl()` 或 `<FormattedMessage>` 在组件中引用翻译。

---

## 11. 公共组件

所有公共组件通过 `src/components/index.ts` 统一导出：

| 组件 | 说明 |
| --- | --- |
| `PageContainer` | 页面容器 |
| `ErrorBoundary` | 全局错误边界，捕获渲染异常 |
| `NavigationProgress` | 路由切换进度条（NProgress） |
| `AuthButton` | 权限按钮，根据权限码控制渲染 |
| `TablePro` | 增强表格组件 |
| `Charts` | ECharts 图表封装 |
| `PermissionTree` | 权限树组件 |
| `StatusTag` | 状态标签（启用/禁用等） |
| `DateTimeFormat` | 日期时间格式化组件 |
| `DictionaryLabel` / `DictionarySelect` | 字典标签 / 选择器 |
| `AppBreadcrumb` | 面包屑 |
| `AppWatermark` | 全局水印 |
| `PageLoading` / `PagePlaceholder` | 页面加载 / 空状态占位 |
| `FormGrid` / `FormLoading` | 表单网格 / 表单加载 |
| `BackButton` | 返回按钮 |
| `CellName` / `CopyId` | 单元格名称 / ID 复制 |

---

## 12. 自定义 Hooks

通过 `src/hooks/index.ts` 统一导出：

| Hook | 说明 |
| --- | --- |
| `useAuth` | 登录鉴权逻辑 |
| `useAppTheme` | 主题管理（返回 themeAlgorithm） |
| `useThemeMode` | 主题模式切换 |
| `useRouteMeta` | 获取当前路由元信息 |
| `useConfig` | 读取系统配置值 |
| `useDict` | 字典数据 Hook |
| `useFeedback` | 反馈 Hook（message / modal） |

---

## 13. 新增页面流程

1. **创建页面组件**：在 `src/pages/` 下新建目录和 `index.tsx`
2. **注册组件映射**：在 `src/router/index.tsx` 的 `componentMap` 中添加字符串标识 → 懒加载
3. **注册路由**：在 `src/router/routes.ts` 中添加路由配置，设置 `meta.title` 和 `meta.permissions`
4. **添加 API 服务**：在 `src/services/` 中新建对应服务文件
5. **添加 Mock**（可选）：在 `mock/` 中添加对应 Mock 数据
6. **添加菜单**：在后端或 Mock 中注册菜单项

```tsx
import { PageContainer } from '@/components';

const MyPage: React.FC = () => {
  return <PageContainer>{/* 页面内容 */}</PageContainer>;
};

export default MyPage;
```

---

## 14. 调试技巧

- **环境变量检查**：启动时控制台会打印环境变量，确认配置正确
- **Mock 调试**：Mock 文件修改后自动热更新，无需重启
- **TypeScript 检查**：`npx tsc -b --noEmit` 快速检查类型错误
- **React DevTools**：推荐安装 React Developer Tools 浏览器扩展
- **网络请求**：所有请求错误会通过 `httpConfig.ts` 统一处理并弹出提示

---

## 15. 注意事项

- **环境变量必须以 `APP_` 开头**：非 `APP_` 前缀的变量不会被加载映射为 `__APP_*__`
- **路由 `meta` 是自定义扩展**：React Router 原生 `RouteObject` 不含 `meta`，通过 `AppRouteObject` 扩展，由 `useRouteMeta` Hook 解析
- **组件需在 `componentMap` 注册**：`routes.ts` 中的 `component` 字符串必须在 `index.tsx` 的 `componentMap` 中有对应映射
- **pnpm 严格模式**：项目使用 pnpm，不要混用 npm/yarn 安装依赖
- **Node.js 版本**：确保使用 Node.js 20.19+，低版本可能导致构建脚本异常

## 16. 命名规范

| 层 | 作用 | 命名关注点 |
| --- | --- | --- |
| **Service** | 调用后端 API，REST 风格 | 用后端 API 风格：`createUser` / `updateUser` / `deleteUser` / `queryUsersList` |
| **Model / Store** | 管理前端状态、业务逻辑 | 用业务动作语义：`addUser` / `editUser` / `removeUser` / `fetchUsersList` |
| **UI / Component** | 页面事件触发、Prop 绑定 | handle + Model 方法：`handleAddUser` / `handleUpdateUser` / `handleDeleteUser` |

## 17. 分支管理

- `feature/*` → 每个新功能或 bug 修复
- `develop` → 测试环境，集成所有 feature
- `release/*` → 准备发版，冻结功能，做最终测试
- `main` → 生产环境，始终稳定
- `hotfix/*` → 紧急修复生产环境 bug
