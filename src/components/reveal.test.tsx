import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./reveal";

const originalIntersectionObserver = globalThis.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  globalThis.IntersectionObserver = originalIntersectionObserver;
  window.matchMedia = originalMatchMedia;
});

function mockMotionPreference(reduced = false) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: reduced,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

function mockIntersectionObserver() {
  const disconnect = vi.fn();
  const observe = vi.fn();
  let callback: IntersectionObserverCallback = () => undefined;

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(next: IntersectionObserverCallback) {
        callback = next;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      root = null;
      rootMargin = "0px";
      thresholds = [0.1];
      takeRecords = () => [];
    },
  );

  return { disconnect, observe, intersect: () => callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver) };
}

describe("Reveal", () => {
  it("becomes visible when intersecting and disconnects", () => {
    vi.useFakeTimers();
    mockMotionPreference();
    const observer = mockIntersectionObserver();

    render(
      <Reveal delay={80}>
        <span>案例内容</span>
      </Reveal>,
    );

    const wrapper = screen.getByText("案例内容").parentElement;
    expect(wrapper).toHaveAttribute("data-visible", "false");

    act(() => observer.intersect());
    act(() => vi.advanceTimersByTime(79));
    expect(wrapper).toHaveAttribute("data-visible", "false");

    act(() => vi.advanceTimersByTime(1));
    expect(wrapper).toHaveAttribute("data-visible", "true");
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("keeps content visible when IntersectionObserver is unavailable", () => {
    mockMotionPreference();
    vi.stubGlobal("IntersectionObserver", undefined);

    render(<Reveal>始终可见</Reveal>);

    expect(screen.getByText("始终可见")).toHaveAttribute("data-visible", "true");
  });

  it("keeps content visible when reduced motion is preferred", () => {
    mockMotionPreference(true);
    const observer = mockIntersectionObserver();

    render(<Reveal>减少动态效果</Reveal>);

    expect(screen.getByText("减少动态效果")).toHaveAttribute("data-visible", "true");
    expect(observer.observe).not.toHaveBeenCalled();
  });

  it("clamps delay to 360 milliseconds", () => {
    vi.useFakeTimers();
    mockMotionPreference();
    const observer = mockIntersectionObserver();

    render(<Reveal delay={1_000}>延迟内容</Reveal>);
    const wrapper = screen.getByText("延迟内容");

    act(() => observer.intersect());
    act(() => vi.advanceTimersByTime(359));
    expect(wrapper).toHaveAttribute("data-visible", "false");
    act(() => vi.advanceTimersByTime(1));
    expect(wrapper).toHaveAttribute("data-visible", "true");
  });

  it("clears pending work when unmounted", () => {
    vi.useFakeTimers();
    mockMotionPreference();
    const observer = mockIntersectionObserver();
    const { unmount } = render(<Reveal delay={80}>待清理内容</Reveal>);

    act(() => observer.intersect());
    unmount();
    act(() => vi.runAllTimers());

    expect(observer.disconnect).toHaveBeenCalled();
  });
});
