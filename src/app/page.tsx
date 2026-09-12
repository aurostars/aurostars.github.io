import { FeaturedCases } from "@/components/featured-cases";
import { IdentityBar } from "@/components/identity-bar";
import { ProfileHistory } from "@/components/profile-history";
import { contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <IdentityBar
        name="董星"
        role="AI 产品经理与独立开发者"
        email={contact.email}
        github={contact.github}
      />
      <ProfileHistory education={education} experiences={experiences} />
      <FeaturedCases projects={portfolioCases} />
    </>
  );
}
