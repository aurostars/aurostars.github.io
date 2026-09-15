# Task 4 Report — README 功能列表与唯一源码链接

## 范围

仅实现 Task 4：更新项目详情中的已实现功能展示与外部链接，不修改 dialog 定位、浏览器矩阵或部署流程。

## 实现摘要

- 将“已实现能力”卡片式区域替换为语义化的“已实现功能”标题与 `ul/li` 列表，直接消费 `ProjectCase.features`。
- 功能列表在桌面端使用两列纯文本列表，在 767px 及以下切换为单列；未引入卡片、徽章或逐项边框。
- 每个项目详情仅渲染一个 GitHub 仓库链接，可见标签统一为“查看源码”；移除 release 与上游项目链接渲染。
- 保持背景、目标、核心问题、工作流程、图片画廊、来源说明和既有 dialog 行为不变。
- 增加四个项目的功能列表及唯一链接组件测试，并覆盖秋招网申助手仅有两张指定截图。

## TDD 证据

### RED

命令：`npm test -- src/components/home-page.test.tsx`

结果：退出码 1；20 个测试中 4 个失败。失败原因符合预期：四个项目详情均找不到“已实现功能”标题，旧实现仍显示“已实现能力”并消费 `highlights`。

### GREEN

命令：`npm test -- src/components/home-page.test.tsx`

结果：退出码 0；1 个测试文件通过，20/20 测试通过。

### Reviewer Important 修复

- 问题：`查看源码` 链接位于截图和详情内容之前，不符合已批准的内容顺序。
- 修复：将 `.case-detail-links` 移至功能列表及来源说明之后，使源码链接成为详情内容的最后一个区块。
- 回归测试：新增 DOM 顺序断言，确保“已实现功能”区域始终位于“查看源码”链接之前。
- RED：聚焦测试退出码 1，21 个测试中新增顺序测试 1 项失败，断言收到 `0`。
- GREEN：聚焦测试退出码 0，21/21 测试通过。

## 最终验证

- `npm test`：退出码 0；10/10 测试文件、58/58 测试通过。
- `npm run lint`：退出码 0。
- `npm run typecheck`：退出码 0。
- `git diff --check`：退出码 0。

## 变更文件

- `src/components/case-detail.tsx`
- `src/components/home-page.test.tsx`
- `src/app/globals.css`
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/task-4-report.md`

## 风险与后续边界

- 按 Task 4 边界未执行完整浏览器矩阵；窄屏列表的真实浏览器几何与视觉回归留待 Task 6。
- `ProjectCase.highlights` 与可选 `releaseUrl` 数据模型仍按既定跨任务计划保留，但详情渲染已不再依赖它们，也不会渲染对应额外链接。
