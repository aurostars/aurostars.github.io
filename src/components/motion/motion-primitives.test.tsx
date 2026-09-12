import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ComponentPropsWithoutRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    motion: {
      div: ({ initial, transition, variants, viewport, whileInView, ...props }: ComponentPropsWithoutRef<"div"> & Record<string, unknown>) =>
        createElement("div", {
          ...props,
          "data-initial": JSON.stringify(initial),
          "data-transition": JSON.stringify(transition),
          "data-variants": JSON.stringify(variants),
          "data-viewport": JSON.stringify(viewport),
          "data-while-in-view": JSON.stringify(whileInView),
        }),
    },
    useReducedMotion: () => reducedMotion.value,
  };
});

vi.mock("./use-prefers-reduced-motion", () => ({
  usePrefersReducedMotion: () => reducedMotion.value,
}));

import { Reveal } from "./reveal";
import { StaggerGroup, StaggerItem } from "./stagger";

beforeEach(() => {
  reducedMotion.value = false;
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("motion primitives", () => {
  it("marks reveal motion as enabled and only runs once", () => {
    render(<Reveal><span>内容</span></Reveal>);
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-motion", "enabled");
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-viewport-once", "true");
  });

  it("renders Reveal without an initial offset or delay for reduced motion", () => {
    reducedMotion.value = true;
    render(<Reveal delay={0.4}><span>静态 Reveal</span></Reveal>);

    expect(screen.getByTestId("reveal")).toHaveAttribute("data-motion", "reduced");
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-initial", "false");
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-transition", '{"duration":0}');
    expect(screen.getByTestId("reveal")).toHaveAttribute("data-while-in-view", '{"opacity":1,"y":0}');
  });

  it("renders StaggerGroup without an initial state or child delay for reduced motion", () => {
    reducedMotion.value = true;
    render(<StaggerGroup delayChildren={0.4} staggerChildren={0.2}><span>静态 Group</span></StaggerGroup>);

    expect(screen.getByTestId("stagger-group")).toHaveAttribute("data-motion", "reduced");
    expect(screen.getByTestId("stagger-group")).toHaveAttribute("data-initial", "false");
    expect(screen.getByTestId("stagger-group")).toHaveAttribute(
      "data-variants",
      '{"hidden":{},"visible":{"transition":{"duration":0}}}',
    );
  });

  it("does not pin a standalone StaggerItem to hidden when motion is enabled", () => {
    render(<StaggerItem><span>独立 Item</span></StaggerItem>);

    expect(screen.getByText("独立 Item").parentElement).not.toHaveAttribute("data-initial");
  });

  it("renders StaggerItem in its final position without delay for reduced motion", () => {
    reducedMotion.value = true;
    render(<StaggerItem><span>静态 Item</span></StaggerItem>);

    const item = screen.getByText("静态 Item").parentElement;
    expect(item).toHaveAttribute("data-initial", "false");
    expect(item).toHaveAttribute(
      "data-variants",
      '{"hidden":{},"visible":{"opacity":1,"y":0,"transition":{"duration":0}}}',
    );
    expect(screen.getByText("静态 Item")).toBeVisible();
  });
});
