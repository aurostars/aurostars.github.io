import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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

const expectedExperiences = [
  { period: "2026.03 - 2026.07", organization: "科大讯飞", role: "AI产品经理", highlight: "多模态心脏超声智能报告系统" },
  { period: "2025.10 - 2026.01", organization: "美团快驴", role: "产品运营", highlight: "AI 工具驱动业务流程提效" },
  { period: "2025.06 - 2025.09", organization: "国务院发展研究中心大数据研究院", role: "产品经理", highlight: "研究与数据产品实践" },
  { period: "2023.10 - 2024.01", organization: "BOSS直聘", role: "行业与产品研究", highlight: "招聘市场与行业研究" },
  { period: "2023.03 - 2023.06", organization: "太平洋证券研究所", role: "行业研究", highlight: "行业数据分析与研究支持" },
];

describe("portfolio content", () => {
  it("keeps the approved case order and exclusions", () => {
    expect(portfolioCases.map((item) => item.slug)).toEqual(expectedSlugs);
    expect(portfolioCases.map((item) => item.slug)).not.toContain("vedio-for-jiji");
    expect(portfolioCases.map((item) => item.slug)).not.toContain("aurostars.github.io");
  });

  it("gives every case a complete five-step workflow and real links", () => {
    for (const item of portfolioCases) {
      expect(item.background.length).toBeGreaterThan(20);
      expect(item.goal.length).toBeGreaterThan(10);
      expect(item.workflow).toHaveLength(5);
      expect(item.repositoryUrl).toBe(expectedRepositoryUrls[item.slug]);
      expect(item.media.length).toBeGreaterThan(0);
      expect(item.media.every((media) => media.src.startsWith("/projects/"))).toBe(true);
    }
  });

  it("backs every declared media item with a non-placeholder public asset", () => {
    for (const item of portfolioCases) {
      for (const media of item.media) {
        const assetPath = join(process.cwd(), "public", media.src.replace(/^\//, ""));

        expect(existsSync(assetPath), `${media.src} should exist under public`).toBe(true);
        expect(statSync(assetPath).size, `${media.src} should be larger than 1KB`).toBeGreaterThan(1024);
      }
    }
  });

  it("records the Resume Builder upstream and verified personal modification scope", () => {
    const resumeBuilder = portfolioCases.find((item) => item.slug === "resume-builder");

    expect(resumeBuilder?.provenance).toBe(expectedResumeBuilderProvenance);
  });

  it("keeps repository internships concise and contact limited to email and GitHub", () => {
    expect(experiences).toEqual(expectedExperiences);
    expect(experiences.every((item) => item.highlight.length <= 48)).toBe(true);
    expect(Object.keys(contact).sort()).toEqual(["email", "github"]);
    expect(contact.email).toBe("dongxing.123@bytedance.com");
    expect(contact.github).toBe("https://github.com/aurostars");
  });
});
