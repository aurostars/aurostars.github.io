# 任务 1 报告：建立测试框架与类型化作品集内容

## 实现内容

- 安装并配置 Vitest、jsdom 与 Testing Library 测试栈。
- 按部署基线固定 `vitest` 为 `3.2.4`，保留 `@types/node ^20`；使用支持 Node 20 的 `jsdom@26.1.0` 与 `@testing-library/jest-dom@6.8.0`。
- 新增 `test`、`test:watch`、`typecheck` 脚本，配置 jsdom、`@` 路径别名、jest-dom 和 `next/image` 测试替身。
- 新增类型化作品集内容，导出 `ProjectSlug`、`ProjectMedia`、`ProjectCase`、`ExperienceItem`、`portfolioCases`、`experiences`、`education`、`capabilities`、`contact`。
- 新增 3 个内容契约测试，覆盖案例顺序与排除项、五步工作流、仓库和媒体路径、实习经历及联系方式。
- 按简报要求对照现有 `src/app/page.tsx`，实习日期、机构与岗位采用仓库当前值；测试 fixture 在同一 RED/GREEN 周期中同步采用这些值。

## RED 命令与关键输出

命令：

```bash
npm test -- src/content/portfolio.test.ts
```

关键输出：

```text
FAIL  src/content/portfolio.test.ts
Error: Failed to resolve import "./portfolio" from "src/content/portfolio.test.ts". Does the file exist?
Test Files  1 failed (1)
```

失败原因符合预期：测试先于生产模块创建，`src/content/portfolio.ts` 尚不存在。

## GREEN 命令与关键输出

命令：

```bash
npm test -- src/content/portfolio.test.ts
```

关键输出：

```text
✓ src/content/portfolio.test.ts (3 tests)
Test Files  1 passed (1)
Tests  3 passed (3)
```

## 测试结果

- `npm test`：通过，1 个测试文件、3 个测试全部通过。
- `npm run typecheck`：通过，无 TypeScript 错误。
- `npm run lint -- vitest.config.ts src/test/setup.ts src/content/portfolio.ts src/content/portfolio.test.ts`：通过，无 ESLint 输出。
- `git diff --check`：通过，无空白错误。
- `npm audit`：安装阶段报告 0 个漏洞。

## 变更文件

- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/content/portfolio.ts`
- `src/content/portfolio.test.ts`

## 自检

- 严格先建立测试并观察到因生产模块缺失而失败，再添加最小内容实现。
- 四个案例 slug、顺序、字段、文案、链接与媒体元数据均按任务简报录入。
- 每个 workflow 由元组类型及运行时测试共同约束为五步。
- 每个案例至少包含一个 `/projects/` 绝对公共路径媒体项。
- 联系方式仅包含 email 与 GitHub，邮箱占位符保持原样。
- 未实现或修改任何页面组件；未修改设计规范或实施计划。
- 已检查实习信息与 `src/app/page.tsx` 的差异，并保留仓库值。

## 问题或担忧

- 简报原始无版本安装命令在当前 npm 解析到 `vitest@5.0.0`，与 `@types/node ^20` 冲突。经用户确认，改为精确固定 `vitest@3.2.4`。
- 当前最新版 `jsdom@30.0.1` 和 `@testing-library/jest-dom@7.0.1` 不支持 Node 20，因此分别使用兼容版本 `26.1.0` 和 `6.8.0`；其余 Testing Library 依赖的 Node 要求亦兼容 Node 20。
- npm 安装提示 `whatwg-encoding@3.1.1` 已弃用；这是 jsdom 依赖树中的传递依赖，不影响测试，且审计无漏洞。

## Task 1 审查修复（2026-09-11）

### 修复说明

- 使用公开 npm registry 从无 `node_modules`、无旧锁文件的状态重新生成 `package-lock.json`，未使用 `--legacy-peer-deps`；保持 `@types/node` 为 `^20`、`vitest` 为精确版本 `3.2.4`。
- 将四个 slug 对应的仓库地址改为完整 URL 契约断言，不再仅检查 `aurostars` 账号前缀。
- 为 Resume Builder provenance 增加契约断言，并根据 `case-resume-builder/README.md` 中可核验的说明，明确上游仓库及个人修改范围：API 提供商扩展、主题色预设与模板扩充、简历快速生成、JD 定制优化、STAR 法则改写、中英简历互译和多格式导出。
- 未处理后续 UI 任务。

### RED / GREEN 证据

- RED：`npm test -- src/content/portfolio.test.ts`，新增 provenance 契约按预期失败：期望具体上游 URL 与修改范围，实际仍为笼统约束；结果为 1 failed、3 passed。
- GREEN：同一命令修复后通过；结果为 1 个测试文件、4 个测试全部通过。

### 锁文件与验证

- 干净安装：`npm_config_registry=https://registry.npmjs.org npx --yes --package=node@20 node "$(command -v npm)" ci --ignore-scripts --registry=https://registry.npmjs.org`，通过（Node 20 运行 npm，新增 465 个包）。
- `npm test`：通过。
- `npx tsc --noEmit`：通过。
- `npx eslint src/content/portfolio.ts src/content/portfolio.test.ts`：通过。
- `git diff --check`：通过。
- `rg 'bnpm\.byted\.org' package-lock.json`：无匹配。
- 版本契约：`@types/node` 为 `^20`，`vitest` 为 `3.2.4`。

### 修复提交

- 本节与修复内容位于同一提交；提交 SHA 以该提交的 `git rev-parse HEAD` 结果为准（最终交付中记录具体值，避免 Git 提交对象自引用导致 SHA 变化）。
