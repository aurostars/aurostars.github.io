import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CaseSummaryCard } from "@/components/case-summary-card";
import { portfolioCases } from "@/content/portfolio";

it("keeps card controls usable while pointer feedback is enabled", () => {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("pointer: fine"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  const onToggle = vi.fn();
  render(<CaseSummaryCard project={portfolioCases[0]} expanded={false} onToggle={onToggle} />);

  const card = screen.getByTestId("case-summary-card");
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 100, clientY: 80 });
  expect(card).toHaveAttribute("data-tilt", "enabled");
  screen.getByRole("button", { name: /展开详情/ }).click();
  expect(onToggle).toHaveBeenCalledOnce();
  vi.unstubAllGlobals();
});
