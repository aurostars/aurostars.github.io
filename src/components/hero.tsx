import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

export function Hero({ cases }: { cases: ProjectCase[] }) {
  const collage = [cases[0].media[0], cases[1].media[0], cases[2].media[0]];

  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker">AI 产品经理</p>
        <h1 id="hero-title">从问题定义，到结果验证。</h1>
        <p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p>
        <a className="primary-action" href="#cases">
          查看案例
        </a>
      </div>

      <div className="hero-collage" role="group" aria-label="个人项目界面预览">
        {collage.map((media, index) => (
          <figure className={`hero-shot hero-shot-${index + 1}`} key={media.src}>
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              priority={index === 0}
              sizes={index === 0 ? "(max-width: 767px) 100vw, 18rem" : "(max-width: 767px) 100vw, 28rem"}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
