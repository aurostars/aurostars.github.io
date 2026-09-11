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
  repositoryUrl: string;
  releaseUrl?: string;
  media: ProjectMedia[];
  provenance: string;
}

export interface ExperienceItem {
  period: string;
  organization: string;
  role: string;
  highlight: string;
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
    repositoryUrl: "https://github.com/aurostars/Job-Application-Helper",
    releaseUrl: "https://github.com/aurostars/Job-Application-Helper/releases",
    media: [
      { src: "/projects/job-application-helper/icon.png", alt: "秋招网申助手的浏览器扩展图标", width: 128, height: 128 },
      { src: "/projects/job-application-helper/profile-manager.png", alt: "秋招网申助手的多简历资料管理界面", width: 1920, height: 1563 },
      { src: "/projects/job-application-helper/visual-fill.png", alt: "秋招网申助手的视觉框选填充流程", width: 360, height: 480 },
      { src: "/projects/job-application-helper/application-records.png", alt: "秋招网申助手的投递记录界面", width: 1920, height: 1563 },
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
  { period: "2026.03 - 2026.07", organization: "科大讯飞", role: "AI产品经理", highlight: "多模态心脏超声智能报告系统" },
  { period: "2025.10 - 2026.01", organization: "美团快驴", role: "产品运营", highlight: "AI 工具驱动业务流程提效" },
  { period: "2025.06 - 2025.09", organization: "国务院发展研究中心大数据研究院", role: "产品经理", highlight: "研究与数据产品实践" },
  { period: "2023.10 - 2024.01", organization: "BOSS直聘", role: "行业与产品研究", highlight: "招聘市场与行业研究" },
  { period: "2023.03 - 2023.06", organization: "太平洋证券研究所", role: "行业研究", highlight: "行业数据分析与研究支持" },
];

export const education = [
  "北京师范大学 理论经济学硕士",
  "中国人民大学 应用经济学学士",
];

export const capabilities = ["AI 产品设计", "数据分析", "用户研究", "模型评测", "项目管理"];

export const contact = {
  email: "dongxing.123@bytedance.com",
  github: "https://github.com/aurostars",
} as const;
