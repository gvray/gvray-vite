# 架构设计文档

> 本文档描述 Gvray Admin（Vite 版）的系统架构与实现。

## 技术栈

| 层 | 技术 | 说明 |
| --- | --- | --- |
| UI 框架 | React 19 | 声明式组件模型 |
| 构建工具 | Vite 8（Rolldown） | 开发期 HMR、生产期构建 |
| 编译优化 | React Compiler | `babel-plugin-react-compiler`，自动 memo，减少手动优化 |
| 语言 | TypeScript | 全量类型 |
| UI 组件库 | Ant Design 6 | `ConfigProvider` + 原生 `cssVar` |
| 路由 | React Router 8 | `createBrowserRouter`，配置式路由 |
| 状态管理 | Zustand 5 | `persist` + `immer` 中间件 |
| 样式 | SCSS + CSS 变量 + styled-components | 三层分工（见 [theme-guidelines.md](./theme-guidelines.md)） |
| 网络请求 | `@gvray/request`（axios 封装） | 拦截器、统一错误处理 |
| 国际化 | react-intl 10 | 自建 `IntlProvider` |
| Mock | vite-plugin-mock | 开发期 Mock |
| 文档标题 | react-helmet-async | 路由级 `<title>` |
| 图表 | ECharts 6 | `useToken` 注入主题色 |

---

## 整体分层

```
全局 Provider（AppProviders：Helmet / Intl / ConfigProvider / StyledTheme）
       ↓
RouterProvider（react-router 8）
       ↓
BasicLayout（路由根：认证守卫 / 权限 / 标题 / RouteMetaProvider）
       ↓
Layout（视觉壳：Sider / Header / Content）
       ↓
业务页面（System / Monitor / Dashboard …）
       ↓
Services（src/services/* → @gvray/request）
       ↓
Stores（Zustand：useAuthStore / useSettingStore / useDictStore）
```

### 关键设计：Provider 与布局分离

- **全局 Provider** 放在 `src/app/App.tsx` → `AppProviders`，覆盖**所有**路由（包括登录、注册、404 这些无后台布局的页面）。
- **BasicLayout**（`path: '/'`）是所有页面的公共根，只承担**非视觉、需路由上下文**的职责：认证 / 权限守卫、文档标题、`RouteMetaProvider`、全局视觉态类名。它本身不含 Sider/Header。
- **Layout** 是 BasicLayout 下的子布局，负责后台**视觉壳**（Sider / Header / Content）。
- 登录 / 注册直接挂在 BasicLayout 下，各自渲染自己的壳（独立背景 + 亮色 `ConfigProvider`）。

---

## 入口与组装

```
index.html → main.tsx → createRoot → <App />
```

- `src/app/App.tsx`：`AppProviders` 包裹 `RouterProvider`，是应用组装的唯一根。
- `src/app/bootstrap.ts`：启动期异步初始化（运行时配置加载等）。`AppProviders` 在 `useEffect` 中调用 `bootstrap()`，完成前显示 `PageLoading` splash，ready 后再渲染子树。
- 只有一个 `ConfigProvider`：`theme` + `locale` + `App` 统一配置，避免嵌套。

---

## 路由

路由采用 **React Router 8 配置式**方案，定义在 [src/router/routes.ts](../src/router/routes.ts)：

```ts
export interface AppRouteObject extends Omit<RouteObject, 'children' | 'element'> {
  component?: string;              // 组件路径标识，由 normalizeRoutes 解析
  meta?: RouteMeta & { auth?: boolean };
  children?: AppRouteObject[];
}
```

- `meta.title`：页面标题，`BasicLayout` 通过 `useRouteMeta()` 读取并经 Helmet 设置 `<title>`。
- `meta.permissions`：页面所需权限码，`BasicLayout` 校验。
- `meta.auth`：`false` 表示免登录（登录 / 注册 / 404）。

[src/router/index.tsx](../src/router/index.tsx) 负责解析：

1. `componentMap`：字符串标识 → `lazyProgress(() => import(...))` 懒加载组件。
2. `normalizeRoutes`：把 `component` 字符串解析成真实 `element`，外层套 `Suspense`（`PageLoading` 兜底）。
3. `createBrowserRouter(normalizedRoutes)` 创建路由实例。

