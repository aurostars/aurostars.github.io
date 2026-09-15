# Task 3 Report — Dialog 顶部操作区与详情信息结构

## 状态

已完成 Task 3。仅调整 dialog 顶部操作区、详情信息结构、图库布局及对应单元测试；未修改 native dialog 生命周期、Escape/backdrop 行为、URL/History、焦点恢复、Motion 生命周期或内容数据，也未新增浏览器测试。

## TDD 证据

### RED

先修改 `src/components/case-dialog.test.tsx` 与 `src/components/home-page.test.tsx`，覆盖：

- header 中唯一源码链接及其与关闭按钮的 DOM 顺序；
- 滚动内容中不存在底部链接区；
- 背景与目标为独立 section，并位于工作流程之前；
- provenance 按字段存在性条件渲染；
- Job Application Helper 使用双图布局，其余项目使用单图布局；
- 各项目媒体数量及 `data-gallery-layout`。

执行：

```text
npm test -- src/components/case-dialog.test.tsx src/components/home-page.test.tsx
```

结果：`2 failed test files；8 failed / 36 passed`。失败原因与缺失行为一致：header 源码链接/操作组不存在、背景和目标缺少独立 class、resume-builder 仍渲染空 provenance、图库布局属性仍为旧值。

### GREEN

完成最小实现后再次执行 focused tests：

```text
Test Files  2 passed (2)
Tests       44 passed (44)
```

## 变更文件

- `src/components/case-dialog.tsx`
  - 在 header 右侧新增 `.case-dialog-actions`；按源码链接、关闭按钮顺序排列。
  - 源码链接使用项目仓库地址、新窗口提示、`target="_blank"` 与 `rel="noopener noreferrer"`。
  - 保留关闭按钮 ref、自动聚焦和原有关闭回调。
- `src/components/case-detail.tsx`
  - 移除滚动区底部链接。
  - 背景与目标拆为 `.case-background`、`.case-goal` 独立 section。
  - provenance 仅在有值时渲染。
  - Job Application Helper 限定两图并标记 `job-helper-duo`，其余项目限定一图并标记 `single`。
- `src/app/globals.css`
  - 新增响应式 header 操作组样式及关闭按钮 pointer/hover/active 样式。
  - 单图占满可用宽度；双图桌面非对称分栏、第二图占更大区域，767px 及以下纵向堆叠。
  - 移除未使用的 `featured-four` 与底部链接规则。
- `src/components/case-dialog.test.tsx`
- `src/components/home-page.test.tsx`

## 验证

- Focused unit tests：`44 passed`
- Full `npm test`：`11 files passed；78 tests passed`
- `npm run lint`：通过
- `npm run typecheck`：通过
- `standard-lint`（5 个变更文件）：通过
- `git diff --check`：通过

## SHA

本报告随 `feat: refine project detail presentation` 提交交付；最终 SHA 以该提交的 `git rev-parse HEAD` 为准。

## Concerns

无已知功能性 concern。按任务范围未执行或新增 Task 4 浏览器几何测试；响应式布局由 CSS 规则及单元测试覆盖的结构契约保证。
