# 个人主页流体动效实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变现有页面内容与布局的前提下，为 Hero、经历、个人项目、案例详情和联系区增加有目的的流体动效、鼠标卡片反馈及完整 reduced-motion 降级。

**Architecture:** 新增 `motion@13.2.0`，使用 `motion/react` 构建小型 Client Components。一次性进入动画由可复用 `Reveal` 和 `Stagger` 组件承担；项目卡片在现有 `CaseSummaryCard` 内使用 Motion Values 实现鼠标倾斜与高光；现有 `FeaturedCases` 使用 `AnimatePresence` 管理详情进入退出。静态页面结构、内容数据、案例布局和静态导出保持不变。

**Tech Stack:** Next.js 16、React 19、TypeScript、Motion 13.2.0、CSS、Vitest、Testing Library、静态导出

## Global Constraints

- `DESIGN_VARIANCE: 6`、`MOTION_INTENSITY: 6`、`VISUAL_DENSITY: 7`。
- 只使用 `motion/react`；不引入 GSAP、Three.js 或第二套动画库。
- 连续鼠标值必须使用 `useMotionValue` / `useSpring` / `useTransform`，不得写入 React state。
- 禁止 `window.addEventListener("scroll", ...)` 和自定义 `window.scrollY` 计算。
- 只动画 `transform` 与 `opacity`，不得动画 `top`、`left`、`width`、`height`。
- 项目卡片倾斜最大 `3deg`，悬停上移最大 `4px`，只在精细指针设备启用。
- 所有自动动效必须遵守 `prefers-reduced-motion`；reduced motion 下直接渲染最终状态并停用倾斜与高光。
- 不制作自定义鼠标指针、视差背景、滚动劫持、横向滚动、无限 marquee 或循环动画。
- 不改变现有文案、配色、字体、锚点、导航、页面结构、案例单项展开逻辑、ARIA、键盘行为、图片策略或断点布局。
- 继续保持浅色主题；本轮不引入深色模式。
- 320px 宽度不得产生水平滚动。

---

### Task 1: 安装 Motion 并建立可复用进入动画原语

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/motion/motion-config.ts`
- Create: `src/components/motion/reveal.tsx`
- Create: `src/components/motion/stagger.tsx`
- Create: `src/components/motion/motion-primitives.test.tsx`

**Interfaces:**
- `entranceTransition(delay?: number)` 返回统一的时长、延迟与缓动配置。
- `<Reveal className?: string; delay?: number; amount?: number; children: ReactNode>` 负责一次性视口进入。
- `<StaggerGroup className?: string; delayChildren?: number; staggerChildren?: number; children: ReactNode>` 提供父级错峰编排。
- `<StaggerItem className?: string; children: ReactNode>` 提供子项进入动画。
- 三个组件在 reduced motion 下设置 `initial={false}`，不产生位移与延迟。

- [ ] **Step 1: 安装精确版本依赖**

```bash
npm install --save-exact motion@13.2.0
```

确认 `package.json` 的 dependencies 包含：

```json
"motion": "13.2.0"
```

并确认 `package-lock.json` 不包含私有 registry 域名。

- [ ] **Step 2: 写失败测试**

创建 `src/components/motion/motion-primitives.test.tsx`：

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => reducedMotion.value,
  };
});

import { Reveal } from "./reveal";
import { StaggerGroup, StaggerItem } from "./stagger";

beforeEach(() => {
  reducedMotion.value = false;
});

describe("motion primitives", () => {
  it("marks reveal motion as enabled and only runs once", () => {
    render(<Reveal><span>内容</span></Reveal>);
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-motion", "enabled");
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-viewport-once", "true");
  });

  it("renders reveal and stagger content statically for reduced motion", () => {
    reducedMotion.value = true;
    render(
      <Reveal>
        <StaggerGroup><StaggerItem><span>静态内容</span></StaggerItem></StaggerGroup>
      </Reveal>,
    );
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-motion", "reduced");
    expect(screen.getByTestId("stagger-group")).toHaveAttribute("data-motion", "reduced");
    expect(screen.getByText("静态内容")).toBeVisible();
  });
});
```

