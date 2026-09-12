import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { contact, experiences, portfolioCases } from "./portfolio";

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

const expectedResumeBuilderProvenance =
  "基于 https://github.com/JOYCEQL/magic-resume 二次开发；当前仓库 README 明确列出的个人修改范围：扩展 API 提供商、增加主题色预设与模板、增加简历快速生成、JD 定制优化、STAR 法则改写、中英简历互译和多格式导出。";

const expectedFeatureBounds = {
  "job-application-helper": { count: 10, first: "求职资料集中管理。", last: "版本化 JSON 备份与 WebDAV 双向同步。" },
  "resume-builder": { count: 11, first: "可视化简历创建、区块编辑与拖拽排序。", last: "本地简历数据与 API Key 管理。" },
  "interview-review": { count: 10, first: "M4A、MP3、WAV、AAC 录音或已有文本导入。", last: "按公司、岗位和时间线管理多场面试档案。" },
  "meeting-minutes": { count: 12, first: "六阶段智能纪要生成。", last: "SQLite 配置与会议数据持久化。" },
} as const;

const expectedExperienceFacts = [
  { period: "2026.07 - 至今", organization: "字节跳动", role: "AI 产品经理", highlight: "企业 Agent 和团队数字员工的搭建与迭代" },
  { period: "2026.03 - 2026.07", organization: "科大讯飞", role: "AI产品经理", highlight: "多模态心脏超声智能报告系统" },
  { period: "2025.10 - 2026.01", organization: "美团快驴", role: "产品运营", highlight: "AI 工具驱动业务流程提效" },
  { period: "2025.06 - 2025.09", organization: "国务院发展研究中心大数据研究院", role: "产品经理", highlight: "研究与数据产品实践" },
  { period: "2023.10 - 2024.01", organization: "BOSS直聘", role: "行业与产品研究", highlight: "招聘市场与行业研究" },
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
        width: 1600,
        height: 900,
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

  it("records the Resume Builder upstream and verified personal modification scope", () => {
    const resumeBuilder = portfolioCases.find((item) => item.slug === "resume-builder");

    expect(resumeBuilder?.provenance).toBe(expectedResumeBuilderProvenance);
  });

  it("adds ByteDance first and keeps all six experiences with local logo metadata", () => {
    expect(experiences.map(({ logo: _logo, ...facts }) => facts)).toEqual(expectedExperienceFacts);
    expect(experiences[0].logo).toEqual({
      src: "/companies/bytedance.svg",
      alt: "字节跳动 Logo",
      width: 240,
      height: 64,
    });
    expect(experiences.every((item) => item.highlight.length <= 48)).toBe(true);
    for (const experience of experiences) {
      expect(experience.logo.src.startsWith("/companies/")).toBe(true);
      expect(experience.logo.alt).toContain("Logo");
      expectAssetDimensions(experience.logo.src, experience.logo.width, experience.logo.height);
    }
  });

  it("constructs the approved visible email and limits contact to email and GitHub", () => {
    expect(Object.keys(contact).sort()).toEqual(["email", "github"]);
    expect(contact.email).toBe(["dst3056", "qq.com"].join("@"));
    expect(contact.github).toBe("https://github.com/aurostars");
  });
});
