import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 767, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

function parseColor(value: string) {
  const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return {
    rgb: channels.slice(0, 3),
    alpha: channels[3] ?? 1,
  };
}

function contrastRatio(foreground: string, background: string) {
  const luminance = (channels: number[]) => channels
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const foregroundLuminance = luminance(parseColor(foreground).rgb);
  const backgroundLuminance = luminance(parseColor(background).rgb);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

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

test("dark theme keeps focused navigation, text, focus ring, and glass surfaces readable", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });

  const skipLink = page.locator(".skip-link");
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  const skipStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, backgroundColor: style.backgroundColor };
  });
  expect(contrastRatio(skipStyle.color, skipStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);

  const card = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await card.focus();
  await expect(card).toBeFocused();
  const styles = await page.evaluate(() => {
    const computed = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    return {
      body: computed("body"),
      identity: computed(".identity-bar-motion"),
      history: computed(".profile-history-motion"),
      card: computed(".case-card"),
      summary: computed(".case-card-summary"),
      detail: computed(".experience-highlight"),
    };
  }).then((result) => ({
    body: { color: result.body.color, backgroundColor: result.body.backgroundColor },
    identity: { backgroundColor: result.identity.backgroundColor },
    history: { backgroundColor: result.history.backgroundColor },
    card: { backgroundColor: result.card.backgroundColor, outlineColor: result.card.outlineColor },
    summary: { color: result.summary.color },
    detail: { color: result.detail.color },
  }));

  expect(parseColor(styles.body.backgroundColor).alpha).toBe(1);
  expect(parseColor(styles.identity.backgroundColor).alpha).toBeGreaterThanOrEqual(0.8);
  expect(parseColor(styles.history.backgroundColor).alpha).toBeGreaterThanOrEqual(0.8);
  expect(parseColor(styles.card.backgroundColor).alpha).toBe(1);
  expect(contrastRatio(styles.body.color, styles.body.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(styles.summary.color, styles.card.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(styles.detail.color, styles.history.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  expect(parseColor(styles.card.outlineColor).alpha).toBe(1);
  expect(contrastRatio(styles.card.outlineColor, styles.card.backgroundColor)).toBeGreaterThanOrEqual(3);
});

for (const viewport of viewports) {
  test(`${viewport.width}px keeps profile history and project layout inside the viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const education = page.getByRole("region", { name: "教育经历", exact: true });
    const internship = page.getByRole("region", { name: "实习经历", exact: true });
    const [educationBox, internshipBox] = await Promise.all([
      education.boundingBox(),
      internship.boundingBox(),
    ]);
    expect(educationBox).not.toBeNull();
    expect(internshipBox).not.toBeNull();

    if (viewport.width >= 768) {
      expect(Math.abs(educationBox!.y - internshipBox!.y)).toBeLessThanOrEqual(1);
      expect(educationBox!.x + educationBox!.width).toBeLessThanOrEqual(internshipBox!.x);
    } else {
      expect(internshipBox!.y).toBeGreaterThanOrEqual(educationBox!.y + educationBox!.height);
    }

    const hint = page.locator("#cases-hint");
    const hintBox = await hint.boundingBox();
    expect(hintBox).not.toBeNull();
    expect(hintBox!.x).toBeGreaterThanOrEqual(0);
    expect(hintBox!.x + hintBox!.width).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  });
}

test("company logo network failure keeps its slot, company name, and experience row stable", async ({ page }) => {
  let failedRequest = false;
  await page.route("**/companies/bytedance.svg", async (route) => {
    failedRequest = true;
    await route.abort("failed");
  });
  await page.goto("/", { waitUntil: "networkidle" });

  const row = page.getByTestId("experience-row").first();
  const slot = row.locator(".company-logo-slot");
  await expect.poll(() => failedRequest).toBe(true);
  await expect(row.getByText("字节跳动")).toBeVisible();
  await expect(row.getByRole("img", { name: "字节跳动 Logo" })).toHaveCount(0);
  const [rowBox, slotBox] = await Promise.all([row.boundingBox(), slot.boundingBox()]);
  expect(rowBox).not.toBeNull();
  expect(slotBox).not.toBeNull();
  expect(rowBox!.height).toBeGreaterThan(0);
  expect(slotBox!.width).toBeGreaterThan(0);
  expect(slotBox!.height).toBeGreaterThan(0);
});

test("company logos load in original color and fit their fixed slots without cropping", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const logo = page.getByRole("img", { name: "字节跳动 Logo" });
  await expect(logo).toBeVisible();
  const imageState = await logo.evaluate((element) => {
    const image = element as HTMLImageElement;
    const style = getComputedStyle(image);
    return {
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      objectFit: style.objectFit,
      filter: style.filter,
    };
  });
  expect(imageState.complete).toBe(true);
  expect(imageState.naturalWidth).toBeGreaterThan(0);
  expect(imageState.objectFit).toBe("contain");
  expect(imageState.filter).toBe("none");
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

test("detail gallery preserves the two approved Job Application Helper screenshots, features, and source link", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const gallery = dialog.getByRole("group", { name: "秋招网申助手真实产品界面" });
  const galleryImages = gallery.getByRole("img");
  await expect(galleryImages).toHaveCount(2);
  await expect(gallery.getByRole("img", { name: "秋招网申助手点击扩展后打开的界面" })).toHaveCSS("object-fit", "contain");
  await expect(gallery.getByRole("img", { name: "秋招网申助手的个人信息设置页面" })).toHaveCSS("object-fit", "contain");

  const features = dialog.getByRole("region", { name: "已实现功能" }).getByRole("listitem");
  await expect(features).toHaveCount(10);
  await expect(features.first()).toHaveText("求职资料集中管理。");
  await expect(features.last()).toHaveText("版本化 JSON 备份与 WebDAV 双向同步。");
  const links = dialog.getByRole("link");
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveAccessibleName(/查看源码\s*（新窗口）/);
  await expect(links.first()).toHaveAttribute("href", "https://github.com/aurostars/Job-Application-Helper");

  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  await expect(page.locator(".case-gallery img").first()).toHaveCSS("object-fit", "contain");
});

test("detail image failure keeps a stable 16:9 frame", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/projects/job-application-helper/extension-popup.png", (route) => route.abort());
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const gallery = page.getByRole("group", { name: "秋招网申助手真实产品界面" });
  await expect(gallery.getByRole("img", { name: "秋招网申助手点击扩展后打开的界面加载失败" })).toBeVisible();
  await expect(gallery.getByRole("img", { name: "秋招网申助手的个人信息设置页面" })).toBeVisible();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog.getByRole("region", { name: "已实现功能" }).getByRole("listitem")).toHaveCount(10);
  await expect(dialog.getByRole("link", { name: /查看源码\s*（新窗口）/ })).toHaveAttribute(
    "href",
    "https://github.com/aurostars/Job-Application-Helper",
  );
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
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => ({
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
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
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
