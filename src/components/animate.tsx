"use client";

import { useEffect, useRef, ReactNode } from "react";

type AnimationType = "fade-up" | "fade-left" | "fade-scale";

export function Animate({
  children,
  type = "fade-up",
  delay = 0,
}: {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={type}>
      {children}
    </div>
  );
}
