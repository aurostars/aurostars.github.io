# Task 1 实施报告

## 状态

DONE_WITH_CONCERNS

## RED 证据

在编写生产实现前，先按 brief 替换渐进披露行为测试，并补充“详情紧跟所选摘要且摘要顺序不变”的回归测试。

执行：

```bash
npm test -- src/components/home-page.test.tsx
```

结果：退出码 1；共 12 项测试，3 项失败、9 项通过。三个失败均因找不到预期披露按钮（例如 `展开秋招网申助手详情`、`展开智能简历编辑工具详情`），证明失败原因是功能尚未实现，而非测试语法或运行错误。

## 实现摘要

- 新增 `CaseSummaryCard`：保留真实封面、描述、摘要、前三项能力关键词、源码链接，并提供带精确可访问名称、`aria-expanded` 与 `aria-controls` 的原生按钮。
- 将原 `CaseStudy` 的真实图库、背景与目标、核心问题、五步工作流、完整能力、来源说明及项目链接迁移到 `CaseDetail`，没有新增虚构案例内容。
- 将 `FeaturedCases` 改为 Client Component，以 `expandedSlug` 保证同一时间仅展开一个案例，再次点击可收起。
- 按每两张摘要组成桌面行：详情在 CSS Grid 中固定到所选卡片所在行之后；小屏切换为单列 flex，利用 DOM 顺序让详情直接紧跟所选卡片。四张摘要卡的语义顺序保持不变。
- 删除旧 `case-study.tsx`，补充紧凑卡片与详情布局样式。

## 验证命令与结果

```bash
npm test -- src/components/home-page.test.tsx
```

通过：1 个测试文件，12/12 项测试通过。

```bash
npm run typecheck
```

通过：`tsc --noEmit` 退出码 0。

```bash
npx eslint src/components/featured-cases.tsx src/components/case-summary-card.tsx src/components/case-detail.tsx src/components/home-page.test.tsx
```

通过：退出码 0，无 ESLint 输出。

```bash
npm run build
```

通过：Next.js 生产构建成功，`/` 与 `/_not-found` 均静态预渲染，确认静态导出边界兼容。

```bash
git diff --check
```

通过：退出码 0，无空白错误。

## Commit SHA

实现提交：`03cff95d9816187092c84f31513e511d619be17a`

## 自审

- 可访问性：使用 `article` + 关联标题、原生 `button`、精确按钮名称、`aria-expanded`、`aria-controls`、具名详情 `region`；键盘可直接操作。
- 内容契约：图库仍使用 `next/image` 和真实尺寸、alt、响应式 sizes；工作流严格为五项；仓库、可选 release、Resume Builder 上游链接及 provenance 均保留。
- 交互边界：初始不渲染详情；切换案例会关闭旧详情；重复点击关闭当前详情。
- 布局边界：桌面详情占满所选两卡行的下一行；移动端 DOM 中直接位于所选卡后；摘要文章查询顺序仍为批准的四项顺序。
- 静态兼容：状态仅存在于叶级 Client Component，项目可完成静态预渲染。

## Concerns

- 测试命令虽然 12/12 通过，但 stderr 仍有项目既有的 jsdom/Tailwind CSS 解析提示、`RootLayout` 测试中的 `<html>` 嵌套提示，以及 `next/image` 测试替身的 `priority` 属性提示；本任务未修改这些测试基础设施问题，且生产构建、类型检查和 ESLint 均通过。
