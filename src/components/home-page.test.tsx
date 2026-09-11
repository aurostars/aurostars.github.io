import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
}));

import RootLayout, { metadata } from "@/app/layout";

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
