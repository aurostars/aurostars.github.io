export type ProjectSlug =
  | "job-application-helper"
  | "interview-review"
  | "resume-builder"
  | "meeting-minutes"
  | "today-island"
  | "xiaomi-su7-3d";

export interface ProjectMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type CompanyLogo = ProjectMedia;
export type SchoolLogo = ProjectMedia;

interface ProjectCaseBase {
  slug: ProjectSlug;
  title: string;
  descriptor: string;
  summary: string;
  highlights: string[];
  features: string[];
  repositoryUrl: string;
  media: ProjectMedia[];
}

export interface FullProjectCase extends ProjectCaseBase {
  presentation: "full";
  background: string;
  goal: string;
  workflow: [string, string, string, string, string];
}

export interface ShowcaseProjectCase extends ProjectCaseBase {
  presentation: "showcase";
  description: string;
  releaseUrl: string;
}

export type ProjectCase = FullProjectCase | ShowcaseProjectCase;

export interface EducationItem {
  school: string;
  schoolLogo: SchoolLogo;
  faculty: string;
  major: string;
  degree: string;
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
    presentation: "full",
    title: "秋招网申助手",
    descriptor: "浏览器扩展",
    summary: "把重复网申变成可核对、可追踪的智能填充流程。",
    background: "求职者需要在不同招聘网站重复填写相同资料，还要维护多份简历和分散的投递记录。",
    goal: "用浏览器扩展统一资料管理、字段识别、人工核对和投递追踪。",
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
      { src: "/projects/job-application-helper/extension-popup.png", alt: "秋招网申助手点击扩展后打开的界面", width: 360, height: 531 },
      { src: "/projects/job-application-helper/profile-manager.png", alt: "秋招网申助手的个人信息设置页面", width: 1920, height: 1563 },
    ],
  },
  {
    slug: "interview-review",
    presentation: "full",
    title: "面试复盘助手",
    descriptor: "AI Web 应用",
    summary: "把面试录音转化为逐题诊断和跨面试改进线索。",
    background: "求职者在面试后容易遗忘问答细节，缺少客观评价，也难以发现多场面试中的共性问题。",
    goal: "将录音或转写文本整理为可追溯、可比较的结构化复盘。",
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
      { src: "/projects/interview-review/analysis.png", alt: "面试复盘助手的逐题分析界面", width: 1920, height: 1563 },
    ],
  },
  {
    slug: "resume-builder",
    presentation: "full",
    title: "智能简历编辑工具",
    descriptor: "二次开发项目",
    summary: "围绕写作、岗位对齐、模板排版和多格式导出优化简历工作流。",
    background: "简历修改同时涉及内容表达、岗位匹配、版式维护和隐私保护，传统工具很难兼顾。",
    goal: "在本地优先的数据策略下，为求职者提供 AI 写作与高保真排版工具。",
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
    ],
  },
  {
    slug: "meeting-minutes",
    presentation: "full",
    title: "智能会议纪要工具",
    descriptor: "LLM 工作流",
    summary: "用六阶段流程把会议转写整理为可复核的结构化纪要。",
    background: "原始会议转写冗长且缺少结构，人工整理参会人、决策和待办容易遗漏。",
    goal: "通过分阶段提取和置信度复核，形成可编辑、可导出的会议纪要。",
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
    ],
  },
  {
    slug: "today-island",
    presentation: "showcase",
    title: "生活打卡网页",
    descriptor: "生活记录网站",
    summary: "把饮水、运动、饮食与心情记录集中到一座本地生活小岛。",
    description: "用于在浏览器中记录日常生活状态，数据保存在本机，并支持按日期查看和备份。",
    highlights: ["八类生活记录", "每日进度汇总", "近三日心情", "本地数据备份"],
    features: [
      "记录饮水类型、容量、杯数和目标进度。",
      "记录运动类型、时长与深蹲次数。",
      "记录睡眠时长和晒太阳时间。",
      "记录零食、水果和三餐并汇总营养数据。",
      "记录学习时长和会议数量。",
      "记录心情评分并展示近三日心情小岛。",
      "支持本地保存、历史记录、数据导入导出及按日期清理。",
    ],
    repositoryUrl: "https://github.com/aurostars/today-island-public",
    releaseUrl: "https://aurostars.github.io/today-island-public/",
    media: [
      { src: "/projects/today-island/overview.png", alt: "生活打卡网页的饮水记录与生活分类界面", width: 2706, height: 1764 },
    ],
  },
  {
    slug: "xiaomi-su7-3d",
    presentation: "showcase",
    title: "小米 SU7 3D 展示网页",
    descriptor: "3D 交互网页",
    summary: "用可交互 3D 车辆呈现小米 SU7 的外观、座舱与核心科技。",
    description: "以可交互 3D 车辆为核心，呈现小米 SU7 外观、座舱和核心技术信息。",
    highlights: ["3D 车辆交互", "外观配色切换", "多座席视角", "核心技术叙事"],
    features: [
      "支持拖拽旋转车辆与滚动自动切换视角。",
      "支持多种车漆配色切换。",
      "支持车辆开门交互。",
      "支持外观与座舱模式切换。",
      "支持主驾、副驾和后排座舱视角切换。",
      "通过滚动叙事呈现空气动力学、纯电性能和智能座舱。",
      "展示 800V 高压平台、智能驾驶感知与 HyperOS 智能座舱。",
    ],
    repositoryUrl: "https://github.com/aurostars/xiaomi-su7-interactive",
    releaseUrl: "https://aurostars.github.io/xiaomi-su7-interactive/#vehicle-stage",
    media: [
      { src: "/projects/xiaomi-su7-3d/vehicle-stage.png", alt: "小米 SU7 3D 展示网页的车辆外观交互舞台", width: 2586, height: 1340 },
    ],
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: "2026.07 - 至今",
    organization: "字节跳动",
    role: "AI 产品经理",
    highlight: "企业 Agent 和团队数字员工的搭建与迭代",
    logo: { src: "/companies/bytedance-color.svg", alt: "字节跳动 Logo", width: 24, height: 24 },
  },
  {
    period: "2026.03 - 2026.07",
    organization: "科大讯飞",
    role: "AI 产品经理",
    highlight: "多模态心脏超声智能报告系统的构建与迭代",
    logo: { src: "/companies/iflytek.svg", alt: "科大讯飞 Logo", width: 256, height: 256 },
  },
  {
    period: "2025.10 - 2026.01",
    organization: "美团",
    role: "产品运营",
    highlight: "供应链质量管理与产品优化",
    logo: { src: "/companies/meituan.png", alt: "美团 Logo", width: 409, height: 400 },
  },
  {
    period: "2025.06 - 2025.09",
    organization: "国务院发展研究中心大数据研究院",
    role: "产品经理",
    highlight: "大数据平台产品构建",
    logo: { src: "/companies/drc-big-data-hd.png", alt: "国研大数据研究院 Logo", width: 640, height: 640 },
  },
  {
    period: "2023.10 - 2024.01",
    organization: "BOSS直聘",
    role: "行业与产品研究",
    highlight: "行业研究与产品优化",
    logo: { src: "/companies/bosszhipin.png", alt: "BOSS直聘 Logo", width: 115, height: 115 },
  },
  {
    period: "2023.03 - 2023.06",
    organization: "太平洋证券研究所",
    role: "行业研究",
    highlight: "行业数据分析与研究支持",
    logo: { src: "/companies/pacific-securities.png", alt: "太平洋证券 Logo", width: 108, height: 122 },
  },
];

export const education: EducationItem[] = [
  {
    school: "北京师范大学",
    schoolLogo: { src: "/schools/beijing-normal-university.svg", alt: "北京师范大学校徽", width: 300, height: 300 },
    faculty: "经济与工商管理学院",
    major: "经济学",
    degree: "硕士",
    period: "2024 - 2027",
  },
  {
    school: "中国人民大学",
    schoolLogo: { src: "/schools/renmin-university-of-china.svg", alt: "中国人民大学校徽", width: 300, height: 300 },
    faculty: "劳动人事学院",
    major: "经济学",
    degree: "学士",
    period: "2020 - 2024",
  },
];

export const contact = {
  email: ["dst3056", "qq.com"].join("@"),
  github: "https://github.com/aurostars",
} as const;
