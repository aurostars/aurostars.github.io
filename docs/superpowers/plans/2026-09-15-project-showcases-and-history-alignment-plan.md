# Project Showcases and History Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two compact showcase projects, restore the original ByteDance wordmark, balance the desktop role column, regenerate the standalone HTML, and deploy the verified result.

**Architecture:** Extend `ProjectCase` as a discriminated union with `full` and `showcase` variants. Keep the existing card and dialog shell, then branch only the detail body and optional demo action. Use the incumbent CSS grid and local asset pipeline; preserve the mobile history layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Vitest, Testing Library, Playwright, Sharp, GitHub Pages.

## Global Constraints

- Existing four projects retain their order and full detail structure.
- Append “生活打卡网页” and then “小米 SU7 3D 展示网页”.
- Showcase details contain only project description, implemented features, and image.
- Header action order is “查看展示网页”, “查看源码”, “关闭”.
- Restore the original full ByteDance wordmark on a dark plate.
- At 1440px, role text has approximately equal gaps to the longest description and the dates; mobile layout is unchanged.
- Both uploaded screenshots are local assets rendered at their intrinsic dimensions.
- Regenerate the standalone HTML and deploy `main`.

---

### Task 1: Define and populate showcase project data

**Files:**
- Modify: `src/content/portfolio.ts`
- Modify: `src/content/portfolio.test.ts`
- Create: `public/projects/today-island/overview.png`
- Create: `public/projects/xiaomi-su7-3d/vehicle-stage.png`

**Interfaces:**
- Produces: `ProjectCase = FullProjectCase | ShowcaseProjectCase`
- Produces: `presentation: "full" | "showcase"`
- Produces: showcase-only `description: string` and `releaseUrl: string`

- [ ] **Step 1: Write failing content tests**

Update expected slugs and assert:

```ts
expect(portfolioCases.map(({ slug }) => slug)).toEqual([
  "job-application-helper",
  "interview-review",
  "resume-builder",
  "meeting-minutes",
  "today-island",
  "xiaomi-su7-3d",
]);
expect(portfolioCases.slice(-2).map(({ title, presentation }) => ({ title, presentation }))).toEqual([
  { title: "生活打卡网页", presentation: "showcase" },
  { title: "小米 SU7 3D 展示网页", presentation: "showcase" },
]);
```

Assert exact repository URLs, release URLs, uploaded image dimensions, project descriptions, and feature boundaries. Restrict five-step workflow assertions to `presentation === "full"`.

- [ ] **Step 2: Run the content test and verify RED**

Run:

```bash
npm test -- src/content/portfolio.test.ts --maxWorkers=1
```

Expected: FAIL because the new slugs and presentation field do not exist.

- [ ] **Step 3: Add the discriminated union and content**

Define:

```ts
interface ProjectCaseBase {
  slug: ProjectSlug;
  title: string;
  descriptor: string;
  summary: string;
  highlights: string[];
  features: string[];
  repositoryUrl: string;
  media: ProjectMedia[];
  provenance?: string;
}

export interface FullProjectCase extends ProjectCaseBase {
  presentation: "full";
  background: string;
  goal: string;
  workflow: [string, string, string, string, string];
}

export interface ShowcaseProjectCase extends ProjectCaseBase {
  presentation: "showcase";
  description: string;
  releaseUrl: string;
}

export type ProjectCase = FullProjectCase | ShowcaseProjectCase;
```

Mark the four existing entries as `presentation: "full"`. Add the two approved showcase entries in the approved order, with exact links and feature copy from the design spec.

Copy:

```text
e43b27be-7200-44e4-96d7-6623134de347_image.png
  -> public/projects/xiaomi-su7-3d/vehicle-stage.png
b4962d5e-87d3-4ef3-98dc-29c04bcc0f9a_image.png
  -> public/projects/today-island/overview.png
```

- [ ] **Step 4: Run the content test and verify GREEN**

Run:

