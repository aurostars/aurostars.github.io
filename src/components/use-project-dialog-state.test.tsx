import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProjectDialogState } from "@/components/use-project-dialog-state";
import { portfolioCases } from "@/content/portfolio";

function Harness() {
  const { selectedProject, openProject, closeProject } = useProjectDialogState(portfolioCases);

  return (
    <div>
      <output aria-label="selected project">{selectedProject?.title ?? "none"}</output>
      <button onClick={() => openProject("job-application-helper")}>open first</button>
      <button onClick={() => openProject("interview-review")}>open second</button>
      <button onClick={closeProject}>close</button>
    </div>
  );
}

beforeEach(() => {
  history.replaceState({}, "", "/");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useProjectDialogState", () => {
  it("pushes a marked entry when a grid card opens", async () => {
    const user = userEvent.setup();
    const push = vi.spyOn(history, "pushState");
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "open first" }));

    expect(location.search).toBe("?project=job-application-helper");
    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({ portfolioDialogEntry: true }),
      "",
      expect.stringContaining("?project=job-application-helper"),
    );
  });

  it("uses history.back when closing an entry opened from the grid", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(history, "back").mockImplementation(() => undefined);
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "open first" }));
    await user.click(screen.getByRole("button", { name: "close" }));

    expect(back).toHaveBeenCalledOnce();
  });

  it("removes the query with replaceState when a deep link closes", async () => {
    history.replaceState({}, "", "/?project=interview-review");
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByLabelText("selected project")).toHaveTextContent("面试复盘助手");
    await user.click(screen.getByRole("button", { name: "close" }));

    expect(location.search).toBe("");
    expect(screen.getByLabelText("selected project")).toHaveTextContent("none");
  });

  it("syncs selection on popstate without changing scroll position", () => {
    const scrollY = window.scrollY;
    render(<Harness />);
    history.replaceState({}, "", "/?project=resume-builder");

    act(() => window.dispatchEvent(new PopStateEvent("popstate")));

    expect(screen.getByLabelText("selected project")).toHaveTextContent("智能简历编辑工具");
    expect(window.scrollY).toBe(scrollY);
  });

  it("cleans an invalid slug and stays on the overview", () => {
    history.replaceState({}, "", "/?project=not-real");

    render(<Harness />);

    expect(location.search).toBe("");
    expect(screen.getByLabelText("selected project")).toHaveTextContent("none");
  });
});
