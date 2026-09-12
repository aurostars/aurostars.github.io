"use client";

import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function useProgressiveAnimation() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supportsMotion = typeof window.matchMedia === "function"
      && !window.matchMedia(reducedMotionQuery).matches
      && "IntersectionObserver" in window;
    const frame = window.requestAnimationFrame(() => setReady(supportsMotion));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return ready;
}
