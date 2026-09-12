import { expect, test } from "@playwright/test";

test("reduced motion keeps offscreen reveal and stagger content visible without transforms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "董星" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "个人项目" })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);

  const affectedNodes = page.locator('[data-motion], [data-motion] [data-testid="stagger-item"]');
  const styles = await affectedNodes.evaluateAll((nodes) => nodes.map((node) => ({
    text: node.textContent?.trim().slice(0, 40),
    opacity: getComputedStyle(node).opacity,
    transform: getComputedStyle(node).transform,
    top: node.getBoundingClientRect().top,
  })));

  expect(styles.some(({ top }) => top > 844)).toBe(true);
  expect(styles.filter(({ opacity }) => opacity !== "1")).toEqual([]);
  expect(styles.filter(({ transform }) => transform !== "none")).toEqual([]);

  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
});
