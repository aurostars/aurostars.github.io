# Task 5 Report — 视口居中的 B1 项目弹窗

## 范围

仅实现 Task 5：修复共享原生项目 dialog 的视口居中，强化 B1 弹窗材质，并补充桌面几何、移动端边界/内部滚动和 Reduced Motion 浏览器验证。不修改 Task 4 内容结构，不执行 Task 6 完整响应式/深色/资源降级矩阵，不部署。

## 根因与实现摘要

- 根因：`.case-dialog` 依赖浏览器默认 margin 居中，但当前样式链未显式保留该定位条件，实测 1440px 视口中 dialog 水平中心偏差 `172.8046875px`。
- 将 dialog 宽度改为 `min(calc(100vw - 2rem), 60rem)`、最大高度改为 `86dvh`，并显式设置 `margin: auto`；定位容器不使用 transform。
- 保持现有原生 `<dialog>`、`showModal()`、焦点初始/恢复、Escape、遮罩点击、URL 深链、History 和 body 滚动锁定实现不变；动画继续只位于 `.case-dialog-panel`。
- 为 panel 增加 16px 圆角、通透表面、内高光、蓝灰阴影与克制模糊；backdrop 增加轻度模糊；不支持 `backdrop-filter` 或偏好降低透明度时回退至不透明语义表面。
- 桌面浏览器测试覆盖 768/1024/1440px，水平与垂直中心偏差阈值均为 2px；移动测试覆盖 320/390px 的视口边界、内部滚动和横向溢出。
- 同步浏览器测试中 Task 4 已完成内容的旧断言：秋招网申助手截图数从旧值 4 对齐为 2，并将失败图片夹具更新为现有扩展弹窗资源；未改动任何内容数据或渲染结构。

## TDD 证据

### RED

命令：`npm run test:browser:portfolio -- --grep "centers the native dialog"`

结果：退出码 1；新增几何测试失败，1440px 视口水平中心偏差为 `172.8046875px`，明确复现视觉偏左。

### GREEN

同一命令在最小定位修复后退出码 0；1/1 测试通过，768/1024/1440px 的水平与垂直中心偏差均不超过 2px。

## Review 修复波次

### 生命周期与动画

- 为 `.case-dialog-panel` 增加 open/close 的 transform + opacity 动画，并以 `project.slug` 作为稳定 key，使项目切换先退出旧 panel、再进入新 panel。
- `AnimatePresence.onExitComplete` 完成后才调用原生 `dialog.close()`、恢复 body 样式与焦点，退出期间 dialog 持续保留在 top layer。
- 移除 dialog 层的 Escape `keydown` 关闭路径，仅由原生 `cancel` 事件触发一次关闭，避免重复 History 操作。
- 增加边界式 Tab/Shift+Tab 循环；Reduced Motion 下进入/退出均不产生位移或缩放。

### 新增真实浏览器覆盖

- 原生 focus trap：Tab 与 Shift+Tab 均不会离开 dialog。
- Escape 只回退一个 History entry，并可通过 `goForward()` 重新打开项目。
- 真实 backdrop 坐标上的 pointer down/up 可关闭 dialog。
- 关闭动画完成后恢复原有 body `overflow` 与 `padding-right`。
- 通过可覆盖的 safe-area CSS 变量模拟左右刘海区域，验证 320px 下 dialog 保持边界与无横向溢出。

### Review RED

- `npm test -- src/components/case-dialog.test.tsx`：新增 2 项生命周期测试按预期失败；旧实现会立即移除 `open`，项目切换复用同一 panel DOM。
- `npm run test:browser:portfolio -- --grep "native dialog traps focus|backdrop pointer"`：真实浏览器焦点循环断言失败，证明仅依赖默认行为不足。
- `npm run test:browser:portfolio -- --grep "safe-area margins"`：模拟左右安全区时 dialog 左边距仅 8px，未消费安全区变量。

### Review GREEN

- `npm test -- src/components/case-dialog.test.tsx`：10/10 通过。
- `npm run test:browser:portfolio -- --grep "native dialog traps focus|backdrop pointer|safe-area margins"`：3/3 通过。

## 最终验证

- `npm test -- src/components/case-dialog.test.tsx`：退出码 0；10/10 测试通过，原生 dialog、初始焦点、单次 cancel、关闭按钮、遮罩关闭、退出生命周期、项目切换、焦点恢复与滚动锁定均保持。
- `npm run test:browser:portfolio`：退出码 0；21/21 Chromium 测试通过；每次测试前生产构建成功。
- `npm run test:browser:reduced`：退出码 0；1/1 测试通过，Reduced Motion 下 panel computed transform 为 `none`。
- `npm test`：退出码 0；10/10 测试文件、60/60 测试通过。
- `npm run lint`：退出码 0。
- `npm run typecheck`：退出码 0。
- `git diff --check`：退出码 0。

## 变更文件

- `src/components/case-dialog.tsx`
- `src/components/case-dialog.test.tsx`
- `src/app/globals.css`
- `tests/browser/compact-portfolio.spec.ts`
- `.superpowers/sdd/2026-09-12-portfolio-balanced-glass-content-refresh/task-5-report.md`

## 风险与后续边界

- 本任务的真实浏览器几何验证仅运行项目既有 Chromium 配置；Safari/WebKit 与移动设备安全区实机表现未单独验证。
- Task 6 的完整响应式履历、深色主题和 Logo 失败矩阵仍按计划保留；本任务只验证 dialog 相关视口与 Reduced Motion 合同。
- Playwright web server 日志存在环境变量 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的 Node 警告，不影响构建或测试结果。
