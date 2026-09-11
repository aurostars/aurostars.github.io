# Task 4 实施报告

## 状态

DONE

## 实现内容

- 新增 `Hero` 组件，由首页传入 `portfolioCases`。
- 使用前三个案例的首张真实媒体组成三图 collage，并保留内容数据中的真实宽高。
- 仅第一张图片启用 `priority`，其余图片保持默认加载策略。
- Hero 在桌面端采用不对称双栏，在 768px 以下严格折叠为单栏，三张图片均可见。
- 页面仅组合 Hero，没有提前实现案例区。
- 页面仅提供一个“查看案例”CTA，目标为 `#cases`。
- collage 使用可访问名称“个人项目界面预览”，每张图片沿用真实媒体替代文本。
- 未使用渐变、玻璃拟态或图片叠加装饰标签。

## TDD 记录

1. 先在 `src/components/home-page.test.tsx` 增加招聘者导向 Hero 行为测试。
2. 首次运行因旧页面动画依赖 `IntersectionObserver` 而错误，随后仅在测试中临时隔离旧动画组件，以确保 RED 来自目标行为缺失。
3. 再次运行得到预期 RED：找不到标题“从问题定义，到结果验证。”，结果为 1 failed、2 passed。
4. 实现 Hero 和首页 composition 后，目标测试转为 3 passed。
5. 删除不再需要的旧动画测试隔离，保留最终测试直接渲染真实首页组件。

## 验证结果

- 目标测试：通过，3 tests passed。
- ESLint：通过。
- TypeScript：通过。
- Production build：通过，静态首页生成成功。
- `git diff --check`：通过。

## 备注

- 首次 build 因 Google Fonts 网络请求失败；原命令重试后成功。
- 测试环境仍会输出既有的 jsdom/Tailwind CSS 解析提示，以及 `next/image` 测试替身对 `priority` 属性的提示，不影响测试结果。
