# 主题系统使用规范

> 规范版本：v3.0 | 适配 antd 6 + SCSS + Vite

## 一、核心原则

```
单一来源：useSettingStore → ConfigProvider → antd cssVar 注入 → CSS 变量
作用域：  CSS 变量由 antd 注入到 .gvray class（根容器），不是 :root
统一通道：所有自定义样式必须通过 CSS 变量消费主题色
禁止硬编码：任何颜色值必须从 token 或 CSS 变量来，禁止写死 #xxx
```

## 二、技术栈角色分工

| 技术 | 职责 | 颜色消费方式 |
| --- | --- | --- |
| **antd 6** | UI 组件库 | `ConfigProvider` + cssinjs + 原生 `cssVar`，自动响应 |
| **SCSS** | 页面级样式 | 只写结构，颜色全部用 `var(--gvray-color-xxx)` |
| **styled-components** | 组件级样式 | 直接用 `var(--gvray-color-xxx)`，不用 `props.theme` |
| **ECharts** | 图表 | `theme.useToken()` 获取 token 注入 option |
| **TSX inline style** | 极少数场景 | 用 `var(--gvray-color-xxx)` 或 `theme.useToken()` |

## 三、变量来源与作用域

与旧版（antd 5 + 手写 `ThemeTokenInjector`）不同，本项目直接使用 **antd 6 原生 `cssVar`** 注入：

```tsx
// src/providers/AppProviders.tsx
<ConfigProvider
  theme={{
    algorithm: themeAlgorithm,
    cssVar: { prefix: 'gvray', key: 'gvray' },
    token: { colorPrimary, colorInfo: colorPrimary },
  }}
>
```

- antd 把所有 token 注入为 `--gvray-*` CSS 变量，作用域是 `.gvray` class（由根容器挂载）。
- **不是 `:root`**：`<html>` / `:root` 级样式拿不到这些变量，需要的话必须在 `global.scss` 自行声明。
- 完整变量列表（439 项）见 `src/styles/_theme-tokens.scss`（自动生成，勿手改）。
- 项目自定义变量（阴影、侧边栏主题）见 `src/styles/global.scss`。

### 生成 / 更新变量参考表

```bash
pnpm gen:theme-tokens
```

`scripts/gen-theme-tokens.ts` 在 jsdom 里真渲染 `<ConfigProvider theme={{ cssVar }}>`，读取 antd cssinjs 注入的真实样式表，生成 `_theme-tokens.scss`（纯注释参考表，不参与编译）。antd 升级或主色调整后重跑。

## 四、使用规范（按场景）

### 4.1 SCSS 文件 → 全部用 CSS 变量

```scss
/* ✅ 正确 */
.my-card {
  color: var(--gvray-color-text);
  background: var(--gvray-color-bg-container);
  border: 1px solid var(--gvray-color-border);

  &:hover {
    background: var(--gvray-color-primary-bg);
    border-color: var(--gvray-color-primary-border);
  }
}

/* ❌ 错误 */
.my-card {
  color: #666; // 硬编码
  background: #fff;
  border: 1px solid #d9d9d9;
}
```

**重要**：不要通过 SCSS 变量包装 CSS 变量——SCSS 变量在编译期固化，会丢失运行时动态性：

```scss
/* ❌ 错误 - SCSS 编译期把 CSS 变量求值为静态字符串，主题切换失效 */
$primary: var(--gvray-color-primary);
.button {
  color: $primary;
}

/* ✅ 正确 - 直接使用 */
.button {
  color: var(--gvray-color-primary);
}
```

> SCSS 变量（`$`）只用于**编译期常量**，如响应式断点 `$bp-sm` … `$bp-xxl`（见 `variables.scss`）。

### 4.2 styled-components → 用 CSS 变量

```tsx
// ✅ 正确：样式静态，主题变化由 CSS 变量驱动，React 不重渲染
const MyBox = styled.div`
  color: var(--gvray-color-text);
  background: var(--gvray-color-bg-container);
  border: 1px solid var(--gvray-color-border);

  &:hover {
    background: var(--gvray-color-primary-bg);
  }
`;

// ❌ 错误：主题变化时 styled-components 会重新生成样式、插入 style 标签
const MyBoxBad = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

// ❌ 错误：ThemeProvider 注入 antd token 导致双上下文
<ThemeProvider theme={antdToken}>
  <MyBox /> // 消费 props.theme.colorPrimary
</ThemeProvider>;
```