测试用的 `data-motion` 与 `data-viewport-once` 只表达运行模式，不用于样式。

- [ ] **Step 3: 验证 RED**

```bash
npm test -- src/components/motion/motion-primitives.test.tsx
```

预期：FAIL，模块 `./reveal` 和 `./stagger` 尚不存在。

- [ ] **Step 4: 实现统一配置**

创建 `src/components/motion/motion-config.ts`：

```ts
export const entranceEase = [0.16, 1, 0.3, 1] as const;

export function entranceTransition(delay = 0) {
  return {
    duration: 0.6,
    delay,
    ease: entranceEase,
  };
}

export const revealInitial = { opacity: 0, y: 20 };
export const revealVisible = { opacity: 1, y: 0 };
```

- [ ] **Step 5: 实现 `Reveal`**

创建 `src/components/motion/reveal.tsx`：

```tsx
"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { entranceTransition, revealInitial, revealVisible } from "./motion-config";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Reveal({ children, className, delay = 0, amount = 0.25 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      data-motion={reduce ? "reduced" : "enabled"}
      data-testid="reveal"
      data-viewport-once="true"
      initial={reduce ? false : revealInitial}
      whileInView={revealVisible}
      viewport={{ once: true, amount }}
      transition={reduce ? { duration: 0 } : entranceTransition(delay)}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 6: 实现错峰组件**

创建 `src/components/motion/stagger.tsx`，使用以下 variants：

```tsx
"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { entranceEase } from "./motion-config";

interface MotionChildrenProps {
  children: ReactNode;
  className?: string;
}

