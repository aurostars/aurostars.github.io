import fs from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "font-geist-sans" },
}));

beforeEach(() => {
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
  vi.useRealTimers();
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
    expect(within(identity).getByRole("link", { name: "发送邮件" })).toHaveAttribute(
      "href",
      "mailto:dongxing.123@bytedance.com",
    );
    expect(within(identity).getByRole("link", { name: "访问 GitHub（新窗口）" })).toHaveAttribute(
      "href",
      "https://github.com/aurostars",
    );
    expect(screen.queryByText("认真体验，持续表达")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看项目" })).not.toBeInTheDocument();
  });

  it("renders semantic education and five concise internship rows", () => {
    render(<Home />);

    const history = screen.getByRole("region", { name: "教育与实习经历" });
    expect(within(history).getByRole("heading", { level: 2, name: "教育经历" })).toBeInTheDocument();
    expect(within(history).getAllByTestId("education-row")).toHaveLength(2);
    expect(within(history).getAllByTestId("experience-row")).toHaveLength(5);
    expect(within(history).getAllByText(/时间|公司|岗位|职责/).length).toBeGreaterThan(0);
  });

  it("labels the project section without the removed helper copy", () => {
    render(<Home />);

    const section = screen.getByRole("region", { name: "个人项目" });
    expect(within(section).getByRole("heading", { level: 2, name: "个人项目" })).toBeInTheDocument();
    expect(within(section).queryByText("先快速浏览项目，再展开查看完整判断与工作流程。")).not.toBeInTheDocument();
  });

  it("marks every summary card with a bottom-aligned action group", () => {
    render(<Home />);

    const cards = screen.getAllByTestId("case-summary-card");
    expect(cards).toHaveLength(4);
    cards.forEach((card) => {
      expect(card.querySelector(".case-card-actions")).toBeTruthy();
    });
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
    const first = screen.getByRole("button", { name: "展开详情：秋招网申助手" });
    const second = screen.getByRole("button", { name: "展开详情：面试复盘助手" });

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

  it("keeps the outgoing detail until its non-reduced exit completes, then leaves the new detail", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("pointer: fine"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    render(<Home />);

    const toggles = screen.getAllByRole("button", { name: /展开详情/ });
    fireEvent.click(toggles[0]);
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    fireEvent.click(toggles[1]);
    expect(screen.getByRole("region", { name: "秋招网申助手案例详情" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "面试复盘助手案例详情" })).toBeInTheDocument();

    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(screen.queryByRole("region", { name: "秋招网申助手案例详情" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: /案例详情/ })).toEqual([
      screen.getByRole("region", { name: "面试复盘助手案例详情" }),
    ]);
  });

  it("keeps the complete verified case contract inside the expanded detail", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "展开详情：智能简历编辑工具" }));
    const detail = within(screen.getByRole("region", { name: "智能简历编辑工具案例详情" }));
    expect(detail.getByRole("heading", { name: "背景" })).toBeInTheDocument();
    expect(detail.getByRole("heading", { name: "目标" })).toBeInTheDocument();
    expect(detail.getByRole("heading", { name: "核心问题" })).toBeInTheDocument();
    expect(detail.getByText(portfolioCases[2].background)).toBeInTheDocument();
    expect(detail.getByText(portfolioCases[2].goal)).toBeInTheDocument();
    expect(detail.getAllByTestId("workflow-step")).toHaveLength(5);
    expect(detail.getAllByRole("img").length).toBeGreaterThan(0);
    expect(detail.getByRole("link", { name: "查看智能简历编辑工具源码" })).toHaveAttribute("target", "_blank");
    expect(detail.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
    expect(detail.getByText(/个人修改范围/)).toBeInTheDocument();
  });

  it("marks the four-image gallery for a complete desktop mosaic", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "展开详情：秋招网申助手" }));

    const gallery = screen.getByRole("group", { name: "秋招网申助手真实产品界面" });
    expect(gallery).toHaveAttribute("data-gallery-layout", "featured-four");
    expect(within(gallery).getAllByRole("img")).toHaveLength(4);
  });

  it("places the detail directly after its selected summary without reordering summaries", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "展开详情：智能简历编辑工具" }));

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
    expect(cards[2].parentElement?.nextElementSibling).toBe(detail);
  });

  it("renders five projects as three rows without an empty card and expands the fifth in row three", async () => {
    const user = userEvent.setup();
    const { container } = render(<FeaturedCases projects={makeProjectFixtures(5)} />);
    const rows = container.querySelectorAll(".case-row");
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(5);
    expect(rows).toHaveLength(3);
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "测试案例 1",
      "测试案例 2",
      "测试案例 3",
      "测试案例 4",
      "测试案例 5",
    ]);
    expect(rows[2].querySelectorAll(".case-card")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "展开详情：测试案例 5" }));
    const detail = screen.getByRole("region", { name: "测试案例 5案例详情" });
    expect(rows[2].contains(detail)).toBe(true);
    expect(cards[4].parentElement?.nextElementSibling).toBe(detail);
  });

  it("renders six projects as three complete rows and expands the sixth in row three", async () => {
    const user = userEvent.setup();
    const { container } = render(<FeaturedCases projects={makeProjectFixtures(6)} />);
    const rows = container.querySelectorAll(".case-row");
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(6);
    expect(rows).toHaveLength(3);
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "测试案例 1",
      "测试案例 2",
      "测试案例 3",
      "测试案例 4",
      "测试案例 5",
      "测试案例 6",
    ]);
    expect(rows[2].querySelectorAll(".case-card")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "展开详情：测试案例 6" }));
    const detail = screen.getByRole("region", { name: "测试案例 6案例详情" });
    expect(rows[2].contains(detail)).toBe(true);
    expect(cards[5].parentElement?.nextElementSibling).toBe(detail);
  });

  it("renders exactly one case card per project and no future placeholders", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll(".case-card")).toHaveLength(4);
    expect(screen.queryByText(/未来案例|待添加/)).not.toBeInTheDocument();
  });

  it("ships the social preview image referenced by metadata", () => {
    const ogImage = path.join(process.cwd(), "public", "og-portfolio.png");
    expect(fs.existsSync(ogImage)).toBe(true);
    expect(fs.statSync(ogImage).size).toBeGreaterThan(10_000);
  });
});
