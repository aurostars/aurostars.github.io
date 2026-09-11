import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
}));

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
    expect(page.getByRole("group", { name: "个人项目界面预览" })).toBeInTheDocument();
    expect(page.getByRole("img", { name: "秋招网申助手的浏览器扩展图标" })).toBeInTheDocument();
    expect(page.getByRole("img", { name: "面试复盘助手的录音上传界面" })).toBeInTheDocument();
    expect(page.getByRole("img", { name: "智能简历编辑工具的编辑工作台" })).toBeInTheDocument();
  });
});
