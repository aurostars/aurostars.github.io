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
import { portfolioCases, type ProjectCase } from "@/content/portfolio";

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
  it("renders a compact identity bar without the removed hero statement", () => {
    render(<Home />);
    const identity = screen.getByRole("region", { name: "个人信息" });
    expect(within(identity).getByRole("heading", { level: 1, name: "董星" })).toBeInTheDocument();
    expect(within(identity).getByText("AI 产品经理与独立开发者")).toBeInTheDocument();
    expect(within(identity).getByRole("link", { name: "dongxing.123@bytedance.com" })).toHaveAttribute("href", "mailto:dongxing.123@bytedance.com");
    expect(within(identity).getByRole("link", { name: "访问 GitHub（新窗口）" })).toHaveAttribute("href", "https://github.com/aurostars");
    expect(screen.queryByText("认真体验，持续表达")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看项目" })).not.toBeInTheDocument();
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
    expect(within(history).getAllByTestId("experience-row")).toHaveLength(5);
  });

  it("labels the project section without the removed helper copy", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: "个人项目" });
    expect(within(section).getByRole("heading", { level: 2, name: "个人项目" })).toBeInTheDocument();
    expect(within(section).queryByText("先快速浏览项目，再展开查看完整判断与工作流程。")).not.toBeInTheDocument();
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
    expect(within(trigger).getByText("查看详情")).toBeInTheDocument();
  });

  it("uses a non-icon product screenshot and preserves image metadata", () => {
    render(<FeaturedCases projects={portfolioCases} />);
    const trigger = screen.getByRole("button", { name: "查看项目详情：秋招网申助手" });
    const image = within(trigger).getByRole("img", { name: "秋招网申助手的多简历资料管理界面" });
    expect(image).toHaveAttribute("width", "1920");
    expect(image).toHaveAttribute("height", "1563");
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

  it("keeps the complete verified content and source links inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "查看项目详情：智能简历编辑工具" }));
    const dialog = within(screen.getByRole("dialog", { name: "智能简历编辑工具" }));
    expect(dialog.getByText(portfolioCases[2].background)).toBeInTheDocument();
    expect(dialog.getAllByTestId("workflow-step")).toHaveLength(5);
    expect(dialog.getByRole("link", { name: /查看智能简历编辑工具源码.*新窗口/ })).toHaveAttribute("target", "_blank");
    expect(dialog.getByRole("link", { name: /查看上游项目.*新窗口/ })).toHaveAttribute("target", "_blank");
    expect(dialog.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
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
