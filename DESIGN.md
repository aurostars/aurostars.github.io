---
name: Dong Xing Immersive Portfolio
description: A sculptural editorial portfolio where verified product work unfolds through a living plaster garden.
colors:
  plaster-paper: "#e5e4df"
  plaster-bright: "#efeee9"
  charcoal-ink: "#161713"
  mineral-muted: "#5e615a"
  botanical-accent: "#547b68"
  focus-green: "#235f46"
typography:
  display:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "clamp(3.1rem, 5.3vw, 5.7rem)"
    fontWeight: 360
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
rounded:
  media: "8px"
  circular: "999px"
spacing:
  compact: "8px"
  control: "16px"
  section: "128px"
components:
  menu-trigger:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.media}"
    height: "44px"
  project-media:
    backgroundColor: "{colors.plaster-paper}"
    rounded: "{rounded.media}"
  dialog-panel:
    backgroundColor: "{colors.plaster-bright}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.media}"
---

# Design System: Dong Xing Immersive Portfolio

## Overview

**Creative North Star: "The Living Relief"**

The portfolio behaves like a pale sculptural garden that happens to contain a rigorous product record. It replaces conventional resume panels with one continuous spatial field, while verified screenshots and plain factual copy preserve credibility.

The interface is quiet and editorial. Large serif statements establish authorship, small Geist labels handle controls and metadata, and the procedural Three.js scene supplies depth without becoming a separate decorative widget.

**Key Characteristics:**

- Full-viewport plaster garden generated from original Three.js geometry.
- Editorial scale changes rather than repeated cards.
- Real product screenshots remain the evidence layer.
- Motion follows scroll, pointer, and UI state, with static fallbacks.

## Colors

The palette is restrained: warm mineral neutrals, charcoal text, and one muted botanical green.

### Primary

- **Botanical Mineral**: Used on select petals, motion transitions, links, and focus states.

### Neutral

- **Plaster Paper**: The continuous page and WebGL background.
- **Bright Plaster**: Dialog surfaces and high-light areas.
- **Charcoal Ink**: Headlines and primary controls.
- **Mineral Muted**: Metadata and secondary copy.

### Named Rules

**The Material Continuity Rule.** Page, canvas, menu, and dialog stay in the same light mineral world.

**The One Botanical Accent Rule.** Green is the only chromatic accent outside real logos and product screenshots.

## Typography

**Display Font:** Source Serif 4 Variable with Georgia fallback  
**Body Font:** Geist with system sans fallback

**Character:** The display face feels cultural and tactile; the body face keeps dense product facts precise.

### Hierarchy

- **Display**: Variable light weights and tight line height for hero, manifesto, project index, and contact.
- **Title**: Source Serif at 1.55rem to 2.3rem for project names.
- **Body**: Geist at 0.78rem to 0.95rem with generous line height.
- **Label**: Geist at 0.7rem to 0.78rem for section names and metadata.

### Named Rules

**The Scale Instead of Decoration Rule.** Hierarchy comes from type scale and whitespace, not badges, gradients, or ornamental borders.

## Layout

The maximum content width is 77.5rem with 3rem desktop gutters. The hero and major statements use viewport-height pacing. History uses a 34/66 split from 768px upward and stacks below 768px. Projects form an offset two-column wall above 680px and a direct single column below it.

The header remains fixed at 78px on desktop and 68px on mobile. Sections use long pauses around 8rem to 9rem, while related rows use compact 1rem to 2rem spacing.

## Elevation & Depth

Depth is primarily rendered by the WebGL lights, cast shadows, and camera movement. Project images use a soft offset shadow; the modal uses the strongest shadow on the page. Ordinary text sections do not become elevated surfaces.

**The Canvas Carries Depth Rule.** Do not add glass panels or shadowed content containers to compensate for a weak scene.

## Shapes

The signature geometry is organic and rounded: tubular stems, ellipsoid leaves, soft petals, and low-relief birds. Interface rectangles use one restrained 8px radius. Identity and return controls may be circular.

## Components

### Navigation

The fixed wordmark and text menu trigger are always visible. Opening the menu creates an opaque full-screen mineral surface with oversized serif links, keyboard focus entry, Escape closing, and focus restoration.

### Project Cards

Cards are unframed buttons. A real screenshot leads, followed by serif title, type, and concise summary. Desktop cards alternate vertical position; mobile cards return to a straight single column.

### Dialog

The native dialog is centered, 8px rounded, and nearly opaque. Its header remains available while the factual detail body scrolls. Source, demo, and close actions use the same quiet bordered control.

### Motion

The garden responds softly to pointer position and global scroll progress. Reduced Motion stops continuous scene motion and leaves the page in a readable final state. WebGL failure reveals the CSS relief without changing the document.

## Do's and Don'ts

### Do:

- **Do** lead with the living relief and real project evidence.
- **Do** keep text readable over the scene by reducing object opacity deeper in the page.
- **Do** preserve 8px corners and one green accent.
- **Do** keep every interaction keyboard accessible and usable without WebGL.

### Don't:

- **Don't** copy reference-site models, identity, projects, or text.
- **Don't** introduce dark sections, purple effects, glass-card grids, or rounded pills.
- **Don't** add invented clients, metrics, roles, or project outcomes.
- **Don't** place decorative labels over product screenshots.
