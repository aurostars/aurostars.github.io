import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

async function injectProjectFixtures(page: Page, count: 5 | 6) {
  await page.locator(".case-grid").evaluate((grid, targetCount) => {
    const sourceCards = Array.from(grid.children);
    for (let index = sourceCards.length; index < targetCount; index += 1) {
      const fixture = sourceCards[index % sourceCards.length].cloneNode(true) as HTMLElement;
      fixture.dataset.testFixture = `project-${index + 1}`;
      const button = fixture.querySelector("button");
      button?.setAttribute("aria-label", `查看项目详情：测试案例 ${index + 1}`);
      grid.append(fixture);
    }
    (grid as HTMLElement).dataset.projectCount = String(targetCount);
  }, count);
}

test("dark mode skip link keeps accessible contrast against the accent surface", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });

  const contrast = await page.locator(".skip-link").evaluate((element) => {
    const parseRgb = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const luminance = (channels: number[]) => channels
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const style = getComputedStyle(element);
    const foreground = luminance(parseRgb(style.color));
    const background = luminance(parseRgb(style.backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test("project instruction stays adjacent to its heading and wraps without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  const heading = page.getByRole("heading", { name: "个人项目" });
  const hint = page.locator("#cases-title + #cases-hint");
  await expect(heading).toBeVisible();
  await expect(hint).toHaveText("点击卡片任意位置，可查看详情");
  await expect(page.locator(".case-grid")).toHaveAttribute("aria-describedby", "cases-hint");

  const positions = await Promise.all([heading.boundingBox(), hint.boundingBox()]);
  expect(positions[0]).not.toBeNull();
  expect(positions[1]).not.toBeNull();
  expect(positions[1]!.y).toBeGreaterThanOrEqual(positions[0]!.y + positions[0]!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const viewport of viewports) {
  for (const count of [5, 6] as const) {
    test(`${viewport.width}px lays out ${count} real cards without overflow or placeholders`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "networkidle" });
      await injectProjectFixtures(page, count);

      const cards = page.locator(".case-card");
      await expect(cards).toHaveCount(count);
      await expect(page.locator(".case-card-placeholder, [data-placeholder]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

      const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
        const { x, y, width } = node.getBoundingClientRect();
        return { x: Math.round(x), y: Math.round(y), width: Math.round(width) };
      }));
      expect(new Set(boxes.slice(0, viewport.columns).map(({ y }) => y)).size).toBe(1);
      expect(boxes[viewport.columns].y).toBeGreaterThan(boxes[0].y);

      if (count === 5) {
        expect(new Set(boxes.map(({ width }) => width)).size).toBe(1);
        const lastRowStart = Math.floor((count - 1) / viewport.columns) * viewport.columns;
        expect(boxes[lastRowStart].x).toBe(boxes[0].x);
      }

      if (count === 6 && viewport.columns === 3) {
        expect(new Set(boxes.slice(0, 3).map(({ y }) => y)).size).toBe(1);
        expect(new Set(boxes.slice(3).map(({ y }) => y)).size).toBe(1);
        expect(boxes[3].y).toBeGreaterThan(boxes[0].y);
      }
    });
  }
}

test("detail gallery preserves complete product screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const galleryImages = page.locator(".case-gallery img");
  await expect(galleryImages).toHaveCount(2);
  await expect(galleryImages.first()).toHaveCSS("object-fit", "contain");
  await expect(galleryImages.nth(1)).toHaveCSS("object-fit", "contain");

  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  await expect(page.locator(".case-gallery img").first()).toHaveCSS("object-fit", "contain");
});

test("detail image failure keeps a stable 16:9 frame", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/projects/job-application-helper/extension-popup.png", (route) => route.abort());
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const gallery = page.getByRole("group", { name: "秋招网申助手真实产品界面" });
  await expect(gallery.getByRole("img", { name: "秋招网申助手点击扩展后打开的界面加载失败" })).toBeVisible();
  const box = await gallery.locator(".project-image-frame").first().boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(0);
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
});

test("centers the native dialog in the viewport at desktop widths", async ({ page }) => {
  for (const viewport of viewports.filter(({ width }) => width >= 768)) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();

    const dialog = page.locator("dialog.case-dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs(box!.y + box!.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(2);
  }
});

test("native dialog traps focus, Escape closes once, restores body styles, and forward reopens", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.style.overflow = "clip";
    document.body.style.paddingRight = "7px";
  });

  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const close = page.getByRole("button", { name: "关闭秋招网申助手详情" });
  const source = dialog.getByRole("link", { name: /查看源码/ });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(source).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(source).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => ({
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  }))).toEqual({ overflow: "clip", paddingRight: "7px" });

  await page.goForward();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
});

test("backdrop pointer down and up close the native dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();

  await page.mouse.move(2, 2);
  await page.mouse.down();
  await page.mouse.up();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});

test("opens, deep-links, restores history, focus, and body scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await trigger.click();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("tagName", "DIALOG");
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog).toHaveAttribute("open", "");
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

test("mobile dialog honors inline safe-area margins at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: ".case-dialog { --case-dialog-safe-left: 24px; --case-dialog-safe-right: 20px; }",
  });

  const box = await page.getByRole("dialog", { name: "智能简历编辑工具" }).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(24);
  expect(box!.x + box!.width).toBeLessThanOrEqual(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("mobile dialog stays inside dynamic viewport and scrolls internally", async ({ page }) => {
  for (const viewport of viewports.filter(({ width }) => width <= 390)) {
    await page.setViewportSize(viewport);
    await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
    const dialog = page.getByRole("dialog", { name: "智能简历编辑工具" });
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByRole("button", { name: "关闭智能简历编辑工具详情" })).toBeVisible();

    const scrollMetrics = await dialog.locator(".case-dialog-scroll").evaluate((node) => ({
      clientHeight: node.clientHeight,
      overflowY: getComputedStyle(node).overflowY,
      scrollHeight: node.scrollHeight,
    }));
    expect(scrollMetrics.overflowY).toBe("auto");
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});
