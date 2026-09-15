# Compact Profile Dialog Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the slogan-led hero and inline case expansion with a compact identity/history page, a responsive screenshot-led project grid, and shareable accessible modal case details.

**Architecture:** Keep `src/app/page.tsx` as a server component that passes static portfolio data into focused presentation components. Move project selection and URL/history synchronization into a small client hook owned by `FeaturedCases`; render one native `<dialog>` through `CaseDialog`, while `CaseDetail` remains responsible only for verified project content. Reuse the existing Motion primitives and fine-pointer detection, but reduce card motion and make all modal animation respect reduced motion.

**Tech Stack:** Next.js 16.2.10 static export, React 19.2.4, TypeScript 5, Motion 13.2.0, Vitest 3.2.4, Testing Library, Playwright 1.62.1, plain CSS in `src/app/globals.css`.

## Global Constraints

- Remove the large Hero, “认真体验，持续表达”, its summary, and the “查看项目” CTA.
- Primary page content is identity/contact, education, internship experience, and personal projects; do not add a side, top, or project directory.
- At `≥1080px` use 3 equal project columns; at `680–1079px` use 2; below `680px` use 1.
- Render exactly one card per data item; 4/5-item final rows keep normal column width and align from the start; never add placeholder or invented projects.
- Current data has 4 verified projects and must remain data-driven for future 5th/6th projects.
- Each card is one native `<button type="button">`; do not nest a second button or link inside it.
- Use `?project=<slug>` for shareable dialog state; do not use hash routing.
- Use native `<dialog>.showModal()` with labelled title, initial close-button focus, background inertness, Escape support, scroll lock, and deterministic focus restoration.
- Desktop dialog maximum width is `1100px` and maximum height is `calc(100dvh - 48px)`; below `680px`, use `calc(100% - 16px)` and `calc(100dvh - 16px)` plus safe-area padding.
- Card screenshots use a stable 16:9 box and `object-fit: contain` unless a specific cover is explicitly safe to crop; preserve supplied width, height, and alt text.
- Card tilt requires both `(hover: hover)` and `(pointer: fine)`, is capped at `2deg`, and lifts no more than `3px`.
- Modal animation uses only `transform` and `opacity`; `prefers-reduced-motion: reduce` disables card tilt and modal movement.
- Preserve the current Geist font, light cool-gray palette, blue accent, verified project copy, static export, and public npm registry lockfile.
- Do not add GSAP, another animation library, dark mode, carousel, horizontal scrolling, scroll hijacking, or autoplay.

## File Structure

### Create

- `src/components/identity-bar.tsx` — compact name, role, email, and GitHub presentation.
- `src/components/profile-history.tsx` — semantic education and internship list.
- `src/components/case-dialog.tsx` — native dialog lifecycle, scroll lock, focus placement/restoration, backdrop-close guard, and modal animation shell.
- `src/components/use-project-dialog-state.ts` — query-string parsing and browser history transitions.
- `src/components/project-image.tsx` — stable image frame, lazy/priority policy, and visible load-error fallback.
- `src/components/use-project-dialog-state.test.tsx` — URL/history contract tests.
- `src/components/case-dialog.test.tsx` — dialog, focus, keyboard, backdrop, and scroll-lock tests.
- `tests/browser/compact-portfolio.spec.ts` — viewport, deep-link, history, focus, layout, and image regression checks.

### Modify

- `src/app/layout.tsx` — preserve the skip link and main landmark, but remove the redundant sticky site navigation.
- `src/app/page.tsx` — compose `IdentityBar`, `ProfileHistory`, and `FeaturedCases`; remove `Hero` and bottom `Contact`.
- `src/components/featured-cases.tsx` — flat data-driven grid, selected-project state, trigger tracking, and single `CaseDialog`.
- `src/components/case-summary-card.tsx` — single-button compact card, 2-degree tilt, project cover, and no source link.
- `src/components/case-detail.tsx` — content-only modal body, lazy gallery images, no region-level enter/exit layout animation.
- `src/components/home-page.test.tsx` — replace Hero/inline-expansion expectations with compact shell/grid/modal expectations.
- `src/test/setup.ts` — deterministic jsdom `showModal()` / `close()` support when unavailable.
- `src/app/globals.css` — remove old Hero/contact/row-expansion rules and add compact profile, 3/2/1 grid, dialog, safe-area, image fallback, and zoom-safe styles.
- `package.json` — add a browser script for the new focused Playwright suite.

### Delete after replacements pass

- `src/components/hero.tsx`
- `src/components/hero-profile-index.tsx`
- `src/components/contact.tsx`

---

### Task 1: Replace the Hero and Contact with a compact identity/history shell

**Files:**
- Create: `src/components/identity-bar.tsx`
- Create: `src/components/profile-history.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/components/site-header.tsx`
- Delete: `src/components/hero.tsx`
- Delete: `src/components/hero-profile-index.tsx`
- Delete: `src/components/contact.tsx`

**Interfaces:**
- Consumes: `ExperienceItem`, `education`, `experiences`, and `contact` from `src/content/portfolio.ts`.
- Produces:

```ts
export interface IdentityBarProps {
  name: string;
  role: string;
  email: string;
  github: string;
}

export interface ProfileHistoryProps {
  education: string[];
  experiences: ExperienceItem[];
}
```

- [ ] **Step 1: Replace the obsolete shell tests with failing compact-shell tests**

In `src/components/home-page.test.tsx`, remove tests that require four Hero stagger items, `hero-copy-motion`, `hero-education-row`, the bottom contact region, and inline Hero copy. Add these assertions:

