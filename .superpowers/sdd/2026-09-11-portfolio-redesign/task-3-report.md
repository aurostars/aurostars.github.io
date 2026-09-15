# Task 3 实施报告

## 状态

DONE

## RED

- 新增 `src/components/home-page.test.tsx`，覆盖招聘定位 metadata、跳转主要内容链接及三个批准的导航锚点。
- 首次有效 RED：`npm test -- src/components/home-page.test.tsx` 退出码为 1，2 个测试失败；metadata 仍为旧文案，且缺少跳转链接及新锚点。
- 为使测试进入真实断言阶段，在测试内补充 `next/font/google` 的最小字体加载 mock，避免测试环境将字体模块报错误判为功能失败。

## GREEN

- 实现 `SiteHeader`，导航指向 `#cases`、`#experience`、`#contact`。
- 重构根布局，保留 Geist，加入 skip link、`main#main-content`、全局 header 与 footer。
- 更新 metadata、Open Graph 信息与站点基础 URL。
- 将全局样式替换为明亮 Product Storyboard tokens 和壳层基础样式。
- 桌面导航固定单行，高度为 68px，不超过 72px。
- 加入 `focus-visible` 和 `prefers-reduced-motion` 基线。
- 删除旧 `.mesh-bg`、`.glass`、`.hero-gradient-text`、`.orb` 及 reveal 样式。按 Task 3 边界未重构旧 `page.tsx`。

## 验证

- `npm test -- src/components/home-page.test.tsx`：通过，2/2。
- `npm test`：通过，2 个测试文件、7/7 测试。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过，静态页面生成成功。
- `git diff --check`：通过。
- 旧全局 CSS 类检索：无匹配。

备注：Vitest/jsdom 会对 Tailwind v4 生成样式输出 CSS 解析提示，并因直接渲染 Next 根布局输出 `<html>` 容器提示；测试退出码仍为 0。Next 构建输出工作区存在多个 lockfile 的既有提示，不影响构建成功。
