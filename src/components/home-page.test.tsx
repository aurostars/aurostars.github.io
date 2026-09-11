import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "font-geist-sans" },
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
  it("renders the primary page content immediately without scroll reveal wrappers", () => {
    const { container } = render(<Home />);
    expect(container.querySelector(".reveal")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    expect(screen.getByRole("region", { name: /代表案例/ })).toBeVisible();
  });

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

  it("renders four compact case summaries in approved order without expanded details", () => {
    render(<Home />);
    const cards = screen.getAllByRole("article", {
      name: /秋招网申助手|面试复盘助手|智能简历编辑工具|智能会议纪要工具/,
    });
    expect(cards).toHaveLength(4);
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "秋招网申助手",
      "面试复盘助手",
      "智能简历编辑工具",
      "智能会议纪要工具",
    ]);
    expect(screen.queryByRole("region", { name: /案例详情/ })).not.toBeInTheDocument();
  });

  it("opens one accessible case detail at a time and closes it on a second click", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const first = screen.getByRole("button", { name: "展开秋招网申助手详情" });
    const second = screen.getByRole("button", { name: "展开面试复盘助手详情" });

    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "秋招网申助手案例详情" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: /案例详情/ })).toHaveLength(1);

    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("region", { name: "秋招网申助手案例详情" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "面试复盘助手案例详情" })).toBeInTheDocument();

    await user.click(second);
    expect(screen.queryByRole("region", { name: /案例详情/ })).not.toBeInTheDocument();
  });

  it("keeps the complete verified case contract inside the expanded detail", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "展开智能简历编辑工具详情" }));
    const detail = within(screen.getByRole("region", { name: "智能简历编辑工具案例详情" }));
    expect(detail.getByRole("heading", { name: "背景与目标" })).toBeInTheDocument();
    expect(detail.getByRole("heading", { name: "核心问题" })).toBeInTheDocument();
    expect(detail.getAllByTestId("workflow-step")).toHaveLength(5);
    expect(detail.getAllByRole("img").length).toBeGreaterThan(0);
    expect(detail.getByRole("link", { name: "查看智能简历编辑工具源码" })).toHaveAttribute("target", "_blank");
    expect(detail.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
    expect(detail.getByText(/个人修改范围/)).toBeInTheDocument();
  });

  it("places the detail directly after its selected summary without reordering summaries", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "展开智能简历编辑工具详情" }));

    const cards = screen.getAllByRole("article", {
      name: /秋招网申助手|面试复盘助手|智能简历编辑工具|智能会议纪要工具/,
    });
    const detail = screen.getByRole("region", { name: "智能简历编辑工具案例详情" });
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "秋招网申助手",
      "面试复盘助手",
      "智能简历编辑工具",
      "智能会议纪要工具",
    ]);
    expect(cards[2].nextElementSibling).toBe(detail);
  });

  it("groups experience, education, capabilities, and approved contact in one profile region", () => {
    render(<Home />);
    const profile = screen.getByRole("region", { name: "经历与能力" });
    expect(within(profile).getAllByTestId("experience-row")).toHaveLength(5);
    expect(within(profile).getByText("北京师范大学 理论经济学硕士")).toBeInTheDocument();
    expect(within(profile).getByText("AI 产品设计")).toBeInTheDocument();
    expect(within(profile).getAllByRole("link")).toHaveLength(2);
    expect(profile.textContent).not.toMatch(/电话|微信|微博|LinkedIn/);
  });

  it("renders exactly one case card per project and no future placeholders", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll(".case-card")).toHaveLength(4);
    expect(screen.queryByText(/未来案例|待添加/)).not.toBeInTheDocument();
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

  it("ships the social preview image referenced by metadata", () => {
    const ogImage = path.join(process.cwd(), "public", "og-portfolio.png");
    expect(fs.existsSync(ogImage)).toBe(true);
    expect(fs.statSync(ogImage).size).toBeGreaterThan(10_000);
  });
});
