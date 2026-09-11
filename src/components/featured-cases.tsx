import type { ProjectCase } from "@/content/portfolio";
import { CaseStudy } from "./case-study";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <header className="section-heading">
        <h2 id="cases-title">代表案例</h2>
        <p>从真实问题出发，记录产品判断、工作流程和可以验证的交付。</p>
      </header>
      <div className="case-list">
        {projects.map((project, index) => (
          <CaseStudy project={project} index={index} key={project.slug} />
        ))}
      </div>
    </section>
  );
}
