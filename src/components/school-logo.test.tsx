import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SchoolLogo } from "@/components/school-logo";
import { ProfileHistory } from "@/components/profile-history";
import { education } from "@/content/portfolio";

const logo = {
  src: "/schools/example.svg",
  alt: "示例大学校徽",
  width: 300,
  height: 240,
};

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SchoolLogo", () => {
  it("renders the local emblem with intrinsic dimensions", () => {
    render(<SchoolLogo logo={logo} />);

    const image = screen.getByRole("img", { name: logo.alt });
    expect(image).toHaveAttribute("src", "/schools/example.svg");
    expect(image).toHaveAttribute("width", "300");
    expect(image).toHaveAttribute("height", "240");
    expect(image).toHaveClass("school-logo");
  });

  it("removes only a failed image from the real education row", () => {
    const { container } = render(
      <ProfileHistory education={[education[0]]} experiences={[]} />,
    );
    const row = screen.getByTestId("education-row");
    const schoolName = education[0].school;

    fireEvent.error(screen.getByRole("img", { name: education[0].schoolLogo.alt }));

    expect(screen.queryByRole("img", { name: education[0].schoolLogo.alt })).not.toBeInTheDocument();
    expect(row.querySelector(".school-logo-slot")).toBeInTheDocument();
    expect(row).toHaveTextContent(schoolName);
    expect(container.querySelector(".education-copy strong")).toHaveTextContent(schoolName);
  });
});
