import { ImmersiveHome } from "@/components/immersive/immersive-home";
import { contact, education, experiences, portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <ImmersiveHome
      name="董星"
      email={contact.email}
      github={contact.github}
      education={education}
      experiences={experiences}
      projects={portfolioCases}
    />
  );
}
