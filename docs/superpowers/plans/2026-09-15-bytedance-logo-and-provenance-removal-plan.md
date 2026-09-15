# ByteDance Logo and Provenance Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ByteDance mark with the uploaded color SVG and remove all project provenance text from data, UI, CSS, offline HTML, and the deployed site.

**Architecture:** Keep the existing logo and project-detail components. Replace only the ByteDance asset reference and simplify the project base type by deleting the unused provenance field and render path.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Playwright, GitHub Pages.

## Global Constraints

- Use `/Users/bytedance/Downloads/bytedance-color.svg` without redrawing or rasterizing it.
- Keep the current 48px company Logo slot and use the light plate.
- Remove provenance text from all six project details.
- Preserve all unrelated content, layout and interactions.
- Regenerate the standalone HTML and deploy `main`.

---

### Task 1: Replace the ByteDance asset

**Files:**
- Create: `public/companies/bytedance-color.svg`
- Delete: `public/companies/bytedance-original.png`
- Modify: `public/companies/ASSETS.md`
- Modify: `src/content/portfolio.ts`
- Modify: `src/content/portfolio.test.ts`
- Modify: `src/components/company-logo.tsx`
- Modify: `tests/browser/history-refinement.spec.ts`
- Modify: `tests/browser/compact-portfolio.spec.ts`

**Interfaces:**
- Produces: ByteDance `CompanyLogo` metadata `{ src: "/companies/bytedance-color.svg", width: 24, height: 24 }`
- Produces: `data-logo-plate="light"` for the ByteDance mark

- [ ] **Step 1: Update tests to require the uploaded SVG**

Assert exact asset metadata, self-contained SVG content, a square aspect ratio and a light plate. Update the failed-image route to intercept `bytedance-color.svg`.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npm test -- src/content/portfolio.test.ts --maxWorkers=1
npx playwright test tests/browser/history-refinement.spec.ts --grep "balances"
```

Expected: FAIL because the site still references `bytedance-original.png` on a dark plate.

- [ ] **Step 3: Copy and reference the uploaded SVG**

Copy the exact uploaded file to `public/companies/bytedance-color.svg`, update portfolio metadata, remove the special dark-plate branch, delete the obsolete PNG, and update `ASSETS.md`.

- [ ] **Step 4: Run focused tests and verify GREEN**

```bash
npm test -- src/content/portfolio.test.ts --maxWorkers=1
npx playwright test tests/browser/history-refinement.spec.ts
```

Expected: PASS.

### Task 2: Remove project provenance

**Files:**
- Modify: `src/content/portfolio.ts`
- Modify: `src/content/portfolio.test.ts`
- Modify: `src/components/case-detail.tsx`
- Modify: `src/components/case-dialog.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Removes: `ProjectCaseBase.provenance`
- Removes: `.case-provenance`

- [ ] **Step 1: Write failing tests**

Assert:

```ts
for (const project of portfolioCases) {
  expect(project).not.toHaveProperty("provenance");
}
expect(dialog.querySelector(".case-provenance")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/content/portfolio.test.ts src/components/case-dialog.test.tsx --maxWorkers=1
```

Expected: FAIL because three projects still contain and render provenance.

- [ ] **Step 3: Remove data, rendering and CSS**

Delete the field from the type and project entries, remove the conditional paragraph from `CaseDetail`, and delete `.case-provenance` CSS.

- [ ] **Step 4: Run tests and verify GREEN**

```bash
npm test -- src/content/portfolio.test.ts src/components/case-dialog.test.tsx --maxWorkers=1
```

Expected: PASS.

- [ ] **Step 5: Commit implementation**

```bash
git add public/companies src/content src/components src/app/globals.css tests/browser
git commit -m "fix: use color ByteDance logo and remove provenance"
```

### Task 3: Verify, export, and deploy

**Files:**
- Update generated file: `/Users/bytedance/Downloads/github/exports/aurostars-homepage.html`

**Interfaces:**
- Produces: verified source tree, standalone HTML and deployed GitHub Pages revision

- [ ] **Step 1: Run the full quality gate**

```bash
npm test -- --maxWorkers=2
npm run lint
npm run typecheck
npm run build
npx playwright test
git diff --check
```

- [ ] **Step 2: Inspect desktop and mobile**

Verify the color Logo remains visible at 1440px and 390px, all project details omit provenance, and no content overlaps or overflows.

- [ ] **Step 3: Regenerate the standalone HTML**

Use the existing exporter, then verify six offline dialogs, embedded assets, no automatic external requests, the new Logo and absence of provenance text.

- [ ] **Step 4: Push and verify GitHub Pages**

Push `main`, wait for the Pages workflow, then verify the deployed Logo path and absence of the deleted provenance strings.
