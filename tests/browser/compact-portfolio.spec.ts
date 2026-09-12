import { expect, test } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

for (const viewport of viewports) {
  test(`${viewport.width}px uses ${viewport.columns} project columns without overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const cards = page.locator(".case-card");
    await expect(cards).toHaveCount(4);
    const tops = await cards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
    expect(new Set(tops.slice(0, viewport.columns)).size).toBe(1);
    if (viewport.columns < 4) expect(tops[viewport.columns]).toBeGreaterThan(tops[0]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  });
}

test("opens, deep-links, restores history, focus, and body scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await trigger.click();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭秋招网申助手详情" })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("direct project URL closes to overview and focuses project heading", async ({ page }) => {
  await page.goto("/?project=meeting-minutes", { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "智能会议纪要工具" })).toBeVisible();
  await page.getByRole("button", { name: "关闭智能会议纪要工具详情" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "个人项目" })).toBeFocused();
});

test("mobile dialog stays inside dynamic viewport and keeps close visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "智能简历编辑工具" });
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await expect(page.getByRole("button", { name: "关闭智能简历编辑工具详情" })).toBeVisible();
});
