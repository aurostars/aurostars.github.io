export function Contact({ email, github }: { email: string; github: string }) {
  return (
    <section className="contact-section site-container" id="contact" aria-label="联系">
      <h2>讨论 AI 产品机会</h2>
      <div className="contact-links">
        <a href={`mailto:${email}`}>发送邮件</a>
        <a href={github} target="_blank" rel="noopener noreferrer">访问 GitHub</a>
      </div>
    </section>
  );
}