`lazyProgress` 同时驱动 `NavigationProgress`（NProgress 路由切换进度条）。

---

## 认证与权限

守卫逻辑集中在 [BasicLayout](../src/layouts/BasicLayout/index.tsx)：

1. `meta.auth !== false` 且未登录 → `redirectToLogin()`。
2. 已登录时校验 `meta.permissions`：超管（`*:*:*`）直接放行，否则要求全部权限码命中，否则 `<Navigate to="/403" />`。

权限三层控制：

- **页面级**：`BasicLayout` 校验 `meta.permissions`。
- **按钮级**：`<AuthButton>` 组件根据权限码控制渲染。
- **菜单级**：动态菜单根据用户权限过滤。

登录态、token、用户信息、权限列表由 `useAuthStore` 管理。

---

## 状态管理

| Store | 职责 |
| --- | --- |
| `useAuthStore` | 登录态、token、用户信息、权限列表 |
| `useSettingStore` | 主题模式 / `colorPrimary` / 语言 / 侧边栏 / 色弱 等用户偏好（`persist` → localStorage） |
| `useDictStore` | 字典数据缓存 |

均使用 Zustand，配合 `persist`（持久化）与 `immer`（不可变更新）中间件。

---

## 主题与样式

> 完整规范见 [theme-guidelines.md](./theme-guidelines.md)，此处仅述架构要点。

- antd 6 **原生 `cssVar: { prefix: 'gvray', key: 'gvray' }`** 把 token 注入为 CSS 变量，作用域是 `.gvray` class（由根容器挂载），**不是 `:root`**。
- 项目自定义运行时变量（阴影、侧边栏主题）在 [global.scss](../src/styles/global.scss) 手动声明于 `:root` / `[data-theme='dark']` / `[data-sider-theme]`。
- SCSS 变量（`$bp-*`）仅用于**编译期常量**（响应式断点）；运行时 / 主题相关值一律走 CSS 变量。
- `_theme-tokens.scss` 是 `scripts/gen-theme-tokens.ts` 自动生成的纯注释参考表（439 项），勿手改。

---

## 环境变量

加载链路：`scripts/load-env.ts`（dotenv 读取 `.env.{mode}` + `.env` 覆盖）→ `vite/plugins/env.ts`（`createAppDefines`）→ Vite `define` 注入 `__APP_*__` 全局常量。

`APP_DEFAULTS`（在 `env.ts`）是默认值的单一来源，**同时决定类型转换**（number / boolean / string）：

| 变量名 | 类型 | 说明 |
| --- | --- | --- |
| `APP_ENV` | string | 当前环境标识 |
| `APP_API_URL` | string | API 请求前缀 |
| `APP_API_ORIGIN` | string | API 源地址 |
| `APP_API_TIMEOUT` | number | 请求超时（ms） |
| `APP_API_TOKEN_KEY` | string | Token 存储 key |
| `APP_MOCK_ENABLED` | boolean | 是否启用 Mock |
| `APP_LOGGING_ENABLED` | boolean | 请求日志开关 |
| `APP_DEFAULT_LANGUAGE` | string | 默认语言 |
| `APP_CDN_URL` | string | CDN 地址 |
| `APP_VERSION` / `APP_BUILD_TIME` | string | 构建版本 / 时间 |
| `APP_SENTRY_DSN` / `APP_TRACKING_ID` | string | 监控 / 埋点（可选） |

> 注意：只有 `APP_` 前缀的变量会被加载并映射为 `__APP_*__`。

---

## Mock

- 基于 `vite-plugin-mock`，`mockPath: 'mock'`，由 `APP_MOCK_ENABLED` 控制开关。
- Mock 文件位于 `mock/`，当前覆盖 auth / dashboard / dictionary / notices 等模块。
- `.env.dev` 开启 Mock，`.env.staging` 关闭连接真实后端。

---

## 网络请求

