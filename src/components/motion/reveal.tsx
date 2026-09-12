"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { entranceTransition, revealInitial, revealVisible } from "./motion-config";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Reveal({ children, className, delay = 0, amount = 0.25 }: RevealProps) {
  const reduce = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      data-delay={delay}
      data-motion={reduce ? "reduced" : "enabled"}
      data-testid="reveal"
      data-viewport-once="true"
      initial={reduce ? false : revealInitial}
      whileInView={revealVisible}
      viewport={{ once: true, amount }}
      transition={reduce ? { duration: 0 } : entranceTransition(delay)}
    >
      {children}
    </motion.div>
  );
}
