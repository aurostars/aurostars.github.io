import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import type { ExperienceItem } from "@/content/portfolio";

interface HeroProfileIndexProps {
  education: string[];
  experiences: ExperienceItem[];
}

export function HeroProfileIndex({ education, experiences }: HeroProfileIndexProps) {
  return (
    <aside className="hero-profile" aria-label="个人资料">
      <section aria-labelledby="hero-education-title">
        <Reveal className="hero-education">
          <h2 id="hero-education-title">教育</h2>
          <div className="hero-education-list">
            {education.map((item) => (
              <p data-testid="hero-education-row" key={item}>{item}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="hero-experience" id="experience" aria-label="经历">
        <h2>实习经历</h2>
        <StaggerGroup className="hero-experience-list" staggerChildren={0.05}>
          {experiences.map((item) => (
            <StaggerItem key={`${item.organization}-${item.period}`}>
              <article data-experience-row data-testid="experience-row" className="hero-experience-row">
                <time>{item.period}</time>
                <div className="hero-experience-main">
                  <p><strong>{item.organization}</strong><span>{item.role}</span></p>
                  <p>{item.highlight}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </aside>
  );
}
