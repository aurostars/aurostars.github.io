export function EducationSkills({ education, capabilities, embedded = false }: { education: string[]; capabilities: string[]; embedded?: boolean }) {
  const Heading = embedded ? "h3" : "h2";

  return (
    <section className={`education-section${embedded ? " is-embedded" : " site-container"}`} aria-labelledby="education-title">
      <Heading id="education-title">教育与能力</Heading>
      <div className="education-grid">
        <div className="education-list">
          {education.map((item) => <p key={item}>{item}</p>)}
        </div>
        <ul className="capability-list">
          {capabilities.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
