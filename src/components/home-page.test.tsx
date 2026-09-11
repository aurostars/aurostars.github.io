import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
}));

afterEach(cleanup);

import RootLayout, { metadata } from "@/app/layout";
import Home from "@/app/page";

function renderLayout() {
  return render(
    <RootLayout>
      <div id="content-probe">content</div>
    </RootLayout>,
  );
}

describe("site shell", () => {
  it("describes the portfolio for AI product manager recruiting", () => {
    expect(metadata.title).toBe("董星 | AI 产品经理与独立开发者");
    expect(metadata.description).toContain("个人项目案例");
  });

  it("provides a skip link and approved navigation", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: "跳到主要内容" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("link", { name: "案例" })).toHaveAttribute("href", "#cases");
    expect(screen.getByRole("link", { name: "经历" })).toHaveAttribute("href", "#experience");
    expect(screen.getByRole("link", { name: "联系" })).toHaveAttribute("href", "#contact");
  });
});

describe("home page", () => {
  it("renders a concise recruiter-focused hero with one case CTA", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "从问题定义，到结果验证。" })).toBeInTheDocument();
    expect(screen.getByText("AI 产品经理")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看案例" })).toHaveAttribute("href", "#cases");
    expect(screen.getAllByRole("link", { name: "查看案例" })).toHaveLength(1);
  });

  it("exposes the project collage as a named group with individually named images", () => {
    const { container } = render(<Home />);
    const page = within(container);
    const collage = within(page.getByRole("group", { name: "个人项目界面预览" }));
    expect(collage.getByRole("img", { name: "秋招网申助手的浏览器扩展图标" })).toBeInTheDocument();
    expect(collage.getByRole("img", { name: "面试复盘助手的录音上传界面" })).toBeInTheDocument();
    expect(collage.getByRole("img", { name: "智能简历编辑工具的编辑工作台" })).toBeInTheDocument();
  });

  it("renders the four approved cases in order with repository links", () => {
    render(<Home />);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent);
    expect(headings).toEqual([
      "秋招网申助手",
      "面试复盘助手",
      "智能简历编辑工具",
      "智能会议纪要工具",
    ]);

    expect(screen.getByRole("link", { name: "查看秋招网申助手源码" })).toHaveAttribute(
      "href",
      "https://github.com/aurostars/Job-Application-Helper",
    );
    expect(screen.queryByText(/vedio-for-jiji/i)).not.toBeInTheDocument();
  });

  it("renders five workflow steps and real media for every case", () => {
    render(<Home />);
    for (const title of ["秋招网申助手", "面试复盘助手", "智能简历编辑工具", "智能会议纪要工具"]) {
      const article = screen.getByRole("article", { name: title });
      expect(article.querySelectorAll("[data-workflow-step]")).toHaveLength(5);
      expect(article.querySelectorAll("img").length).toBeGreaterThan(0);
    }
  });

  it("exposes background, goals, user problems, provenance, and responsive media", () => {
    render(<Home />);
    for (const title of ["秋招网申助手", "面试复盘助手", "智能简历编辑工具", "智能会议纪要工具"]) {
      const article = within(screen.getByRole("article", { name: title }));
      expect(article.getByRole("heading", { level: 4, name: "背景与目标" })).toBeInTheDocument();
      expect(article.getByRole("heading", { level: 4, name: "核心问题" })).toBeInTheDocument();
      expect(article.getByText(/独立开发项目|个人修改范围/)).toBeInTheDocument();
      expect(article.getByRole("link", { name: `查看${title}源码` })).toHaveAttribute("target", "_blank");
      for (const image of article.getAllByRole("img")) {
        expect(image).toHaveAttribute("src", expect.stringMatching(/^\/projects\//));
        expect(image).toHaveAttribute("width");
        expect(image).toHaveAttribute("height");
        expect(image).toHaveAttribute("sizes");
      }
    }
  });

  it("states the Resume Builder upstream and the verified personal modification scope", () => {
    render(<Home />);
    const article = within(screen.getByRole("article", { name: "智能简历编辑工具" }));
    expect(article.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
    expect(article.getByText(/个人修改范围/)).toBeInTheDocument();
  });

  it("renders five concise experience rows", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: "经历" });
    expect(section.querySelectorAll("[data-experience-row]")).toHaveLength(5);
    expect(section.textContent).not.toContain("产品设计：");
  });

  it("renders education and capabilities after experience", () => {
    render(<Home />);
    const experience = screen.getByRole("region", { name: "经历" });
    const education = screen.getByRole("region", { name: "教育与能力" });
    expect(experience.compareDocumentPosition(education) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(education).getByText("北京师范大学 理论经济学硕士")).toBeInTheDocument();
    expect(within(education).getByText("AI 产品设计")).toBeInTheDocument();
  });

  it("limits contact to email and GitHub", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: "联系" });
    expect(section.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "发送邮件" })).toHaveAttribute("href", "mailto:dongxing.123@bytedance.com");
    expect(screen.getByRole("link", { name: "访问 GitHub" })).toHaveAttribute("href", "https://github.com/aurostars");
    expect(section.querySelector("form")).not.toBeInTheDocument();
    expect(section.textContent).not.toMatch(/电话|微信|微博|LinkedIn/);
  });
});
