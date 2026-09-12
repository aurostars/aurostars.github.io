import { Reveal } from "@/components/motion/reveal";
import type { EducationItem, ExperienceItem } from "@/content/portfolio";

export interface ProfileHistoryProps {
  education: EducationItem[];
  experiences: ExperienceItem[];
}

export function ProfileHistory({ education, experiences }: ProfileHistoryProps) {
  return (
    <section
      className="profile-history site-container"
      id="experience"
      aria-labelledby="history-title"
    >
      <Reveal className="profile-history-motion">
        <h2 id="history-title" className="sr-only">教育与实习经历</h2>
        <section aria-labelledby="education-title">
          <h2 id="education-title">教育经历</h2>
          <ul className="education-list">
            {education.map((item) => (
              <li data-testid="education-row" key={`${item.school}-${item.degree}`}>
                <strong>{item.school}</strong>
                <span>{item.major}{item.degree}</span>
                <time>{item.period}</time>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="internship-title">
          <h2 id="internship-title">实习经历</h2>
          <ol className="experience-list">
            {experiences.map((item) => (
              <li data-testid="experience-row" key={`${item.organization}-${item.period}`}>
                <time><span className="mobile-field-label">时间</span>{item.period}</time>
                <p><span className="mobile-field-label">公司</span><strong>{item.organization}</strong></p>
                <p><span className="mobile-field-label">岗位</span>{item.role}</p>
                <p><span className="mobile-field-label">职责</span>{item.highlight}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </section>
  );
}
