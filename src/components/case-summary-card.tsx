"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { useFinePointer } from "@/components/motion/use-fine-pointer";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { ProjectImage } from "@/components/project-image";
import type { ProjectCase } from "@/content/portfolio";

export interface CaseSummaryCardProps {
  project: ProjectCase;
  priority?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
  onOpen: () => void;
}

export function CaseSummaryCard({ project, priority = false, buttonRef, onOpen }: CaseSummaryCardProps) {
  const cover = project.media.find((media) => !media.src.endsWith("icon.png")) ?? project.media[0];
  const reduce = usePrefersReducedMotion();
  const canTilt = useFinePointer();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const hoverY = useMotionValue(0);
  const springConfig = { stiffness: 180, damping: 22, mass: 0.7 };
  const springRotateX = useSpring(useTransform(pointerY, [0, 1], [2, -2]), springConfig);
  const springRotateY = useSpring(useTransform(pointerX, [0, 1], [-2, 2]), springConfig);
  const rotateX = useTransform(springRotateX, (value) => Math.max(-2, Math.min(2, value)));
  const rotateY = useTransform(springRotateY, (value) => Math.max(-2, Math.min(2, value)));
  const spotlightX = useTransform(pointerX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(pointerY, [0, 1], ["0%", "100%"]);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${spotlightX} ${spotlightY}, var(--portfolio-accent-soft), transparent 70%)`;
  const bounds = useRef<DOMRect | null>(null);
  const hoverAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const tiltEnabled = canTilt && !reduce;

  useEffect(() => {
    if (!tiltEnabled) {
      bounds.current = null;
      pointerX.set(0.5);
      pointerY.set(0.5);
      springRotateX.jump(0);
      springRotateY.jump(0);
      hoverAnimation.current?.stop();
      hoverY.set(0);
    }

    return () => hoverAnimation.current?.stop();
  }, [hoverY, pointerX, pointerY, springRotateX, springRotateY, tiltEnabled]);

  function handlePointerEnter(event: React.PointerEvent<HTMLElement>) {
    if (!tiltEnabled || event.pointerType !== "mouse") return;
    bounds.current = event.currentTarget.getBoundingClientRect();
    hoverAnimation.current?.stop();
    hoverAnimation.current = animate(hoverY, -3, { duration: 0.2, ease: "easeOut" });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!tiltEnabled || event.pointerType !== "mouse") return;
    const rect = bounds.current ?? event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function resetPointer() {
    bounds.current = null;
    pointerX.set(0.5);
    pointerY.set(0.5);
    hoverAnimation.current?.stop();
    hoverAnimation.current = animate(hoverY, 0, { duration: 0.2, ease: "easeOut" });
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className="case-card"
      aria-label={`查看项目详情：${project.title}`}
      data-testid="case-summary-card"
      data-tilt={reduce ? "reduced" : canTilt ? "enabled" : "disabled"}
      onClick={onOpen}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={tiltEnabled ? { rotateX, rotateY, y: hoverY } : { transform: "none" }}
    >
      <motion.span
        className="case-card-spotlight"
        aria-hidden="true"
        style={tiltEnabled
          ? { background: spotlight, pointerEvents: "none" }
          : { background: "none", pointerEvents: "none" }}
      />
      <span className="case-card-media">
        <ProjectImage
          media={cover}
          priority={priority}
          sizes="(max-width: 679px) calc(100vw - 2rem), (max-width: 1079px) 50vw, 27rem"
        />
      </span>
      <span className="case-card-body">
        <span className="case-descriptor">{project.descriptor}</span>
        <span className="case-card-title">{project.title}</span>
        <span className="case-card-summary">{project.summary}</span>
      </span>
    </motion.button>
  );
}