```tsx
it("renders a compact identity bar without the removed hero statement", () => {
  render(<Home />);

  const identity = screen.getByRole("region", { name: "个人信息" });
  expect(within(identity).getByRole("heading", { level: 1, name: "董星" })).toBeInTheDocument();
  expect(within(identity).getByText("AI 产品经理与独立开发者")).toBeInTheDocument();
  expect(within(identity).getByRole("link", { name: "发送邮件" })).toHaveAttribute(
    "href",
    "mailto:dongxing.123@bytedance.com",
  );
  expect(within(identity).getByRole("link", { name: "访问 GitHub（新窗口）" })).toHaveAttribute(
    "href",
    "https://github.com/aurostars",
  );
  expect(screen.queryByText("认真体验，持续表达")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "查看项目" })).not.toBeInTheDocument();
});

it("renders semantic education and five concise internship rows", () => {
  render(<Home />);

  const history = screen.getByRole("region", { name: "教育与实习经历" });
  expect(within(history).getByRole("heading", { level: 2, name: "教育经历" })).toBeInTheDocument();
  expect(within(history).getAllByTestId("education-row")).toHaveLength(2);
  expect(within(history).getAllByTestId("experience-row")).toHaveLength(5);
  expect(within(history).getAllByText(/时间|公司|岗位|职责/).length).toBeGreaterThan(0);
});

it("keeps the skip link and removes directory navigation", () => {
  const page = renderLayout();
  expect(page.querySelector('a[href="#main-content"]')?.textContent).toContain("跳到主要内容");
  expect(page.querySelector('nav[aria-label="主要导航"]')).toBeNull();
  expect(page.querySelector('a[href="#experience"]')).toBeNull();
  expect(page.querySelector('a[href="#cases"]')).toBeNull();
  expect(page.querySelector('a[href="#contact"]')).toBeNull();
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
npx vitest run src/components/home-page.test.tsx -t "compact identity|semantic education|removes directory"
```

Expected: FAIL because `IdentityBar` / `ProfileHistory` are not rendered and the obsolete contact navigation still exists.

- [ ] **Step 3: Implement `IdentityBar` with the approved content and native links**

Create `src/components/identity-bar.tsx`:

```tsx
import { Reveal } from "@/components/motion/reveal";

export interface IdentityBarProps {
  name: string;
  role: string;
  email: string;
  github: string;
}

export function IdentityBar({ name, role, email, github }: IdentityBarProps) {
  return (
    <section className="identity-bar site-container" aria-label="个人信息">
      <Reveal className="identity-bar-motion">
        <div>
          <h1>{name}</h1>
          <p>{role}</p>
        </div>
        <div className="identity-links">
          <a href={`mailto:${email}`}>发送邮件</a>
          <a href={github} target="_blank" rel="noopener noreferrer">
            访问 GitHub<span className="sr-only">（新窗口）</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 4: Implement `ProfileHistory` with semantic lists and mobile labels**

Create `src/components/profile-history.tsx`:

```tsx
import { Reveal } from "@/components/motion/reveal";
import type { ExperienceItem } from "@/content/portfolio";

export interface ProfileHistoryProps {
  education: string[];
  experiences: ExperienceItem[];
}

