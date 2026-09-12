import { HeroProfileIndex } from "@/components/hero-profile-index";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import type { ExperienceItem } from "@/content/portfolio";

export function Hero({ education, experiences }: { education: string[]; experiences: ExperienceItem[] }) {
  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <StaggerGroup className="hero-copy-motion">
          <StaggerItem><p className="hero-kicker">AI 产品经理</p></StaggerItem>
          <StaggerItem><h1 id="hero-title">认真体验，持续表达</h1></StaggerItem>
          <StaggerItem><p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p></StaggerItem>
          <StaggerItem><a className="primary-action" href="#cases">查看项目</a></StaggerItem>
        </StaggerGroup>
      </div>
      <HeroProfileIndex education={education} experiences={experiences} />
    </section>
  );
}
