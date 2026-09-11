# Task 7 实施报告

## 状态

DONE

## Reveal 实现

- 新增可访问的渐进增强 `Reveal`，服务端输出及首次 hydration 状态默认可见。
- 仅在 `IntersectionObserver` 可用且未启用 `prefers-reduced-motion` 时等待进入视口。
- reveal 触发后仅设置一次可见状态并断开 observer，组件卸载时清理 observer 与待执行 timer。
- 延迟限制在 `0` 至 `360ms`。
- 动效仅使用 `opacity` 与轻微纵向 `transform`，未使用 blur、横向飞入或弹簧。
- 减少动态效果、IntersectionObserver 缺失、JS 禁用与 SSR 场景均保持内容可见。
- 仅接入 hero 文案、hero 拼图、每个案例标题区和每个案例图库。
- 删除旧 `src/components/animate.tsx` 及残余用法。

## 构建稳定性修复

构建连续三次因 `next/font/google` 在构建期无法连接 Google Fonts 获取 Geist 而失败。为消除外部网络依赖：

- 从公开 npm registry 安装并精确锁定 `geist@1.7.2`，未使用 `legacy-peer-deps`。
- 将 `next/font/google` 的 `Geist()` 替换为本地打包的 `geist/font/sans` 中 `GeistSans.variable`。
- 更新首页测试 mock，删除不再适用的 `next/font/google` mock。
- 保持现有视觉 token `--font-geist-sans` 不变，`globals.css` 继续通过该 token 使用 Geist。
- 修复后生产静态构建成功，不再访问 Google Fonts。

## TDD 记录

1. Reveal RED：focused test 因 `src/components/reveal.tsx` 不存在而失败。
2. Reveal GREEN：实现后 5 个 focused tests 通过。
3. 字体修复 RED：测试 mock 切换到 `geist/font/sans` 后，旧 `Geist()` 调用按预期失败。
4. 字体修复 GREEN：安装本地字体并切换 `GeistSans.variable` 后测试通过。

## 验证结果

- Reveal focused tests：5/5 通过。
- 全量测试：21/21 通过。
- ESLint：通过。
- TypeScript typecheck：通过。
- Next.js production build：通过，静态页面生成成功。
- `git diff --check`：通过。
- 旧动画组件及 `Animate`、`fade-up`、`fade-left`、`fade-scale` 残余检查：通过。

## 提交

提交信息：`feat: add accessible content reveals`