export function ProfileHistory({ education, experiences }: ProfileHistoryProps) {
  return (
    <section
      className="profile-history site-container"
      id="experience"
      aria-labelledby="history-title"
    >
      <Reveal className="profile-history-motion">
        <h2 id="history-title" className="sr-only">教育与实习经历</h2>
        <section aria-labelledby="education-title">
          <h2 id="education-title">教育经历</h2>
          <ul className="education-list">
            {education.map((item) => <li data-testid="education-row" key={item}>{item}</li>)}
          </ul>
        </section>
        <section aria-labelledby="internship-title">
          <h2 id="internship-title">实习经历</h2>
          <ol className="experience-list">
            {experiences.map((item) => (
              <li data-testid="experience-row" key={`${item.organization}-${item.period}`}>
                <time><span className="mobile-field-label">时间</span>{item.period}</time>
                <p><span className="mobile-field-label">公司</span><strong>{item.organization}</strong></p>
                <p><span className="mobile-field-label">岗位</span>{item.role}</p>
                <p><span className="mobile-field-label">职责</span>{item.highlight}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 5: Recompose the page and remove the redundant directory header**

Replace `src/app/page.tsx` body composition with:

```tsx
import { FeaturedCases } from "@/components/featured-cases";
import { IdentityBar } from "@/components/identity-bar";
import { ProfileHistory } from "@/components/profile-history";
import { contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <IdentityBar
        name="董星"
        role="AI 产品经理与独立开发者"
        email={contact.email}
        github={contact.github}
      />
      <ProfileHistory education={education} experiences={experiences} />
      <FeaturedCases projects={portfolioCases} />
    </>
  );
}
```

Then remove `SiteHeader` from `src/app/layout.tsx` while preserving the skip link and `<main id="main-content">`:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} antialiased`}>
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
```

Keep the existing `metadata` export unchanged above this function. Delete `src/components/site-header.tsx` after the import is removed.

- [ ] **Step 6: Add compact identity/history CSS and remove obsolete Hero/contact selectors**

In `src/app/globals.css`, preserve variables, base styles, `.site-container`, `.skip-link`, and focus styles. Remove `.site-header`, `.site-nav*`, `.hero*`, `.primary-action`, `.contact-*`, and old Hero mobile blocks. Add focused rules with these exact layout contracts:

```css
.identity-bar { padding-block: clamp(1.5rem, 3vw, 2.25rem); }
.identity-bar-motion { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.identity-bar h1 { margin: 0; font-size: clamp(1.875rem, 3vw, 2.5rem); letter-spacing: -0.04em; }
.identity-bar p { margin: 0.35rem 0 0; color: var(--color-muted); }
.identity-links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
.identity-links a { display: inline-flex; min-height: 2.75rem; align-items: center; font-weight: 700; }
.profile-history { padding-block: clamp(2rem, 4vw, 3.25rem); }
.profile-history-motion { display: grid; gap: 2rem; }
.profile-history h2 { margin: 0 0 0.75rem; font-size: 0.8125rem; letter-spacing: 0.12em; text-transform: uppercase; }
.education-list, .experience-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--color-border); }
.education-list li { padding-block: 0.75rem; border-bottom: 1px solid var(--color-border); }
.experience-list li { display: grid; grid-template-columns: 7rem 1.1fr 1fr 1.6fr; gap: 1rem; padding-block: 0.75rem; border-bottom: 1px solid var(--color-border); }
.experience-list p { margin: 0; }
.mobile-field-label { display: none; }
@media (max-width: 679px) {
  .identity-bar-motion { align-items: flex-start; flex-direction: column; gap: 1rem; }
  .identity-links { width: 100%; }
  .experience-list li { grid-template-columns: 1fr; gap: 0.35rem; }
  .mobile-field-label { display: inline-block; min-width: 3rem; color: var(--color-muted); font-size: 0.75rem; }
}
```

- [ ] **Step 7: Run tests and quality checks**

Run:

```bash
npx vitest run src/components/home-page.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS; no stale imports of `Hero`, `HeroProfileIndex`, or `Contact`.

- [ ] **Step 8: Commit the compact shell**

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/identity-bar.tsx src/components/profile-history.tsx src/components/home-page.test.tsx src/app/globals.css src/components/site-header.tsx src/components/hero.tsx src/components/hero-profile-index.tsx src/components/contact.tsx
git commit -m "feat: replace hero with compact profile history"
```

---

### Task 2: Build the responsive single-button project grid

**Files:**
- Create: `src/components/project-image.tsx`
- Modify: `src/components/case-summary-card.tsx`
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProjectCase`, `ProjectMedia`, `useFinePointer()`, and `usePrefersReducedMotion()`.
- Produces:

```ts
export interface ProjectImageProps {
  media: ProjectMedia;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export interface CaseSummaryCardProps {
  project: ProjectCase;
  priority?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
  onOpen: () => void;
}
```

- [ ] **Step 1: Replace row/inline-expansion tests with failing flat-grid tests**

Add or update tests in `src/components/home-page.test.tsx`:

```tsx
it.each([4, 5, 6])("renders %i projects as one flat grid without placeholders", (count) => {
  const { container } = render(<FeaturedCases projects={makeProjectFixtures(count)} />);
  expect(container.querySelector(".case-grid")).toHaveAttribute("data-project-count", String(count));
  expect(screen.getAllByRole("button", { name: /查看项目详情：测试案例/ })).toHaveLength(count);
  expect(container.querySelectorAll(".case-row")).toHaveLength(0);
  expect(container.querySelectorAll(".case-card")).toHaveLength(count);
});

it("uses one native button per card and keeps source links out of summaries", () => {
  render(<FeaturedCases projects={portfolioCases} />);
  const trigger = screen.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  expect(trigger).toHaveClass("case-card");
  expect(within(trigger).queryByRole("link")).not.toBeInTheDocument();
  expect(within(trigger).getByText("查看详情")).toBeInTheDocument();
});

it("uses a non-icon product screenshot and preserves image metadata", () => {
  render(<FeaturedCases projects={portfolioCases} />);
  const trigger = screen.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  const image = within(trigger).getByRole("img", { name: "秋招网申助手的多简历资料管理界面" });
  expect(image).toHaveAttribute("width", "1920");
  expect(image).toHaveAttribute("height", "1563");
});
```

- [ ] **Step 2: Run the grid tests and verify they fail**

```bash
npx vitest run src/components/home-page.test.tsx -t "flat grid|one native button|non-icon"
```

Expected: FAIL because cards are articles containing nested controls and `FeaturedCases` still creates two-column `.case-row` wrappers.

- [ ] **Step 3: Implement a stable project image with visible failure fallback**

Create `src/components/project-image.tsx` as a client component. Use `useState(false)` for the discrete load-error state only; continuous pointer data must remain Motion Values.

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectMedia } from "@/content/portfolio";

export interface ProjectImageProps {
  media: ProjectMedia;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export function ProjectImage({ media, priority = false, sizes, className }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={`project-image-fallback ${className ?? ""}`.trim()} role="img" aria-label={`${media.alt}加载失败`}>图片暂时无法显示</span>;
  }
  return (
    <Image
      className={className}
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
```

- [ ] **Step 4: Rewrite `CaseSummaryCard` as one button and cap its motion**

Update `CaseSummaryCardProps` to the interface in this task’s Interfaces block and change the function signature to:

```tsx
export function CaseSummaryCard({ project, priority = false, buttonRef, onOpen }: CaseSummaryCardProps) {
```

Keep the current `pointerX`, `pointerY`, `hoverY`, `bounds`, `hoverAnimation`, cleanup effect, `handlePointerEnter`, `handlePointerMove`, and `resetPointer` functions. Change both spring mappings and hard clamps from `3` to `2`, and change the pointer-enter hover target from `-4` to `-3`. Replace only the existing return statement with:

```tsx
return (
  <motion.button
      ref={buttonRef}
      type="button"
      className="case-card"
      aria-label={`查看项目详情：${project.title}`}
      data-testid="case-summary-card"
      data-tilt={reduce ? "reduced" : canTilt ? "enabled" : "disabled"}
      onClick={onOpen}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={tiltEnabled ? { rotateX, rotateY, y: hoverY } : { transform: "none" }}
    >
      <motion.span
        className="case-card-spotlight"
        aria-hidden="true"
        style={tiltEnabled ? { background: spotlight, pointerEvents: "none" } : { background: "none", pointerEvents: "none" }}
      />
      <span className="case-card-media">
        <ProjectImage media={cover} priority={priority} sizes="(max-width: 679px) calc(100vw - 2rem), (max-width: 1079px) 50vw, 27rem" />
      </span>
      <span className="case-card-body">
        <span className="case-descriptor">{project.descriptor}</span>
        <span className="case-card-title">{project.title}</span>
        <span className="case-card-summary">{project.summary}</span>
        <span className="case-card-action">查看详情</span>
      </span>
    </motion.button>
);
```

Do not render keywords or repository links in the summary card.

- [ ] **Step 5: Flatten `FeaturedCases` without adding dialog behavior yet**

Temporarily let `onOpen` select a project in local state, but do not render inline details. Replace row slicing with direct mapping:

```tsx
<div className="case-grid" data-project-count={projects.length}>
  {projects.map((project, index) => (
    <Reveal className="case-card-motion" delay={index * 0.04} key={project.slug}>
      <CaseSummaryCard
        project={project}
        priority={index < 3}
        onOpen={() => setSelectedSlug(project.slug)}
      />
    </Reveal>
  ))}
</div>
```

Keep `selectedSlug` internal only until Tasks 3–5 connect URL state and `CaseDialog`. Do not render `CaseDetail` here.

- [ ] **Step 6: Replace project CSS with the 3/2/1 contract**

Remove `.case-row`, inline detail grid placement, article action/keyword rules, and expanded-card selectors. Add:

```css
.case-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.case-card-motion { display: grid; min-width: 0; }
.case-card { position: relative; display: grid; grid-template-rows: auto 1fr; width: 100%; min-width: 0; overflow: hidden; padding: 0; border: 1px solid var(--color-border); border-radius: 1rem; background: var(--color-surface); color: inherit; text-align: left; cursor: pointer; transform-style: preserve-3d; }
.case-card-media { display: grid; aspect-ratio: 16 / 9; overflow: hidden; background: var(--color-surface-muted); }
.case-card-media img, .project-image-fallback { width: 100%; height: 100%; object-fit: contain; }
.project-image-fallback { display: grid; place-items: center; color: var(--color-muted); font-size: 0.875rem; }
.case-card-body { display: grid; align-content: start; gap: 0.55rem; padding: 1rem; }
.case-card-title { font-size: 1.125rem; font-weight: 750; letter-spacing: -0.025em; }
.case-card-summary { display: -webkit-box; overflow: hidden; color: var(--color-muted); line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.case-card-action { margin-top: 0.35rem; font-weight: 700; }
@media (max-width: 1079px) { .case-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 679px) { .case-grid { grid-template-columns: 1fr; } .case-card-summary { -webkit-line-clamp: 3; } }
```

Keep the fine-pointer spotlight media query and reduced-motion fallback, adjusted to the new button selector.

- [ ] **Step 7: Run grid, motion, type, and lint tests**

```bash
npx vitest run src/components/home-page.test.tsx src/components/motion/tilt-card.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS; update `tilt-card.test.tsx` expectations from `3deg/-4px` to `2deg/-3px` if that file asserts exact bounds.

- [ ] **Step 8: Commit the grid**

```bash
git add src/components/project-image.tsx src/components/case-summary-card.tsx src/components/featured-cases.tsx src/components/home-page.test.tsx src/components/motion/tilt-card.test.tsx src/app/globals.css
git commit -m "feat: add compact responsive project grid"
```

---

### Task 3: Implement deterministic query-string and history state

**Files:**
- Create: `src/components/use-project-dialog-state.ts`
- Create: `src/components/use-project-dialog-state.test.tsx`

**Interfaces:**
- Consumes: `ProjectCase[]`.
- Produces:

```ts
export interface ProjectDialogState {
  selectedProject: ProjectCase | null;
  openProject: (slug: ProjectCase["slug"]) => void;
  closeProject: () => void;
}

export function useProjectDialogState(projects: ProjectCase[]): ProjectDialogState;
```

History entries created by the page use this marker:

```ts
interface PortfolioHistoryState {
  portfolioDialogEntry?: true;
}
```

- [ ] **Step 1: Write failing hook tests with a small harness**

Create `src/components/use-project-dialog-state.test.tsx` with a harness exposing the selected title plus open/close buttons. Cover the exact state table:

```tsx
function Harness() {
  const { selectedProject, openProject, closeProject } = useProjectDialogState(portfolioCases);
  return (
    <div>
      <output aria-label="selected project">{selectedProject?.title ?? "none"}</output>
      <button onClick={() => openProject("job-application-helper")}>open first</button>
      <button onClick={() => openProject("interview-review")}>open second</button>
      <button onClick={closeProject}>close</button>
    </div>
  );
}

it("pushes a marked entry when a grid card opens", async () => {
  const user = userEvent.setup();
  const push = vi.spyOn(history, "pushState");
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "open first" }));
  expect(location.search).toBe("?project=job-application-helper");
  expect(push).toHaveBeenCalledWith(
    expect.objectContaining({ portfolioDialogEntry: true }),
    "",
    expect.stringContaining("?project=job-application-helper"),
  );
});

it("uses history.back when closing an entry opened from the grid", async () => {
  const user = userEvent.setup();
  const back = vi.spyOn(history, "back").mockImplementation(() => undefined);
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "open first" }));
  await user.click(screen.getByRole("button", { name: "close" }));
  expect(back).toHaveBeenCalledOnce();
});

