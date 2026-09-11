import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

const resumeBuilderUpstream = "https://github.com/JOYCEQL/magic-resume";

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
    <section
      className="case-detail"
      id={`${project.slug}-detail`}
      role="region"
      aria-label={`${project.title}案例详情`}
    >
      <div className="case-detail-links" aria-label={`${project.title}项目链接`}>
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

      <div
        className="case-gallery"
        data-gallery-layout={project.media.length === 4 ? "featured-four" : "standard"}
        role="group"
        aria-label={`${project.title}真实产品界面`}
      >
        {project.media.map((media, mediaIndex) => (
          <figure key={media.src}>
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
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

      <section className="case-outcomes" aria-labelledby={`${project.slug}-outcomes`}>
        <h4 id={`${project.slug}-outcomes`}>已实现能力</h4>
        <ul className="case-highlights">
          {project.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="case-provenance">{project.provenance}</p>
    </section>
  );
}
