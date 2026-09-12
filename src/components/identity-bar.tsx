import { Reveal } from "@/components/motion/reveal";

export interface IdentityBarProps {
  name: string;
  role: string;
  email: string;
  github: string;
}

export function IdentityBar({ name, role, email, github }: IdentityBarProps) {
  return (
    <section className="identity-bar site-container" aria-label="个人信息">
      <Reveal className="identity-bar-motion">
        <div>
          <h1>{name}</h1>
          <p>{role}</p>
        </div>
        <div className="identity-links">
          <a href={`mailto:${email}`}>发送邮件</a>
          <a href={github} target="_blank" rel="noopener noreferrer" aria-label="访问 GitHub（新窗口）">
            访问 GitHub<span className="sr-only">（新窗口）</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
