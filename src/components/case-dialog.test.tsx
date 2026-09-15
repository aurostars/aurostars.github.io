import React, { createRef } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CaseDialog } from "@/components/case-dialog";
import {
  portfolioCases,
  type FullProjectCase,
  type ProjectCase,
  type ShowcaseProjectCase,
} from "@/content/portfolio";

const fullProject = portfolioCases.find((project): project is FullProjectCase => project.presentation === "full")!;
const showcaseProject = portfolioCases.find(
  (project): project is ShowcaseProjectCase => project.presentation === "showcase",
)!;

function renderDialog({
  project = fullProject as ProjectCase | null,
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

  it("renders one source link before close in the header and none in scroll content", () => {
    renderDialog({ project: fullProject });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    const actions = dialog.querySelector(".case-dialog-actions");
    const sourceLink = within(dialog).getByRole("link", { name: "查看源码（新窗口）" });
    const closeButton = within(dialog).getByRole("button", { name: "关闭秋招网申助手详情" });

    expect(actions).not.toBeNull();
    expect(Array.from(actions?.children ?? [])).toEqual([sourceLink, closeButton]);
    expect(sourceLink).toHaveClass("case-source-link");
    expect(closeButton).toHaveClass("case-dialog-close");
    expect(sourceLink).toHaveAttribute("href", portfolioCases[0].repositoryUrl);
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(dialog.querySelectorAll(".case-source-link")).toHaveLength(1);
    expect(dialog.querySelector(".case-dialog-scroll .case-detail-links")).not.toBeInTheDocument();
  });

  it("renders the showcase link before source and close", () => {
    renderDialog({ project: showcaseProject });
    const dialog = screen.getByRole("dialog", { name: showcaseProject.title });
    const actions = dialog.querySelector(".case-dialog-actions");
    const demoLink = within(dialog).getByRole("link", { name: "查看展示网页（新窗口）" });
    const sourceLink = within(dialog).getByRole("link", { name: "查看源码（新窗口）" });
    const closeButton = within(dialog).getByRole("button", { name: `关闭${showcaseProject.title}详情` });

    expect(Array.from(actions?.children ?? [])).toEqual([demoLink, sourceLink, closeButton]);
    expect(demoLink).toHaveClass("case-demo-link");
    expect(demoLink).toHaveAttribute("href", showcaseProject.releaseUrl);
    expect(demoLink).toHaveAttribute("target", "_blank");
    expect(demoLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders compact showcase details without full-case sections", () => {
    renderDialog({ project: showcaseProject });
    const dialog = screen.getByRole("dialog", { name: showcaseProject.title });

    expect(within(dialog).getByRole("heading", { name: "项目说明" })).toBeInTheDocument();
    expect(within(dialog).getByText(showcaseProject.description)).toBeInTheDocument();
    expect(within(dialog).queryByRole("heading", { name: "背景" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("heading", { name: "目标" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("heading", { name: "工作流程" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "已实现功能" })).toBeInTheDocument();
  });

  it("renders background and goal as distinct full-row detail sections before workflow", () => {
    renderDialog({ project: fullProject });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    const grid = dialog.querySelector(".case-detail-grid");
    const background = dialog.querySelector(".case-background");
    const goal = dialog.querySelector(".case-goal");
    const workflow = dialog.querySelector(".case-workflow");

    expect(Array.from(grid?.children ?? [])).toEqual([background, goal]);
    expect(background).toHaveTextContent(fullProject.background);
    expect(goal).toHaveTextContent(fullProject.goal);
    expect(goal).not.toBeNull();
    expect(workflow).not.toBeNull();
    if (!goal || !workflow) throw new Error("Expected goal and workflow sections");
    expect(goal.compareDocumentPosition(workflow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not render the removed core-problems section", () => {
    renderDialog({ project: fullProject });

    expect(screen.queryByRole("heading", { name: "核心问题" })).not.toBeInTheDocument();
  });

  it.each(portfolioCases)("renders provenance only when defined for $title", (project) => {
    renderDialog({ project });
    const provenance = screen.getByRole("dialog", { name: project.title }).querySelector(".case-provenance");

    if (project.provenance) {
      expect(provenance).toHaveTextContent(project.provenance);
    } else {
      expect(provenance).not.toBeInTheDocument();
    }
  });

  it.each(portfolioCases)("uses the approved gallery layout and media count for $title", (project) => {
    renderDialog({ project });
    const gallery = within(screen.getByRole("dialog", { name: project.title }))
      .getByRole("group", { name: `${project.title}真实产品界面` });
    const isJobHelper = project.slug === "job-application-helper";

    expect(gallery).toHaveAttribute("data-gallery-layout", isJobHelper ? "job-helper-duo" : "single");
    expect(gallery.querySelectorAll("figure")).toHaveLength(isJobHelper ? 2 : 1);
  });

  it("locks body scroll while open and restores prior inline styles after exit", async () => {
    document.body.style.overflow = "visible";
    document.body.style.paddingRight = "7px";
    const { rerenderProject } = renderDialog({ project: fullProject });
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).not.toBe("7px");
    rerenderProject(null);
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(document.body.style.overflow).toBe("visible"));
    expect(document.body.style.paddingRight).toBe("7px");
  });

  it("handles the native Escape cancel event once", () => {
    const onClose = vi.fn();
    renderDialog({ project: fullProject, onClose });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes with the explicit close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ project: fullProject, onClose });
    await user.click(screen.getByRole("button", { name: "关闭秋招网申助手详情" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("only backdrop-closes when pointer down and up both target the dialog", () => {
    const onClose = vi.fn();
    renderDialog({ project: fullProject, onClose });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });
    fireEvent.pointerDown(dialog);
    fireEvent.pointerUp(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not backdrop-close after a pointer sequence that starts in content", () => {
    const onClose = vi.fn();
    renderDialog({ project: fullProject, onClose });
    fireEvent.pointerDown(screen.getByText(fullProject.background));
    fireEvent.pointerUp(screen.getByRole("dialog", { name: "秋招网申助手" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the native dialog open until the panel exit finishes", async () => {
    const { rerenderProject, fallbackFocusRef } = renderDialog({ project: fullProject });
    const dialog = screen.getByRole("dialog", { name: "秋招网申助手" });

    rerenderProject(null);

    expect(dialog).toHaveAttribute("open");
    expect(fallbackFocusRef.current).not.toHaveFocus();
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(fallbackFocusRef.current).toHaveFocus();
  });

  it("replaces the animated panel when the selected project changes", async () => {
    const { rerenderProject } = renderDialog({ project: fullProject });
    const firstPanel = screen.getByRole("dialog", { name: "秋招网申助手" }).querySelector(".case-dialog-panel");

    rerenderProject(portfolioCases[1]);

    const nextDialog = await screen.findByRole("dialog", { name: portfolioCases[1].title });
    expect(nextDialog.querySelector(".case-dialog-panel")).not.toBe(firstPanel);
  });

  it("returns focus to its trigger", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "项目触发器";
    document.body.append(trigger);
    const { rerenderProject } = renderDialog({ project: fullProject, returnFocusTo: trigger });
    rerenderProject(null);
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });

  it("uses the project heading for deep-link focus fallback", async () => {
    const { rerenderProject, fallbackFocusRef } = renderDialog({ project: fullProject, returnFocusTo: null });
    rerenderProject(null);
    await waitFor(() => expect(fallbackFocusRef.current).toHaveFocus());
  });
});
