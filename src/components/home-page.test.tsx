import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "font-geist-sans" },
}));

beforeEach(() => {
  history.replaceState({}, "", "/");
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  vi.stubGlobal("IntersectionObserver", class {
    private callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }

    observe(element: Element) {
      this.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

import RootLayout, { metadata } from "@/app/layout";
import Home from "@/app/page";
import { FeaturedCases } from "@/components/featured-cases";
import { contact, experiences, portfolioCases, type ProjectCase } from "@/content/portfolio";

function makeProjectFixtures(count: number): ProjectCase[] {
  return Array.from({ length: count }, (_, index) => ({
    ...portfolioCases[index % portfolioCases.length],
    slug: `fixture-${index + 1}` as ProjectCase["slug"],
    title: `测试案例 ${index + 1}`,
  }));
}

function renderLayout(children: React.ReactNode = <div id="content-probe">content</div>) {
  const markup = renderToStaticMarkup(<RootLayout>{children}</RootLayout>);
  return new DOMParser().parseFromString(`<!doctype html>${markup}`, "text/html");
}

describe("site shell", () => {
  it("describes the portfolio for AI product manager recruiting", () => {
    expect(metadata.title).toBe("董星 | AI 产品经理与独立开发者");
    expect(metadata.description).toContain("个人项目案例");
  });

  it("keeps the skip link and removes directory navigation", () => {
    const page = renderLayout();
    expect(page.querySelector('a[href="#main-content"]')?.textContent).toContain("跳到主要内容");
    expect(page.querySelector('nav[aria-label="主要导航"]')).toBeNull();
    expect(page.querySelector('a[href="#experience"]')).toBeNull();
    expect(page.querySelector('a[href="#cases"]')).toBeNull();
    expect(page.querySelector('a[href="#contact"]')).toBeNull();
  });
});

describe("home page", () => {
  it("renders only the name, email, and GitHub in the compact identity bar", () => {
    render(<Home />);
    const identity = screen.getByRole("region", { name: "个人信息" });
    expect(within(identity).getByRole("heading", { level: 1, name: "董星" })).toBeInTheDocument();
    expect(within(identity).getByRole("link", { name: contact.email })).toHaveAttribute("href", `mailto:${contact.email}`);
    expect(within(identity).getByRole("link", { name: "访问 GitHub（新窗口）" })).toHaveAttribute("href", "https://github.com/aurostars");
    expect(screen.queryByText("AI 产品经理与独立开发者")).not.toBeInTheDocument();
    expect(screen.queryByText("保持好奇，终身学习")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /头像/ })).not.toBeInTheDocument();
  });

  it("renders schools, simplified majors, degrees, and semantic education dates", () => {
    render(<Home />);
    const history = screen.getByRole("region", { name: "教育与实习经历" });
    expect(within(history).getByRole("heading", { level: 2, name: "教育经历" })).toBeInTheDocument();
    const educationRows = within(history).getAllByTestId("education-row");
    expect(educationRows).toHaveLength(2);
    expect(educationRows[0]).toHaveTextContent("北京师范大学经济学硕士2024-2027");
    expect(educationRows[0].querySelector("time")).toHaveTextContent("2024-2027");
    expect(educationRows[1]).toHaveTextContent("中国人民大学经济学学士2020-2024");
    expect(educationRows[1].querySelector("time")).toHaveTextContent("2020-2024");
    expect(within(history).queryByText(/理论经济学|应用经济学/)).not.toBeInTheDocument();
    expect(history.querySelector(".profile-history-motion")).toBeInTheDocument();
    const experienceRows = within(history).getAllByTestId("experience-row");
    expect(experienceRows).toHaveLength(6);
    expect(within(experienceRows[0]).getByText("2026.07 - 至今")).toBeInTheDocument();
    expect(within(experienceRows[0]).getByText("字节跳动")).toBeInTheDocument();
    expect(within(experienceRows[0]).getByText("AI 产品经理")).toBeInTheDocument();
    expect(within(experienceRows[0]).getByText("企业 Agent 和团队数字员工的搭建与迭代")).toBeInTheDocument();
    for (const item of experiences) {
      expect(within(history).getByRole("img", { name: item.logo.alt })).toBeInTheDocument();
    }
  });

  it("describes the project grid with one shared instruction instead of per-card detail labels", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: "个人项目" });
    const hint = within(section).getByText("点击卡片任意位置，可查看详情");
    const grid = section.querySelector(".case-grid");

    expect(within(section).getByRole("heading", { level: 2, name: "个人项目" })).toBeInTheDocument();
    expect(hint).toHaveAttribute("id", "cases-hint");
    expect(grid).toHaveAttribute("aria-describedby", "cases-hint");
    expect(within(section).queryByText("先快速浏览项目，再展开查看完整判断与工作流程。")).not.toBeInTheDocument();
    expect(within(section).queryAllByText("查看详情")).toHaveLength(0);

    for (const card of within(section).getAllByRole("button", { name: /查看项目详情：/ })) {
      expect(card).not.toHaveTextContent("查看详情");
    }
  });

  it.each([4, 5, 6])("renders %i projects as one flat grid without placeholders", (count) => {
    const { container } = render(<FeaturedCases projects={makeProjectFixtures(count)} />);
    expect(container.querySelector(".case-grid")).toHaveAttribute("data-project-count", String(count));
    expect(screen.getAllByRole("button", { name: /查看项目详情：测试案例/ })).toHaveLength(count);
    expect(container.querySelectorAll(".case-row")).toHaveLength(0);
    expect(container.querySelectorAll(".case-card")).toHaveLength(count);
  });

  it("uses one native button per card and keeps source links out of summaries", () => {
    render(<FeaturedCases projects={portfolioCases} />);
    const trigger = screen.getByRole("button", { name: "查看项目详情：秋招网申助手" });
    expect(trigger).toHaveClass("case-card");
    expect(within(trigger).queryByRole("link")).not.toBeInTheDocument();
    expect(within(trigger).queryByText("查看详情")).not.toBeInTheDocument();
  });

  it("uses a non-icon product screenshot and preserves image metadata", () => {
    render(<FeaturedCases projects={portfolioCases} />);
    const trigger = screen.getByRole("button", { name: "查看项目详情：秋招网申助手" });
    const image = within(trigger).getByRole("img", { name: "秋招网申助手点击扩展后打开的界面" });
    expect(image).toHaveAttribute("width", "1600");
    expect(image).toHaveAttribute("height", "900");
  });

  it("renders exactly one case card per project and no future placeholders", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll(".case-card")).toHaveLength(4);
    expect(screen.queryByText(/未来案例|待添加/)).not.toBeInTheDocument();
  });

  it("opens exactly one labelled dialog and writes the project query", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "查看项目详情：秋招网申助手" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog", { name: "秋招网申助手" })).toBeInTheDocument();
    expect(location.search).toBe("?project=job-application-helper");
  });

  it.each(portfolioCases)("renders $title verified features and only its source link", async (project) => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: `查看项目详情：${project.title}` }));
    const dialog = within(screen.getByRole("dialog", { name: project.title }));

    expect(dialog.getByText(project.background)).toBeInTheDocument();
    expect(dialog.getAllByTestId("workflow-step")).toHaveLength(5);
    expect(dialog.getByRole("heading", { name: "已实现功能" })).toBeInTheDocument();
    for (const feature of project.features) {
      expect(dialog.getByText(feature)).toBeInTheDocument();
    }
    expect(dialog.getByRole("link", { name: /查看源码/ })).toHaveAttribute("href", project.repositoryUrl);
    expect(dialog.getAllByRole("link")).toHaveLength(1);
    expect(dialog.queryByText("下载版本")).not.toBeInTheDocument();
    expect(dialog.queryByText("查看上游项目")).not.toBeInTheDocument();
  });

  it("places the source link after the verified feature list", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "查看项目详情：秋招网申助手" }));
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    const features = within(dialog).getByRole("region", { name: "已实现功能" });
    const sourceLink = within(dialog).getByRole("link", { name: /查看源码/ });

    expect(features.compareDocumentPosition(sourceLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows only the two approved Job Application Helper screenshots", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "查看项目详情：秋招网申助手" }));
    const dialog = within(screen.getByRole("dialog", { name: "秋招网申助手" }));
    const gallery = dialog.getByRole("group", { name: "秋招网申助手真实产品界面" });

    expect(gallery.querySelectorAll("figure")).toHaveLength(2);
    expect(within(gallery).getByRole("img", { name: "秋招网申助手点击扩展后打开的界面" })).toBeInTheDocument();
    expect(within(gallery).getByRole("img", { name: "秋招网申助手的个人信息设置页面" })).toBeInTheDocument();
  });

  it("restores focus to the originating project card after close", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(history, "back").mockImplementation(() => {
      history.replaceState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    render(<Home />);
    const trigger = screen.getByRole("button", { name: "查看项目详情：面试复盘助手" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "关闭面试复盘助手详情" }));
    expect(back).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
  });

  it("opens a valid deep link and falls back to the project heading on close", async () => {
    history.replaceState({}, "", "/?project=meeting-minutes");
    const user = userEvent.setup();
    render(<Home />);
    expect(screen.getByRole("dialog", { name: "智能会议纪要工具" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "关闭智能会议纪要工具详情" }));
    expect(screen.getByRole("heading", { level: 2, name: "个人项目" })).toHaveFocus();
    expect(location.search).toBe("");
  });

  it("ships the social preview image referenced by metadata", () => {
    const ogImage = path.join(process.cwd(), "public", "og-portfolio.png");
    expect(fs.existsSync(ogImage)).toBe(true);
    expect(fs.statSync(ogImage).size).toBeGreaterThan(10_000);
  });
});