```bash
npm test -- src/content/portfolio.test.ts --maxWorkers=1
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/portfolio.ts src/content/portfolio.test.ts public/projects/today-island/overview.png public/projects/xiaomi-su7-3d/vehicle-stage.png
git commit -m "feat: add lifestyle and SU7 showcase projects"
```

### Task 2: Render compact showcase details and demo links

**Files:**
- Modify: `src/components/case-detail.tsx`
- Modify: `src/components/case-dialog.tsx`
- Modify: `src/components/case-dialog.test.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProjectCase.presentation`, `ShowcaseProjectCase.description`, `ShowcaseProjectCase.releaseUrl`
- Produces: `.case-description` and `.case-demo-link`

- [ ] **Step 1: Write failing component tests**

For “生活打卡网页”, assert:

```ts
expect(within(dialog).getByRole("heading", { name: "项目说明" })).toBeVisible();
expect(within(dialog).getByText(project.description)).toBeVisible();
expect(within(dialog).queryByRole("heading", { name: "背景" })).not.toBeInTheDocument();
expect(within(dialog).queryByRole("heading", { name: "目标" })).not.toBeInTheDocument();
expect(within(dialog).queryByRole("heading", { name: "工作流程" })).not.toBeInTheDocument();
expect(Array.from(actions.children)).toEqual([demoLink, sourceLink, closeButton]);
```

Retain assertions that full projects render background, goal and workflow and have no demo link.

- [ ] **Step 2: Run component tests and verify RED**

Run:

```bash
npm test -- src/components/case-dialog.test.tsx src/components/home-page.test.tsx --maxWorkers=1
```

Expected: FAIL because showcase branching and demo link do not exist.

- [ ] **Step 3: Implement the compact detail branch**

In `CaseDetail`, render gallery for every project. For `presentation === "showcase"`, render only:

```tsx
<section className="case-description" aria-labelledby={`${project.slug}-description`}>
  <h4 id={`${project.slug}-description`}>项目说明</h4>
  <p>{project.description}</p>
</section>
```

Then render the shared implemented-features section. Keep the existing full detail blocks only for `presentation === "full"`.

In `CaseDialog`, add an external `case-demo-link` before the source link only when `presentation === "showcase"`.

- [ ] **Step 4: Style the new section and action**

Reuse the existing link height, border, focus and hover language for `.case-demo-link`. Give `.case-description` the same quiet section treatment as existing detail content without introducing a nested card.

- [ ] **Step 5: Run component tests and verify GREEN**

Run:

```bash
npm test -- src/components/case-dialog.test.tsx src/components/home-page.test.tsx --maxWorkers=1
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/case-detail.tsx src/components/case-dialog.tsx src/components/case-dialog.test.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add compact showcase project details"
```

### Task 3: Restore ByteDance logo and balance role spacing

**Files:**
- Modify: `src/content/portfolio.ts`
- Modify: `src/components/company-logo.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/content/portfolio.test.ts`
- Modify: `tests/browser/history-refinement.spec.ts`
- Create: `public/companies/bytedance-original.png`

**Interfaces:**
- Produces: ByteDance asset metadata with a wordmark aspect ratio above `3`
- Produces: `data-logo-plate="dark"` for the ByteDance wordmark

- [ ] **Step 1: Finalize failing history tests**

Retain the interrupted regression test that checks the ByteDance wordmark and 1440px gap balance. Ensure it fails against current production because the asset is square, the plate is light, and the role gaps differ by more than 24px.

- [ ] **Step 2: Run the focused browser test and verify RED**

Run:

```bash
npx playwright test tests/browser/history-refinement.spec.ts --grep "balances"
```

Expected: FAIL on the current ByteDance asset or role spacing.

- [ ] **Step 3: Restore the original wordmark**

Use the pre-refinement ByteDance SVG from commit `3ec8b1a`, rasterized at high density to a local PNG without upscaling a bitmap. Update portfolio metadata and select the dark plate in `CompanyLogo` based on the ByteDance organization or asset.

- [ ] **Step 4: Move the desktop role column**

