# 个人主页内容重排实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页 Hero 改为个人表达与教育/实习信息索引，把案例区改名为“个人项目”，并将底部精简为仅包含“欢迎联系～”、邮箱和 GitHub 的联系区。

**Architecture:** 保持现有 Next.js 静态导出和内容数据不变，新增一个专门渲染 Hero 右栏的 `HeroProfileIndex`，让 `Hero` 只负责首屏组合。首页移除 `ProfileIndex`，直接组合 `Hero`、`FeaturedCases` 和 `Contact`；项目卡片通过内部布局把操作区固定到底部。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS、Vitest、Testing Library、静态导出

## Global Constraints

- 一级标题必须精确为“认真体验，持续表达”。
- Hero 标签保持“AI 产品经理”，简介保持“把 AI 能力接入真实工作流，用产品与数据持续验证价值。”。
- Hero 主按钮必须显示“查看项目”并继续跳转到 `#cases`。
- Hero 右栏必须完整显示 2 条教育信息和 5 条实习经历，不再渲染任何项目预览图片。
- `#experience` 与 `#contact` 锚点必须保留。
- 个人项目区标题必须精确为“个人项目”，原说明文案必须删除。
- 底部只保留“欢迎联系～”、邮箱和 GitHub，不得重复显示经历、教育或能力。
- 不新增依赖，不改变项目数据、详情展开逻辑、ARIA、键盘交互、reduced-motion 或静态导出配置。
- 320px 宽度不得产生水平滚动。

---

### Task 1: 重组 Hero 与首页内容结构

**Files:**
- Create: `src/components/hero-profile-index.tsx`
- Modify: `src/components/hero.tsx`
- Modify: `src/components/contact.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/components/home-page.test.tsx`

**Interfaces:**
- `HeroProfileIndex({ education, experiences }: { education: string[]; experiences: ExperienceItem[] })` 渲染 `id="experience"` 的右栏资料索引。
- `Hero({ education, experiences }: { education: string[]; experiences: ExperienceItem[] })` 不再接收案例媒体。
- `Contact` 继续接收 `{ email, github, embedded? }`，默认标题改为“欢迎联系～”。
- `Home` 组合 `<Hero />`、`<FeaturedCases />`、`<Contact />`。

- [ ] **Step 1: 写 Hero 内容与页面结构的失败测试**

在 `src/components/home-page.test.tsx` 中把旧 Profile 断言替换为以下行为断言：

```tsx
it("renders the personal statement and profile index in the hero", () => {
  render(<Home />);

  const hero = screen.getByRole("region", { name: "认真体验，持续表达" });
  expect(within(hero).getByRole("heading", { level: 1, name: "认真体验，持续表达" })).toBeInTheDocument();
  expect(within(hero).getByRole("link", { name: "查看项目" })).toHaveAttribute("href", "#cases");
  expect(within(hero).getByRole("region", { name: "经历" })).toHaveAttribute("id", "experience");
  expect(within(hero).getAllByTestId("hero-education-row")).toHaveLength(2);
  expect(within(hero).getAllByTestId("experience-row")).toHaveLength(5);
  expect(within(hero).queryByRole("group", { name: "个人项目界面预览" })).not.toBeInTheDocument();
});

it("keeps only the approved contact block after personal projects", () => {
  render(<Home />);

  const contact = screen.getByRole("region", { name: "联系" });
  expect(within(contact).getByRole("heading", { name: "欢迎联系～" })).toBeInTheDocument();
  expect(within(contact).getAllByRole("link")).toHaveLength(2);
  expect(screen.queryByRole("region", { name: "经历与能力" })).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-experience-row]")).toHaveLength(5);
});
```

删除或改写以下与新结构冲突的旧断言：

- “groups experience, education, capabilities, and approved contact in one profile region”
- “renders education and capabilities after experience”

- [ ] **Step 2: 验证 RED**

运行：

```bash
npm test -- src/components/home-page.test.tsx
```

预期：测试因旧 H1、旧 Hero 图片、旧 Profile 结构和旧联系标题而失败。

- [ ] **Step 3: 创建 `HeroProfileIndex`**

创建 `src/components/hero-profile-index.tsx`：

