# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is recruiters, product leaders, and potential collaborators evaluating 董星's product thinking, AI product experience, and ability to ship independent software.

## Product Purpose

The site is a public personal portfolio. It should let a visitor quickly understand 董星's background, inspect six real projects, open detailed case information without leaving the page, and contact him by email or GitHub.

## Positioning

The portfolio connects verified product work and career history with unusually expressive browser craft. The visual experience demonstrates the same curiosity and implementation ability described by the project content.

## Operating Context

Visitors usually arrive from a shared link or GitHub profile and browse on desktop or mobile. They may scan quickly, open one project in depth, follow its source or live demo, and contact the owner.

## Capabilities and Constraints

- Next.js 16 with React 19 and static export.
- Published from `aurostars/aurostars.github.io` through the existing GitHub Pages workflow.
- Six verified projects, two education entries, six experience entries, email, and GitHub.
- Project details use the existing accessible native dialog, query-string deep links, browser history, focus restoration, and external source/demo links.
- Content facts and local project screenshots must be preserved. Do not invent clients, metrics, outcomes, education, roles, or capabilities.
- The site must work at 320px and above, support keyboard navigation, reduced motion, no JavaScript content access, image failures, and WebGL fallback.

## Brand Commitments

- Name: 董星.
- The user explicitly selected `https://immersive-g.com/` as the visual quality and interaction reference.
- The redesign should feel cinematic, sculptural, editorial, and bright rather than like a conventional resume or SaaS page.
- Reference assets, identity, copy, project claims, and source code must not be copied.

## Evidence on Hand

- Verified portfolio data: `src/content/portfolio.ts`.
- Real product screenshots: `public/projects/`.
- Local organization and school marks: `public/companies/` and `public/schools/`.
- Existing accessibility and behavior tests: `src/**/*.test.tsx` and `tests/browser/`.
- Existing GitHub Pages workflow: `.github/workflows/deploy.yml`.

## Product Principles

1. Let real work carry the credibility.
2. Make exploration memorable without making information hard to reach.
3. Keep every factual claim traceable to repository evidence.
4. Treat motion as narrative and state feedback, not decoration.
5. Keep the experience resilient when motion, JavaScript, images, or WebGL are limited.

## Accessibility & Inclusion

Maintain semantic headings and regions, visible keyboard focus, native dialog behavior, reduced-motion handling, readable contrast, responsive layouts, and static fallbacks for visual effects.
