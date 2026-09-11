import { Hero } from "@/components/hero";
import { portfolioCases } from "@/content/portfolio";

export default function Home() {
  return <Hero cases={portfolioCases} />;
}
