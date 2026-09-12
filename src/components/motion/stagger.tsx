"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { entranceEase } from "./motion-config";

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
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      data-motion={reduce ? "reduced" : "enabled"}
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
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      variants={{
        hidden: reduce ? {} : { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.6, ease: entranceEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
