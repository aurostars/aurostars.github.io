# Task 2 报告：压缩 Hero 并移除页面级滚动 Reveal

## 状态

已完成并提交，未 push。

## RED 证据

- 新增契约测试：`renders the primary page content immediately without scroll reveal wrappers`。
- 执行：`npm test -- src/components/home-page.test.tsx`
- 结果：按预期失败，13 个测试中 1 个失败；失败点为页面仍包含 `<div class="reveal hero-copy" data-visible="true">`。

## 改动

- 将 Hero 的两个 `Reveal` 包裹替换为静态语义 `div`，保留 `Hero({ cases })` 接口、单一 CTA、三张真实图片及 Next Image 的 dimensions/sizes。
- 删除 `Reveal` 组件及其独立测试。
- 删除全局 `.reveal` 动效规则。
- 按 brief 压缩桌面与移动端 Hero：取消视口最小高度、收紧字号/间距、限制 collage 高度，并在 767px 以下保持严格单列。
- 未改动 `FeaturedCases` / `CaseSummaryCard` / `CaseDetail` 的交互契约。

## GREEN 与验证

- `npm test -- src/components/home-page.test.tsx`：通过，13/13。
- `npm test`：通过，2 个测试文件、18/18。
- `npm run lint`：通过，退出码 0。
- `npm run typecheck`：通过，退出码 0。
- `git diff --check`：通过。
- 源码检索：无 `Reveal` 引用；`globals.css` 无 `.reveal` 选择器。测试文件保留 `.reveal` 查询作为回归契约。

## Commit

- 实现提交：`1775b73bfc11f559fd43e2cc96c74f586861fdd2` (`refactor: compact the portfolio entry experience`)

## 自审

- 变更严格限制在 Task 2 指定范围；`page.tsx` 无需内容改动，因为其页面区块已直接渲染且未导入 Reveal。
- Hero 仍服务端静态渲染；可访问名称、H1、CTA、图片 alt 与尺寸信息均保留。
- 未修改 Task 1 提供的案例展开/收起行为。

## Concerns

- 测试全部通过，但现有 Vitest/JSDOM 输出仍包含既有告警：JSDOM 无法解析 Tailwind 生成 CSS、测试中 `<html>` 被挂到 `<div>`、Next Image mock 将 `priority` 传为非布尔 DOM 属性。这些告警不由本任务引入，未在本任务范围内处理。