export function StaggerGroup({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.07,
}: MotionChildrenProps & { delayChildren?: number; staggerChildren?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      data-motion={reduce ? "reduced" : "enabled"}
      data-testid="stagger-group"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: reduce ? { duration: 0 } : { delayChildren, staggerChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: MotionChildrenProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? {} : { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.6, ease: entranceEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 7: 验证 GREEN 与依赖完整性**

```bash
npm test -- src/components/motion/motion-primitives.test.tsx
npm run typecheck
npm ls motion
```

预期：motion primitive tests 通过，TypeScript 通过，`motion@13.2.0` 可解析。

- [ ] **Step 8: 提交 Task 1**

```bash
git add package.json package-lock.json src/components/motion
git commit -m "feat: add accessible motion primitives"
```

---

### Task 2: 为 Hero、经历、项目与联系区增加滚动进入

**Files:**
- Modify: `src/components/hero.tsx`
- Modify: `src/components/hero-profile-index.tsx`
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/components/contact.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Hero 左栏使用 `StaggerGroup`，四个现有文本元素分别使用 `StaggerItem`。
- Hero 右栏教育整体进入，5 条经历以 `0.05s` 间隔进入。
- 项目标题使用 `Reveal`，项目摘要卡通过现有 `case-row` 顺序错峰进入。
- Contact 使用一个 `Reveal`，不改变 `#contact` 或语义结构。

- [ ] **Step 1: 写进入动画集成失败测试**

在 `src/components/home-page.test.tsx` 添加：

```tsx
it("wires one-time reveal groups without changing semantic landmarks", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "认真体验，持续表达" })).toBeVisible();
  expect(screen.getByRole("region", { name: "经历" })).toHaveAttribute("id", "experience");
  expect(screen.getByRole("region", { name: "个人项目" })).toHaveAttribute("id", "cases");
  expect(screen.getByRole("region", { name: "联系" })).toHaveAttribute("id", "contact");
  expect(screen.getAllByTestId("stagger-group").length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByTestId("reveal").length).toBeGreaterThanOrEqual(3);
});
```

现有测试中若全局查询单个 `data-testid="reveal"`，改为 `getAllByTestId`，不要删除语义断言。

- [ ] **Step 2: 验证 RED**

```bash
npm test -- src/components/home-page.test.tsx
```

预期：FAIL，页面尚未使用 stagger/reveal 组件。

- [ ] **Step 3: 接入 Hero 左栏错峰进入**

在 `Hero` 中保持 `.hero-copy` 为现有布局容器，内部使用：

```tsx
<StaggerGroup className="hero-copy-motion">
  <StaggerItem><p className="hero-kicker">AI 产品经理</p></StaggerItem>
  <StaggerItem><h1 id="hero-title">认真体验，持续表达</h1></StaggerItem>
  <StaggerItem><p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p></StaggerItem>
  <StaggerItem><a className="primary-action" href="#cases">查看项目</a></StaggerItem>
</StaggerGroup>
```

保留外层 `<div className="hero-copy">`，避免改变 Hero grid。

- [ ] **Step 4: 接入教育与经历错峰进入**

在 `HeroProfileIndex` 中：

- 用 `<Reveal className="hero-education">` 包裹现有教育 section 的内容，或让 Reveal 成为 section 内的内容容器，确保 `aria-labelledby` 仍指向真实 h2。
- 使用 `<StaggerGroup className="hero-experience-list" staggerChildren={0.05}>` 替换纯 div。
- 每个现有 `<article className="hero-experience-row">` 放在 `StaggerItem` 中。
- `id="experience"`、`aria-label="经历"`、`data-experience-row` 与测试标识不得丢失。

- [ ] **Step 5: 接入项目与联系区进入动画**

在 `FeaturedCases` 中：

```tsx
<Reveal className="section-heading compact-heading">
  <h2 id="cases-title">个人项目</h2>
</Reveal>
```

项目摘要卡使用 `<Reveal className="case-card-motion">` 包裹，并按全局项目顺序传入 `delay={globalIndex * 0.06}`，实现稳定的 DOM 顺序错峰。把两层循环签名改为 `rows.map((row, rowIndex) => ...)` 和 `row.map((project, projectIndex) => ...)`，并在内层开头显式定义 `const globalIndex = rowIndex * 2 + projectIndex`。把 `.case-row` 根节点改为带 `layout` 的 `motion.div`，其 class、key 与内部现有业务逻辑全部保留。

不要使用 `display: contents`，因为它没有可供 Motion 应用 transform 的渲染盒。

`.case-card-motion` 必须成为 `.case-row` 的 grid item，并保持与详情区的网格关系：

```css
.case-card-motion {
  display: grid;
  grid-row: 1;
  min-width: 0;
}

.case-card-motion > .case-card {
  grid-row: auto;
  height: 100%;
}
```

原 `.case-card` 与 `.case-detail` 的列定位规则不变，详情区仍位于 `grid-row: 2`。在 1440px、768px 和 390px 真实浏览器中验证卡片和详情区顺序，不允许 wrapper 导致错列或空白行。

在 `Contact` 的 section 内使用 `<Reveal className="contact-motion">` 包裹 h2 和 links，保持 section 仍是 landmark。

- [ ] **Step 6: 补充交互 CSS**

在 `globals.css` 增加：

```css
.hero-copy-motion,
.contact-motion {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.hero-copy-motion {
  width: 100%;
}

.contact-motion {
  gap: 1rem;
}

@media (prefers-reduced-motion: no-preference) {
  .site-nav a,
  .case-card-actions button,
  .case-card-actions a {
    transition: color 200ms ease, background-color 200ms ease, border-color 200ms ease, transform 200ms ease;
  }

  .site-nav a:hover,
  .case-card-actions button:hover,
  .case-card-actions a:hover {
    transform: translateY(-1px);
  }

  .case-card-actions button:active,
  .case-card-actions a:active {
    transform: translateY(1px) scale(0.98);
  }
}
```

保留 `.primary-action:hover` 与 `.contact-links a:hover` 现有的 `translateY(-2px)`，不要用通用规则覆盖；只为尚无位移反馈的导航和案例操作补充轻量反馈。

不得覆盖现有 `:focus-visible`。

- [ ] **Step 7: 验证 GREEN**

```bash
npm test -- src/components/home-page.test.tsx src/components/motion/motion-primitives.test.tsx
npm run typecheck
```

预期：语义 landmark 与动效 wrapper 测试通过，类型检查通过。

- [ ] **Step 8: 提交 Task 2**

```bash
git add src/components/hero.tsx src/components/hero-profile-index.tsx src/components/featured-cases.tsx src/components/contact.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add guided page reveals"
```

---

### Task 3: 增加卡片倾斜、高光和案例详情过渡

**Files:**
- Modify: `src/components/case-summary-card.tsx`
- Modify: `src/components/case-detail.tsx`
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/components/home-page.test.tsx`
- Create: `src/components/motion/use-fine-pointer.ts`
- Create: `src/components/motion/tilt-card.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `CaseSummaryCard` 保持现有 props 与可访问性接口，内部改为 `motion.article`。
- Pointer movement 仅更新 `pointerX` / `pointerY` Motion Values。
- `CaseDetail` 改为 `motion.section`，接收 Motion 的进入/退出属性但保持现有 `id`、role 和内容。
- `FeaturedCases` 使用 `AnimatePresence initial={false}`；稳态只保留一个 `CaseDetail`，退出动画期间允许旧节点短暂留在 DOM。

- [ ] **Step 1: 写卡片交互与详情生命周期失败测试**

创建 `src/components/motion/tilt-card.test.tsx`：

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CaseSummaryCard } from "@/components/case-summary-card";
import { portfolioCases } from "@/content/portfolio";

it("keeps card controls usable while pointer feedback is enabled", () => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("pointer: fine"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  const onToggle = vi.fn();
  render(<CaseSummaryCard project={portfolioCases[0]} expanded={false} onToggle={onToggle} />);

  const card = screen.getByTestId("case-summary-card");
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 100, clientY: 80 });
  expect(card).toHaveAttribute("data-tilt", "enabled");
  screen.getByRole("button", { name: /展开详情/ }).click();
  expect(onToggle).toHaveBeenCalledOnce();
  vi.unstubAllGlobals();
});
```

在 `home-page.test.tsx` 增加：

```tsx
it("removes the previous detail when switching projects with presence enabled", async () => {
  const user = userEvent.setup();
  render(<Home />);

  const toggles = screen.getAllByRole("button", { name: /展开详情/ });
  await user.click(toggles[0]);
  expect(screen.getAllByRole("region", { name: /案例详情/ })).toHaveLength(1);
  await user.click(toggles[1]);
  await waitFor(() => {
    expect(screen.getAllByRole("region", { name: /案例详情/ })).toHaveLength(1);
  });
});
```

把 `waitFor` 加入 `@testing-library/react` 的现有导入；禁止使用固定 timeout。

- [ ] **Step 2: 验证 RED**

```bash
npm test -- src/components/motion/tilt-card.test.tsx src/components/home-page.test.tsx
```

预期：FAIL，卡片尚无 `data-tilt`，详情尚未接入 presence。

- [ ] **Step 3: 实现卡片 Motion Values**

在 `case-summary-card.tsx` 顶部增加 `"use client"`，从 `motion/react` 导入：

```ts
motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform
```

组件内建立：

```tsx
const reduce = useReducedMotion();
const pointerX = useMotionValue(0.5);
const pointerY = useMotionValue(0.5);
const springConfig = { stiffness: 180, damping: 22, mass: 0.7 };
const rotateX = useSpring(useTransform(pointerY, [0, 1], [3, -3]), springConfig);
const rotateY = useSpring(useTransform(pointerX, [0, 1], [-3, 3]), springConfig);
const spotlightX = useTransform(pointerX, [0, 1], ["0%", "100%"]);
const spotlightY = useTransform(pointerY, [0, 1], ["0%", "100%"]);
const spotlight = useMotionTemplate`radial-gradient(220px circle at ${spotlightX} ${spotlightY}, rgb(49 95 219 / 0.14), transparent 70%)`;
```

在 `src/components/motion/use-fine-pointer.ts` 新建一个能力 Hook：顶层用 `useState(false)` 保存静态指针能力，并在 `useEffect` 中只创建一次 `window.matchMedia("(hover: hover) and (pointer: fine)")`；首次同步 `matches`，监听 `change`，cleanup 时移除监听。连续坐标仍只进入 Motion Values，不进入 React state。

Pointer handler：

```tsx
const canTilt = useFinePointer();

function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
  if (reduce || !canTilt || event.pointerType !== "mouse") return;
  const rect = event.currentTarget.getBoundingClientRect();
  pointerX.set((event.clientX - rect.left) / rect.width);
  pointerY.set((event.clientY - rect.top) / rect.height);
}