**唯一例外**：布局参数（width、height、position 等）可以用 transient props（`$` 前缀）传递。

### 4.3 TSX inline style → CSS 变量或 useToken

```tsx
// ✅ 正确：使用 CSS 变量
<span style={{ color: 'var(--gvray-color-primary)' }} />

// ✅ 正确：在组件内用 useToken
import { theme } from 'antd';
const { token } = theme.useToken();
<Progress strokeColor={{ from: token.colorPrimary, to: token.colorPrimaryHover }} />

// ❌ 错误
<span style={{ color: '#1890ff' }} />
```

### 4.4 ECharts 图表 → useToken 注入

```tsx
import { theme } from 'antd';

const MyChart = () => {
  const { token } = theme.useToken();

  const option = {
    xAxis: {
      axisLabel: { color: token.colorTextSecondary },
    },
    yAxis: {
      splitLine: { lineStyle: { color: token.colorFillSecondary } },
    },
    tooltip: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      textStyle: { color: token.colorText },
    },
    // 数据系列颜色保留，用于区分数据
    series: [{ data: [...], itemStyle: { color: '#667eea' } }],
  };

  return <ReactECharts option={option} />;
};
```

### 4.5 颜色消费方式

| 场景 | 推荐方式 |
| --- | --- |
| SCSS / styled-components | `var(--gvray-color-xxx)` |
| ECharts / Canvas | `theme.useToken()` |
| TSX inline style | `var(--gvray-color-xxx)` 或 `theme.useToken()` |

不要自定义 Hook 封装颜色，CSS 变量和 `useToken` 已经覆盖所有场景。

## 五、CSS 变量命名规范

命名规则：antd 6 token 名转 kebab-case，前缀为 `--gvray-`（由 `cssVar: { prefix: 'gvray' }` 决定）。

```
colorPrimary        → --gvray-color-primary
colorBgContainer    → --gvray-color-bg-container
colorTextSecondary  → --gvray-color-text-secondary
borderRadiusLG      → --gvray-border-radius-lg
```

> 连续大写的合并由 antd 运行时决定，不靠手猜；以 `_theme-tokens.scss` 的实际输出为准。

完整变量列表见 `src/styles/_theme-tokens.scss`。

## 六、常见颜色替换对照

| 硬编码值 | 替换为 |
| --- | --- |
| `#fff`, `#ffffff` | `var(--gvray-color-bg-container)` |
| `#000`, `#000000` | `var(--gvray-color-text)` |
| `#666` | `var(--gvray-color-text-secondary)` |
| `#999`, `#bfbfbf`, `#8c8c8c`, `#bbb` | `var(--gvray-color-text-placeholder)` |
| `#888` | `var(--gvray-color-text-secondary)` |
| `#d9d9d9` | `var(--gvray-color-border)` |
| `#f0f0f0`, `#f5f5f5` | `var(--gvray-color-border)` 或 `var(--gvray-color-fill)` |
| `#fafafa` | `var(--gvray-color-bg-elevated)` |
| `#e6e6e6` | `var(--gvray-color-fill)` |
| `#1890ff`, `#1677ff` | `var(--gvray-color-primary)` |
| `#52c41a` | `var(--gvray-color-success)` |
| `#faad14` | `var(--gvray-color-warning)` |
| `#ff4d4f` | `var(--gvray-color-error)` |
| `#722ed1` | `var(--gvray-color-info)` |
| `rgba(0,0,0,0.45)` | `var(--gvray-color-text-secondary)` |
| `rgba(0,0,0,0.25)` | `var(--gvray-color-text-placeholder)` |
| `rgba(0,0,0,0.06)` | `var(--gvray-color-fill)` |
| `rgba(255,255,255,0.75)` | `var(--gvray-color-bg-mask)` |

## 七、架构图

