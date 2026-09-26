# Immersive Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing compact portfolio with an original Immersive Garden-inspired personal homepage and publish it to `https://aurostars.github.io/`.

**Architecture:** Keep Next.js static export and verified content. Add a dynamically loaded Three.js scene as an isolated Client Component, a separate accessible full-screen menu, and a new immersive page shell that reuses existing history, project dialog, and content modules.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, Motion, Source Serif 4 Variable, Vitest, Playwright, GitHub Pages.

## Global Constraints

- Preserve all verified facts and existing project URLs from `src/content/portfolio.ts`.
- Do not use reference-site assets, identity, copy, or source.
- Keep native dialog deep links, history, focus restoration, image failure behavior, Reduced Motion, and no-JavaScript content.
- Use a light theme throughout, 8px media/dialog corners, and no em dash characters in visible copy.
- Verify 1440, 1024, 768, 390, and 320px widths without horizontal overflow.

---

### Task 1: Lock the new page contract

**Files:**
- Modify: `src/components/home-page.test.tsx`
- Create: `src/components/immersive/site-menu.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: expected hero heading, menu anchors, preserved personal data, six project buttons, and metadata.

- [ ] **Step 1: Write failing tests**

Assert that the home page has a `个人信息` hero with heading `董星`, the statement `让智能产品，拥有可感知的体验。`, menu links to `#about`, `#experience`, `#cases`, and `#contact`, plus all six project triggers.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/home-page.test.tsx src/components/immersive/site-menu.test.tsx
```

Expected: FAIL because the immersive shell and menu do not exist.

- [ ] **Step 3: Update metadata**

Set title to `董星 | AI 产品与独立创造` and describe the verified AI product work, independent projects, and interactive portfolio.

- [ ] **Step 4: Commit**

```bash
git add src/components/home-page.test.tsx src/components/immersive/site-menu.test.tsx src/app/layout.tsx
git commit -m "test: define immersive portfolio contract"
```

### Task 2: Build the immersive shell and menu

**Files:**
- Create: `src/components/immersive/immersive-home.tsx`
- Create: `src/components/immersive/site-menu.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `education`, `experiences`, `portfolioCases`, and `contact`.
- Produces: `ImmersiveHome` and semantic section IDs `home`, `about`, `experience`, `cases`, `contact`.

- [ ] **Step 1: Implement the page shell**

Render hero, manifesto, existing `ProfileHistory`, existing `FeaturedCases`, and contact footer. Keep content visible in server output.

- [ ] **Step 2: Implement the menu**

Use a native button, full-screen overlay, Escape close, focus entry, focus restoration, and same-page anchors.

- [ ] **Step 3: Replace the visual system**

Rewrite `globals.css` for the stone-white editorial world, Source Serif headings, fixed header, generous sections, staggered project grid, redesigned dialog, responsive single-column layout, and Reduced Motion.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test -- src/components/home-page.test.tsx src/components/immersive/site-menu.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components/immersive src/components/home-page.test.tsx
git commit -m "feat: build immersive portfolio shell"
```

### Task 3: Build the procedural garden

**Files:**
- Create: `src/components/immersive/garden-scene.tsx`
- Create: `src/components/immersive/garden-geometry.ts`
- Create: `src/components/immersive/garden-geometry.test.ts`
- Modify: `src/components/immersive/immersive-home.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `GardenScene` with WebGL ready/fallback state.
- Produces: deterministic geometry helpers that return finite Three.js buffer geometry.

- [ ] **Step 1: Write geometry tests**

Assert that generated stems, leaves, flowers, and birds have finite positions and non-empty index/position buffers.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/immersive/garden-geometry.test.ts
```

Expected: FAIL because the geometry module does not exist.

- [ ] **Step 3: Implement geometry and scene**

Create original procedural meshes, plaster material, soft studio lights, pointer parallax, Motion scroll progression, responsive geometry detail, visibility pause, context-loss fallback, and full disposal.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test -- src/components/immersive/garden-geometry.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/immersive src/app/globals.css package.json package-lock.json
git commit -m "feat: add procedural immersive garden"
```

### Task 4: Browser verification and deployment

**Files:**
- Modify: `tests/browser/compact-portfolio.spec.ts`
- Modify: `tests/browser/reduced-motion-css.spec.ts`
- Modify: `tests/browser/no-javascript.spec.ts`
- Create: `DESIGN.md`
- Create: `.impeccable/design.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete page and existing GitHub Pages workflow.
- Produces: verified static export and public deployment.

- [ ] **Step 1: Update browser contracts**

Cover canvas/fallback, fixed header, menu keyboard flow, project dialog, 320px overflow, image loading, and stable content when JavaScript or motion is limited.

- [ ] **Step 2: Run the full verification matrix**

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser:portfolio -- --reporter=line
npm run test:browser:reduced -- --reporter=line
npm run test:browser:no-js -- --reporter=line
npm run test:browser:assets -- --reporter=line
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Inspect in two bounded screenshot rounds**

Capture desktop and mobile hero, experience, projects, dialog, menu, Reduced Motion, and fallback. Apply one batch of material fixes, then confirm once.

- [ ] **Step 4: Document the built system**

Run the Impeccable detector once, independent finish review, then generate `DESIGN.md` and `.impeccable/design.json` from the implementation.

- [ ] **Step 5: Publish**

Merge the feature branch into `main`, push `main`, wait for `Deploy to GitHub Pages`, then verify title, visible hero, project images, menu, and project dialog at `https://aurostars.github.io/`.
