import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero cases={portfolioCases} />
      <FeaturedCases projects={portfolioCases} />
    </>
  );
}
