import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";
import { Reveal } from "./reveal";

const resumeBuilderUpstream = "https://github.com/JOYCEQL/magic-resume";

function imageSizes(project: ProjectCase, layout: number, mediaIndex: number) {
  if (project.slug === "job-application-helper") {
    return mediaIndex === 0
      ? "(max-width: 767px) calc(100vw - 2rem), 12rem"
      : "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 48vw, 624px";
  }

  if (layout === 1 && mediaIndex === 0) {
    return "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) calc(100vw - 4rem), 1280px";
  }

  if (layout === 2) {
    return "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 52vw, 720px";
  }

  return "(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 72vw, 960px";
}

export function CaseStudy({ project, index }: { project: ProjectCase; index: number }) {
  const layout = (index % 3) + 1;

  return (
    <article
      className={`case-study case-layout-${layout} case-${project.slug}`}
      id={project.slug}
      aria-labelledby={`${project.slug}-title`}
    >
      <Reveal className="case-intro">
        <header>
          <p className="case-descriptor">{project.descriptor}</p>
          <h3 id={`${project.slug}-title`}>{project.title}</h3>
          <p className="case-summary">{project.summary}</p>
          <div className="case-links" aria-label={`${project.title}项目链接`}>
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
              查看{project.title}源码
            </a>
            {project.releaseUrl ? (
              <a href={project.releaseUrl} target="_blank" rel="noopener noreferrer">
                下载版本
              </a>
            ) : null}
            {project.slug === "resume-builder" ? (
              <a href={resumeBuilderUpstream} target="_blank" rel="noopener noreferrer">
                查看上游项目
              </a>
            ) : null}
          </div>
        </header>
      </Reveal>

      <Reveal className="case-gallery" delay={80} role="group" aria-label={`${project.title}真实产品界面`}>
        {project.media.map((media, mediaIndex) => (
          <figure key={media.src}>
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              sizes={imageSizes(project, layout, mediaIndex)}
            />
          </figure>
        ))}
      </Reveal>

      <div className="case-detail-grid">
        <section>
          <h4>背景与目标</h4>
          <p>{project.background}</p>
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
            <li data-workflow-step key={step}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="case-outcomes" aria-labelledby={`${project.slug}-outcomes`}>
        <h4 id={`${project.slug}-outcomes`}>已实现能力</h4>
        <ul className="case-highlights">
          {project.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="case-provenance">{project.provenance}</p>
    </article>
  );
}
