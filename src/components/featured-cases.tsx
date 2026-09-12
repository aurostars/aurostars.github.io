"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import type { ProjectCase } from "@/content/portfolio";
import { CaseDetail } from "./case-detail";
import { CaseSummaryCard } from "./case-summary-card";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  const [expandedSlug, setExpandedSlug] = useState<ProjectCase["slug"] | null>(null);
  const rows = Array.from({ length: Math.ceil(projects.length / 2) }, (_, index) => projects.slice(index * 2, index * 2 + 2));

  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <Reveal className="section-heading compact-heading">
        <h2 id="cases-title">个人项目</h2>
      </Reveal>
      <div className="case-grid">
        {rows.map((row, rowIndex) => (
          <motion.div layout className="case-row" key={row[0].slug}>
            {row.map((project, projectIndex) => {
              const globalIndex = rowIndex * 2 + projectIndex;
              const expanded = expandedSlug === project.slug;

              return (
                <Fragment key={project.slug}>
                  <Reveal className="case-card-motion" delay={globalIndex * 0.06}>
                    <CaseSummaryCard
                      project={project}
                      expanded={expanded}
                      onToggle={() => setExpandedSlug((current) => (current === project.slug ? null : project.slug))}
                    />
                  </Reveal>
                  <AnimatePresence initial={false}>
                    {expanded ? <CaseDetail key={project.slug} project={project} /> : null}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
