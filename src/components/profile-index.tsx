import { Contact } from "@/components/contact";
import { EducationSkills } from "@/components/education-skills";
import { ExperienceIndex } from "@/components/experience-index";
import type { ExperienceItem } from "@/content/portfolio";

interface ProfileIndexProps {
  experiences: ExperienceItem[];
  education: string[];
  capabilities: string[];
  contact: {
    email: string;
    github: string;
  };
}

export function ProfileIndex({ experiences, education, capabilities, contact }: ProfileIndexProps) {
  return (
    <section className="profile-section site-container" aria-labelledby="profile-title">
      <header className="profile-heading">
        <h2 id="profile-title">经历与能力</h2>
      </header>
      <div className="profile-grid">
        <ExperienceIndex items={experiences} embedded />
        <div className="profile-side">
          <EducationSkills education={education} capabilities={capabilities} embedded />
          <Contact email={contact.email} github={contact.github} embedded />
        </div>
      </div>
    </section>
  );
}
