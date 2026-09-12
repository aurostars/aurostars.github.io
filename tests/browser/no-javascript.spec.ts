import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("server-rendered identity, history, and project content remain visible without JavaScript", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "董星" })).toBeVisible();
  await expect(page.getByRole("region", { name: "教育与实习经历" })).toBeVisible();
  await expect(page.getByText("字节跳动", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "个人项目" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看项目详情：秋招网申助手" })).toBeVisible();

  const hiddenCoreContent = await page.locator(
    '.identity-bar-motion, .profile-history-motion, .section-heading, .case-card-motion',
  ).evaluateAll((nodes) => nodes.filter((node) => {
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    return style.opacity === "0" || style.visibility === "hidden" || box.width === 0 || box.height === 0;
  }).length);
  expect(hiddenCoreContent).toBe(0);
  expect(await page.evaluate(() => document.body.innerText.trim().length)).toBeGreaterThan(300);
});
