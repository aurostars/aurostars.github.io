import type { ExperienceItem } from "@/content/portfolio";

interface HeroProfileIndexProps {
  education: string[];
  experiences: ExperienceItem[];
}

export function HeroProfileIndex({ education, experiences }: HeroProfileIndexProps) {
  return (
    <aside className="hero-profile" aria-label="个人资料">
      <section className="hero-education" aria-labelledby="hero-education-title">
        <h2 id="hero-education-title">教育</h2>
        <div className="hero-education-list">
          {education.map((item) => (
            <p data-testid="hero-education-row" key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="hero-experience" id="experience" aria-label="经历">
        <h2>实习经历</h2>
        <div className="hero-experience-list">
          {experiences.map((item) => (
            <article data-experience-row data-testid="experience-row" className="hero-experience-row" key={`${item.organization}-${item.period}`}>
              <time>{item.period}</time>
              <div className="hero-experience-main">
                <p><strong>{item.organization}</strong><span>{item.role}</span></p>
                <p>{item.highlight}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
