import { Contact } from "@/components/contact";
import { EducationSkills } from "@/components/education-skills";
import { ExperienceIndex } from "@/components/experience-index";
import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { capabilities, contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero cases={portfolioCases} />
      <FeaturedCases projects={portfolioCases} />
      <ExperienceIndex items={experiences} />
      <EducationSkills education={education} capabilities={capabilities} />
      <Contact email={contact.email} github={contact.github} />
    </>
  );
}
