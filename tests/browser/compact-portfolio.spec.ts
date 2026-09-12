import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 767, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

type Color = { rgb: [number, number, number]; alpha: number };
type Point = { x: number; y: number };

function parseColor(value: string): Color {
  const normalized = value.trim();
  if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(normalized)) {
    return {
      rgb: [
        Number.parseInt(normalized.slice(1, 3), 16),
        Number.parseInt(normalized.slice(3, 5), 16),
        Number.parseInt(normalized.slice(5, 7), 16),
      ],
      alpha: normalized.length === 9 ? Number.parseInt(normalized.slice(7, 9), 16) / 255 : 1,
    };
  }
  const channels = normalized.match(/[\d.]+/g)?.map(Number) ?? [];
  if (channels.length < 3) {
    throw new Error(`Unsupported computed color: ${value}`);
  }
  return {
    rgb: channels.slice(0, 3) as Color["rgb"],
    alpha: channels[3] ?? 1,
  };
}

function composite(foreground: Color, background: Color): Color {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  return {
    rgb: foreground.rgb.map((channel, index) => (
      (channel * foreground.alpha + background.rgb[index] * background.alpha * (1 - foreground.alpha)) / alpha
    )) as Color["rgb"],
    alpha,
  };
}

function contrastRatio(foreground: Color | string, background: Color | string) {
  const luminance = (color: Color | string) => (typeof color === "string" ? parseColor(color) : color).rgb
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function surfaceSamplePoints(box: { x: number; y: number; width: number; height: number }): Point[] {
  const inset = 1;
  return [
    { x: box.x + inset, y: box.y + inset },
    { x: box.x + box.width - inset, y: box.y + inset },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: box.x + inset, y: box.y + box.height - inset },
    { x: box.x + box.width - inset, y: box.y + box.height - inset },
  ];
}

function effectivePageBackgroundsAt(
  point: Point,
  pageMetrics: { width: number; height: number; rootFontSize: number },
  colors: { base: string; primary: string; secondary: string; texture: string },
) {
  const base = parseColor(colors.base);
  const gradientAt = (color: string, center: Point, radiusRem: number) => {
    const parsed = parseColor(color);
    const distance = Math.hypot(point.x - center.x, point.y - center.y);
    return { ...parsed, alpha: parsed.alpha * Math.max(0, 1 - distance / (radiusRem * pageMetrics.rootFontSize)) };
  };
  const secondary = gradientAt(colors.secondary, {
    x: pageMetrics.width * 0.88,
    y: pageMetrics.height * 0.24,
  }, 34);
  const primary = gradientAt(colors.primary, {
    x: pageMetrics.width * 0.12,
    y: pageMetrics.height * 0.08,
  }, 30);
  const pageBackground = composite(primary, composite(secondary, base));
  const texture = parseColor(colors.texture);
  const texturedBackground = composite({ ...texture, alpha: texture.alpha * 0.18 }, pageBackground);
  return [pageBackground, texturedBackground];
}

function expectReadableOnSurface(
  textColor: string,
  surfaceColor: string,
  points: Point[],
  pageMetrics: { width: number; height: number; rootFontSize: number },
  pageColors: { base: string; primary: string; secondary: string; texture: string },
) {
  const surface = parseColor(surfaceColor);
  const effectiveBackgrounds = points.flatMap((point) => effectivePageBackgroundsAt(point, pageMetrics, pageColors))
    .map((background) => composite(surface, background));
  expect(Math.min(...effectiveBackgrounds.map((background) => contrastRatio(textColor, background))))
    .toBeGreaterThanOrEqual(4.5);
}

function expectRectClose(
  actual: { x: number; y: number; width: number; height: number },
  expected: { x: number; y: number; width: number; height: number },
  tolerance = 1,
) {
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(actual[key] - expected[key]), `${key} changed`).toBeLessThanOrEqual(tolerance);
  }
}

function rectanglesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  const epsilon = 0.5;
  return first.x < second.x + second.width - epsilon
    && first.x + first.width > second.x + epsilon
    && first.y < second.y + second.height - epsilon
    && first.y + first.height > second.y + epsilon;
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
  const [identityBox, historyBox, cardBox] = await Promise.all([
    page.locator(".identity-bar-motion").boundingBox(),
    page.locator(".profile-history-motion").boundingBox(),
    card.boundingBox(),
  ]);
  expect(identityBox).not.toBeNull();
  expect(historyBox).not.toBeNull();
  expect(cardBox).not.toBeNull();

  const styles = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    const body = style("body");
    const identity = style(".identity-bar-motion");
    const history = style(".profile-history-motion");
    const card = style(".case-card");
    return {
      pageMetrics: {
        width: document.body.getBoundingClientRect().width,
        height: document.body.getBoundingClientRect().height,
        rootFontSize: Number.parseFloat(root.fontSize),
      },
      pageColors: {
        base: root.getPropertyValue("--portfolio-background"),
        primary: root.getPropertyValue("--portfolio-ambient-primary"),
        secondary: root.getPropertyValue("--portfolio-ambient-secondary"),
        texture: root.getPropertyValue("--portfolio-texture"),
      },
      body: { color: body.color, backgroundColor: body.backgroundColor },
      identity: {
        textColors: Array.from(document.querySelectorAll(".identity-bar-motion h1, .identity-bar-motion a"))
          .map((element) => getComputedStyle(element).color),
        backgroundColor: identity.backgroundColor,
      },
      history: {
        textColors: Array.from(document.querySelectorAll(".profile-history-motion h2, .profile-history-motion strong, .profile-history-motion span, .profile-history-motion time, .profile-history-motion p"))
          .map((element) => getComputedStyle(element).color),
        backgroundColor: history.backgroundColor,
      },
      card: {
        backgroundColor: card.backgroundColor,
        outlineColor: card.outlineColor,
        summaryColor: style(".case-card-summary").color,
      },
    };
  });

  const identityPoints = surfaceSamplePoints(identityBox!);
  const historyPoints = surfaceSamplePoints(historyBox!);
  expect(parseColor(styles.body.backgroundColor).alpha).toBe(1);
  expect(parseColor(styles.identity.backgroundColor).alpha).toBeGreaterThanOrEqual(0.8);
  expect(parseColor(styles.history.backgroundColor).alpha).toBeGreaterThanOrEqual(0.8);
  expect(parseColor(styles.card.backgroundColor).alpha).toBe(1);
  expect(contrastRatio(styles.body.color, styles.body.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  expect(styles.identity.textColors).not.toHaveLength(0);
  for (const textColor of styles.identity.textColors) {
    expectReadableOnSurface(
      textColor,
      styles.identity.backgroundColor,
      identityPoints,
      styles.pageMetrics,
      styles.pageColors,
    );
  }
  expect(styles.history.textColors).not.toHaveLength(0);
  for (const textColor of styles.history.textColors) {
    expectReadableOnSurface(
      textColor,
      styles.history.backgroundColor,
      historyPoints,
      styles.pageMetrics,
      styles.pageColors,
    );
  }
  expect(contrastRatio(styles.card.summaryColor, styles.card.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  expect(parseColor(styles.card.outlineColor).alpha).toBe(1);
  const focusBackgrounds = surfaceSamplePoints(cardBox!)
    .flatMap((point) => effectivePageBackgroundsAt(point, styles.pageMetrics, styles.pageColors));
  expect(Math.min(...focusBackgrounds.map((background) => contrastRatio(styles.card.outlineColor, background))))
    .toBeGreaterThanOrEqual(3);
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

test("company logo failure preserves the successful row, slot, and company text geometry", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const row = page.getByTestId("experience-row").first();
  const slot = row.locator(".company-logo-slot");
  const company = row.getByText("字节跳动", { exact: true });
  const logo = row.getByRole("img", { name: "字节跳动 Logo" });
  await expect(logo).toBeVisible();
  const imageState = await logo.evaluate((element) => {
    const image = element as HTMLImageElement;
    const effects = [];
    for (let node: Element | null = image; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      effects.push({ opacity: style.opacity, filter: style.filter, mixBlendMode: style.mixBlendMode });
      if (node.matches('[data-testid="experience-row"]')) break;
    }
    return {
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      objectFit: getComputedStyle(image).objectFit,
      effects,
    };
  });
  expect(imageState.complete).toBe(true);
  expect(imageState.naturalWidth).toBeGreaterThan(0);
  expect(imageState.objectFit).toBe("contain");
  expect(imageState.effects).not.toHaveLength(0);
  expect(imageState.effects.every(({ opacity }) => opacity === "1")).toBe(true);
  expect(imageState.effects.every(({ filter }) => filter === "none")).toBe(true);
  expect(imageState.effects.every(({ mixBlendMode }) => mixBlendMode === "normal")).toBe(true);

  const [loadedRowBox, loadedSlotBox, loadedCompanyBox] = await Promise.all([
    row.boundingBox(),
    slot.boundingBox(),
    company.boundingBox(),
  ]);
  expect(loadedRowBox).not.toBeNull();
  expect(loadedSlotBox).not.toBeNull();
  expect(loadedCompanyBox).not.toBeNull();
  expect(loadedSlotBox!.width).toBeCloseTo(88, 0);
  expect(loadedSlotBox!.height).toBeCloseTo(40, 0);

  let failedRequest = false;
  await page.route("**/companies/bytedance.svg", async (route) => {
    failedRequest = true;
    await route.abort("failed");
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect.poll(() => failedRequest).toBe(true);
  await expect(row.getByRole("img", { name: "字节跳动 Logo" })).toHaveCount(0);
  await expect(company).toBeVisible();

  const [failedRowBox, failedSlotBox, failedCompanyBox] = await Promise.all([
    row.boundingBox(),
    slot.boundingBox(),
    company.boundingBox(),
  ]);
  expect(failedRowBox).not.toBeNull();
  expect(failedSlotBox).not.toBeNull();
  expect(failedCompanyBox).not.toBeNull();
  expectRectClose(failedRowBox!, loadedRowBox!);
  expectRectClose(failedSlotBox!, loadedSlotBox!);
  expectRectClose(failedCompanyBox!, loadedCompanyBox!);
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
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "networkidle" });
      await injectProjectFixtures(page, count);

      const cards = page.locator(".case-card");
      await expect(cards).toHaveCount(count);
      await expect(page.locator(".case-card-placeholder, [data-placeholder]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

      const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
      }));
      for (const box of boxes) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
      for (let rowStart = 0; rowStart < count; rowStart += viewport.columns) {
        const row = boxes.slice(rowStart, rowStart + viewport.columns);
        expect(Math.max(...row.map(({ y }) => y)) - Math.min(...row.map(({ y }) => y))).toBeLessThanOrEqual(1);
        for (let index = 1; index < row.length; index += 1) {
          expect(row[index].x).toBeGreaterThan(row[index - 1].x);
        }
      }
      for (let first = 0; first < boxes.length; first += 1) {
        for (let second = first + 1; second < boxes.length; second += 1) {
          expect(rectanglesOverlap(boxes[first], boxes[second]), `cards ${first + 1} and ${second + 1} overlap`).toBe(false);
        }
      }
      expect(boxes[viewport.columns].y).toBeGreaterThan(boxes[0].y);

      if (count === 5) {
        expect(Math.max(...boxes.map(({ width }) => width)) - Math.min(...boxes.map(({ width }) => width)))
          .toBeLessThanOrEqual(1);
        const lastRowStart = Math.floor((count - 1) / viewport.columns) * viewport.columns;
        expect(Math.abs(boxes[lastRowStart].x - boxes[0].x)).toBeLessThanOrEqual(1);
      }

      if (count === 6 && viewport.columns === 3) {
        expect(Math.max(...boxes.slice(0, 3).map(({ y }) => y)) - Math.min(...boxes.slice(0, 3).map(({ y }) => y)))
          .toBeLessThanOrEqual(1);
        expect(Math.max(...boxes.slice(3).map(({ y }) => y)) - Math.min(...boxes.slice(3).map(({ y }) => y)))
          .toBeLessThanOrEqual(1);
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