it("removes the query with replaceState when a deep link closes", async () => {
  history.replaceState({}, "", "/?project=interview-review");
  const user = userEvent.setup();
  render(<Harness />);
  expect(screen.getByLabelText("selected project")).toHaveTextContent("面试复盘助手");
  await user.click(screen.getByRole("button", { name: "close" }));
  expect(location.search).toBe("");
  expect(screen.getByLabelText("selected project")).toHaveTextContent("none");
});

it("syncs selection on popstate without changing scroll position", () => {
  const scrollY = window.scrollY;
  render(<Harness />);
  history.replaceState({}, "", "/?project=resume-builder");
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(screen.getByLabelText("selected project")).toHaveTextContent("智能简历编辑工具");
  expect(window.scrollY).toBe(scrollY);
});

it("cleans an invalid slug and stays on the overview", () => {
  history.replaceState({}, "", "/?project=not-real");
  render(<Harness />);
  expect(location.search).toBe("");
  expect(screen.getByLabelText("selected project")).toHaveTextContent("none");
});
```

Reset `history.replaceState({}, "", "/")` in `beforeEach` and restore spies in `afterEach`.

- [ ] **Step 2: Run the hook tests and verify they fail**

```bash
npx vitest run src/components/use-project-dialog-state.test.tsx
```

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement parsing and state synchronization**

Create `src/components/use-project-dialog-state.ts` as a client hook. Implement these concrete helpers:

```ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjectCase } from "@/content/portfolio";

