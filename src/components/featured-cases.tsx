"use client";

import { Fragment, useState } from "react";
import type { ProjectCase } from "@/content/portfolio";
import { CaseDetail } from "./case-detail";
import { CaseSummaryCard } from "./case-summary-card";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  const [expandedSlug, setExpandedSlug] = useState<ProjectCase["slug"] | null>(null);
  const rows = Array.from({ length: Math.ceil(projects.length / 2) }, (_, index) => projects.slice(index * 2, index * 2 + 2));

  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <header className="section-heading compact-heading">
        <h2 id="cases-title">代表案例</h2>
        <p>先快速浏览项目，再展开查看完整判断与工作流程。</p>
      </header>
      <div className="case-grid">
        {rows.map((row) => (
          <div className="case-row" key={row[0].slug}>
            {row.map((project) => {
              const expanded = expandedSlug === project.slug;

              return (
                <Fragment key={project.slug}>
                  <CaseSummaryCard
                    project={project}
                    expanded={expanded}
                    onToggle={() => setExpandedSlug((current) => (current === project.slug ? null : project.slug))}
                  />
                  {expanded ? <CaseDetail project={project} /> : null}
                </Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
