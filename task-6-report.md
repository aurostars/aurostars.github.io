# Task 6 实施报告

## 状态

DONE

## 实现内容

- 新增 `ExperienceIndex`，以桌面四列单行展示 5 段实习经历，并在 767px 以下切换为紧凑单列。
- 新增 `EducationSkills`，并列呈现教育背景与核心能力，移动端改为单列。
- 新增 `Contact`，仅提供 `dongxing.123@bytedance.com` 邮件入口与 `https://github.com/aurostars` GitHub 入口，不含表单、电话、社媒或其他 CTA。
- 首页严格按 `Hero`、`FeaturedCases`、`ExperienceIndex`、`EducationSkills`、`Contact` 顺序组合。
- 延续冷白、银灰、石墨与钴蓝的 Product Storyboard 视觉体系，使用语义化 section 和标题、可见键盘焦点、移动端布局及克制的交互反馈。

## TDD 记录

1. 先新增经历行数、教育能力顺序与内容、联系入口限制测试。
2. 运行目标测试，因页面不存在“经历”区域而按预期失败。
3. 实现三个服务端组件、首页组合与响应式样式。
4. 再次运行目标测试，11 项全部通过。

## 验证结果

- `npm test -- src/components/home-page.test.tsx`：通过，11/11。
- `npm test`：通过，2 个测试文件，16/16。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过，静态首页成功生成。
- `git diff --check`：通过。

## 已知非阻塞提示

- Vitest/jsdom 仍会输出既有的 Tailwind 4 样式解析、根布局 `<html>` 测试挂载和 Next Image `priority` 属性提示，不影响测试退出码；这些属于 Task 6 之前的测试环境行为。
- Next.js 构建仍会提示工作区存在多个 lockfile，但编译、类型检查与静态导出均成功。