const marker = "portfolioDialogEntry" as const;

function projectFromLocation(projects: ProjectCase[]) {
  const slug = new URLSearchParams(window.location.search).get("project");
  return slug ? projects.find((project) => project.slug === slug) ?? null : null;
}

function urlWithoutProject() {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  return `${url.pathname}${url.search}${url.hash}`;
}
```

Inside `useProjectDialogState`:

- initialize to `null` for hydration safety;
- on mount, parse `window.location.search`; if a slug exists and is invalid, `replaceState` with `urlWithoutProject()`;
- subscribe to `popstate`, parse again, and clean invalid slugs;
- `openProject(slug)` finds the project, sets it, then `pushState({ ...history.state, [marker]: true }, "", url)`;
- `closeProject()` calls `history.back()` only when `history.state?.[marker] === true`; otherwise clear state and `replaceState` the base URL;
- keep the selected object derived from the canonical project array, not a copied fixture.

Use `useMemo` for a `Map(project.slug -> project)` and clean up the `popstate` listener.

- [ ] **Step 4: Run hook tests and typecheck**

```bash
npx vitest run src/components/use-project-dialog-state.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit URL/history behavior**

```bash
git add src/components/use-project-dialog-state.ts src/components/use-project-dialog-state.test.tsx
git commit -m "feat: synchronize project dialog with history"
```

---

### Task 4: Create the native accessible project dialog

**Files:**
- Create: `src/components/case-dialog.tsx`
- Create: `src/components/case-dialog.test.tsx`
- Modify: `src/components/case-detail.tsx`
- Modify: `src/components/project-image.tsx`
- Modify: `src/test/setup.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProjectCase | null`, `CaseDetail`, `usePrefersReducedMotion()`.
- Produces:

```ts
export interface CaseDialogProps {
  project: ProjectCase | null;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
  fallbackFocusRef: React.RefObject<HTMLElement | null>;
}
```

- [ ] **Step 1: Add deterministic dialog support to jsdom setup**

In `src/test/setup.ts`, preserve the Next Image mock and add a guard that only polyfills missing methods:

```ts
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
```

- [ ] **Step 2: Write failing dialog lifecycle and accessibility tests**

Create `src/components/case-dialog.test.tsx`. Define this concrete helper before the tests:

```tsx
function renderDialog({
  project = portfolioCases[0] as ProjectCase | null,
  onClose = vi.fn(),
  returnFocusTo = null as HTMLElement | null,
} = {}) {
  const fallbackFocusRef = createRef<HTMLHeadingElement>();
  const node = (nextProject: ProjectCase | null) => (
    <>
      <h2 ref={fallbackFocusRef} tabIndex={-1}>个人项目</h2>
      <CaseDialog
        project={nextProject}
        onClose={onClose}
        returnFocusTo={returnFocusTo}
        fallbackFocusRef={fallbackFocusRef}
      />
    </>
  );
  const view = render(node(project));
  return {
    ...view,
    fallbackFocusRef,
    onClose,
    rerenderProject: (nextProject: ProjectCase | null) => view.rerender(node(nextProject)),
  };
}
```

Then add these tests:

```tsx
it("opens one labelled modal and initially focuses close", async () => {
  renderDialog({ project: portfolioCases[0] });
  const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
  expect(dialog).toHaveAttribute("open");
  expect(within(dialog).getByRole("button", { name: "关闭秋招网申助手详情" })).toHaveFocus();
  expect(dialog).toHaveAttribute("aria-labelledby", "case-dialog-title");
});

it("locks body scroll while open and restores prior inline styles on close", () => {
  document.body.style.overflow = "visible";
  const { rerenderProject } = renderDialog({ project: portfolioCases[0] });
  expect(document.body.style.overflow).toBe("hidden");
  rerenderProject(null);
  expect(document.body.style.overflow).toBe("visible");
});

it("closes with Escape and the explicit close button", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  renderDialog({ project: portfolioCases[0], onClose });
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledOnce();
});

it("only backdrop-closes when pointer down and up both target the dialog", () => {
  const onClose = vi.fn();
  renderDialog({ project: portfolioCases[0], onClose });
  const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
  fireEvent.pointerDown(dialog);
  fireEvent.pointerUp(dialog);
  expect(onClose).toHaveBeenCalledOnce();
});

it("does not backdrop-close after a pointer sequence that starts in content", () => {
  const onClose = vi.fn();
  renderDialog({ project: portfolioCases[0], onClose });
  fireEvent.pointerDown(screen.getByText(portfolioCases[0].background));
  fireEvent.pointerUp(screen.getByRole("dialog", { name: "秋招网申助手" }));
  expect(onClose).not.toHaveBeenCalled();
});

it("returns focus to its trigger", () => {
  const trigger = document.createElement("button");
  trigger.textContent = "项目触发器";
  document.body.append(trigger);
  const { rerenderProject } = renderDialog({ project: portfolioCases[0], returnFocusTo: trigger });
  rerenderProject(null);
  expect(trigger).toHaveFocus();
  trigger.remove();
});

it("uses the project heading for deep-link focus fallback", () => {
  const { rerenderProject, fallbackFocusRef } = renderDialog({ project: portfolioCases[0], returnFocusTo: null });
  rerenderProject(null);
  expect(fallbackFocusRef.current).toHaveFocus();
});
```


