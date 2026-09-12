"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useFinePointer } from "@/components/motion/use-fine-pointer";
import type { ProjectCase } from "@/content/portfolio";

export interface CaseSummaryCardProps {
  project: ProjectCase;
  expanded: boolean;
  onToggle: () => void;
}

export function CaseSummaryCard({ project, expanded, onToggle }: CaseSummaryCardProps) {
  const cover = project.media.find((media) => !media.src.endsWith("icon.png")) ?? project.media[0];
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 180, damping: 22, mass: 0.7 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-3, 3]), springConfig);
  const spotlightX = useTransform(pointerX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(pointerY, [0, 1], ["0%", "100%"]);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${spotlightX} ${spotlightY}, rgb(49 95 219 / 0.14), transparent 70%)`;
  const canTilt = useFinePointer();

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduce || !canTilt || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function resetPointer() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.article
      layout="position"
      className={`case-card${expanded ? " is-expanded" : ""}`}
      aria-labelledby={`${project.slug}-title`}
      data-testid="case-summary-card"
      data-tilt={reduce ? "reduced" : canTilt ? "enabled" : "disabled"}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={reduce ? undefined : { rotateX, rotateY }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <motion.div
        className="case-card-spotlight"
        aria-hidden="true"
        style={reduce ? undefined : { background: spotlight }}
      />
      <figure className="case-card-media">
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 767px) calc(100vw - 2rem), 40rem"
        />
      </figure>
      <div className="case-card-body">
        <p className="case-descriptor">{project.descriptor}</p>
        <h3 id={`${project.slug}-title`}>{project.title}</h3>
        <p className="case-card-summary">{project.summary}</p>
        <ul className="case-card-keywords" aria-label={`${project.title}能力关键词`}>
          {project.highlights.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="case-card-actions">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`${project.slug}-detail`}
            aria-label={`${expanded ? "收起详情" : "展开详情"}：${project.title}`}
            onClick={onToggle}
          >
            {expanded ? "收起详情" : "展开详情"}
          </button>
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
            查看源码
          </a>
        </div>
      </div>
    </motion.article>
  );
}
