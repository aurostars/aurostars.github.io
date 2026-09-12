import { Reveal } from "@/components/motion/reveal";

export function Contact({ email, github }: { email: string; github: string }) {
  return (
    <section className="contact-section site-container" id="contact" aria-label="联系">
      <Reveal className="contact-motion">
        <h2>欢迎联系～</h2>
        <div className="contact-links">
          <a href={`mailto:${email}`}>发送邮件</a>
          <a href={github} target="_blank" rel="noopener noreferrer">访问 GitHub</a>
        </div>
      </Reveal>
    </section>
  );
}
