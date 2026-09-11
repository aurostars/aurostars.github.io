import { Contact } from "@/components/contact";
import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero education={education} experiences={experiences} />
      <FeaturedCases projects={portfolioCases} />
      <Contact email={contact.email} github={contact.github} />
    </>
  );
}
