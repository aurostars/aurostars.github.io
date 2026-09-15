import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CompanyLogo } from "@/components/company-logo";
import type { CompanyLogo as CompanyLogoData } from "@/content/portfolio";

const logo: CompanyLogoData = {
  src: "/companies/bytedance.svg",
  alt: "字节跳动 Logo",
  width: 240,
  height: 64,
};

afterEach(cleanup);

describe("CompanyLogo", () => {
  it("hides a failed image while keeping the organization name readable", () => {
    render(
      <div>
        <CompanyLogo logo={logo} />
        <span>字节跳动</span>
      </div>,
    );

    const image = screen.getByRole("img", { name: "字节跳动 Logo" });
    expect(image).toHaveAttribute("width", "240");
    expect(image).toHaveAttribute("height", "64");

    fireEvent.error(image);

    expect(screen.queryByRole("img", { name: "字节跳动 Logo" })).not.toBeInTheDocument();
    expect(screen.getByText("字节跳动")).toBeInTheDocument();
  });
});
