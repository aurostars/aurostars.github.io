export function EducationSkills({ education, capabilities }: { education: string[]; capabilities: string[] }) {
  return (
    <section className="education-section site-container" aria-labelledby="education-title">
      <h2 id="education-title">教育与能力</h2>
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
