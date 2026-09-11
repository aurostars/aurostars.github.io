import { HeroProfileIndex } from "@/components/hero-profile-index";
import type { ExperienceItem } from "@/content/portfolio";

export function Hero({ education, experiences }: { education: string[]; experiences: ExperienceItem[] }) {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker">AI 产品经理</p>
        <h1 id="hero-title">认真体验，持续表达</h1>
        <p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p>
        <a className="primary-action" href="#cases">查看项目</a>
      </div>
      <HeroProfileIndex education={education} experiences={experiences} />
    </section>
  );
}
