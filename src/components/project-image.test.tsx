import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectImage } from "@/components/project-image";
import { portfolioCases } from "@/content/portfolio";

const media = portfolioCases[0].media.find((item) => !item.src.endsWith("icon.png")) ?? portfolioCases[0].media[0];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProjectImage", () => {
  it("consumes Next Image priority without leaking it to the native image", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<ProjectImage media={media} priority sizes="100vw" />);

    const image = screen.getByRole("img", { name: media.alt });
    expect(image).not.toHaveAttribute("priority");
    expect(image).not.toHaveAttribute("loading");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("keeps lazy loading and shows the visible fallback after an image error", () => {
    render(<ProjectImage media={media} sizes="100vw" className="project-cover" />);

    const image = screen.getByRole("img", { name: media.alt });
    expect(image).toHaveAttribute("loading", "lazy");
    fireEvent.error(image);
    expect(screen.getByRole("img", { name: `${media.alt}加载失败` })).toHaveClass(
      "project-image-fallback",
      "project-cover",
    );
  });
});
