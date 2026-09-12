import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reducedMotion = vi.hoisted(() => ({ value: false, listeners: new Set<() => void>() }));

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  const { useSyncExternalStore } = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useReducedMotion: () => useSyncExternalStore(
      (listener) => {
        reducedMotion.listeners.add(listener);
        return () => reducedMotion.listeners.delete(listener);
      },
      () => reducedMotion.value,
      () => reducedMotion.value,
    ),
  };
});

vi.mock("./use-prefers-reduced-motion", async () => {
  const { useSyncExternalStore } = await vi.importActual<typeof import("react")>("react");
  return {
    usePrefersReducedMotion: () => useSyncExternalStore(
      (listener) => {
        reducedMotion.listeners.add(listener);
        return () => reducedMotion.listeners.delete(listener);
      },
      () => reducedMotion.value,
      () => reducedMotion.value,
    ),
  };
});

import { CaseSummaryCard } from "@/components/case-summary-card";
import { portfolioCases } from "@/content/portfolio";

type MediaListener = (event: MediaQueryListEvent) => void;

function installMatchMedia({ fine = true, reduced = false } = {}) {
  const listeners = new Map<string, Set<MediaListener>>();
  const states = new Map<string, boolean>();

  function initialMatch(query: string) {
    return query.includes("prefers-reduced-motion") ? reduced : query.includes("pointer: fine") ? fine : false;
  }

  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => {
    if (!states.has(query)) states.set(query, initialMatch(query));
    const queryListeners = listeners.get(query) ?? new Set<MediaListener>();
    listeners.set(query, queryListeners);

    return {
      get matches() {
        return states.get(query) ?? false;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: "change", listener: MediaListener) => queryListeners.add(listener),
      removeEventListener: (_type: "change", listener: MediaListener) => queryListeners.delete(listener),
      dispatchEvent: vi.fn(),
    };
  }));

  return {
    set(fragment: string, matches: boolean) {
      const query = [...states.keys()].find((candidate) => candidate.includes(fragment));
      if (!query) throw new Error(`No media query matched ${fragment}`);
      states.set(query, matches);
      act(() => {
        listeners.get(query)?.forEach((listener) => listener({ matches, media: query } as MediaQueryListEvent));
      });
    },
  };
}

function renderCard() {
  const onToggle = vi.fn();
  render(<CaseSummaryCard project={portfolioCases[0]} expanded={false} onToggle={onToggle} />);
  const card = screen.getByTestId("case-summary-card");
  vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
    left: 100,
    top: 50,
    width: 200,
    height: 100,
    right: 300,
    bottom: 150,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  });
  return { card, onToggle, spotlight: card.querySelector(".case-card-spotlight") as HTMLElement };
}

function readTransformNumber(card: HTMLElement, name: "rotateX" | "rotateY" | "translateY") {
  const match = card.style.transform.match(new RegExp(`${name}\\((-?[\\d.]+)(?:deg|px)\\)`));
  return match ? Number(match[1]) : 0;
}

function nextAnimationFrames(count: number, onFrame?: () => void) {
  return new Promise<void>((resolve) => {
    function advance(remaining: number) {
      if (remaining === 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => {
        onFrame?.();
        advance(remaining - 1);
      });
    }
    advance(count);
  });
}

function setReducedMotion(value: boolean) {
  reducedMotion.value = value;
  act(() => reducedMotion.listeners.forEach((listener) => listener()));
}

beforeEach(() => {
  reducedMotion.value = false;
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "";
      this.isPrimary = init.isPrimary ?? false;
    }
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CaseSummaryCard pointer feedback", () => {
  it("updates real motion output for a fine mouse, clamps it, and returns to center on leave", async () => {
    installMatchMedia();
    const { card, onToggle, spotlight } = renderCard();

    fireEvent.pointerEnter(card, { pointerType: "mouse", isPrimary: true });
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 500, clientY: -50 });

    await waitFor(() => expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeGreaterThan(0.5));
    const samples: Array<{ rotateX: number; rotateY: number; y: number }> = [];
    await nextAnimationFrames(80, () => {
      samples.push({
        rotateX: readTransformNumber(card, "rotateX"),
        rotateY: readTransformNumber(card, "rotateY"),
        y: readTransformNumber(card, "translateY"),
      });
    });
    expect(samples.every(({ rotateX }) => Math.abs(rotateX) <= 3)).toBe(true);
    expect(samples.every(({ rotateY }) => Math.abs(rotateY) <= 3)).toBe(true);
    expect(samples.every(({ y }) => Math.abs(y) <= 4)).toBe(true);
    expect(spotlight.style.background).toContain("100% 0%");
    expect(spotlight.style.pointerEvents).toBe("none");

    screen.getByRole("button", { name: /展开详情/ }).click();
    expect(onToggle).toHaveBeenCalledOnce();

    fireEvent.pointerLeave(card, { pointerType: "mouse" });
    await waitFor(() => {
      expect(Math.abs(readTransformNumber(card, "rotateX"))).toBeLessThan(0.1);
      expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeLessThan(0.1);
    });
  });

  it("does not update tilt or spotlight for non-mouse or non-fine pointers", async () => {
    const media = installMatchMedia();
    const { card, spotlight } = renderCard();
    await nextAnimationFrames(2);
    const centeredTransform = card.style.transform;
    const centeredSpotlight = spotlight.style.background;

    fireEvent.pointerEnter(card, { pointerType: "pen", isPrimary: true });
    fireEvent.pointerMove(card, { pointerType: "pen", clientX: 300, clientY: 50 });
    await nextAnimationFrames(2);
    expect(card.style.transform).toBe(centeredTransform);
    expect(spotlight.style.background).toBe(centeredSpotlight);

    media.set("pointer: fine", false);
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 300, clientY: 50 });
    await nextAnimationFrames(2);
    expect(card.style.transform).toBe("none");
    expect(spotlight.style.background).toBe("none");
  });

  it("resets and disables all pointer feedback when fine-pointer capability is lost", async () => {
    const media = installMatchMedia();
    const { card, spotlight } = renderCard();

    fireEvent.pointerEnter(card, { pointerType: "mouse", isPrimary: true });
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 300, clientY: 50 });
    await waitFor(() => expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeGreaterThan(0.5));

    media.set("pointer: fine", false);
    expect(card.style.transform).toBe("none");
    expect(spotlight.style.background).toBe("none");

    media.set("pointer: fine", true);
    await nextAnimationFrames(2);
    expect(Math.abs(readTransformNumber(card, "rotateX"))).toBeLessThan(0.1);
    expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeLessThan(0.1);
  });

  it("resets and disables all pointer feedback when reduced motion becomes active", async () => {
    installMatchMedia({ fine: true });
    const { card, spotlight } = renderCard();

    fireEvent.pointerEnter(card, { pointerType: "mouse", isPrimary: true });
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 300, clientY: 50 });
    await waitFor(() => expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeGreaterThan(0.5));

    setReducedMotion(true);
    expect(card).toHaveAttribute("data-tilt", "reduced");
    expect(card.style.transform).toBe("none");
    expect(readTransformNumber(card, "translateY")).toBe(0);
    expect(spotlight.style.background).toBe("none");

    setReducedMotion(false);
    await nextAnimationFrames(2);
    expect(Math.abs(readTransformNumber(card, "rotateX"))).toBeLessThan(0.1);
    expect(Math.abs(readTransformNumber(card, "rotateY"))).toBeLessThan(0.1);
  });
});