- `src/app/request.ts`：`@gvray/request`（axios 封装）初始化，`baseURL` / `timeout` 由 `__APP_*__` 控制。
- `src/app/httpConfig.ts`：请求 / 响应拦截器、统一错误处理。
- `src/services/*`：按业务模块组织 API 调用（auth / user / role / permission / department / position / dictionary / config / menu / notice / monitor / loginLog / operationLog 等）。

---

## 目录结构

```
gvray-vite/
├── docker/                    # Docker 配置（nginx.conf / default.conf / scripts/）
├── mock/                       # Mock 数据（vite-plugin-mock）
├── public/                     # 静态资源
├── scripts/                    # 构建 & 工具脚本
│   ├── dev.ts                  # 开发服务器启动
│   ├── load-env.ts             # 环境变量加载器
│   ├── gen-api-types.ts        # OpenAPI 类型生成
│   ├── gen-theme-tokens.ts     # 主题 CSS 变量参考表生成
│   └── docker-build.ts         # Docker 构建
├── src/
│   ├── app/                    # 应用入口与组装
│   │   ├── App.tsx             # 组装根：AppProviders + RouterProvider
│   │   ├── bootstrap.ts        # 启动期异步初始化
│   │   ├── request.ts          # 请求客户端初始化
│   │   └── httpConfig.ts      # 拦截器 / 错误处理
│   ├── components/             # 全局公共组件（统一 index.ts 导出）
│   ├── constants/             # 全局常量
│   ├── hocs/                  # 高阶组件
│   ├── hooks/                 # 自定义 Hooks（统一 index.ts 导出）
│   ├── layouts/
│   │   ├── BasicLayout/       # 路由根（认证守卫 / 标题 / RouteMeta）
│   │   └── Layout/            # 视觉壳（Sider / Header / Content）
│   ├── locales/               # 国际化资源（zh-CN / en-US）
│   ├── pages/                 # 页面组件
│   ├── providers/             # Provider 组合（AppProviders / Intl / RouteMeta / StyledTheme）
│   ├── router/                # 路由（routes.ts 配置 + index.tsx 解析）
│   ├── services/              # API 服务层
│   ├── stores/                # Zustand 状态管理
│   ├── styles/                # 全局样式（variables / mixins / global / _theme-tokens）
│   ├── types/                 # TypeScript 类型定义
│   └── utils/                 # 工具函数（含 runtime-config）
├── vite/                      # Vite 插件（env / mock / plugins）
├── vite.config.ts
└── package.json
```

---

## 与 Umi 版（gvray-react）的主要差异

| 维度 | gvray-react（Umi 4） | gvray-vite（Vite 8） |
| --- | --- | --- |
| 构建 | Umi（Webpack） | Vite（Rolldown）+ React Compiler |
| 路由 | Umi 约定式路由 | React Router 8 配置式（`routes.ts`） |
| 运行时配置 | Umi `app.tsx` / `getInitialState` | `AppProviders` + `bootstrap.ts` |
| 样式预处理 | Less | SCSS |
| 主题变量注入 | antd v5 + 手写 `ThemeTokenInjector` 写 `<style>` | antd v6 原生 `cssVar` 注入 `.gvray` 作用域 |
| 环境变量 | Umi `define` + `config/define.ts` | `vite/plugins/env.ts` + `scripts/load-env.ts` |
| Mock | Umi 内置 mock | vite-plugin-mock |
| React / antd | React 18 / antd 5 | React 19 / antd 6 |

---

## 架构风险与制约

- **`.gvray` 作用域**：antd cssVar 注入到 `.gvray` class（根容器），而非 `:root`。`<html>` / `:root` 级样式拿不到这些变量，需在 `global.scss` 自行声明（见主题规范）。
- **SCSS 变量 vs CSS 变量**：SCSS 变量编译期即固化，会丢失运行时动态性——主题色等运行时值不得用 SCSS 变量二次包装。
- **路由静态性**：当前 `routes.ts` 为静态配置，菜单由后端动态下发并按权限过滤；如需完全动态路由可在此基础上扩展。
- **状态拆分**：Zustand 轻量友好，大型业务状态需配合 Immer 与合理的 Store 拆分策略。
