"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { entranceEase } from "./motion-config";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

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
  return (
    <motion.div
      className={className}
      data-motion={reduce ? "reduced" : "enabled"}
      data-stagger-children={staggerChildren}
      data-testid="stagger-group"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: reduce ? { duration: 0 } : { delayChildren, staggerChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: MotionChildrenProps) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      data-testid="stagger-item"
      initial={reduce ? false : undefined}
      variants={{
        hidden: reduce ? {} : { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.6, ease: entranceEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