- [ ] **Step 3: Run the dialog tests and verify they fail**

```bash
npx vitest run src/components/case-dialog.test.tsx
```

Expected: FAIL because `CaseDialog` does not exist.

- [ ] **Step 4: Refactor `CaseDetail` into content-only markup**

Delete imports for `Image`, `motion`, `entranceEase`, and `usePrefersReducedMotion`; import `ProjectImage` instead. Delete `const reduce = usePrefersReducedMotion()`. Replace the complete opening `<motion.section ...>` tag with:

```tsx
<div className="case-detail">
```

Replace the final `</motion.section>` with:

```tsx
</div>
```

Do not alter the existing links, gallery grouping, background, goal, `userProblems`, five workflow steps, `highlights`, provenance text, or resume-builder upstream attribution. Replace each gallery image node:

```tsx
<ProjectImage
  media={media}
  priority={mediaIndex === 0}
  sizes={imageSizes(project, mediaIndex)}
/>
```

This keeps supplied alt/width/height through `ProjectImage` and retains `data-gallery-layout`.

- [ ] **Step 5: Implement `CaseDialog` lifecycle and guarded backdrop behavior**

Create `src/components/case-dialog.tsx` with:

- a `dialogRef` and `closeButtonRef`;
- an effect calling `showModal()` when `project` is non-null and the dialog is not open;
- an effect locking `document.body.style.overflow = "hidden"` and adding scrollbar compensation via `paddingRight`, restoring previous inline values on cleanup;
- a `cancel` listener that calls `event.preventDefault()` then `onClose()`;
- close-button focus after `showModal()`;
- focus restoration in the transition from open to closed, preferring `returnFocusTo?.isConnected`, otherwise `fallbackFocusRef.current`;
- a boolean ref set only when pointer down targets `event.currentTarget`, consumed on pointer up with the same target check;
- `aria-labelledby="case-dialog-title"`, one `<h2 id="case-dialog-title">`, and a close button named `关闭${project.title}详情`;
- `AnimatePresence`/Motion only inside the open native dialog; animate overlay content with `opacity` and `transform`, and use duration `0` under reduced motion.

The structural core is:

```tsx
<dialog
  ref={dialogRef}
  className="case-dialog"
  aria-labelledby="case-dialog-title"
  onCancel={handleCancel}
  onPointerDown={handleBackdropPointerDown}
  onPointerUp={handleBackdropPointerUp}
>
  {project ? (
    <motion.div className="case-dialog-panel" initial={initial} animate={animate} exit={exit}>
      <header className="case-dialog-header">
        <h2 id="case-dialog-title">{project.title}</h2>
        <button ref={closeButtonRef} type="button" aria-label={`关闭${project.title}详情`} onClick={onClose}>关闭</button>
      </header>
      <div className="case-dialog-scroll"><CaseDetail project={project} /></div>
    </motion.div>
  ) : null}
</dialog>
```

Do not call `dialog.close()` before the exit content has been removed; if exit animation is retained, close the native dialog from `AnimatePresence.onExitComplete`. Under reduced motion, completion is immediate.

- [ ] **Step 6: Add desktop/mobile dialog and safe-area CSS**

Add exact constraints:

```css
.case-dialog { width: min(76vw, 1100px); max-width: none; max-height: calc(100dvh - 48px); padding: 0; border: 0; border-radius: 1.25rem; background: transparent; color: inherit; overflow: hidden; }
.case-dialog::backdrop { background: rgb(15 23 42 / 0.5); backdrop-filter: blur(6px); }
.case-dialog-panel { display: grid; grid-template-rows: auto minmax(0, 1fr); max-height: calc(100dvh - 48px); background: var(--color-surface); }
.case-dialog-header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
.case-dialog-header h2 { margin: 0; font-size: clamp(1.25rem, 3vw, 1.75rem); }
.case-dialog-header button { min-width: 2.75rem; min-height: 2.75rem; }
.case-dialog-scroll { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
@media (max-width: 679px) {
  .case-dialog { width: calc(100% - 16px); max-height: calc(100dvh - 16px); border-radius: 1rem; }
  .case-dialog-panel { max-height: calc(100dvh - 16px); }
  .case-dialog-header { padding: calc(0.75rem + env(safe-area-inset-top)) calc(1rem + env(safe-area-inset-right)) 0.75rem calc(1rem + env(safe-area-inset-left)); }
  .case-dialog-scroll { padding-bottom: env(safe-area-inset-bottom); }
}
```

Remove inline-expansion placement rules from `.case-detail`; retain and adapt gallery/detail typography for the modal scroll container.

- [ ] **Step 7: Run dialog, content, type, and lint tests**

