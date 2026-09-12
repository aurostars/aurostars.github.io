import { Reveal } from "@/components/motion/reveal";

export interface IdentityBarProps {
  name: string;
  email: string;
  github: string;
}

export function IdentityBar({ name, email, github }: IdentityBarProps) {
  return (
    <section className="identity-bar site-container" aria-label="个人信息">
      <Reveal className="identity-bar-motion">
        <h1>{name}</h1>
        <div className="identity-links">
          <a href={`mailto:${email}`}>{email}</a>
          <a href={github} target="_blank" rel="noopener noreferrer" aria-label="访问 GitHub（新窗口）">
            访问 GitHub<span className="sr-only">（新窗口）</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
