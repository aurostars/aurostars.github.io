import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

export interface CaseSummaryCardProps {
  project: ProjectCase;
  expanded: boolean;
  onToggle: () => void;
}

export function CaseSummaryCard({ project, expanded, onToggle }: CaseSummaryCardProps) {
  const cover = project.media.find((media) => !media.src.endsWith("icon.png")) ?? project.media[0];

  return (
    <article className={`case-card${expanded ? " is-expanded" : ""}`} aria-labelledby={`${project.slug}-title`}>
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
            aria-label={`${expanded ? "收起" : "展开"}${project.title}详情`}
            onClick={onToggle}
          >
            {expanded ? "收起详情" : "展开详情"}
          </button>
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
            查看源码
          </a>
        </div>
      </div>
    </article>
  );
}