```bash
npx vitest run src/components/case-dialog.test.tsx src/components/home-page.test.tsx -t "complete verified case contract|four-image gallery"
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit the dialog**

```bash
git add src/components/case-dialog.tsx src/components/case-dialog.test.tsx src/components/case-detail.tsx src/components/project-image.tsx src/test/setup.ts src/app/globals.css
git commit -m "feat: add accessible project detail dialog"
```

---

### Task 5: Integrate grid triggers, URL state, and focus restoration

**Files:**
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/components/case-summary-card.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/components/use-project-dialog-state.test.tsx`

**Interfaces:**
- Consumes: `useProjectDialogState(projects)`, `CaseDialogProps`, and `CaseSummaryCard.buttonRef`.
- Produces: one `FeaturedCases` client boundary that owns selection, URL synchronization, per-trigger refs, fallback project heading ref, and one modal.

- [ ] **Step 1: Write failing end-to-end component tests**

Replace old inline detail tests with:

```tsx
it("opens exactly one labelled dialog and writes the project query", async () => {
  const user = userEvent.setup();
  render(<Home />);
  await user.click(screen.getByRole("button", { name: "查看项目详情：秋招网申助手" }));
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name: "秋招网申助手" })).toBeInTheDocument();
  expect(location.search).toBe("?project=job-application-helper");
});

it("keeps the complete verified content and source links inside the dialog", async () => {
  const user = userEvent.setup();
  render(<Home />);
  await user.click(screen.getByRole("button", { name: "查看项目详情：智能简历编辑工具" }));
  const dialog = within(screen.getByRole("dialog", { name: "智能简历编辑工具" }));
  expect(dialog.getByText(portfolioCases[2].background)).toBeInTheDocument();
  expect(dialog.getAllByTestId("workflow-step")).toHaveLength(5);
  expect(dialog.getByRole("link", { name: /查看智能简历编辑工具源码/ })).toHaveAttribute("target", "_blank");
  expect(dialog.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
});

it("restores focus to the originating project card after close", async () => {
  const user = userEvent.setup();
  const back = vi.spyOn(history, "back").mockImplementation(() => {
    history.replaceState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  render(<Home />);
  const trigger = screen.getByRole("button", { name: "查看项目详情：面试复盘助手" });
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "关闭面试复盘助手详情" }));
  expect(back).toHaveBeenCalledOnce();
  expect(trigger).toHaveFocus();
});

it("opens a valid deep link and falls back to the project heading on close", async () => {
  history.replaceState({}, "", "/?project=meeting-minutes");
  const user = userEvent.setup();
  render(<Home />);
  expect(screen.getByRole("dialog", { name: "智能会议纪要工具" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "关闭智能会议纪要工具详情" }));
  expect(screen.getByRole("heading", { level: 2, name: "个人项目" })).toHaveFocus();
  expect(location.search).toBe("");
});
```

Reset URL and history state before every home-page test so tests do not leak query state.

- [ ] **Step 2: Run focused integration tests and verify they fail**

```bash
npx vitest run src/components/home-page.test.tsx -t "labelled dialog|verified content|originating project|valid deep link"
```

Expected: FAIL because `FeaturedCases` is not yet connected to the hook/dialog/ref lifecycle.

- [ ] **Step 3: Integrate one dialog and stable trigger refs**

In `FeaturedCases`:

```tsx
const { selectedProject, openProject, closeProject } = useProjectDialogState(projects);
const headingRef = useRef<HTMLHeadingElement>(null);
const triggerRefs = useRef(new Map<ProjectCase["slug"], HTMLButtonElement>());
const [returnFocusTo, setReturnFocusTo] = useState<HTMLElement | null>(null);
```

Render `h2` with `ref={headingRef}` and `tabIndex={-1}`. For each card, provide a callback ref that adds/removes its button in `triggerRefs`. On open:

```ts
setReturnFocusTo(triggerRefs.current.get(project.slug) ?? null);
openProject(project.slug);
```

For a deep link, `returnFocusTo` stays `null`. Render exactly one dialog after the grid:

```tsx
<CaseDialog
  project={selectedProject}
  onClose={closeProject}
  returnFocusTo={returnFocusTo}
  fallbackFocusRef={headingRef}
/>
```

Keep `returnFocusTo` unchanged during close so `CaseDialog` can restore focus after the URL-driven selected project becomes `null`; every subsequent card open overwrites it with that card’s button, while an initial deep-link render leaves it `null`.

- [ ] **Step 4: Ensure source links identify new-window behavior**

In `CaseDetail`, preserve `target="_blank" rel="noopener noreferrer"` and add hidden text or aria-label so accessible names include “新窗口”, for example:

```tsx
<a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
  查看{project.title}源码<span className="sr-only">（新窗口）</span>
</a>
```

Apply the same rule to release and upstream links.

- [ ] **Step 5: Run the full unit suite and static checks**

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

Expected: all tests PASS and no inline-expansion expectation remains.

- [ ] **Step 6: Commit the integrated experience**

```bash
git add src/components/featured-cases.tsx src/components/case-summary-card.tsx src/components/case-detail.tsx src/components/home-page.test.tsx src/components/use-project-dialog-state.test.tsx
git commit -m "feat: connect project grid to shareable dialog"
```

---

### Task 6: Add real-browser responsive, history, focus, and reduced-motion coverage

**Files:**
- Create: `tests/browser/compact-portfolio.spec.ts`
- Modify: `tests/browser/reduced-motion-css.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: exported static site served by existing `playwright.config.ts` on `127.0.0.1:43117`.
- Produces: reproducible Chromium evidence for responsive columns, no overflow, deep links, history, focus, dialog scroll lock, screenshots, and reduced motion.

- [ ] **Step 1: Add a browser-test script and failing Playwright cases**

Add to `package.json` scripts:

```json
"test:browser:portfolio": "playwright test tests/browser/compact-portfolio.spec.ts"
```

Create `tests/browser/compact-portfolio.spec.ts` with these concrete tests:

```ts
import { expect, test } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

