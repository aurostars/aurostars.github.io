# Task 6 Report — 响应式、深色模式与资源降级浏览器覆盖

日期：2026-09-12

## 范围与结果

- 扩充 `tests/browser/compact-portfolio.spec.ts`，覆盖 320、390、767、768、1024、1440px。
- 在全部目标宽度验证页面无横向溢出、项目网格列数和真实卡片换行稳定；明确验证 767px 及以下履历单栏且实习位于教育之后，768px 及以上双栏顶部对齐且互不重叠。
- 深色模式测试先聚焦 skip link，再读取真实 computed style；验证 skip link 对比度不低于 4.5，并覆盖正文、项目描述、经历正文、项目焦点环及 identity/history/card surface 的不透明度与对比度阈值。
- 通过 Playwright 路由拦截真实 `/companies/bytedance.svg` 请求，验证失败后公司名称、固定 Logo slot 和完整经历行仍保持可见且具有稳定几何尺寸；正常请求验证图片加载、`object-fit: contain` 和无滤镜改色。
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

新增测试初次整套运行还暴露了 accessible name 中浏览器规范化空白差异（`查看源码 （新窗口）`）；将定位改为允许规范化空白的可访问名称正则后，详情覆盖 2/2 通过。未使用 retry、固定 timeout 或 sleep。

## 最终验证

- `npm test`：退出码 0；10/10 测试文件、60/60 测试通过。
- `npm run test:browser:portfolio`：退出码 0；31/31 Chromium 测试通过。
- `npm run test:browser:reduced`：退出码 0；1/1 Chromium 测试通过。
- `npm run lint`：退出码 0。
- `npm run typecheck`：退出码 0。
- `npm run build`：退出码 0；Next.js 16.2.10 生产构建及 4/4 静态页面生成成功。
- `git diff --check`：退出码 0。

## 变更文件

- `tests/browser/compact-portfolio.spec.ts`
- `src/components/company-logo.tsx`（仅文件模式）
- `src/components/company-logo.test.tsx`（仅文件模式）
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/task-6-report.md`
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/progress.md`

## 风险

- 浏览器覆盖按项目配置仅运行 Chromium；WebKit、Firefox 与真实移动设备未执行。
- 深色玻璃 surface 的测试验证 computed color、透明度下限和关键文本对比度，不做像素级截图比对。
- Playwright web server 输出 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的 Node 警告；不影响构建和测试结果。
