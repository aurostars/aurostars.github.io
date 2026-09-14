import { createRef } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CaseDialog } from "@/components/case-dialog";
import { portfolioCases, type ProjectCase } from "@/content/portfolio";

function renderDialog({
  project = portfolioCases[0] as ProjectCase | null,
  onClose = vi.fn(),
  returnFocusTo = null as HTMLElement | null,
} = {}) {
  const fallbackFocusRef = createRef<HTMLHeadingElement>();
  const node = (nextProject: ProjectCase | null) => (
    <>
      <h2 ref={fallbackFocusRef} tabIndex={-1}>个人项目</h2>
      <CaseDialog
        project={nextProject}
        onClose={onClose}
        returnFocusTo={returnFocusTo}
        fallbackFocusRef={fallbackFocusRef}
      />
    </>
  );
  const view = render(node(project));
  return {
    ...view,
    fallbackFocusRef,
    onClose,
    rerenderProject: (nextProject: ProjectCase | null) => view.rerender(node(nextProject)),
  };
}

afterEach(() => {
  cleanup();
  document.body.removeAttribute("style");
});

describe("CaseDialog", () => {
  it("opens one labelled modal and initially focuses close", () => {
    renderDialog({ project: portfolioCases[0] });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("button", { name: "关闭秋招网申助手详情" })).toHaveFocus();
    expect(dialog).toHaveAttribute("aria-labelledby", "case-dialog-title");
  });

  it("does not render the removed core-problems section", () => {
    renderDialog({ project: portfolioCases[0] });

    expect(screen.queryByRole("heading", { name: "核心问题" })).not.toBeInTheDocument();
  });

  it("locks body scroll while open and restores prior inline styles after exit", async () => {
    document.body.style.overflow = "visible";
    document.body.style.paddingRight = "7px";
    const { rerenderProject } = renderDialog({ project: portfolioCases[0] });
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).not.toBe("7px");
    rerenderProject(null);
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(document.body.style.overflow).toBe("visible"));
    expect(document.body.style.paddingRight).toBe("7px");
  });

  it("handles the native Escape cancel event once", () => {
    const onClose = vi.fn();
    renderDialog({ project: portfolioCases[0], onClose });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes with the explicit close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ project: portfolioCases[0], onClose });
    await user.click(screen.getByRole("button", { name: "关闭秋招网申助手详情" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("only backdrop-closes when pointer down and up both target the dialog", () => {
    const onClose = vi.fn();
    renderDialog({ project: portfolioCases[0], onClose });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    fireEvent.pointerDown(dialog);
    fireEvent.pointerUp(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not backdrop-close after a pointer sequence that starts in content", () => {
    const onClose = vi.fn();
    renderDialog({ project: portfolioCases[0], onClose });
    fireEvent.pointerDown(screen.getByText(portfolioCases[0].background));
    fireEvent.pointerUp(screen.getByRole("dialog", { name: "秋招网申助手" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the native dialog open until the panel exit finishes", async () => {
    const { rerenderProject, fallbackFocusRef } = renderDialog({ project: portfolioCases[0] });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });

    rerenderProject(null);

    expect(dialog).toHaveAttribute("open");
    expect(fallbackFocusRef.current).not.toHaveFocus();
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(fallbackFocusRef.current).toHaveFocus();
  });

  it("replaces the animated panel when the selected project changes", async () => {
    const { rerenderProject } = renderDialog({ project: portfolioCases[0] });
    const firstPanel = screen.getByRole("dialog", { name: "秋招网申助手" }).querySelector(".case-dialog-panel");

    rerenderProject(portfolioCases[1]);

    const nextDialog = await screen.findByRole("dialog", { name: portfolioCases[1].title });
    expect(nextDialog.querySelector(".case-dialog-panel")).not.toBe(firstPanel);
  });

  it("returns focus to its trigger", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "项目触发器";
    document.body.append(trigger);
    const { rerenderProject } = renderDialog({ project: portfolioCases[0], returnFocusTo: trigger });
    rerenderProject(null);
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });

  it("uses the project heading for deep-link focus fallback", async () => {
    const { rerenderProject, fallbackFocusRef } = renderDialog({ project: portfolioCases[0], returnFocusTo: null });
    rerenderProject(null);
    await waitFor(() => expect(fallbackFocusRef.current).toHaveFocus());
  });
});
