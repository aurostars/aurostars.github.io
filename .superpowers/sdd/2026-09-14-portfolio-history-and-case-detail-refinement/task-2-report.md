# Task 2 Report — 校徽教育列表与紧凑实习时间轴

## 状态
已完成。严格限定在校徽、履历组件测试、履历标记与紧凑布局；未修改 dialog、项目详情、项目媒体或浏览器测试。

## RED 证据
执行：

```text
npm test -- src/components/school-logo.test.tsx src/components/home-page.test.tsx
```

结果：失败（符合预期）。`school-logo` 模块尚不存在；教育行缺少校徽及指定结构；经历行缺少 `experience-title-line` 分组。

## GREEN 证据
执行相同定向测试后：2 个测试文件、24 个测试全部通过。

## 实现与布局选择
- 新增独立 `SchoolLogo` 客户端组件，消费 Task 1 的 `SchoolLogo` 类型并传递本地图片的 alt、width、height。
- 图片加载失败后仅移除图片节点，保留 `.school-logo-slot` 与完整教育文案。
- 教育行采用校徽左置、三行文案右置；学院、专业、学位为三个独立 span，时间使用语义化 `time`。
- 经历采用紧凑纵向时间轴；首行严格按 Logo、机构、岗位、时间排列，时间右对齐，亮点位于第二行。
- 桌面履历列为 `minmax(0, 36fr) minmax(0, 64fr)`；`max-width: 767px` 改为单列并保持教育在实习之前。
- 收紧身份栏底部间距、履历区块垂直留白、卡片内边距与条目间距；未使用固定高度或最小高度强制布局。

## 文件
- `src/components/school-logo.tsx`
- `src/components/school-logo.test.tsx`
- `src/components/profile-history.tsx`
- `src/components/home-page.test.tsx`
- `src/app/globals.css`

## 验证
- 定向测试：24/24 通过。
- 全量测试：67/67 通过（11/11 文件）。
- ESLint：通过。
- TypeScript：通过。
- `git diff --check`：通过。

## SHA
提交后填写：见本报告所在提交。

## Concerns
无。
