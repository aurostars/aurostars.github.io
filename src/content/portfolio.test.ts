import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { contact, education, experiences, portfolioCases } from "./portfolio";

const expectedSlugs = [
  "job-application-helper",
  "interview-review",
  "resume-builder",
  "meeting-minutes",
];

const expectedRepositoryUrls = {
  "job-application-helper": "https://github.com/aurostars/Job-Application-Helper",
  "interview-review": "https://github.com/aurostars/Interview-Review-Assistant",
  "resume-builder": "https://github.com/aurostars/Resume-Builder-and-Editor",
  "meeting-minutes": "https://github.com/aurostars/meeting-minutes-extractor",
} as const;

const expectedFeatureBounds = {
  "job-application-helper": { count: 10, first: "求职资料集中管理。", last: "版本化 JSON 备份与 WebDAV 双向同步。" },
  "resume-builder": { count: 11, first: "可视化简历创建、区块编辑与拖拽排序。", last: "本地简历数据与 API Key 管理。" },
  "interview-review": { count: 10, first: "M4A、MP3、WAV、AAC 录音或已有文本导入。", last: "按公司、岗位和时间线管理多场面试档案。" },
  "meeting-minutes": { count: 12, first: "六阶段智能纪要生成。", last: "SQLite 配置与会议数据持久化。" },
} as const;

