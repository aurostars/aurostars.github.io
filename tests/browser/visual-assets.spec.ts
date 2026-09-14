import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

function distance(first: number[], second: number[]) {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

test("captured extension popup is tightly cropped, populated, and free of failure-red rendering", async () => {
  const asset = path.join(process.cwd(), "public/projects/job-application-helper/extension-popup.png");
  const image = sharp(asset).ensureAlpha();
  const [{ width, height }, stats, raw] = await Promise.all([
    image.metadata(),
    image.stats(),
    image.raw().toBuffer({ resolveWithObject: true }),
  ]);

  expect({ width, height }).toEqual({ width: 360, height: 531 });
  expect(stats.entropy).toBeGreaterThan(2.5);

  const background = [247, 249, 252];
  let contentPixels = 0;
  let failureRedPixels = 0;
  for (let offset = 0; offset < raw.data.length; offset += raw.info.channels) {
    const pixel = [raw.data[offset], raw.data[offset + 1], raw.data[offset + 2]];
    if (distance(pixel, background) > 20) contentPixels += 1;
    if (pixel[0] > 150 && pixel[0] > pixel[1] * 1.45 && pixel[0] > pixel[2] * 1.45) failureRedPixels += 1;
  }
  const pixelCount = width! * height!;
  expect(contentPixels / pixelCount, "popup should contain product UI across the crop").toBeGreaterThan(0.12);
  expect(failureRedPixels / pixelCount, "popup should not render a red error state").toBeLessThan(0.001);
});

test("official-color light and dark logos remain distinguishable on their rendered neutral plates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  for (const name of ["字节跳动 Logo", "科大讯飞 Logo", "太平洋证券 Logo"]) {
    const logo = page.getByRole("img", { name });
    const plate = logo.locator("xpath=parent::*[contains(@class, 'company-logo-plate')]");
    await expect(logo).toBeVisible();
    await expect(plate).toBeVisible();
    const screenshot = await sharp(await plate.screenshot({ animations: "disabled" })).ensureAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    const background = [screenshot.data[0], screenshot.data[1], screenshot.data[2]];
    let contrastingPixels = 0;
    for (let offset = 0; offset < screenshot.data.length; offset += screenshot.info.channels) {
      const pixel = [screenshot.data[offset], screenshot.data[offset + 1], screenshot.data[offset + 2]];
      if (distance(pixel, background) > 35) contrastingPixels += 1;
    }
    expect(
      contrastingPixels / (screenshot.info.width * screenshot.info.height),
      `${name} should have enough rendered pixels distinct from its plate`,
    ).toBeGreaterThan(0.005);
  }
});

test("all company logos load with intrinsic width and contain fit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const names = [
    "字节跳动 Logo",
    "科大讯飞 Logo",
    "美团快驴 Logo",
    "国务院发展研究中心 Logo",
    "BOSS直聘 Logo",
    "太平洋证券 Logo",
  ];
  for (const name of names) {
    const logo = page.getByRole("img", { name });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveCSS("object-fit", "contain");
    expect(await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`school emblems load with contained, visible artwork in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    for (const name of ["北京师范大学校徽", "中国人民大学校徽"]) {
      const emblem = page.getByRole("img", { name });
      const slot = emblem.locator("xpath=parent::*[contains(@class, 'school-logo-slot')]");
      await expect(emblem).toBeVisible();
      await expect(emblem).toHaveCSS("object-fit", "contain");
      expect(await emblem.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);

      const screenshot = await sharp(await slot.screenshot({ animations: "disabled" })).ensureAlpha().raw()
        .toBuffer({ resolveWithObject: true });
      const background = [screenshot.data[0], screenshot.data[1], screenshot.data[2]];
      let contrastingPixels = 0;
      for (let offset = 0; offset < screenshot.data.length; offset += screenshot.info.channels) {
        const pixel = [screenshot.data[offset], screenshot.data[offset + 1], screenshot.data[offset + 2]];
        if (distance(pixel, background) > 35) contrastingPixels += 1;
      }
      expect(
        contrastingPixels / (screenshot.info.width * screenshot.info.height),
        `${name} should remain visibly distinct from its plate in ${colorScheme} mode`,
      ).toBeGreaterThan(0.01);
    }
  });
}

test("failed school emblem preserves its row, slot, and school name geometry", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const row = page.getByTestId("education-row").first();
  const slot = row.locator(".school-logo-slot");
  const school = row.getByText("北京师范大学", { exact: true });
  const loaded = await Promise.all([row.boundingBox(), slot.boundingBox(), school.boundingBox()]);
  expect(loaded.every(Boolean)).toBe(true);

  await page.route("**/schools/beijing-normal-university.svg", (route) => route.abort("failed"));
  await page.reload({ waitUntil: "networkidle" });
  await expect(row.getByRole("img", { name: "北京师范大学校徽" })).toHaveCount(0);
  await expect(school).toBeVisible();
  const failed = await Promise.all([row.boundingBox(), slot.boundingBox(), school.boundingBox()]);
  expect(failed.every(Boolean)).toBe(true);
  for (let index = 0; index < loaded.length; index += 1) {
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(failed[index]![key] - loaded[index]![key]), `${key} changed`).toBeLessThanOrEqual(1);
    }
  }
});

test("every project renders its selected images without loading failures and with contain fit", async ({ page }) => {
  const projects = [
    { slug: "job-application-helper", title: "秋招网申助手", count: 2 },
    { slug: "interview-review", title: "面试复盘助手", count: 1 },
    { slug: "resume-builder", title: "智能简历编辑工具", count: 1 },
    { slug: "meeting-minutes", title: "智能会议纪要工具", count: 1 },
  ];
  for (const project of projects) {
    await page.goto(`/?project=${project.slug}`, { waitUntil: "networkidle" });
    const gallery = page.getByRole("group", { name: `${project.title}真实产品界面` });
    const images = gallery.getByRole("img");
    await expect(images).toHaveCount(project.count);
    await expect(gallery.locator('[data-image-status="failed"]')).toHaveCount(0);
    for (const image of await images.all()) {
      await expect(image).toHaveCSS("object-fit", "contain");
      expect(await image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
  }
});

test("detail image frames use the approved 12px radius", async ({ page }) => {
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const frames = page.locator(".case-detail figure");
  await expect(frames).toHaveCount(2);
  for (const frame of await frames.all()) {
    await expect(frame).toHaveCSS("border-radius", "12px");
  }
});
