import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SchoolLogo } from "@/components/school-logo";

const logo = {
  src: "/schools/example.svg",
  alt: "示例大学校徽",
  width: 300,
  height: 240,
};

afterEach(cleanup);

describe("SchoolLogo", () => {
  it("renders the local emblem with intrinsic dimensions", () => {
    render(<SchoolLogo logo={logo} />);

    const image = screen.getByRole("img", { name: logo.alt });
    expect(image).toHaveAttribute("src", "/schools/example.svg");
    expect(image).toHaveAttribute("width", "300");
    expect(image).toHaveAttribute("height", "240");
    expect(image).toHaveClass("school-logo");
  });

  it("removes only the failed image", () => {
    const { container } = render(
      <div className="school-logo-slot">
        <SchoolLogo logo={logo} />
      </div>,
    );

    fireEvent.error(screen.getByRole("img", { name: logo.alt }));

    expect(screen.queryByRole("img", { name: logo.alt })).not.toBeInTheDocument();
    expect(container.querySelector(".school-logo-slot")).toBeInTheDocument();
  });
});
