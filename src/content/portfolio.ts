export type ProjectSlug =
  | "job-application-helper"
  | "interview-review"
  | "resume-builder"
  | "meeting-minutes";

export interface ProjectMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CompanyLogo extends ProjectMedia {}

export interface ProjectCase {
  slug: ProjectSlug;
  title: string;
  descriptor: string;
  summary: string;
  background: string;
  goal: string;
  userProblems: string[];
  workflow: [string, string, string, string, string];
  highlights: string[];
  features: string[];
  repositoryUrl: string;
  releaseUrl?: string;
  media: ProjectMedia[];
  provenance: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  major: string;
  period: string;
}

export interface ExperienceItem {
  period: string;
  organization: string;
  role: string;
  highlight: string;
  logo: CompanyLogo;
}

export const portfolioCases: ProjectCase[] = [
  {
    slug: "job-application-helper",
    title: "秋招网申助手",
    descriptor: "浏览器扩展",
    summary: "把重复网申变成可核对、可追踪的智能填充流程。",
    background: "求职者需要在不同招聘网站重复填写相同资料，还要维护多份简历和分散的投递记录。",
    goal: "用浏览器扩展统一资料管理、字段识别、人工核对和投递追踪。",
    userProblems: ["重复填写耗时", "多简历切换困难", "复杂字段难识别", "投递记录分散"],
    workflow: ["导入简历", "识别表单", "匹配字段", "人工核对", "记录并同步"],
    highlights: ["视觉与文本联合匹配", "多简历资料管理", "WebDAV 冲突防护", "投递记录追踪"],
    features: [
      "求职资料集中管理。",
      "多套简历独立管理与快速切换。",
      "招聘表单自动识别与快速填充。",
      "AI 扫描填充，显示进度、允许终止且不覆盖已有内容。",
      "AI 框选补填，仅处理选区内空白字段。",
      "侧边栏、浮窗和置顶小窗信息助手。",
      "PDF、DOCX、Markdown、TXT 与 JSON 简历解析和结构化导入。",
      "求职投递记录管理、筛选、排序与编辑。",
      "投递记录 CSV 导入导出。",
      "版本化 JSON 备份与 WebDAV 双向同步。",
    ],
    repositoryUrl: "https://github.com/aurostars/Job-Application-Helper",
    media: [
      { src: "/projects/job-application-helper/extension-popup.png", alt: "秋招网申助手点击扩展后打开的界面", width: 1600, height: 900 },
      { src: "/projects/job-application-helper/profile-manager.png", alt: "秋招网申助手的个人信息设置页面", width: 1920, height: 1563 },
    ],
    provenance: "独立开发项目，页面只展示仓库和真实运行结果可验证的功能。",
  },
  {
    slug: "interview-review",
    title: "面试复盘助手",
    descriptor: "AI Web 应用",
    summary: "把面试录音转化为逐题诊断和跨面试改进线索。",
    background: "求职者在面试后容易遗忘问答细节，缺少客观评价，也难以发现多场面试中的共性问题。",
    goal: "将录音或转写文本整理为可追溯、可比较的结构化复盘。",
    userProblems: ["细节快速遗忘", "评价依赖主观感受", "改进路径不清晰", "缺少纵向对比"],
    workflow: ["配置服务", "上传录音", "提取问答", "逐题诊断", "汇总规律"],
    highlights: ["录音与文本输入", "问答链路提取", "逐题改进建议", "跨面试规律分析"],
    features: [
      "M4A、MP3、WAV、AAC 录音或已有文本导入。",
      "录音自动转写与角色区分。",
      "问答结构化整理与连续追问链路识别。",
      "低置信度转写片段提示。",
      "问题考察意图识别。",
      "回答质量评价、改进建议和优化回答示例。",
      "多维度面试表现分析。",
      "跨面试共性弱点、高频考点与趋势分析。",
      "薄弱维度可视化与改进优先级建议。",
      "按公司、岗位和时间线管理多场面试档案。",
    ],
    repositoryUrl: "https://github.com/aurostars/Interview-Review-Assistant",
    media: [
      { src: "/projects/interview-review/upload.png", alt: "面试复盘助手的录音上传界面", width: 1920, height: 1563 },
      { src: "/projects/interview-review/analysis.png", alt: "面试复盘助手的逐题分析界面", width: 1920, height: 1563 },
      { src: "/projects/interview-review/patterns.png", alt: "面试复盘助手的跨面试规律分析界面", width: 1920, height: 1563 },
    ],
    provenance: "独立开发项目，效果描述不包含未经真实测试验证的准确率或提升比例。",
  },
  {
    slug: "resume-builder",
    title: "智能简历编辑工具",
    descriptor: "二次开发项目",
    summary: "围绕写作、岗位对齐、模板排版和多格式导出优化简历工作流。",
    background: "简历修改同时涉及内容表达、岗位匹配、版式维护和隐私保护，传统工具很难兼顾。",
    goal: "在本地优先的数据策略下，为求职者提供 AI 写作与高保真排版工具。",
    userProblems: ["经历表达困难", "简历与 JD 脱节", "格式维护繁琐", "个人数据敏感"],
    workflow: ["配置模型", "创建或导入", "AI 增强", "模板预览", "多格式导出"],
    highlights: ["STAR 改写", "JD 对齐", "多套模板", "本地数据存储"],
    features: [
      "可视化简历创建、区块编辑与拖拽排序。",
      "多 AI 服务商与自定义端点接入。",
      "根据目标岗位和经历要点一键生成完整简历。",
      "PDF 简历视觉识别与结构化导入。",
      "根据职位描述分析匹配度并给出修改建议。",
      "STAR 法则改写、内容润色及语法拼写修正。",
      "中英文整份简历翻译并保存为新副本。",
      "11 套简历模板。",
      "主题色、字体、间距与页边距配置。",
      "PDF、Word、Markdown 和 JSON 导出。",
      "本地简历数据与 API Key 管理。",
    ],
    repositoryUrl: "https://github.com/aurostars/Resume-Builder-and-Editor",
    media: [
      { src: "/projects/resume-builder/workspace.png", alt: "智能简历编辑工具的编辑工作台", width: 3976, height: 2028 },
      { src: "/projects/resume-builder/modern-template.png", alt: "智能简历编辑工具的现代模板", width: 1588, height: 2246 },
      { src: "/projects/resume-builder/polish.png", alt: "智能简历编辑工具的 AI 润色功能", width: 1988, height: 1332 },
    ],
    provenance: "基于 https://github.com/JOYCEQL/magic-resume 二次开发；当前仓库 README 明确列出的个人修改范围：扩展 API 提供商、增加主题色预设与模板、增加简历快速生成、JD 定制优化、STAR 法则改写、中英简历互译和多格式导出。",
  },
  {
    slug: "meeting-minutes",
    title: "智能会议纪要工具",
    descriptor: "LLM 工作流",
    summary: "用六阶段流程把会议转写整理为可复核的结构化纪要。",
    background: "原始会议转写冗长且缺少结构，人工整理参会人、决策和待办容易遗漏。",
    goal: "通过分阶段提取和置信度复核，形成可编辑、可导出的会议纪要。",
    userProblems: ["转写缺少结构", "决策容易遗漏", "待办归属不清", "生成结果难复核"],
    workflow: ["输入转写", "识别说话人", "执行六阶段流程", "置信度复核", "导出纪要"],
    highlights: ["六阶段 Pipeline", "置信度标注", "说话人管理", "多格式导出"],
    features: [
      "六阶段智能纪要生成。",
      "参会人与说话人识别和管理。",
      "会议话题分割与关键要点提取。",
      "待办事项、负责人和截止时间结构化识别。",
      "明确决策、隐含倾向和待定事项分析。",
      "多模型服务商与自定义端点适配。",
      "SSE 流式处理进度展示。",
      "置信度评分与低置信度人工核对提示。",
      "参会人、待办、决策等纪要内容在线编辑。",
      "Markdown、Word 和 Excel 导出。",
      "历史记录筛选与关键词搜索。",
      "SQLite 配置与会议数据持久化。",
    ],
    repositoryUrl: "https://github.com/aurostars/meeting-minutes-extractor",
    media: [
      { src: "/projects/meeting-minutes/input.png", alt: "智能会议纪要工具的转写输入界面", width: 1920, height: 1563 },
      { src: "/projects/meeting-minutes/pipeline.png", alt: "智能会议纪要工具的处理流程界面", width: 1920, height: 1563 },
      { src: "/projects/meeting-minutes/review.png", alt: "智能会议纪要工具的置信度复核界面", width: 1920, height: 1563 },
    ],
    provenance: "独立开发项目，页面只描述仓库中可验证的流程与功能。",
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: "2026.07 - 至今",
    organization: "字节跳动",
    role: "AI 产品经理",
    highlight: "企业 Agent 和团队数字员工的搭建与迭代",
    logo: { src: "/companies/bytedance.svg", alt: "字节跳动 Logo", width: 240, height: 64 },
  },
  {
    period: "2026.03 - 2026.07",
    organization: "科大讯飞",
    role: "AI产品经理",
    highlight: "多模态心脏超声智能报告系统",
    logo: { src: "/companies/iflytek.svg", alt: "科大讯飞 Logo", width: 168, height: 33 },
  },
  {
    period: "2025.10 - 2026.01",
    organization: "美团快驴",
    role: "产品运营",
    highlight: "AI 工具驱动业务流程提效",
    logo: { src: "/companies/meituan.svg", alt: "美团快驴 Logo", width: 813, height: 186 },
  },
  {
    period: "2025.06 - 2025.09",
    organization: "国务院发展研究中心大数据研究院",
    role: "产品经理",
    highlight: "研究与数据产品实践",
    logo: { src: "/companies/drc-big-data.svg", alt: "国务院发展研究中心 Logo", width: 537, height: 73 },
  },
  {
    period: "2023.10 - 2024.01",
    organization: "BOSS直聘",
    role: "行业与产品研究",
    highlight: "招聘市场与行业研究",
    logo: { src: "/companies/bosszhipin.svg", alt: "BOSS直聘 Logo", width: 16, height: 16 },
  },
  {
    period: "2023.03 - 2023.06",
    organization: "太平洋证券研究所",
    role: "行业研究",
    highlight: "行业数据分析与研究支持",
    logo: { src: "/companies/pacific-securities.svg", alt: "太平洋证券 Logo", width: 537, height: 122 },
  },
];

export const education: EducationItem[] = [
  { school: "北京师范大学", degree: "硕士", major: "经济学", period: "2024-2027" },
  { school: "中国人民大学", degree: "学士", major: "经济学", period: "2020-2024" },
];

export const contact = {
  email: ["dst3056", "qq.com"].join("@"),
  github: "https://github.com/aurostars",
} as const;
