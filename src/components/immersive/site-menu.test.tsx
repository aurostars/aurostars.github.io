import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SiteMenu } from "./site-menu";

afterEach(cleanup);

describe("SiteMenu", () => {
  it("opens as a labelled navigation and returns focus after Escape", async () => {
    const user = userEvent.setup();
    render(<SiteMenu />);

    const trigger = screen.getByRole("button", { name: "打开菜单" });
    await user.click(trigger);

    expect(screen.getByRole("navigation", { name: "主页导航" })).toBeVisible();
    expect(screen.getByRole("link", { name: "关于" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "主页导航" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes after choosing a same-page destination", async () => {
    const user = userEvent.setup();
    render(<SiteMenu />);

    await user.click(screen.getByRole("button", { name: "打开菜单" }));
    await user.click(screen.getByRole("link", { name: "项目" }));

    expect(screen.queryByRole("navigation", { name: "主页导航" })).not.toBeInTheDocument();
  });
});
