import { CompanyLogo } from "@/components/company-logo";
import { Reveal } from "@/components/motion/reveal";
import { SchoolLogo } from "@/components/school-logo";
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
              <li className="education-entry" data-testid="education-row" key={`${item.school}-${item.degree}`}>
                <div className="school-logo-slot">
                  <SchoolLogo logo={item.schoolLogo} />
                </div>
                <div className="education-copy">
                  <strong>{item.school}</strong>
                  <div className="education-meta">
                    <span>{item.faculty}</span>
                    <span>{item.major} {item.degree}</span>
                  </div>
                  <time>{item.period}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="internship-title">
          <h2 id="internship-title">实习经历</h2>
          <ol className="experience-list">
            {experiences.map((item) => (
              <li data-testid="experience-row" key={`${item.organization}-${item.period}`}>
                <div className="experience-title-line" data-testid="experience-title-line">
                  <div className="company-logo-slot">
                    <CompanyLogo logo={item.logo} />
                  </div>
                  <strong className="experience-organization">{item.organization}</strong>
                  <span className="experience-role">{item.role}</span>
                  <time className="experience-period">{item.period}</time>
                </div>
                <p className="experience-highlight">{item.highlight}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </section>
  );
}