At the desktop breakpoint, change the role track from `7.6rem` to approximately `12rem`, keeping the date track unchanged. Do not change the stacked layout below the existing responsive breakpoint.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npm test -- src/content/portfolio.test.ts --maxWorkers=1
npx playwright test tests/browser/history-refinement.spec.ts
```

Expected: PASS at 390, 768, 1024 and 1440px.

- [ ] **Step 6: Commit**

```bash
git add src/content/portfolio.ts src/components/company-logo.tsx src/app/globals.css src/content/portfolio.test.ts tests/browser/history-refinement.spec.ts public/companies/bytedance-original.png
git commit -m "fix: restore ByteDance wordmark and balance roles"
```

### Task 4: Verify six-card layout and showcase behavior

**Files:**
- Modify: `tests/browser/compact-portfolio.spec.ts`
- Modify: `tests/browser/visual-assets.spec.ts`

**Interfaces:**
- Consumes: six project cards and both project detail variants
- Produces: browser-level regression coverage

- [ ] **Step 1: Add failing browser assertions**

Assert:

```ts
await expect(page.getByTestId("case-summary-card")).toHaveCount(6);
await expect(page.getByTestId("case-summary-card").nth(4)).toContainText("生活打卡网页");
await expect(page.getByTestId("case-summary-card").nth(5)).toContainText("小米 SU7 3D 展示网页");
```

Open both new projects and verify the compact section set, action order, exact release links, image loading, image contain fit, Escape close and trigger focus restoration.

- [ ] **Step 2: Run browser tests and verify RED or immediate coverage**

Run:

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts tests/browser/visual-assets.spec.ts
```

Expected before Task 1–3 implementation: FAIL. If Task 1–3 are already green, temporarily reverse one expected title to prove the new assertion fails, restore it, then continue.

- [ ] **Step 3: Make only necessary responsive CSS corrections**

At desktop, retain three columns for six projects. At mobile, keep one column. Adjust only fixed card/media constraints shown by the failing tests; do not redesign the cards.

- [ ] **Step 4: Run browser tests and verify GREEN**

Run:

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts tests/browser/visual-assets.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/browser/compact-portfolio.spec.ts tests/browser/visual-assets.spec.ts src/app/globals.css
git commit -m "test: cover showcase project interactions"
```

### Task 5: Quality gate, HTML export, and deployment

**Files:**
- Update generated file: `/Users/bytedance/Downloads/github/exports/aurostars-homepage.html`
- Modify only if required by verification: files already listed above

**Interfaces:**
- Produces: verified production build, offline HTML and deployed GitHub Pages revision

- [ ] **Step 1: Run the full local quality gate**

Run:

```bash
npm test -- --maxWorkers=2
npm run lint
npm run typecheck
npm run build
npx playwright test
git diff --check
node /Users/bytedance/.trae-cn/skills/impeccable/scripts/detect.mjs --json src/app/globals.css src/components/case-detail.tsx src/components/case-dialog.tsx
```

Expected: all commands pass with no errors.

- [ ] **Step 2: Inspect desktop and mobile screenshots**

Capture 1440px and 390px full-page screenshots. Confirm the six cards, both new covers, restored ByteDance wordmark, balanced role column, action wrapping, and no overlap or clipping.

- [ ] **Step 3: Regenerate and verify the standalone HTML**

Run the established exporter against the fresh `out/` build. Verify with network blocked:

- No automatic external resource requests.
- Six project cards and six working dialogs.
- Both new project images render.
- Demo links and source links have exact URLs.
- 1440px and 390px layouts have no horizontal overflow.

- [ ] **Step 4: Commit implementation and merge**

Commit any final verification-driven fixes. Fast-forward the clean main worktree to the feature branch.

- [ ] **Step 5: Push and verify deployment**

```bash
git push origin main
gh run list --repo aurostars/aurostars.github.io --limit 2
```

Wait for the Pages workflow to succeed, then fetch the deployed HTML and verify both new project titles, both release URLs and the ByteDance asset path.

- [ ] **Step 6: Report deliverables**

Provide the deployed URL, commit SHA and clickable local standalone HTML path.
