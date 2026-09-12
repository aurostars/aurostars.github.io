import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
