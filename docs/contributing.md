# 贡献指南（Contributing Guide）

感谢你对 Gvray Admin 的关注与贡献！本文档说明如何参与项目开发、提交代码和报告问题。

---

## 1. 行为准则

- 尊重每一位贡献者，保持友善、专业的沟通态度
- 提交前充分测试，确保不引入新的问题
- 遵循项目已有的代码风格和架构规范

---

## 2. 参与方式

### 2.1 报告 Bug

1. 在 [Issues](https://github.com/gvray/gvray-vite/issues) 中搜索是否已有相同问题
2. 如果没有，创建新 Issue，请包含：
   - **环境信息**：Node.js 版本、pnpm 版本、浏览器、操作系统
   - **复现步骤**：清晰的操作步骤
   - **期望行为**：你认为应该发生什么
   - **实际行为**：实际发生了什么
   - **截图 / 日志**：如有，请附上控制台报错或截图

### 2.2 功能建议

1. 在 Issues 中创建 Feature Request
2. 描述功能的使用场景和预期效果
3. 如果可能，提供参考实现或设计方案

### 2.3 提交代码

请通过 Pull Request 提交代码，流程见下方。

---

## 3. 开发流程

### 3.1 Fork & Clone

```bash
# Fork 项目到你的 GitHub 账号，然后克隆
git clone https://github.com/<your-username>/gvray-vite.git
cd gvray-vite
pnpm install
```

### 3.2 创建分支

从 `main` 分支创建功能分支：

```bash
git checkout -b feat/your-feature-name
```

分支命名规范：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `feat/` | 新功能 | `feat/user-export` |
| `fix/` | Bug 修复 | `fix/login-redirect` |
| `refactor/` | 重构 | `refactor/request-layer` |
| `docs/` | 文档更新 | `docs/developer-guide` |
| `style/` | 样式调整 | `style/profile-layout` |
| `chore/` | 构建/工具 | `chore/upgrade-antd` |
| `test/` | 测试 | `test/auth-service` |

### 3.3 开发与测试

```bash
# 启动开发服务器（Mock 模式）
pnpm start:dev

# 检查 TypeScript 类型
npx tsc -b --noEmit

# 运行 lint 检查
pnpm lint

# 自动修复
npx eslint . --fix
```

### 3.4 提交代码

项目使用 ESLint（flat config，`eslint.config.js`）做代码检查，基于 `typescript-eslint`。

#### Commit Message 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>
```

**type 类型**：

| type | 说明 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（非新功能、非修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建工具或辅助工具变动 |
| `ci` | CI/CD 配置变更 |
| `revert` | 回滚提交 |

**scope（可选）**：影响范围，如 `auth`、`user`、`layout`、`request`、`mock` 等。

**示例**：

```bash
git commit -m "feat(profile): add avatar upload with crop"
git commit -m "fix(mock): use relative path instead of @/ alias"
git commit -m "docs: update developer guide"
git commit -m "refactor(request): migrate to @gvray/request v2"
git commit -m "chore: upgrade antd to 6.6"
```

### 3.5 推送与 PR

```bash
git push origin feat/your-feature-name
```

在 GitHub 上创建 Pull Request：

1. **标题**：遵循 Commit Message 规范
2. **描述**：说明改动内容、动机和影响范围
3. **关联 Issue**：如有，使用 `Closes #123` 关联
4. **截图**：UI 变更请附上前后对比截图

---

## 4. 代码规范

### 4.1 TypeScript

- 全面使用 TypeScript，避免 `any`（必要时加注释说明）
- 组件 Props 使用 `interface` 定义
- API 响应类型定义在 `src/types/` 中

### 4.2 ESLint

项目配置了 ESLint（flat config），规则基于 `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks`：

```bash
pnpm lint            # 检查
npx eslint . --fix   # 自动修复
```

### 4.3 样式规范

- 页面级样式使用 SCSS（`.scss` 文件，CSS Modules 风格）
- 组件级样式使用 `styled-components`
- 避免内联样式，除非是动态计算值
- 颜色、间距等使用 antd 主题 CSS 变量（`var(--gvray-color-xxx)`），不硬编码
- 详见 [theme-guidelines.md](./theme-guidelines.md)

### 4.4 文件组织

- 组件目录结构：`ComponentName/index.tsx`
- 公共组件放 `src/components/`，并在 `index.ts` 中导出
- 自定义 Hooks 放 `src/hooks/`，并在 `index.ts` 中导出
- API 服务按业务模块放 `src/services/`
- 页面组件放 `src/pages/`

---

## 5. Mock 数据贡献

在 `mock/` 目录添加或修改 Mock 数据时（基于 `vite-plugin-mock`）：

- 使用 Express 风格的路由定义
- 使用 `sleep()` 模拟网络延迟
- Mock 文件运行在 Node.js 环境，如遇 `@/` 别名不解析，改用相对路径（如 `../src/constants`）
- 响应格式统一为：

```ts
{
  success: boolean;
  code: number;
  message: string;
  data: T;
}
```

---

## 6. PR 审查标准

PR 合并前需满足：

- [ ] TypeScript 编译通过（`npx tsc -b --noEmit` 无错误）
- [ ] ESLint 检查通过（`pnpm lint` 无错误）
- [ ] 不引入新的 `console.log`（调试用途除外）
- [ ] 新增组件/Hook 已在对应 `index.ts` 中导出
- [ ] 新增页面已在 `src/router/routes.ts` 中注册
- [ ] 新增 API 已在 `src/services/` 中封装
- [ ] UI 变更附有截图
- [ ] Commit Message 符合规范

---

## 7. 发布流程

项目维护者负责版本发布：

1. 合并所有待发布 PR 到 `main`
2. 更新版本号和 CHANGELOG
3. 执行构建验证：`pnpm build`
4. 打 Tag 并推送
5. 部署到对应环境

---

## 8. 常见问题

### Q: 安装依赖报错？

确保使用 pnpm（不要用 npm 或 yarn）：

```bash
corepack enable
pnpm install
```

### Q: 如何添加新的环境变量？

1. 在 `.env.example` 中添加变量模板
2. 在各 `.env.{mode}` 文件中设置实际值
3. 在 `vite/plugins/env.ts` 的 `APP_DEFAULTS` 中添加默认值（其类型决定 number / boolean / string 转换）
4. 在代码中通过 `__APP_<NAME>__` 全局常量消费

> 注意：只有 `APP_` 前缀的变量才会被加载并映射为 `__APP_*__`。

### Q: 如何添加新的公共组件？

1. 在 `src/components/` 下创建组件目录
2. 在 `src/components/index.ts` 中添加导入和导出
3. 在组件中使用 TypeScript 定义 Props 接口

---

## 9. 联系方式

- **GitHub Issues**：[gvray/gvray-vite/issues](https://github.com/gvray/gvray-vite/issues)
- **作者**：Gavin Ray <gavinbirkhoff@gmail.com>

感谢你的贡献！