function resetPointer() {
  pointerX.set(0.5);
  pointerY.set(0.5);
}
```

将当前 `<article>` 开始标签精确替换为：

```tsx
<motion.article
  layout="position"
  className={`case-card${expanded ? " is-expanded" : ""}`}
  aria-labelledby={`${project.slug}-title`}
  data-testid="case-summary-card"
  data-tilt={reduce ? "reduced" : canTilt ? "enabled" : "disabled"}
  onPointerMove={handlePointerMove}
  onPointerLeave={resetPointer}
  style={reduce ? undefined : { rotateX, rotateY }}
  whileHover={reduce ? undefined : { y: -4 }}
  transition={{ type: "spring", stiffness: 180, damping: 22 }}
>
```

紧接开始标签插入高光层：

```tsx
<motion.div
  className="case-card-spotlight"
  aria-hidden="true"
  style={reduce ? undefined : { background: spotlight }}
/>
```

当前 `<figure className="case-card-media">` 与 `<div className="case-card-body">` 的全部 JSX 原样保留；只把结束标签 `</article>` 改为 `</motion.article>`，不得改动文案、ARIA、链接或点击行为。

- [ ] **Step 4: 实现详情 presence**

将 `CaseDetail` 的根节点改为 `motion.section`，保持所有语义属性，并设置：

```tsx
layout="position"
initial={reduce ? false : { opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
transition={reduce ? { duration: 0 } : { duration: 0.35, ease: entranceEase }}
```

组件内部使用 `useReducedMotion`，因此增加 `"use client"`。

在 `FeaturedCases` 中导入 `AnimatePresence` 和 `motion`。Task 2 已将每个 `.case-row` 改为带 `layout` 的 `motion.div`；每个项目的详情条件改为：

```tsx
<AnimatePresence initial={false}>
  {expanded ? <CaseDetail key={project.slug} project={project} /> : null}
</AnimatePresence>
```

禁止使用 `mode="popLayout"`：退出元素绝对定位会让跨两列的 CSS Grid 详情脱离文档流，导致联系区瞬间跳动。默认模式允许退出节点短暂保留，稳态仍只有一个详情；`.case-row` 的 `layout` 负责平滑后续内容位置变化。不得复制详情 DOM。

- [ ] **Step 5: 增加卡片高光与 3D 样式**

在 `globals.css` 增加：

```css
.case-card {
  position: relative;
  transform-style: preserve-3d;
}

.case-card-spotlight {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease;
}

.case-card > :not(.case-card-spotlight) {
  position: relative;
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .case-card:hover .case-card-spotlight {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-card {
    transform: none !important;
  }

  .case-card-spotlight {
    display: none;
  }
}
```

不得添加外发光或修改现有卡片背景、边框、圆角。

- [ ] **Step 6: 验证 GREEN**

```bash
npm test -- src/components/motion/tilt-card.test.tsx src/components/home-page.test.tsx
npm run typecheck
```

预期：交互、单详情和类型检查通过。

- [ ] **Step 7: 提交 Task 3**

```bash
git add src/components/case-summary-card.tsx src/components/case-detail.tsx src/components/featured-cases.tsx src/components/home-page.test.tsx src/components/motion/use-fine-pointer.ts src/components/motion/tilt-card.test.tsx src/app/globals.css
git commit -m "feat: add card physics and detail transitions"
```

---

### Task 4: 完整验证、性能检查与重新部署

**Files:**
- Verify: `src/**`
- Verify: `package.json`, `package-lock.json`
- Build output: `out/**`

**Interfaces:**
- 生产入口仍为 `out/index.html`。
- 部署使用当前 worktree 的绝对 `out/` 路径。

- [ ] **Step 1: 运行完整质量门禁**

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
npm ls motion
```

预期：0 failures；静态导出成功；`motion@13.2.0` 可解析。

- [ ] **Step 2: 执行动效静态审计**

```bash
! rg 'window\.addEventListener' src
! rg 'window\.scrollY|setInterval\(' src
! rg 'transition:\s*all' src
! rg '[—–]' src
```

预期：生产源码无滚动监听、手写 scrollY、循环 timer、`transition: all` 或可见长破折号。

同时人工确认：

- 仅 `transform` 与 `opacity` 被动画。
- Motion Client Components 有明确边界。
- 所有 hooks 在组件顶层调用。
- `prefers-reduced-motion` 有 JS 与 CSS 双重降级。

- [ ] **Step 3: 真实 Chromium 验证**

在 1440×900、768×900、390×844、320×800 验证：

- Hero 标签、标题、简介、CTA 按顺序进入且 CTA 首屏可见。
- 教育和 5 条经历顺序进入，不改变布局高度。
- 项目标题与四张卡片首次进入时动画，离开再返回不闪烁。
- 精细鼠标在项目卡片上移动时 `rotateX/rotateY` 不超过 3deg，卡片最多上移 4px，离开后归位。
- 局部高光跟随鼠标，不挡住按钮或链接。
- 按钮、源码链接、详情链接可点击且焦点可见。
- 展开、切换和收起详情时仍只有一个详情，桌面跨两列，移动端紧跟卡片。
- 联系区只进入一次。
- 390/320 触屏模拟下卡片不倾斜。
- `document.documentElement.scrollWidth === window.innerWidth`。
- 图片全部加载，console/page errors 为 0。

- [ ] **Step 4: Reduced Motion 验证**

在 Chromium 模拟 `prefers-reduced-motion: reduce`：

- Hero、经历、项目和联系内容初始即见，无延迟与位移。
- 卡片 `rotateX/rotateY` 为 0，高光不显示。
- 详情立即出现/消失。
- 原生平滑滚动关闭。
- 键盘与焦点行为不变。

- [ ] **Step 5: 性能检查**

使用 Lighthouse 或 Chromium Performance trace 检查首页：

- 无由动效造成的布局偏移，CLS < 0.1。
- 无持续运行的动画 loop。
- 鼠标移动期间无 React commit storm 或明显长任务。
- 静态首页可交互时间不因 Motion 产生明显阻塞。

若发现真实缺陷，先写覆盖测试再修复并提交：

```bash
git add src package.json package-lock.json
git commit -m "fix: polish portfolio motion performance"
```

若无代码调整，不创建空提交。

- [ ] **Step 6: 重新部署并静态验证**

提交所有代码后，部署当前 worktree 的 `out/`，覆盖或更新稳定预览 URL：

`https://4e3b81628415.aime-site.bytedance.net`

使用 `html_vision` 验证：

- 首屏与项目区完整渲染。
- 无裁切、重叠、破图或运行时错误。
- 静态截图中的最终状态清晰可读。

报告最终 URL，禁止 push 或创建 PR。
