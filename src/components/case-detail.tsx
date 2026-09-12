"use client";

import { ProjectImage } from "@/components/project-image";
import type { ProjectCase } from "@/content/portfolio";

function imageSizes(project: ProjectCase, mediaIndex: number) {
  if (project.slug === "job-application-helper") {
    return mediaIndex === 0
      ? "(max-width: 767px) calc(100vw - 2rem), 12rem"
      : "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 48vw, 624px";
  }

  return "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 72vw, 960px";
}

export function CaseDetail({ project }: { project: ProjectCase }) {
  return (
    <div className="case-detail">
      <div
        className="case-gallery"
        data-gallery-layout={project.media.length === 4 ? "featured-four" : "standard"}
        role="group"
        aria-label={`${project.title}真实产品界面`}
      >
        {project.media.map((media, mediaIndex) => (
          <figure key={media.src}>
            <ProjectImage
              media={media}
              priority={mediaIndex === 0}
              sizes={imageSizes(project, mediaIndex)}
            />
          </figure>
        ))}
      </div>

      <div className="case-detail-grid">
        <section>
          <h4>背景</h4>
          <p>{project.background}</p>
        </section>
        <section>
          <h4>目标</h4>
          <p>{project.goal}</p>
        </section>
        <section>
          <h4>核心问题</h4>
          <ul>
            {project.userProblems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="case-workflow" aria-labelledby={`${project.slug}-workflow`}>
        <h4 id={`${project.slug}-workflow`}>工作流程</h4>
        <ol className="workflow">
          {project.workflow.map((step) => (
            <li data-testid="workflow-step" key={step}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="case-features" aria-labelledby={`${project.slug}-features`}>
        <h4 id={`${project.slug}-features`}>已实现功能</h4>
        <ul>
          {project.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <p className="case-provenance">{project.provenance}</p>

      <div className="case-detail-links" aria-label={`${project.title}项目链接`}>
        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
          查看源码<span className="sr-only">（新窗口）</span>
        </a>
      </div>
    </div>
  );
}
