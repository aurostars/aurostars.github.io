"use client";

import React from "react";
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
  const isJobHelper = project.slug === "job-application-helper";
  const galleryMedia = project.media.slice(0, isJobHelper ? 2 : 1);

  return (
    <div className="case-detail">
      <div
        className="case-gallery"
        data-gallery-layout={isJobHelper ? "job-helper-duo" : "single"}
        role="group"
        aria-label={`${project.title}真实产品界面`}
      >
        {galleryMedia.map((media, mediaIndex) => (
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
        <section className="case-background">
          <h4>背景</h4>
          <p>{project.background}</p>
        </section>
        <section className="case-goal">
          <h4>目标</h4>
          <p>{project.goal}</p>
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

      {project.provenance ? <p className="case-provenance">{project.provenance}</p> : null}
    </div>
  );
}