for (const viewport of viewports) {
  test(`${viewport.width}px uses ${viewport.columns} project columns without overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const cards = page.locator(".case-card");
    await expect(cards).toHaveCount(4);
    const tops = await cards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
    expect(new Set(tops.slice(0, viewport.columns)).size).toBe(1);
    if (viewport.columns < 4) expect(tops[viewport.columns]).toBeGreaterThan(tops[0]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  });
}

test("opens, deep-links, restores history, focus, and body scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await trigger.click();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭秋招网申助手详情" })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("direct project URL closes to overview and focuses project heading", async ({ page }) => {
  await page.goto("/?project=meeting-minutes", { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "智能会议纪要工具" })).toBeVisible();
  await page.getByRole("button", { name: "关闭智能会议纪要工具详情" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "个人项目" })).toBeFocused();
});

test("mobile dialog stays inside dynamic viewport and keeps close visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "智能简历编辑工具" });
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await expect(page.getByRole("button", { name: "关闭智能简历编辑工具详情" })).toBeVisible();
});
```

- [ ] **Step 2: Run the new browser suite and verify any missing behavior fails**

```bash
npm run test:browser:portfolio
```

Expected before final polish: at least one responsive/history/focus assertion exposes remaining integration or CSS gaps; if all pass, preserve the evidence and continue.

- [ ] **Step 3: Update reduced-motion browser coverage for the new component count**

The old test hard-codes nine `[data-motion]` elements from the Hero layout. Replace that count with semantic visibility assertions and add a dialog check:

```ts
await expect(page.getByRole("heading", { name: "董星" })).toBeVisible();
await expect(page.getByRole("heading", { name: "个人项目" })).toBeVisible();
await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
await expect(dialog).toBeVisible();
expect(await dialog.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
```

Keep the existing offscreen reveal assertions, but derive the locator from current `[data-motion]` nodes rather than asserting an obsolete exact count.

- [ ] **Step 4: Fix only defects revealed by browser evidence**

Apply targeted fixes in owning files:

- column mismatch or overflow → `src/app/globals.css`;
- URL/back mismatch → `src/components/use-project-dialog-state.ts`;
- focus mismatch or dialog bounds → `src/components/case-dialog.tsx`;
- image or accessible-name mismatch → `src/components/project-image.tsx` / `case-detail.tsx`.

For each fix, first add the smallest reproducing unit assertion when jsdom can represent it, then rerun the focused test before browser rerun.

- [ ] **Step 5: Run complete verification**

```bash
npm test
npm run test:browser:reduced
npm run test:browser:portfolio
npm run lint
npm run typecheck
npm run build
git diff --check
npm ls motion @playwright/test
```

Also scan the lockfile for private registries:

```bash
rg -n "bnpm\.byted\.org|registry\.byted\.org" package-lock.json
```

Expected: all commands PASS; the registry scan prints no matches; static export exists in `out/`.

- [ ] **Step 6: Manually inspect browser states at required sizes**

Using Playwright screenshots or an equivalent real Chromium session, inspect:

- 1440×900: 3-column grid and normal-width 4th card;
- 1024×768 and 768×900: 2 columns;
- 390×844 and 320×800: 1 column, long email wraps, no horizontal overflow;
- dialog open/close, Escape, guarded backdrop, deep link, Back/Forward;
- 200% and 400% page zoom;
- slow/failed image state;
- reduced motion with no card tilt or modal translation;
- console has no errors and all supplied images load.

Record exact observations in the task completion message; do not commit generated screenshots or logs.

- [ ] **Step 7: Commit browser coverage and polish**

```bash
git add package.json tests/browser/compact-portfolio.spec.ts tests/browser/reduced-motion-css.spec.ts src/app/globals.css src/components src/test/setup.ts
git commit -m "test: verify compact portfolio dialog experience"
```

---

### Task 7: Final whole-branch review and deployment readiness

**Files:**
- Review: all files changed since `64aa356`
- Modify only if review or verification finds a concrete defect.

**Interfaces:**
- Consumes: Tasks 1–6 complete and passing.
- Produces: clean branch, reproducible verification evidence, and a deployable static export.

- [ ] **Step 1: Review the aggregate diff against the approved spec**

```bash
git diff --stat 64aa356..HEAD
git diff --check 64aa356..HEAD
git status --short --branch
```

Verify every spec requirement has an owning implementation/test and that deleted Hero/contact code has no references:

```bash
rg -n "认真体验，持续表达|hero-copy|HeroProfileIndex|<Contact|case-row|aria-expanded" src tests
```

Expected: no obsolete UI implementation references; test strings may remain only when asserting absence.

- [ ] **Step 2: Run the final clean-install gate**

```bash
rm -rf node_modules
npm ci --registry=https://registry.npmjs.org/
npm test
npm run test:browser:reduced
npm run test:browser:portfolio
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Confirm repository cleanliness**

```bash
git status --short --branch
```

Expected: branch `aime/portfolio-density-redesign` with no uncommitted files. Do not push, create a PR, merge, or deploy unless the user explicitly chooses that next action.

- [ ] **Step 4: Commit only if final review required a fix**

If and only if Step 1 or 2 produced a concrete defect, stage only its owning files and commit with a specific message such as:

```bash
git add src/components/case-dialog.tsx src/components/case-dialog.test.tsx
git commit -m "fix: restore project dialog focus safely"
```

If no defect exists, do not create an empty commit.
