import { Animate } from "@/components/animate";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero Section */}
      <section className="relative pb-16 pt-20 sm:pt-28">
        <div className="orb orb-1 top-4 left-[5%] h-32 w-32 bg-blue-500"></div>
        <div className="orb orb-2 top-24 right-[10%] h-28 w-28 bg-purple-500"></div>
        <div className="orb orb-3 bottom-16 left-[40%] h-36 w-36 bg-blue-400"></div>

        <div className="relative">
          <Animate>
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 avatar-glow"></div>
                <div className="relative h-[130px] w-[130px] rounded-full border-2 border-slate-800 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">A</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-400 mb-3">👋 你好，我是</p>
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                  <span className="hero-gradient-text">Aurostars</span>
                </h1>
                <p className="mt-1 text-2xl font-light text-slate-400">Full Stack Developer</p>
                <p className="mt-3 text-sm text-slate-500">热爱开源 · 追求优雅的代码 · 持续学习中</p>
              </div>
            </div>
          </Animate>

          <Animate delay={200}>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: "3+", label: "年开发经验" },
                { value: "10+", label: "开源项目" },
                { value: "500+", label: "GitHub Stars" },
                { value: "∞", label: "学习热情" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
                  <p className="text-2xl font-bold text-blue-400">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Animate>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Full Stack", "React / Vue", "Node.js", "Cloud Native", "Open Source"].map((tag, i) => (
              <Animate key={tag} type="fade-scale" delay={300 + i * 100}>
                <div className="glass flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
                  <span className="text-sm font-medium text-slate-300">{tag}</span>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">精选项目</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">我参与和创建的开源项目</p>
        </Animate>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Project Alpha",
              desc: "一个现代化的全栈 Web 应用模板，集成了认证、数据库、部署等最佳实践。",
              tags: ["TypeScript", "Next.js", "Prisma"],
            },
            {
              title: "DevTools CLI",
              desc: "提升开发效率的命令行工具集，自动化重复任务，让开发更专注。",
              tags: ["Rust", "CLI", "Automation"],
            },
            {
              title: "UI Components",
              desc: "精心设计的 React 组件库，支持暗色模式、无障碍访问和高度自定义。",
              tags: ["React", "Tailwind", "Storybook"],
            },
          ].map((project, i) => (
            <Animate key={project.title} delay={i * 150}>
              <a
                className="group relative block overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_0_20px_rgba(96,165,250,0.1)] hover:-translate-y-2 h-full"
                href="https://github.com/aurostars"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{project.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag, j) => {
                    const colors = ["bg-blue-500/15 text-blue-400", "bg-purple-500/15 text-purple-400", "bg-teal-500/15 text-teal-400"];
                    return (
                      <span key={tag} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[j % 3]}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </a>
            </Animate>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">时间线</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">学习与工作经历</p>
        </Animate>

        <div className="relative mt-8 pl-10">
          <div className="timeline-line"></div>
          {[
            { date: "2024 - 至今", title: "全栈开发工程师", desc: "独立开发多个开源项目，参与社区贡献", color: "bg-blue-500" },
            { date: "2023 - 2024", title: "前端开发实习", desc: "参与企业级 SaaS 产品的开发与优化", color: "bg-teal-500" },
            { date: "2021 - 2024", title: "计算机科学学士", desc: "系统学习计算机基础知识，参与多项竞赛", color: "bg-purple-500" },
          ].map((item, i) => (
            <Animate key={item.title} type="fade-left" delay={i * 150}>
              <div className="relative mb-8 last:mb-0">
                <div className="absolute -left-10 top-1.5">
                  <div className={`timeline-dot ${item.color}`}></div>
                </div>
                <div className="glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
                  <p className="text-xs font-medium text-blue-400">{item.date}</p>
                  <p className="mt-1 font-semibold text-slate-200">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">技术栈</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">工具与技能</p>
        </Animate>

        <Animate delay={200}>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { name: "JavaScript", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
              { name: "TypeScript", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
              { name: "React", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
              { name: "Vue", color: "bg-green-500/15 text-green-400 border-green-500/20" },
              { name: "Node.js", color: "bg-green-500/15 text-green-400 border-green-500/20" },
              { name: "Python", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
              { name: "Rust", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
              { name: "Docker", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
              { name: "PostgreSQL", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
              { name: "Redis", color: "bg-red-500/15 text-red-400 border-red-500/20" },
              { name: "Linux", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
              { name: "Git", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
            ].map((tech) => (
              <span key={tech.name} className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${tech.color}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </Animate>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pb-24">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">联系我</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">有任何想法或合作意向，欢迎联系</p>
        </Animate>

        <Animate delay={200}>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://github.com/aurostars" target="_blank" rel="noopener noreferrer" className="glass rounded-2xl px-6 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
              <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-sm font-medium text-slate-300">GitHub</span>
            </a>
            <a href="mailto:3056728260@qq.com" className="glass rounded-2xl px-6 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span className="text-sm font-medium text-slate-300">3056728260@qq.com</span>
            </a>
          </div>
        </Animate>
      </section>
    </div>
  );
}
