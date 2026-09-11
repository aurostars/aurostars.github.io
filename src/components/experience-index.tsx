import type { ExperienceItem } from "@/content/portfolio";

export function ExperienceIndex({ items, embedded = false }: { items: ExperienceItem[]; embedded?: boolean }) {
  const Heading = embedded ? "h3" : "h2";

  return (
    <section className={`experience-section${embedded ? " is-embedded" : " site-container"}`} id="experience" aria-label="经历">
      <Heading>经历</Heading>
      <div className="experience-list">
        {items.map((item) => (
          <article data-experience-row data-testid="experience-row" className="experience-row" key={`${item.organization}-${item.period}`}>
            <time>{item.period}</time>
            <strong>{item.organization}</strong>
            <span>{item.role}</span>
            <p>{item.highlight}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
