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
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-400 avatar-glow"></div>
                <div className="relative h-[130px] w-[130px] rounded-full border-2 border-slate-800 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">董</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-400 mb-3">👋 你好，我是</p>
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                  <span className="hero-gradient-text">董星</span>
                </h1>
                <p className="mt-1 text-2xl font-light text-slate-400">Xing Dong</p>
                <p className="mt-3 text-sm text-slate-500">北京师范大学 理论经济学硕士 · 中国人民大学 应用经济学学士</p>
              </div>
            </div>
          </Animate>

          <Animate delay={200}>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: "5+", label: "段实习经历" },
                { value: "4000+", label: "月产出报告" },
                { value: "90%+", label: "人机一致率" },
                { value: "80%+", label: "效率提升" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
                  <p className="text-2xl font-bold text-blue-400">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Animate>

          <div className="mt-8 flex flex-wrap gap-3">
            {["AI产品设计", "数据分析", "用户研究", "模型评测", "项目管理"].map((tag, i) => (
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
            <span className="hero-gradient-text">个人项目</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">独立开发的 AI 应用</p>
        </Animate>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            {
              title: "面试复盘助手",
              desc: "一款基于AI的Web应用，通过分析真实面试录音，帮助应届生求职者进行科学化、系统化的面试复盘。",
              tags: ["AI", "Web App", "语音分析"],
              href: "https://github.com/aurostars/Interview-Review-Assistant",
            },
            {
              title: "智能简历编辑工具",
              desc: "一款本地运行的智能简历编辑器，支持多种AI大模型接入、丰富的模板和配色方案、AI辅助写作功能以及多格式导出。",
              tags: ["AI写作", "简历模板", "多模型支持"],
              href: "https://github.com/aurostars/Resume-Builder-and-Editor",
            },
          ].map((project, i) => (
            <Animate key={project.title} delay={i * 150}>
              <a
                className="group relative block overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_0_20px_rgba(96,165,250,0.1)] hover:-translate-y-2 h-full"
                href={project.href}
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

      {/* Experience Section */}
      <section id="experience" className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">实习经历</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">产品与数据驱动的实战经验</p>
        </Animate>

        <div className="relative mt-8 pl-10">
          <div className="timeline-line"></div>
          {[
            {
              date: "2026.03 - 2026.07",
              company: "科大讯飞",
              role: "AI产品经理",
              color: "bg-blue-500",
              highlights: [
                "参与多模态心脏超声智能报告系统从0到1设计与落地，完成超声助理、预后决策等核心功能规划",
                "构建模型评测体系，设计LLM-as-a-Judge方案，人机一致率达90%+",
                "推动医院常态运营，覆盖30+诊室、70+医生，月产出4000+份报告",
                "设计LLM自动分析工作流，单份分析耗时缩短50%+；PRD生成原型效率提升80%+",
              ],
            },
            {
              date: "2025.10 - 2026.01",
              company: "美团快驴",
              role: "产品运营",
              color: "bg-teal-500",
              highlights: [
                "独立负责业务数据支持，搭建并优化3个核心数据看板",
                "搭建核心指标日级监控机制，深入下探归因推动改善落地",
                "识别质检系统痛点，推动任务自动生成功能上线，每人每次节省30s",
              ],
            },
            {
              date: "2025.06 - 2025.09",
              company: "国务院发展研究中心",
              role: "产品经理",
              color: "bg-purple-500",
              highlights: [
                "参与大数据可视化平台产品迭代，完成场景调研到交互原型的闭环交付",
                "拉通多角色协同，保障20+项需求按期高质量交付",
                "设计智能总结功能prompt策略，通过多轮调优支撑功能上线",
              ],
            },
            {
              date: "2023.10 - 2024.01",
              company: "BOSS直聘",
              role: "行业与产品研究",
              color: "bg-pink-500",
              highlights: [
                "完成互联网、餐饮等行业10+核心职位知识库建设",
                "输出产品优化方案并主导上线，各职位匹配成功率提升30%+",
                "搭建20+职位指标监控看板，数据驱动方案迭代",
              ],
            },
            {
              date: "2023.03 - 2023.06",
              company: "太平洋证券研究所",
              role: "行业研究",
              color: "bg-amber-500",
              highlights: [
                "运用Wind、iFinD等数据库收集与整合目标行业及公司基本面数据",
                "深度参与撰写3篇公司和行业深度报告，独立完成财务表现、业务与竞争分析等部分",
                "独立撰写8篇行业周报，持续跟踪市场动态",
              ],
            },
          ].map((item, i) => (
            <Animate key={item.company} type="fade-left" delay={i * 150}>
              <div className="relative mb-8 last:mb-0">
                <div className="absolute -left-10 top-1.5">
                  <div className={`timeline-dot ${item.color}`}></div>
                </div>
                <div className="glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
                  <p className="text-xs font-medium text-blue-400">{item.date}</p>
                  <p className="mt-1 font-semibold text-slate-200">{item.company} · {item.role}</p>
                  <ul className="mt-2 space-y-1">
                    {item.highlights.map((h) => (
                      <li key={h} className="text-sm text-slate-400 leading-relaxed">• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">教育背景</span>
          </h2>
        </Animate>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            {
              school: "北京师范大学",
              degree: "硕士 · 理论经济学",
              period: "2024.09 - 2027.06",
              color: "from-blue-500 to-purple-500",
            },
            {
              school: "中国人民大学",
              degree: "本科 · 劳动经济学",
              period: "2020.09 - 2024.06",
              color: "from-purple-500 to-pink-500",
            },
          ].map((edu, i) => (
            <Animate key={edu.school} delay={i * 150}>
              <div className="glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/5 h-full">
                <div className={`inline-block rounded-lg bg-gradient-to-r ${edu.color} px-3 py-1 text-xs font-medium text-white`}>
                  {edu.period}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-100">{edu.school}</h3>
                <p className="mt-1 text-sm text-slate-400">{edu.degree}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* Campus Section */}
      <section className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">校园经历与荣誉</span>
          </h2>
        </Animate>

        <Animate delay={200}>
          <div className="mt-8 glass rounded-2xl p-6">
            <ul className="space-y-3">
              {[
                "院学生会部长，任期内主导策划大小活动20余个",
                "大学生创业训练计划，负责市场分析与财务模块，获国家级结项",
                "大学生创新实验计划，负责数据分析与实证回归，获国家级结项",
                "\"千人百村\"访谈调研活动负责人，带领团队获优秀结项",
                "学习优秀奖学金、社会工作与志愿服务奖学金",
                "校级三好学生、优秀共青团员、优秀学生干部、校级优秀毕业生",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Animate>
      </section>

      {/* Skills Section */}
      <section className="pb-16">
        <Animate>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">专业技能</span>
          </h2>
        </Animate>

        <Animate delay={200}>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { name: "AI产品设计", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
              { name: "Claude Code", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
              { name: "Axure", color: "bg-green-500/15 text-green-400 border-green-500/20" },
              { name: "Figma", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
              { name: "SQL", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
              { name: "Python", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
              { name: "Stata", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
              { name: "SPSS", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
              { name: "Photoshop", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
              { name: "剪映", color: "bg-red-500/15 text-red-400 border-red-500/20" },
              { name: "Excel", color: "bg-green-500/15 text-green-400 border-green-500/20" },
              { name: "Thinkcell", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
              { name: "XMind", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
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
          <p className="mt-2 text-sm text-slate-500">欢迎交流合作</p>
        </Animate>

        <Animate delay={200}>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="mailto:dst3056@qq.com" className="glass rounded-2xl px-6 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span className="text-sm font-medium text-slate-300">dst3056@qq.com</span>
            </a>
            <a href="https://github.com/aurostars" target="_blank" rel="noopener noreferrer" className="glass rounded-2xl px-6 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5">
              <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-sm font-medium text-slate-300">GitHub</span>
            </a>
          </div>
        </Animate>
      </section>
    </div>
  );
}
