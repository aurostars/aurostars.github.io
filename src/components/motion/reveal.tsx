"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { entranceTransition, revealInitial, revealVisible } from "./motion-config";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { useProgressiveAnimation } from "./use-progressive-animation";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Reveal({ children, className, delay = 0, amount = 0.25 }: RevealProps) {
  const reduce = usePrefersReducedMotion();
  const animationReady = useProgressiveAnimation();
  const animate = animationReady && !reduce;

  return (
    <motion.div
      key={animate ? "animated" : "static"}
      className={className}
      data-delay={delay}
      data-motion={reduce ? "reduced" : animate ? "enabled" : "static"}
      data-testid="reveal"
      data-viewport-once="true"
      initial={animate ? revealInitial : false}
      whileInView={revealVisible}
      viewport={{ once: true, amount }}
      transition={animate ? entranceTransition(delay) : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
