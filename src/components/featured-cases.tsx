"use client";

import { useRef, useState } from "react";
import { CaseDialog } from "@/components/case-dialog";
import { useProjectDialogState } from "@/components/use-project-dialog-state";
import type { ProjectCase } from "@/content/portfolio";
import { CaseSummaryCard } from "./case-summary-card";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  const { selectedProject, openProject, closeProject } = useProjectDialogState(projects);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRefs = useRef(new Map<ProjectCase["slug"], HTMLButtonElement>());
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLElement | null>(null);

  function handleOpen(project: ProjectCase) {
    setReturnFocusTo(triggerRefs.current.get(project.slug) ?? null);
    openProject(project.slug);
  }

  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <div className="section-heading compact-heading">
        <h2 ref={headingRef} id="cases-title" tabIndex={-1}>个人项目</h2>
        <p id="cases-hint" className="cases-hint">点击卡片任意位置，可查看详情</p>
      </div>
      <div className="case-grid" aria-describedby="cases-hint" data-project-count={projects.length}>
        {projects.map((project, index) => (
          <div className="case-card-motion" key={project.slug}>
            <CaseSummaryCard
              project={project}
              priority={index < 3}
              buttonRef={(button) => {
                if (button) triggerRefs.current.set(project.slug, button);
                else triggerRefs.current.delete(project.slug);
              }}
              onOpen={() => handleOpen(project)}
            />
          </div>
        ))}
      </div>
      <CaseDialog
        project={selectedProject}
        onClose={closeProject}
        returnFocusTo={returnFocusTo}
        fallbackFocusRef={headingRef}
      />
    </section>
  );
}
