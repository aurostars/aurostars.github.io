import { FeaturedCases } from "@/components/featured-cases";
import { ProfileHistory } from "@/components/profile-history";
import type { EducationItem, ExperienceItem, ProjectCase } from "@/content/portfolio";
import { GardenStage } from "./garden-stage";
import { SiteMenu } from "./site-menu";

interface ImmersiveHomeProps {
  name: string;
  email: string;
  github: string;
  education: EducationItem[];
  experiences: ExperienceItem[];
  projects: ProjectCase[];
}

export function ImmersiveHome({
  name,
  email,
  github,
  education,
  experiences,
  projects,
}: ImmersiveHomeProps) {
  return (
    <div className="garden-site">
      <div
        hidden
        dangerouslySetInnerHTML={{
          __html:
            "<!-- THESIS: verified product work unfolds through an original living relief, not a resume dashboard. OWN-WORLD: plaster white, charcoal type, cool mineral color, botanical geometry. STORY: meet Dong Xing, understand his practice, inspect real work, then contact him. FIRST VIEWPORT: a full-bleed sculptural garden with identity anchored low left and a quiet menu above. FORM: user-pinned Immersive Garden reference translated into an original scroll-led personal portfolio. -->",
        }}
      />
      <GardenStage />
      <header className="garden-header">
        <a className="garden-wordmark" href="#home" aria-label="董星，返回首页">
          <span className="garden-monogram" aria-hidden="true">
            星
          </span>
          <span>董星</span>
        </a>
        <SiteMenu />
      </header>

      <section className="garden-hero" id="home" aria-label="个人信息">
        <div className="garden-hero-copy">
          <h1>{name}</h1>
          <p>AI 产品经理，长期做独立产品</p>
          <h2>让智能产品，拥有可感知的体验。</h2>
          <div className="garden-hero-links">
            <a href={`mailto:${email}`}>{email}</a>
            <a href={github} target="_blank" rel="noopener noreferrer" aria-label="访问 GitHub（新窗口）">
              GitHub<span className="sr-only">（新窗口）</span>
            </a>
          </div>
        </div>
      </section>

      <section className="garden-manifesto site-container" id="about" aria-label="关于">
        <p className="garden-section-label">关于我的工作</p>
        <h2>
          把复杂问题梳理成清晰路径，
          <br />
          再把路径做成真正可用的产品。
        </h2>
        <div className="garden-manifesto-copy">
          <p>
            我关注 AI 如何进入真实工作流，也关心每一次交互是否自然、可信、可持续。
          </p>
          <p>
            从需求分析、产品定义到原型与实现，我喜欢把抽象判断变成可以验证的体验。
          </p>
        </div>
      </section>

      <div className="garden-history-wrap">
        <ProfileHistory education={education} experiences={experiences} />
      </div>

      <div className="garden-projects-wrap">
        <FeaturedCases projects={projects} />
      </div>

      <section className="garden-contact site-container" id="contact" aria-label="联系">
        <p className="garden-section-label">联系</p>
        <h2>有值得一起解决的问题，欢迎来聊。</h2>
        <div className="garden-contact-links">
          <a href={`mailto:${email}`}>{email}</a>
          <a href={github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </section>

      <footer className="garden-footer site-container">
        <span>{name}</span>
        <span>AI 产品与独立创造</span>
        <a href="#home">回到顶部</a>
      </footer>
    </div>
  );
}
