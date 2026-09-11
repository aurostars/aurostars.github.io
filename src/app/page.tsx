import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { ProfileIndex } from "@/components/profile-index";
import { capabilities, contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero cases={portfolioCases} />
      <FeaturedCases projects={portfolioCases} />
      <ProfileIndex
        experiences={experiences}
        education={education}
        capabilities={capabilities}
        contact={contact}
      />
    </>
  );
}
