"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import type { ProjectCase } from "@/content/portfolio";
import { CaseSummaryCard } from "./case-summary-card";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  const [, setSelectedSlug] = useState<ProjectCase["slug"] | null>(null);

  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <Reveal className="section-heading compact-heading">
        <h2 id="cases-title">个人项目</h2>
      </Reveal>
      <div className="case-grid" data-project-count={projects.length}>
        {projects.map((project, index) => (
          <Reveal className="case-card-motion" delay={index * 0.04} key={project.slug}>
            <CaseSummaryCard
              project={project}
              priority={index < 3}
              onOpen={() => setSelectedSlug(project.slug)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
