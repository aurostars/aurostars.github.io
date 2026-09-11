import type { ExperienceItem } from "@/content/portfolio";

export function ExperienceIndex({ items }: { items: ExperienceItem[] }) {
  return (
    <section className="experience-section site-container" id="experience" aria-label="经历">
      <h2>经历</h2>
      <div className="experience-list">
        {items.map((item) => (
          <article data-experience-row className="experience-row" key={`${item.organization}-${item.period}`}>
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
