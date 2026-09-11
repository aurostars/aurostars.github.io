"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  role?: string;
  "aria-label"?: string;
};

export function Reveal({ children, delay = 0, className = "", role, "aria-label": ariaLabel }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    const element = ref.current;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (!element || prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }

    const safeDelay = Math.min(360, Math.max(0, delay));
    let timer: ReturnType<typeof setTimeout> | undefined;
    element.dataset.visible = "false";
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        observer.disconnect();
        timer = setTimeout(() => setVisible(true), safeDelay);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [delay]);

  const classes = ["reveal", className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-visible={visible ? "true" : "false"}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