```
┌─────────────────────────────────────────────────────────────┐
│  Zustand Store (useSettingStore)                             │
│  theme | colorPrimary | colorWeak | language                │
│  persist → localStorage                                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  ConfigProvider (AppProviders)                                │
│  theme={{ algorithm, cssVar: { prefix: 'gvray', key },      │
│           token: { colorPrimary, colorInfo } }}              │
└────────────────────────┬─────────────────────────────────────┘
                         │ antd cssinjs 注入到 .gvray 作用域
┌────────────────────────▼─────────────────────────────────────┐
│  CSS 变量（.gvray class 作用域）                              │
│  colorPrimary → --gvray-color-primary                         │
│  colorBgContainer → --gvray-color-bg-container  ...           │
└────────────┬───────────┬───────────┬────────────────────────┘
             │           │           │
      ┌──────▼───┐ ┌────▼────┐ ┌────▼────┐
      │  antd    │ │  SCSS   │ │ styled  │
      │ 组件     │ │ 页面    │ │ 组件    │
      │ cssinjs  │ │ var()   │ │ var()   │
      └──────────┘ └─────────┘ └─────────┘
                         │
                  ┌──────▼──────┐
                  │  ECharts    │
                  │ useToken()  │
                  └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│  global.scss 手动声明（:root / [data-theme] / [data-sider]）│
│  --gvray-shadow-card(-lg)   亮/暗各一份                       │
│  --gvray-sider-*             侧边栏独立主题                   │
└─────────────────────────────────────────────────────────────┘
```

## 八、FAQ

**Q1: 为什么不用 styled-components 的 ThemeProvider？**

A: 三个原因：

1. 双上下文（ConfigProvider + ThemeProvider）维护成本高
2. styled-components 的 `props.theme` 动态插值会导致重渲染
3. CSS 变量是更轻量的跨技术栈方案，antd、SCSS、styled-components 都能消费

**Q2: SCSS 中能不能用 CSS 变量做运算？**

A: 不能直接用 SCSS 运算（SCSS 的 `/`、`+` 在编译期处理 CSS 变量会出错），但可以用浏览器原生 `calc()`：

```scss
/* ❌ 错误 - SCSS 编译期无法处理 CSS 变量 */
width: var(--gvray-border-radius) * 2;

/* ✅ 正确 - calc 在浏览器运行期计算 */
width: calc(var(--gvray-border-radius) * 2);
```

**Q3: 切换主题时 CSS 变量怎么生效？**

A: 由 antd 6 原生 `cssVar` 驱动，无需手写注入器：

1. `useAppTheme()` 根据设置返回 `themeAlgorithm`（`defaultAlgorithm` / `darkAlgorithm`）
2. `ConfigProvider` 的 `theme.algorithm` 变化 → antd cssinjs 重新注入 `.gvray` 作用域的变量
3. 浏览器重新计算所有 `var(--gvray-color-xxx)` 的值
4. React 组件**不会**因样式值变化重渲染（样式规则不变，只是变量值变了）

项目自定义变量（`--gvray-shadow-card` 等）通过 `<html data-theme>` 切换，由 `global.scss` 的 `:root[data-theme='dark']` 提供。

**Q4: 为什么 `:root` 级样式拿不到 `--gvray-color-*`？**

A: antd `cssVar` 把变量注入到 `.gvray` class（根容器），而非 `:root`。`.gvray` 之内的子树都能解析，但 `<html>` / `:root` 级别的样式（如全局 `body` 背景）需要用项目在 `global.scss` 自行声明的变量，或改写到 `.gvray` 作用域内。

**Q5: 新组件怎么接入主题？**

A: 三步：

1. 需要动态值 → `theme.useToken()` 获取 token
2. 写样式 → 用 `var(--gvray-color-xxx)` CSS 变量
3. 不要 → 写死任何 `#xxx` 颜色值

**Q6: Dashboard 渐变卡片为什么保留 `color: #fff`？**

A: 渐变卡片的背景是深色渐变（`linear-gradient(135deg, ...)`），文字必须在任何主题下都是白色才能可读。这是**装饰性硬编码**，不是主题色。

## 九、检查清单（Code Review）

提交 PR 时检查：

- [ ] 没有 `#1890ff`、`#1677ff` 等主色硬编码
- [ ] 没有 `#fff` / `#ffffff` / `#000` 等极端色（除非装饰性场景）
- [ ] SCSS 中所有颜色使用 `var(--gvray-color-xxx)`
- [ ] SCSS 中没有用 `$` 变量二次包装 CSS 变量
- [ ] styled-components 中没有 `${props => props.$color}` 动态插值传递主题色
- [ ] ECharts 使用 `theme.useToken()` 获取颜色
- [ ] 新增/修改的组件在暗色主题下测试通过
