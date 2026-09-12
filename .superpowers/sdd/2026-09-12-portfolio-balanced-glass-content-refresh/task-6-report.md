# Task 6 Report — 响应式、深色模式与资源降级浏览器覆盖

日期：2026-09-12

## 范围与结果

- 扩充 `tests/browser/compact-portfolio.spec.ts`，覆盖 320、390、767、768、1024、1440px。
- 在全部目标宽度验证页面无横向溢出、项目网格列数和真实卡片换行稳定；每张卡片均保持水平视口边界，逐行 x 坐标严格递增，任意两张卡片矩形不重叠；明确验证 767px 及以下履历单栏且实习位于教育之后，768px 及以上双栏顶部对齐且互不重叠。
- 深色模式测试先聚焦 skip link，再读取真实 computed style；对 identity/history 表面按元素四角及中心位置计算页面底色、两层径向渐变、纹理与半透明 surface 的最终合成背景，并以其中最低对比度验证全部身份/履历文本；另验证正文、项目描述、项目焦点环与 skip link 的最终背景对比度。透明度下限保留为独立断言。
- Logo 浏览器测试先记录成功加载状态，再拦截真实 `/companies/bytedance.svg` 并 reload；逐项比较同一经历行、固定 Logo slot 和公司文字的 `x/y/width/height`，容差 1px。正常状态同时验证 slot 为 88×40px、图片成功加载、`object-fit: contain`，以及从图片到经历行的祖先链不存在 opacity、filter 或 mix-blend-mode 失真。
- 强化详情浏览器契约：秋招网申助手仅保留两张指定图片、10 项功能和唯一源码链接；首图网络失败时，文字回退保持 16:9，第二张图、功能列表和源码链接不受影响。
- 清理 Task 2 deferred：`company-logo.tsx` 与 `company-logo.test.tsx` 文件模式由 `100755` 规范为 `100644`。
- 现有 CSS 已满足新增浏览器契约，因此未修改生产样式或功能代码。

## TDD 证据

### 测试有效性（RED）

将履历单栏断点临时从 `max-width: 767px` 变异为 `max-width: 768px`，运行：

```text
npm run test:browser:portfolio -- --grep "768px keeps profile history"
```

结果：退出码 1，1/1 失败；768px 教育与实习顶部差为 `280.8750305175781px`，准确捕获断点回归。随后恢复原实现。

### GREEN

恢复 `max-width: 767px` 后运行相同命令：退出码 0，1/1 通过。

新增测试初次整套运行还暴露了 accessible name 中浏览器规范化空白差异（`查看源码 （新窗口）`）；将定位改为允许规范化空白的可访问名称正则后，详情覆盖 2/2 通过。Review 修复中，新增合成色解析首次 focused 运行因 CSS 自定义属性返回 6/8 位十六进制格式而 RED；补齐十六进制及 alpha 解析后 focused 覆盖 14/14 通过。

为验证三个 review 回归测试确实可捕获缺陷，临时同时注入低 alpha identity surface、64px Logo slot 和第二张卡片横向位移：focused 运行退出码 1，3/3 分别因 alpha 仅 0.1、slot 宽度仅 64px、卡片 1/2 重叠而失败。移除临时变异后，同组测试 3/3 通过。所有等待均使用 Playwright locator 或 `expect.poll`，未使用 retry、固定 timeout 或 sleep。

## Review 修复

- Important：不再把半透明 surface 的 RGB 当作不透明背景；按被测位置合成页面底色、径向渐变、纹理与 surface，并采用各采样点中的最低对比度。
- Important：Logo 失败验证升级为成功/失败同一元素几何对照，覆盖 row、slot、公司文本及正常态祖先视觉效果。
- Minor：项目网格对每张卡片执行水平边界检查、逐行 x 顺序检查及全量 pairwise 矩形重叠检查。
- 修正文档冲突：计划现明确 768px 为双栏，只有 767px 及以下堆叠。

## 最终验证

- `npm test`：退出码 0；10/10 测试文件、60/60 测试通过。
- `npm run test:browser:portfolio -- --grep "dark theme|company logo failure|lays out"`：退出码 0；14/14 focused Chromium 测试通过。
- `npm run test:browser:portfolio -- --reporter=dot`：连续运行 3 次，每次退出码 0、30/30 Chromium 测试通过（合计 90/90）。
- `npm run test:browser:reduced -- --reporter=dot`：退出码 0；1/1 Chromium 测试通过。
- `npm run lint`：退出码 0。
- `npm run typecheck`：退出码 0。
- `npm run build`：退出码 0；Next.js 16.2.10 生产构建及 4/4 静态页面生成成功。
- `git diff --check`：退出码 0。

## 变更文件

- `tests/browser/compact-portfolio.spec.ts`
- `docs/superpowers/plans/2026-09-12-portfolio-balanced-glass-content-refresh.md`
- `src/components/company-logo.tsx`（仅文件模式）
- `src/components/company-logo.test.tsx`（仅文件模式）
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/task-6-report.md`
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/progress.md`

## 风险

- 浏览器覆盖按项目配置仅运行 Chromium；WebKit、Firefox 与真实移动设备未执行。
- 深色玻璃 surface 的测试验证 computed color、透明度下限和关键文本对比度，不做像素级截图比对。
- Playwright web server 输出 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的 Node 警告；不影响构建和测试结果。
