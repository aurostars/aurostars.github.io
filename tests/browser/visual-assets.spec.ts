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

test("detail image frames use the approved 12px radius", async ({ page }) => {
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const frames = page.locator(".case-detail figure");
  await expect(frames).toHaveCount(2);
  for (const frame of await frames.all()) {
    await expect(frame).toHaveCSS("border-radius", "12px");
  }
});