```tsx
import type { ExperienceItem } from "@/content/portfolio";

interface HeroProfileIndexProps {
  education: string[];
  experiences: ExperienceItem[];
}

export function HeroProfileIndex({ education, experiences }: HeroProfileIndexProps) {
  return (
    <aside className="hero-profile" aria-label="个人资料">
      <section className="hero-education" aria-labelledby="hero-education-title">
        <h2 id="hero-education-title">教育</h2>
        <div className="hero-education-list">
          {education.map((item) => (
            <p data-testid="hero-education-row" key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="hero-experience" id="experience" aria-label="经历">
        <h2>实习经历</h2>
        <div className="hero-experience-list">
          {experiences.map((item) => (
            <article data-experience-row data-testid="experience-row" className="hero-experience-row" key={`${item.organization}-${item.period}`}>
              <time>{item.period}</time>
              <div className="hero-experience-main">
                <p><strong>{item.organization}</strong><span>{item.role}</span></p>
                <p>{item.highlight}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
```

- [ ] **Step 4: 重构 `Hero` 与首页组合**

将 `Hero` 改为接收教育和经历数据，并删除 `next/image`、`ProjectCase`、`collage` 与 `.hero-collage` DOM：

```tsx
import { HeroProfileIndex } from "@/components/hero-profile-index";
import type { ExperienceItem } from "@/content/portfolio";

export function Hero({ education, experiences }: { education: string[]; experiences: ExperienceItem[] }) {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker">AI 产品经理</p>
        <h1 id="hero-title">认真体验，持续表达</h1>
        <p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p>
        <a className="primary-action" href="#cases">查看项目</a>
      </div>
      <HeroProfileIndex education={education} experiences={experiences} />
    </section>
  );
}
```

将 `src/app/page.tsx` 组合改为：

```tsx
import { Contact } from "@/components/contact";
import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero education={education} experiences={experiences} />
      <FeaturedCases projects={portfolioCases} />
      <Contact email={contact.email} github={contact.github} />
    </>
  );
}
```

将 `Contact` 标题精确改为：

```tsx
<Heading>欢迎联系～</Heading>
```

- [ ] **Step 5: 验证 GREEN**

运行：

```bash
npm test -- src/components/home-page.test.tsx
```

预期：Hero、页面结构和联系区相关测试通过。

- [ ] **Step 6: 提交 Task 1**

```bash
git add src/components/hero-profile-index.tsx src/components/hero.tsx src/components/contact.tsx src/app/page.tsx src/components/home-page.test.tsx
git commit -m "feat: move profile details into hero"
```

---

### Task 2: 更新个人项目文案并对齐卡片操作区

**Files:**
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/home-page.test.tsx`

**Interfaces:**
- `FeaturedCases` 继续接收 `{ projects: ProjectCase[] }` 并保留现有展开状态接口。
- `.case-card-actions` 继续承载展开按钮与源码链接，但必须固定在摘要卡底部并保持同一基线。
- `.hero-profile`、`.hero-education`、`.hero-experience` 负责 Task 1 新结构的桌面与移动端样式。

- [ ] **Step 1: 写文案与结构的失败测试**

在 `src/components/home-page.test.tsx` 添加：

```tsx
it("labels the project section without the removed helper copy", () => {
  render(<Home />);

  const section = screen.getByRole("region", { name: "个人项目" });
  expect(within(section).getByRole("heading", { level: 2, name: "个人项目" })).toBeInTheDocument();
  expect(within(section).queryByText("先快速浏览项目，再展开查看完整判断与工作流程。")).not.toBeInTheDocument();
});

it("marks every summary card with a bottom-aligned action group", () => {
  render(<Home />);

  const cards = screen.getAllByTestId("case-summary-card");
  expect(cards).toHaveLength(4);
  cards.forEach((card) => {
    expect(card.querySelector(".case-card-actions")).toBeTruthy();
  });
});
```

在测试中断言现有 `<article>` 将提供 `data-testid="case-summary-card"`；最小实现时给该 `<article>` 增加此属性。

- [ ] **Step 2: 验证 RED**

运行：

```bash
npm test -- src/components/home-page.test.tsx
```

预期：测试因标题仍为“代表案例”及缺少测试标识而失败。

- [ ] **Step 3: 更新项目区文案**

将 `src/components/featured-cases.tsx` 的区块标题改为：

```tsx
<header className="section-heading compact-heading">
  <h2 id="cases-title">个人项目</h2>
