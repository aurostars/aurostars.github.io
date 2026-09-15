# Task 3 实施报告

日期：2026-09-12

## 范围

仅完成 Task 3：B1 平衡通透视觉系统与项目提示，以及评审指出的深色模式 skip link 对比度修复。未修改项目详情内容结构、功能列表或链接，未修改 dialog 定位与内部视觉，未提前执行 Task 6 的完整浏览器覆盖。

## 实现摘要

- 设计参数按已批准规范执行：设计变化度 7、动效强度 5、信息密度 6。
- 将页面颜色收敛为语义 token：冰白背景、雾蓝磨砂表面、近实体项目表面、低饱和电蓝强调、蓝灰边框与阴影。
- 身份栏和双栏履历使用轻磨砂、内高光边框与不支持模糊时的实体表面降级；项目卡片保持更实的表面层级。
- 增加固定且不可交互的轻颗粒背景，不绑定滚动容器。
- 补齐系统深色模式 token，保持同一蓝色强调家族与可读文本层级。
- 评审修复：新增 `--portfolio-on-accent`，浅色使用近白前景，深色使用 `#0d1626`；skip link 改为消费该语义 token。
- 将环境光主色、次色和颗粒色收敛为 `--portfolio-ambient-primary`、`--portfolio-ambient-secondary` 和 `--portfolio-texture`。
- 项目图片框采用 12px 圆角，主要容器与项目卡片采用 16px 圆角。
- 在“个人项目”标题旁加入唯一提示“点击卡片任意位置，可查看详情”，窄屏时换到标题下方；项目网格通过 `aria-describedby="cases-hint"` 关联说明。
- 删除每张项目卡片内的“查看详情”，保留整卡原生按钮、项目级可访问名称、tilt、spotlight、焦点和 Reduced Motion 行为。

## TDD 证据

### RED

命令：

```bash
npm test -- src/components/home-page.test.tsx
```

结果：预期失败，16 项中 2 项失败。失败原因分别为共享提示尚不存在，以及卡片仍包含“查看详情”。

### GREEN

命令：

```bash
npm test -- src/components/home-page.test.tsx src/components/motion/tilt-card.test.tsx
```

结果：2 个测试文件、20 项测试全部通过。

### 评审修复 RED/GREEN

新增真实浏览器对比度测试，读取深色模式下 skip link 的计算前景色与背景色，并按 WCAG 相对亮度公式验证至少 `4.5:1`。

- RED：`npm run test:browser:portfolio -- --grep "dark mode skip link"` 失败，实测对比度为 `2.414334748517011:1`。
- GREEN：引入并应用 `--portfolio-on-accent` 后，同一命令 1 项通过。

## 验证结果

- `npm run test:browser:portfolio -- --grep "dark mode skip link"`：1 项通过，验证深色模式 skip link 对比度至少为 `4.5:1`。
- `npm run test:browser:portfolio -- --grep "responsive|overflow|project"`：12 项通过，覆盖 320、390、768、1024、1440px 项目网格与 320px 提示换行、相邻关系、无横向溢出。
- `npm test`：10 个测试文件、53 项测试全部通过。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `git diff --check`：通过。

Playwright WebServer 输出了 `NO_COLOR` 被 `FORCE_COLOR` 忽略的 Node 环境警告，不影响测试结果或页面行为。

## 边界确认

- 未执行 Task 4：详情仍使用现有内容和链接。
- 未执行 Task 5：dialog 定位与内部结构未改。
- 未执行 Task 6 的完整深色模式、履历布局与 Logo 失败浏览器覆盖；仅增加本次评审要求的 skip link 对比度回归测试。
- 未部署、push、创建 PR 或 merge。

## 风险

- 深色模式 skip link 已有真实浏览器对比度回归测试；其余页面表面的完整计算色值和对比度覆盖仍属于 Task 6。
- `prefers-reduced-transparency` 浏览器支持不一致；同时保留了 `@supports` 无 `backdrop-filter` 的实体表面降级。
- 本次按 Task 3 要求运行聚焦浏览器覆盖；完整浏览器套件中的详情图片和 dialog 场景属于后续任务范围。
