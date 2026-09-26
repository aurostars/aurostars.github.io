import { expect, test } from "@playwright/test";

test("reduced motion keeps content visible and disables authored motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "董星" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "个人项目" })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);

  await expect(page.getByText("太平洋证券研究所", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看项目详情：小米 SU7 3D 展示网页" })).toBeVisible();
  expect(await page.locator(".garden-scene").getAttribute("data-state")).toMatch(/ready|fallback|loading/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  const card = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await expect(card).toHaveCSS("transform", "none");

  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  const panel = dialog.locator(".case-dialog-panel");
  await expect(panel).toBeVisible();
  await expect.poll(() => panel.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
});