</header>
```

彻底删除原说明 `<p>`，不要使用 CSS 隐藏。

- [ ] **Step 4: 实现 Hero 资料索引与卡片操作区样式**

在 `src/app/globals.css` 中：

1. 删除不再使用的 `.hero-collage`、`.hero-shot` 及其响应式规则。
2. 保持 `.hero` 桌面双栏，右栏使用 `.hero-profile`。
3. 为教育与经历使用分隔线、紧凑字号和可换行网格。
4. 在移动断点将 `.hero` 改为单列，经历行允许自然换行。
5. 让摘要卡内容容器使用行布局，将 `.case-card-actions` 推到底部并统一对齐。

目标 CSS 结构：

```css
.hero-profile {
  display: grid;
  gap: 1.5rem;
  align-self: stretch;
  padding-left: clamp(1.5rem, 3vw, 3rem);
  border-left: 1px solid var(--color-border);
}

.hero-education h2,
.hero-experience h2 {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-education-list,
.hero-experience-list {
  border-top: 1px solid var(--color-border);
}

.hero-education-list p,
.hero-experience-row {
  margin: 0;
  padding-block: 0.7rem;
  border-bottom: 1px solid var(--color-border);
}

.hero-experience-row {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 1rem;
}

.hero-experience-main p {
  margin: 0;
}

.hero-experience-main p:first-child {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.case-card {
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.case-card-actions {
  align-self: end;
  margin-top: auto;
}

@media (max-width: 767px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-profile {
    padding-left: 0;
    border-left: 0;
  }

  .hero-experience-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}
```

使用项目已有的 `--color-border` CSS 变量，禁止新建重复颜色常量。

- [ ] **Step 5: 验证 GREEN 与无旧 Hero 选择器**

运行：

```bash
npm test -- src/components/home-page.test.tsx
rg "hero-collage|hero-shot|代表案例|先快速浏览项目" src
```

预期：focused tests 通过；`rg` 不返回生产代码匹配（测试中的否定断言字符串除外）。

- [ ] **Step 6: 提交 Task 2**

```bash
git add src/components/featured-cases.tsx src/components/case-summary-card.tsx src/app/globals.css src/components/home-page.test.tsx
git commit -m "style: refine portfolio content hierarchy"
```

---

### Task 3: 完整验证与重新部署

**Files:**
- Verify: `src/**`
- Build output: `out/**`

**Interfaces:**
- 生产入口保持 `out/index.html`。
- 部署目录为该 worktree 的绝对路径 `.../out`。

- [ ] **Step 1: 运行完整质量门禁**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

预期：全部命令退出码为 0，测试 0 failures。

- [ ] **Step 2: 检查生产导出内容**

```bash
test -f out/index.html
rg "认真体验，持续表达|个人项目|欢迎联系～" out/index.html
! rg "个人项目界面预览|先快速浏览项目，再展开查看完整判断与工作流程。" out/index.html
```

预期：新文案全部存在，旧图片组标签和说明文案不存在。

- [ ] **Step 3: 在真实 Chromium 中验证响应式布局**

对 1440×900、768×900、390×844、320×800 验证：

- Hero 无项目预览图片。
- 桌面为左右双栏，移动端按介绍、教育、实习顺序单列。
- 2 条教育、5 条经历完整显示。
- 320px 下 `document.documentElement.scrollWidth === window.innerWidth`。
- 四张项目卡的操作区在同一行中保持底部基线一致。
- 单详情展开、Enter/Space、ARIA 与 reduced-motion 无回归。
- 底部只出现“欢迎联系～”、邮箱和 GitHub。
- 图片资源加载成功，控制台无运行时错误。

- [ ] **Step 4: 若验证产生代码调整则提交**

```bash
git add src
git commit -m "fix: polish responsive profile layout"
```

若无代码调整，不创建空提交。

- [ ] **Step 5: 部署并执行静态视觉验证**

提交所有源码改动后，使用部署工具发布该 worktree 的 `out/` 目录，并用 `html_vision` 检查：

- 新 H1、教育与实习信息可见。
- 个人项目标题正确。
- 案例卡片无明显错位。
- 联系区正常显示。
- 控制台无运行时错误。

记录最终 URL，禁止 push 或创建 PR。
