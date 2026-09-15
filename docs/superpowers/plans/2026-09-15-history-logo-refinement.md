# History Logo Refinement Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan task by task.

**Goal:** Apply the approved company-logo and education refinements to remote main, preserving the current light portfolio and project interactions.

**Architecture:** Keep ProfileHistory and the existing logo components. Use explicit grid tracks for logos and content; share column sizing across experience rows. Reuse authentic existing artwork, preserving aspect ratios and original colors.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Vitest, Playwright, sharp.

## Global Constraints

- Base: origin/main at 3ec8b1a, not the outdated local main.
- Preserve all six experiences, education facts, project content, dialogs and motion.
- Company marks on the left; descriptions align with organization text.
- Desktop organization, role and date share a row; roles are left-aligned.
- Remove timeline pseudo-elements and their indentation.
- School emblems approximately 64px. Following preview feedback, center a 160px text block in the remaining right-hand area, with an 8px minimum gap.
- Faculty and major/degree occupy separate lines.
- Narrow screens reflow complete text instead of clipping it.
- Keep image fallback dimensions stable; never stretch or claim upscaled raster art is vector art.

## Task 1: Regression Coverage

**Files:** `tests/browser/history-refinement.spec.ts`, `src/components/home-page.test.tsx`

**Interfaces:** Exercise the actual home route, existing experience/education test IDs and image elements.

- [x] Run `npm test` to establish the baseline: 79 passed.
- [x] Add Playwright assertions for hidden timeline pseudo-elements, shared role starts, description/name alignment, square logo slots, 64px school slots, 8px school/copy gap, and separate faculty/degree lines.
- [x] Cover 390, 768, 1024 and 1440px widths; check no document overflow or clipped company/role text.
- [x] Confirm the education unit regression fails before the metadata change. Browser baseline was blocked by missing Chromium; installed Chromium and verified five browser regressions after implementation.

## Task 2: Layout and Artwork

**Files:** `src/components/profile-history.tsx`, `src/components/company-logo.tsx`, `src/app/globals.css`, `src/content/portfolio.ts`, `public/companies/*`

**Interfaces:** Preserve ExperienceItem/EducationItem and existing accessible image names. Update image metadata when intrinsic asset dimensions change.

- [x] Group education metadata as faculty plus a second line containing `{item.major} {item.degree}`.
- [x] Use `grid-template-columns: 4rem minmax(0, 1fr)` and `gap: 0.5rem` for education rows; remove the conflicting list selector.
- [x] Remove obsolete timeline and conflicting history layout rules. Use a fixed square logo track and a shared description offset.
- [x] Use shared organization/role tracks on desktop, with full text wrapping and a compact stacked fallback on small screens.
- [x] Extract graphic marks from existing vector artwork; use original raster sources where available. Keep the logo plate neutral and image fit contained. Record the institute screenshot limitation in `public/companies/ASSETS.md`.
- [x] Update tests that require obsolete clipped mobile text, old intrinsic dimensions or three separate education metadata spans.
- [x] Run targeted regression tests, then unit tests: 5 browser regressions and 78 unit tests passed.

## Task 3: Verification and Handoff

**Files:** Tests and scoped layout fixes only if verification exposes defects.

- [x] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`: all passed.
- [x] Run all Playwright suites, including image failures, keyboard/dialog workflows, reduced motion and no-JavaScript rendering: 60 passed.
- [x] Inspect desktop/mobile screenshots together; resolve any defects in one batch.
- [x] Run the scoped Impeccable detector: no findings.
- [x] Leave a local preview running at `http://127.0.0.1:43118` (HTTP 200). Branch: `fix/history-logo-refinement`; not pushed or deployed.

## Preview Feedback

- Replace the screenshot crop with the institute's 640 x 640 Guopin company-profile logo. Its triangular artwork differs from the original reference; identity and source are recorded in `public/companies/ASSETS.md`. No raster upscaling.
- Center the education copy block within the area to the right of each school emblem; keep its text left-aligned and its width responsive.
- Update iFlytek summary to "多模态心脏超声智能报告系统的构建与迭代".
- Update Meituan summary to "供应链质量管理与产品优化".
- Regression proof: updated content test failed on the old summaries; browser layout test failed on the old full-width education text block (252px instead of 160px).