const expectedExperienceFacts = [
  { period: "2026.07 - 至今", organization: "字节跳动", role: "AI 产品经理", highlight: "企业 Agent 和团队数字员工的搭建与迭代" },
  { period: "2026.03 - 2026.07", organization: "科大讯飞", role: "AI 产品经理", highlight: "多模态心脏超声智能报告系统" },
  { period: "2025.10 - 2026.01", organization: "美团", role: "产品运营", highlight: "供应链质量管理" },
  { period: "2025.06 - 2025.09", organization: "国务院发展研究中心大数据研究院", role: "产品经理", highlight: "大数据平台产品构建" },
  { period: "2023.10 - 2024.01", organization: "BOSS直聘", role: "行业与产品研究", highlight: "行业研究与产品优化" },
  { period: "2023.03 - 2023.06", organization: "太平洋证券研究所", role: "行业研究", highlight: "行业数据分析与研究支持" },
];

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function expectAssetDimensions(src: string, width: number, height: number) {
  const assetPath = join(process.cwd(), "public", src.replace(/^\//, ""));

  expect(existsSync(assetPath), `${src} should exist under public`).toBe(true);
  expect(statSync(assetPath).size, `${src} should not be empty`).toBeGreaterThan(0);

  if (extname(assetPath) === ".png") {
    const png = readFileSync(assetPath);
    expect(png.subarray(0, 8), `${src} should have a PNG signature`).toEqual(pngSignature);
    expect(png.subarray(12, 16).toString("ascii"), `${src} should start with an IHDR chunk`).toBe("IHDR");
    expect({ width, height }, `${src} metadata should match its IHDR dimensions`).toEqual({
      width: png.readUInt32BE(16),
      height: png.readUInt32BE(20),
    });
    return;
  }

  const svg = readFileSync(assetPath, "utf8");
  expect(svg, `${src} should be an SVG with matching intrinsic dimensions`).toMatch(
    new RegExp(`<svg[^>]*width=["']${width}["'][^>]*height=["']${height}["']`),
  );
}

describe("portfolio content", () => {
  it("does not expose capabilities that no current page renders", () => {
    expect(portfolio).not.toHaveProperty("capabilities");
  });

  it("keeps the approved case order and exclusions", () => {
    expect(portfolioCases.map((item) => item.slug)).toEqual(expectedSlugs);
    expect(portfolioCases.map((item) => item.slug)).not.toContain("vedio-for-jiji");
    expect(portfolioCases.map((item) => item.slug)).not.toContain("aurostars.github.io");
  });

  it("gives every case a complete five-step workflow and real repository link", () => {
    for (const item of portfolioCases) {
      expect(item.background.length).toBeGreaterThan(20);
      expect(item.goal.length).toBeGreaterThan(10);
      expect(item.workflow).toHaveLength(5);
      expect(item.repositoryUrl).toBe(expectedRepositoryUrls[item.slug]);
      expect(item.releaseUrl).toBeUndefined();
    }
  });

  it("uses the approved verified feature-list boundaries and counts", () => {
    for (const item of portfolioCases) {
      const expected = expectedFeatureBounds[item.slug];
      expect(item.features).toHaveLength(expected.count);
      expect(item.features.at(0)).toBe(expected.first);
      expect(item.features.at(-1)).toBe(expected.last);
    }
  });

  it("uses exactly the two approved Job Application Helper screenshots", () => {
    const jobHelper = portfolioCases.find((item) => item.slug === "job-application-helper");

    expect(jobHelper?.media).toEqual([
      {
        src: "/projects/job-application-helper/extension-popup.png",
        alt: "秋招网申助手点击扩展后打开的界面",
        width: 360,
        height: 531,
      },
      {
        src: "/projects/job-application-helper/profile-manager.png",
        alt: "秋招网申助手的个人信息设置页面",
        width: 1920,
        height: 1563,
      },
    ]);
  });

  it("keeps every referenced media asset local, present, and dimensionally accurate", () => {
    for (const media of portfolioCases.flatMap((item) => item.media)) {
      expect(media.src.startsWith("/projects/")).toBe(true);
      expectAssetDimensions(media.src, media.width, media.height);
    }
  });

  it("uses the approved experience facts and local logo metadata", () => {
    expect(experiences.map(({ period, organization, role, highlight }) => ({ period, organization, role, highlight }))).toEqual(
      expectedExperienceFacts,
    );
    expect(experiences[0].logo).toEqual({
      src: "/companies/bytedance.svg",
      alt: "字节跳动 Logo",
      width: 240,
      height: 64,
    });
    for (const experience of experiences) {
      expect(experience.logo.src.startsWith("/companies/")).toBe(true);
      expectAssetDimensions(experience.logo.src, experience.logo.width, experience.logo.height);
    }
  });

  it("uses the approved education fields and local school emblems", () => {
    expect(education).toEqual([
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
    ]);
    for (const item of education) {
      expect(item.schoolLogo.src.startsWith("/schools/")).toBe(true);
      expectAssetDimensions(item.schoolLogo.src, item.schoolLogo.width, item.schoolLogo.height);
    }
  });

  it("keeps both school SVGs self-contained, script-free, square, and on-brand", () => {
    const emblems = [
      { src: "/schools/beijing-normal-university.svg", brandColor: "#004ea2" },
      { src: "/schools/renmin-university-of-china.svg", brandColor: "#ad0b2a" },
    ];

    for (const emblem of emblems) {
      const svg = readFileSync(join(process.cwd(), "public", emblem.src.replace(/^\//, "")), "utf8");
      expect(svg).not.toMatch(/<script\b/i);
      expect(svg).not.toMatch(/<foreignObject\b/i);
      expect(svg).not.toMatch(/(?:href|xlink:href)\s*=\s*["']https?:/i);
      expect(svg).not.toMatch(/@font-face/i);
      expect(svg.toLowerCase()).toContain(emblem.brandColor);

      const viewBox = svg.match(/\bviewBox=["']\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
      expect(viewBox, `${emblem.src} should declare a viewBox`).not.toBeNull();
      expect(Number(viewBox![3]), `${emblem.src} viewBox should be square`).toBe(Number(viewBox![4]));
    }
  });

  it("uses the final project media selections", () => {
    expect(portfolioCases.map(({ slug, media }) => ({ slug, sources: media.map(({ src }) => src) }))).toEqual([
      {
        slug: "job-application-helper",
        sources: [
          "/projects/job-application-helper/extension-popup.png",
          "/projects/job-application-helper/profile-manager.png",
        ],
      },
      { slug: "interview-review", sources: ["/projects/interview-review/analysis.png"] },
      { slug: "resume-builder", sources: ["/projects/resume-builder/workspace.png"] },
      { slug: "meeting-minutes", sources: ["/projects/meeting-minutes/input.png"] },
    ]);
    expect(portfolioCases.map(({ media }) => media.length)).toEqual([2, 1, 1, 1]);
  });

  it("removes user problems and omits provenance only for Resume Builder", () => {
    for (const item of portfolioCases) {
      expect(item).not.toHaveProperty("userProblems");
    }
    expect(portfolioCases.find(({ slug }) => slug === "resume-builder")).not.toHaveProperty("provenance");
    expect(portfolioCases.filter(({ provenance }) => provenance !== undefined).map(({ provenance }) => provenance)).toEqual([
      "独立开发项目，页面只展示仓库和真实运行结果可验证的功能。",
      "独立开发项目，效果描述不包含未经真实测试验证的准确率或提升比例。",
      "独立开发项目，页面只描述仓库中可验证的流程与功能。",
    ]);
  });

  it("constructs the approved visible email and limits contact to email and GitHub", () => {
    expect(Object.keys(contact).sort()).toEqual(["email", "github"]);
    expect(contact.email).toBe(["dst3056", "qq.com"].join("@"));
    expect(contact.github).toBe("https://github.com/aurostars");
  });
});
