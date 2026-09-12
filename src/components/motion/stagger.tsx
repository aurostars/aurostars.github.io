"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { entranceEase } from "./motion-config";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { useProgressiveAnimation } from "./use-progressive-animation";

interface MotionChildrenProps {
  children: ReactNode;
  className?: string;
}

export function StaggerGroup({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.07,
}: MotionChildrenProps & { delayChildren?: number; staggerChildren?: number }) {
  const reduce = usePrefersReducedMotion();
  const animationReady = useProgressiveAnimation();
  const animate = animationReady && !reduce;
  return (
    <motion.div
      key={animate ? "animated" : "static"}
      className={className}
      data-motion={reduce ? "reduced" : animate ? "enabled" : "static"}
      data-stagger-children={staggerChildren}
      data-testid="stagger-group"
      initial={animate ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: animate ? { delayChildren, staggerChildren } : { duration: 0 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: MotionChildrenProps) {
  const reduce = usePrefersReducedMotion();
  const animationReady = useProgressiveAnimation();
  const animate = animationReady && !reduce;
  return (
    <motion.div
      key={animate ? "animated" : "static"}
      className={className}
      data-testid="stagger-item"
      initial={animate ? undefined : false}
      variants={{
        hidden: animate ? { opacity: 0, y: 20 } : {},
        visible: { opacity: 1, y: 0, transition: animate ? { duration: 0.6, ease: entranceEase } : { duration: 0 } },
      }}
    >
      {children}
    </motion.div>
  );
}
