"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { entranceTransition, revealInitial, revealVisible } from "./motion-config";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Reveal({ children, className, delay = 0, amount = 0.25 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
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
