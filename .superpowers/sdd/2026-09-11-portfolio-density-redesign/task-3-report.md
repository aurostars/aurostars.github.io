# Task 3 报告：高密度案例、个人信息与响应式布局

## 状态

已完成实现并提交，未 push。

## RED 证据

- 新增组合契约测试：`groups experience, education, capabilities, and approved contact in one profile region`。
- 新增案例数量契约测试：`renders exactly one case card per project and no future placeholders`。
- 执行：`npm test -- src/components/home-page.test.tsx`。
- 结果：按预期失败，15 个测试中 1 个失败；失败点为页面不存在可访问名称为“经历与能力”的组合区域。案例数量与无未来占位断言已通过，说明该测试保护既有可扩展渲染行为。

## GREEN 与实现

- 新增 `ProfileIndex`，在单一外层区域中组合经历、教育、能力和批准联系方式。
- 为复用组件增加 `embedded` 模式，将内部标题降为 `h3` 并移除重复容器，同时保留 `#experience`、`#contact` 和各自可访问区域名称。
- 为经历行同时保留 `data-experience-row` 并新增 `data-testid="experience-row"`。
- 首页正文现仅按 `Hero`、`FeaturedCases`、`ProfileIndex` 顺序组合。
- 案例保持行分组渲染：桌面每行两项，展开详情跨整行；移动端行内单列，详情紧跟被选中的摘要卡。
- 删除旧长篇案例布局选择器，案例摘要、详情和 Profile 均改为紧凑间距；Profile 使用分隔线与留白组织信息，不引入卡片套卡片。
- 正式页面仍只按项目数据渲染实际案例，不生成未来案例或待添加占位。当前 4 项布局与后续 5、6 项的行分组均由同一逻辑覆盖。
- 处理 Task 2 deferred minor：桌面 Hero collage 最大高度由 25rem 降为 22.5rem；与最大上下 padding 合计后整体上限为 520px。移动端显式取消该最大高度，避免单列图片溢出。

## 设计决策

- 设计读法：招聘作品集保留式重构，面向快速扫描，采用克制的编辑式信息架构与原生 CSS。
- 参数：`DESIGN_VARIANCE 5 / MOTION_INTENSITY 2 / VISUAL_DENSITY 8`。
- 案例摘要保留单层 surface；关键词由胶囊改为轻量文本组，降低容器噪声。
- Profile 主次栏比例为 1.35:0.65，经历承担主扫描路径，教育、能力和联系作为紧凑侧栏；767px 以下全部切为单列。
- 保留现有单项展开、再次点击收起、切换项目时仅保留一个详情，以及桌面行后详情契约。

## 验证

- `npm test -- src/components/home-page.test.tsx`：GREEN，15/15。
- `npm test`：通过，2 个测试文件、20/20。
- `npm run lint`：通过，退出码 0。
- `npm run typecheck`：通过，退出码 0。
- `npm run build`：通过，Next.js 生产构建和静态页面生成成功。
- `git diff --check`：通过。
- 源码检索：`globals.css` 中无 `.case-list`、`.case-study`、`.case-layout-*`、`.case-intro`、`.case-links` 旧选择器；正式页面源码无未来案例或待添加占位文案。

## Commit

- 实现提交：`a23510a7d81a36efccfde5ccf4d535fd87cdb1d9` (`style: increase portfolio information density`)

## 自审

- `FeaturedCases`、`CaseSummaryCard`、`CaseDetail` 的公开接口和交互逻辑未修改。
- 4 个案例摘要的 DOM 顺序未变，移动端详情仍直接跟随选中卡片，桌面详情仍位于对应行后。
- `#experience` 与 `#contact` 目标保留；联系方式仅包含邮箱与 GitHub。
- 响应式规则显式覆盖案例行、详情网格、工作流、Profile 和经历行。
- 未新增依赖，未 push。

## Concerns

- 无阻塞问题。
- 测试全部通过，但 Vitest/JSDOM 仍输出既有告警：无法解析 Tailwind 生成 CSS、测试中 `<html>` 被挂到 `<div>`、Next Image mock 将 `priority` 传为非布尔 DOM 属性。本任务未引入这些告警。
- 当前环境未提供浏览器连接，因此响应式结果由结构契约、CSS 审查和生产构建验证，未执行截图级视觉回归。
