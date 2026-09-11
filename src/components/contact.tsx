export function Contact({ email, github, embedded = false }: { email: string; github: string; embedded?: boolean }) {
  const Heading = embedded ? "h3" : "h2";

  return (
    <section className={`contact-section${embedded ? " is-embedded" : " site-container"}`} id="contact" aria-label="联系">
      <Heading>欢迎联系～</Heading>
      <div className="contact-links">
        <a href={`mailto:${email}`}>发送邮件</a>
        <a href={github} target="_blank" rel="noopener noreferrer">访问 GitHub</a>
      </div>
    </section>
  );
}
