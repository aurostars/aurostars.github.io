import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const media = {
  matches: false,
  listeners: new Set<() => void>(),
};

function Probe() {
  const reduce = usePrefersReducedMotion();
  return <output>{reduce ? "reduced" : "enabled"}</output>;
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => {
    media.matches = false;
    media.listeners.clear();
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return query === "(prefers-reduced-motion: reduce)" && media.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => media.listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => media.listeners.delete(listener),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("reflects the browser reduced-motion preference and responds to changes", () => {
    media.matches = true;
    render(<Probe />);
    expect(screen.getByText("reduced")).toBeInTheDocument();

    act(() => {
      media.matches = false;
      media.listeners.forEach((listener) => listener());
    });
    expect(screen.getByText("enabled")).toBeInTheDocument();
  });
});
